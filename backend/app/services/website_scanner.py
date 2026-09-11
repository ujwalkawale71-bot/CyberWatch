"""
CyberWatch Defensive Website Security Scanner
Evidence-based, deterministic website security auditing engine.
Strictly separates verified threats from heuristic indicators and configuration issues.
Includes:
- Safe URL normalization & SSRF protection
- DNS resolution & routing inspection
- HTTP/HTTPS reachability & server response analysis
- SSL/TLS cryptographic handshake & certificate validation
- HTTP security headers assessment (conservative scoring)
- Redirect chain & protocol upgrade analysis
- HTML content parsing (forms, password inputs, scripts, resources)
- Context-aware brand impersonation & credential harvesting detection
- Form submission endpoint security (cross-domain / unencrypted)
- Mixed content & iframe risk inspection
- Live multi-source Threat Intelligence integration (PhishTank, Google Safe Browsing, VirusTotal, URLhaus)
- Calibrated evidence-based risk scoring (Heuristic cap: 85, CRITICAL: 90-100 reserved for verified threats)
- Distinct analysis coverage & limitations tracking
"""

import socket
import ssl
import ipaddress
import urllib.request
import urllib.error
from urllib.parse import urlparse, urljoin
import re
import json
from html.parser import HTMLParser
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple, Set

from app.services.threat_intelligence import query_all_threat_intelligence

# High-risk / suspicious TLDs
SUSPICIOUS_TLDS = {"tk", "ml", "ga", "cf", "gq", "xyz", "top", "work", "click", "loan", "fit", "racing", "surf"}

# Known Brand Dictionary for context-aware brand impersonation
KNOWN_BRANDS = {
    "paypal": ["paypal.com", "paypal-community.com"],
    "google": ["google.com", "google.co.uk", "google.ca", "google.com.au", "gmail.com", "youtube.com"],
    "microsoft": ["microsoft.com", "live.com", "office.com", "office365.com", "outlook.com", "azure.com", "microsoftonline.com"],
    "apple": ["apple.com", "icloud.com"],
    "amazon": ["amazon.com", "amazon.co.uk", "amazon.de", "amazon.ca", "aws.amazon.com"],
    "netflix": ["netflix.com"],
    "facebook": ["facebook.com", "fb.com", "meta.com", "instagram.com", "whatsapp.com"],
    "bankofamerica": ["bankofamerica.com"],
    "wellsfargo": ["wellsfargo.com"],
    "chase": ["chase.com"],
    "github": ["github.com", "github.io", "githubusercontent.com"]
}

# Credential / Authentication keywords
CREDENTIAL_KEYWORDS = ["login", "signin", "sign-in", "log-in", "verify", "verification", "secure", "account", "update", "banking", "authenticate", "password", "wallet"]


def is_private_ip(ip_str: str) -> bool:
    """Validate if an IP is in local, loopback, private, link-local or reserved range."""
    try:
        ip = ipaddress.ip_address(ip_str)
        return (
            ip.is_private
            or ip.is_loopback
            or ip.is_link_local
            or ip.is_multicast
            or ip.is_reserved
            or ip.is_unspecified
        )
    except ValueError:
        return True


def check_ssrf_safety(host: str) -> Tuple[bool, List[str], Optional[str]]:
    """Resolve host and ensure it does not resolve to a private/internal IP."""
    try:
        addr_info = socket.getaddrinfo(host, None)
        resolved_ips = []
        for item in addr_info:
            ip = item[4][0]
            if ip not in resolved_ips:
                resolved_ips.append(ip)
                if is_private_ip(ip):
                    return False, resolved_ips, f"Host resolves to private/internal IP address: {ip}"
        return True, resolved_ips, None
    except socket.gaierror as e:
        return False, [], f"DNS Resolution failed: {str(e)}"
    except Exception as e:
        return False, [], f"DNS check error: {str(e)}"


class WebsiteRedirectTracker(urllib.request.HTTPRedirectHandler):
    def __init__(self, initial_url: str):
        super().__init__()
        self.redirects: List[Dict[str, Any]] = []
        self.initial_url = initial_url
        self.current_url = initial_url

    def redirect_request(self, req, fp, code, msg, hdrs, newurl):
        parsed = urlparse(newurl)
        new_host = parsed.hostname or ""
        if new_host:
            is_safe, _, err = check_ssrf_safety(new_host)
            if not is_safe and "private/internal" in (err or ""):
                raise urllib.request.HTTPError(newurl, 403, f"SSRF Blocked redirect to internal IP: {newurl}", hdrs, fp)

        self.redirects.append({
            "hop": len(self.redirects) + 1,
            "from": self.current_url,
            "to": newurl,
            "status_code": code
        })
        self.current_url = newurl

        if len(self.redirects) > 8:
            raise urllib.request.HTTPError(newurl, 310, "Excessive redirect loop (exceeded 8 hops)", hdrs, fp)

        return super().redirect_request(req, fp, code, msg, hdrs, newurl)


class AdvancedWebsiteHTMLParser(HTMLParser):
    def __init__(self, base_domain: str, base_url: str):
        super().__init__()
        self.base_domain = base_domain.lower()
        self.base_url = base_url
        self.title = ""
        self.meta_description = ""
        self.canonical_url = ""
        self.language = ""
        self.forms: List[Dict[str, Any]] = []
        self.current_form: Optional[Dict[str, Any]] = None
        self.scripts: List[Dict[str, str]] = []
        self.iframes: List[Dict[str, str]] = []
        self.links: List[str] = []
        self.images: List[str] = []
        self.stylesheets: List[str] = []
        self.obfuscated_js_indicators = 0
        self.has_password_input = False
        self.has_credit_card_input = False
        self.has_login_button = False
        self.raw_text_chunks: List[str] = []
        self._in_title = False

    def handle_starttag(self, tag: str, attrs: List[Tuple[str, Optional[str]]]):
        attrs_dict = {k.lower(): (v or "") for k, v in attrs if k}

        if tag == "html":
            self.language = attrs_dict.get("lang", "")
        elif tag == "title":
            self._in_title = True
        elif tag == "meta":
            if attrs_dict.get("name", "").lower() == "description":
                self.meta_description = attrs_dict.get("content", "")
        elif tag == "link":
            rel = attrs_dict.get("rel", "").lower()
            href = attrs_dict.get("href", "")
            if rel == "canonical" and href:
                self.canonical_url = href
            elif rel == "stylesheet" and href:
                self.stylesheets.append(href)
        elif tag == "form":
            action = attrs_dict.get("action", "")
            method = attrs_dict.get("method", "GET").upper()
            form_id = attrs_dict.get("id", "")
            form_name = attrs_dict.get("name", "")
            self.current_form = {
                "action": action,
                "method": method,
                "id": form_id,
                "name": form_name,
                "has_password": False,
                "has_email": False,
                "has_credit_card": False,
                "inputs": []
            }
            self.forms.append(self.current_form)
        elif tag == "input":
            input_type = attrs_dict.get("type", "text").lower()
            input_name = attrs_dict.get("name", "").lower()
            input_id = attrs_dict.get("id", "").lower()

            if input_type == "password" or "password" in input_name:
                self.has_password_input = True
                if self.current_form:
                    self.current_form["has_password"] = True
            if "email" in input_type or "email" in input_name or "username" in input_name:
                if self.current_form:
                    self.current_form["has_email"] = True
            if "card" in input_name or "cvv" in input_name or "cc-number" in input_name or "cardnumber" in input_name:
                self.has_credit_card_input = True
                if self.current_form:
                    self.current_form["has_credit_card"] = True

            if self.current_form:
                self.current_form["inputs"].append({
                    "type": input_type,
                    "name": input_name,
                    "id": input_id
                })
        elif tag == "button" or tag == "input":
            btn_text = (attrs_dict.get("value", "") + " " + attrs_dict.get("name", "")).lower()
            if any(k in btn_text for k in ["login", "sign in", "log in", "submit", "verify", "authenticate"]):
                self.has_login_button = True
        elif tag == "script":
            src = attrs_dict.get("src", "")
            if src:
                self.scripts.append({"src": src})
        elif tag == "iframe":
            src = attrs_dict.get("src", "")
            if src:
                self.iframes.append({"src": src})
        elif tag == "img":
            src = attrs_dict.get("src", "")
            if src:
                self.images.append(src)
        elif tag == "a":
            href = attrs_dict.get("href", "")
            if href:
                self.links.append(href)

    def handle_data(self, data: str):
        if self._in_title:
            self.title += data
        clean = data.strip()
        if clean:
            self.raw_text_chunks.append(clean.lower())
            if "eval(" in clean or "unescape(" in clean or "string.fromcharcode" in clean.lower():
                self.obfuscated_js_indicators += 1

    def handle_endtag(self, tag: str):
        if tag == "title":
            self._in_title = False
        elif tag == "form":
            self.current_form = None


def inspect_tls_certificate(hostname: str, port: int = 443) -> Dict[str, Any]:
    """Perform real TLS handshake and validate certificate parameters."""
    ctx = ssl.create_default_context()
    conn = None
    sock = None
    try:
        sock = socket.create_connection((hostname, port), timeout=3.5)
        conn = ctx.wrap_socket(sock, server_hostname=hostname)
        cert = conn.getpeercert()
        tls_version = conn.version()
        cipher = conn.cipher()

        if not cert:
            return {
                "valid": False,
                "tls_version": tls_version,
                "error": "No certificate presented by destination host."
            }

        subject = dict(x[0] for x in cert.get("subject", []))
        issuer = dict(x[0] for x in cert.get("issuer", []))
        sans = [x[1] for x in cert.get("subjectAltName", []) if x[0] == "DNS"]

        not_after_str = cert.get("notAfter", "")
        not_before_str = cert.get("notBefore", "")

        days_remaining = None
        is_expired = False
        if not_after_str:
            try:
                exp_date = datetime.strptime(not_after_str, "%b %d %H:%M:%S %Y %Z").replace(tzinfo=timezone.utc)
                now = datetime.now(timezone.utc)
                days_remaining = (exp_date - now).days
                is_expired = days_remaining < 0
            except Exception:
                pass

        # Hostname mismatch check
        subject_cn = subject.get("commonName", "")
        hostname_matched = False
        all_names = [subject_cn] + sans
        for name in all_names:
            if not name:
                continue
            if name.startswith("*."):
                suffix = name[2:].lower()
                if hostname.lower() == suffix or hostname.lower().endswith("." + suffix):
                    hostname_matched = True
                    break
            elif name.lower() == hostname.lower():
                hostname_matched = True
                break

        is_self_signed = issuer.get("commonName") == subject_cn and issuer.get("organizationName") == subject.get("organizationName")

        return {
            "valid": True,
            "tls_version": tls_version,
            "cipher_suite": cipher[0] if cipher else None,
            "issuer": issuer.get("organizationName") or issuer.get("commonName", "Unknown Issuer"),
            "issuer_cn": issuer.get("commonName", ""),
            "subject_cn": subject_cn,
            "subject_alt_names": sans,
            "not_before": not_before_str,
            "not_after": not_after_str,
            "days_remaining": days_remaining,
            "is_expired": is_expired,
            "is_self_signed": is_self_signed,
            "hostname_mismatch": not hostname_matched if all_names and any(all_names) else False,
            "error": None
        }
    except ssl.SSLCertVerificationError as e:
        return {
            "valid": False,
            "tls_version": None,
            "is_self_signed": "self-signed" in str(e).lower(),
            "hostname_mismatch": "hostname" in str(e).lower() or "doesn't match" in str(e).lower(),
            "is_expired": "expired" in str(e).lower() or "certificate has expired" in str(e).lower(),
            "error": f"SSL Certificate Verification Failed: {str(e)}"
        }
    except Exception as e:
        return {
            "valid": False,
            "tls_version": None,
            "error": f"TLS Inspection Error: {str(e)}"
        }
    finally:
        if conn:
            try:
                conn.close()
            except Exception:
                pass
        elif sock:
            try:
                sock.close()
            except Exception:
                pass


def scan_website_security(target_input: str) -> Dict[str, Any]:
    """
    Main entry point for evidence-based defensive website security audit.
    """
    timestamp = datetime.now(timezone.utc).isoformat()
    raw_input = target_input.strip()

    if not raw_input:
        raise ValueError("The submitted website address cannot be empty.")

    # 1. Safe URL Normalization
    has_scheme = raw_input.lower().startswith("http://") or raw_input.lower().startswith("https://")
    url = raw_input if has_scheme else f"https://{raw_input}"

    try:
        parsed_url = urlparse(url)
        hostname = parsed_url.hostname or ""
        port = parsed_url.port or (443 if parsed_url.scheme == "https" else 80)
        scheme = parsed_url.scheme.lower()
        path = parsed_url.path or "/"
    except Exception:
        return {
            "url": raw_input,
            "domain": "unparseable",
            "risk_score": None,
            "risk_level": "UNKNOWN",
            "security_verdict": "ANALYSIS FAILED",
            "explanation": "The submitted website address could not be parsed as a valid URL.",
            "status": "failed",
            "timestamp": timestamp,
            "local_analysis_coverage": {"status": "FAILED", "percent": 0, "modules_completed": 0, "total_modules": 9},
            "threat_intelligence_coverage": {"status": "NOT CONFIGURED", "percent": 0, "sources_configured": 0, "sources_total": 4},
            "findings": [],
            "score_components": [],
            "positive_signals": [],
            "analysis_limitations": ["Invalid or unparseable URL input."],
            "recommendations": ["Verify target URL formatting and try again."]
        }

    if not hostname:
        return {
            "url": raw_input,
            "domain": "invalid",
            "risk_score": None,
            "risk_level": "UNKNOWN",
            "security_verdict": "ANALYSIS FAILED",
            "explanation": "The submitted website address is missing a valid hostname.",
            "status": "failed",
            "timestamp": timestamp,
            "local_analysis_coverage": {"status": "FAILED", "percent": 0, "modules_completed": 0, "total_modules": 9},
            "threat_intelligence_coverage": {"status": "NOT CONFIGURED", "percent": 0, "sources_configured": 0, "sources_total": 4},
            "findings": [],
            "score_components": [],
            "positive_signals": [],
            "analysis_limitations": ["Target URL has no valid hostname."],
            "recommendations": ["Enter a valid hostname (e.g., example.com)."]
        }

    domain = hostname.lower()
    parts = domain.split(".")
    tld = parts[-1] if len(parts) > 1 else ""
    registered_domain = ".".join(parts[-2:]) if len(parts) >= 2 else domain

    # Tracking Structures
    score_components: List[Dict[str, Any]] = []
    findings: List[Dict[str, Any]] = []
    positive_signals: List[str] = []
    analysis_limitations: List[str] = []
    modules_completed = 0
    total_modules = 9

    # Module 1: URL Normalization completed
    modules_completed += 1

    # Check unencrypted HTTP protocol
    if scheme == "http":
        findings.append({
            "id": "unencrypted-http",
            "category": "Connection Security",
            "title": "Unencrypted HTTP Protocol",
            "severity": "MEDIUM",
            "evidence_type": "SECURITY_CONFIGURATION",
            "score_impact": 15,
            "statusTag": "Cleartext Protocol",
            "reason": "The website operates over cleartext HTTP without TLS cryptographic encryption.",
            "evidence": f"Requested protocol: {scheme.upper()}://",
            "remediation": "Configure HTTPS and redirect all HTTP traffic to port 443."
        })
        score_components.append({
            "id": "unencrypted_http",
            "title": "Unencrypted HTTP Protocol",
            "severity": "MEDIUM",
            "evidence_type": "SECURITY_CONFIGURATION",
            "score_contribution": 15,
            "confidence": "HIGH",
            "reason": "Cleartext transmission enables interception."
        })

    # URL-Level Lexical Brand Impersonation check
    full_url_lexical = f"{domain}{path}".lower()
    has_credential_word = any(cw in full_url_lexical for cw in CREDENTIAL_KEYWORDS)
    for brand_key, official_domains in KNOWN_BRANDS.items():
        is_legit_brand_domain = any(domain == off or domain.endswith("." + off) for off in official_domains)
        if is_legit_brand_domain:
            continue
        if brand_key in domain:
            if has_credential_word:
                findings.append({
                    "id": f"brand-impersonation-url-{brand_key}",
                    "category": "Phishing & Brand Security",
                    "title": f"Suspected Brand Impersonation in URL ({brand_key.capitalize()})",
                    "severity": "HIGH",
                    "evidence_type": "STRONG_EVIDENCE",
                    "score_impact": 45,
                    "statusTag": "Brand Spoofing",
                    "reason": f"Target URL contains brand name '{brand_key}' combined with credential keywords on an unauthorized domain.",
                    "evidence": f"Target domain '{domain}' is not among official {brand_key.capitalize()} domains.",
                    "remediation": "Avoid entering credentials on unverified third-party domains."
                })
                score_components.append({
                    "id": f"brand_impersonation_url_{brand_key}",
                    "title": f"Suspected Brand Impersonation ({brand_key.capitalize()})",
                    "severity": "HIGH",
                    "evidence_type": "STRONG_EVIDENCE",
                    "score_contribution": 45,
                    "confidence": "HIGH",
                    "reason": f"Brand '{brand_key}' and credential keywords on unauthorized domain."
                })
                break

    # Uncommon / Suspicious TLD check
    if tld in SUSPICIOUS_TLDS:
        findings.append({
            "id": "suspicious-tld",
            "category": "Domain & Infrastructure",
            "title": "Uncommon / Elevated-Risk Top-Level Domain",
            "severity": "LOW",
            "evidence_type": "MODERATE_HEURISTIC",
            "score_impact": 10,
            "statusTag": "Observed Pattern",
            "reason": f"The top-level domain '.{tld}' has an elevated statistical incidence in temporary phishing campaigns.",
            "evidence": f"TLD: .{tld}",
            "remediation": "Review domain authenticity and registrant details."
        })
        score_components.append({
            "id": "suspicious_tld",
            "title": "Uncommon Top-Level Domain",
            "severity": "LOW",
            "evidence_type": "MODERATE_HEURISTIC",
            "score_contribution": 10,
            "confidence": "MEDIUM",
            "reason": f"Elevated-risk TLD: .{tld}"
        })

    # Subdomain depth
    if len(parts) > 4:
        findings.append({
            "id": "excessive-subdomains",
            "category": "Domain & Infrastructure",
            "title": "Excessive Subdomain Depth",
            "severity": "LOW",
            "evidence_type": "MODERATE_HEURISTIC",
            "score_impact": 10,
            "statusTag": "Observed Pattern",
            "reason": f"Hostname contains {len(parts)-1} subdomain levels which can be used to obfuscate destination names.",
            "evidence": f"Subdomain levels: {len(parts)-1}",
            "remediation": "Audit DNS naming hierarchy."
        })
        score_components.append({
            "id": "excessive_subdomains",
            "title": "Excessive Subdomain Depth",
            "severity": "LOW",
            "evidence_type": "MODERATE_HEURISTIC",
            "score_contribution": 10,
            "confidence": "LOW",
            "reason": "Deep subdomain nesting observed."
        })

    # -------------------------------------------------------------
    # MODULE 2: DNS & Network Infrastructure
    # -------------------------------------------------------------
    dns_resolved = False
    resolved_ips: List[str] = []
    dns_error: Optional[str] = None
    is_private_destination = False

    is_safe_ip, ips_found, ssrf_err = check_ssrf_safety(hostname)
    resolved_ips = ips_found
    if ssrf_err and "DNS Resolution failed" in ssrf_err:
        dns_error = ssrf_err
        analysis_limitations.append(f"DNS Resolution failed for host '{hostname}'. Destination is offline or unresolvable.")
    elif not is_safe_ip:
        dns_resolved = True
        is_private_destination = True
        dns_error = ssrf_err
        findings.append({
            "id": "ssrf-private-ip",
            "category": "Infrastructure & Routing",
            "title": "Internal / Private IP Address Destination",
            "severity": "CRITICAL",
            "evidence_type": "VERIFIED_THREAT",
            "score_impact": 95,
            "statusTag": "Blocked Destination",
            "reason": f"Target resolves to internal or non-routable address ({resolved_ips[0] if resolved_ips else 'private'}).",
            "evidence": ssrf_err or "Private RFC1918 / Loopback address detected",
            "remediation": "Block outbound requests to internal infrastructure ranges."
        })
        score_components.append({
            "id": "ssrf_private_ip",
            "title": "Private / Internal Network Destination",
            "severity": "CRITICAL",
            "evidence_type": "VERIFIED_THREAT",
            "score_contribution": 95,
            "confidence": "HIGH",
            "reason": "Host points to internal or restricted IP range."
        })
    else:
        dns_resolved = True
        modules_completed += 1
        positive_signals.append(f"DNS resolution successful ({resolved_ips[0]})")

    # Raw IP Hostname Check
    try:
        ipaddress.ip_address(hostname)
        findings.append({
            "id": "raw-ip-host",
            "category": "Domain & Infrastructure",
            "title": "Direct IP Hostname Access",
            "severity": "MEDIUM",
            "evidence_type": "MODERATE_HEURISTIC",
            "score_impact": 15,
            "statusTag": "Suspicious Indicator",
            "reason": "Website is accessed directly via numeric IP address rather than a registered domain.",
            "evidence": f"Raw host: {hostname}",
            "remediation": "Use registered DNS domain names with authenticated TLS certificates."
        })
        score_components.append({
            "id": "raw_ip_host",
            "title": "Direct IP Hostname Access",
            "severity": "MEDIUM",
            "evidence_type": "MODERATE_HEURISTIC",
            "score_contribution": 15,
            "confidence": "HIGH",
            "reason": "Direct numeric IP access bypasses domain reputation filters."
        })
    except ValueError:
        pass

    # -------------------------------------------------------------
    # MODULE 3 & 4: HTTP Reachability, TLS, and Response Headers
    # -------------------------------------------------------------
    tls_details: Dict[str, Any] = {}
    http_reachable = False
    status_code: Optional[int] = None
    response_headers: Dict[str, str] = {}
    final_url = url
    html_content = ""
    redirect_tracker = WebsiteRedirectTracker(url)
    server_header = "N/A"
    content_type = "N/A"

    if dns_resolved and not is_private_destination:
        # TLS Inspection
        if scheme == "https":
            tls_details = inspect_tls_certificate(hostname, port)
            if tls_details.get("valid"):
                modules_completed += 1
                positive_signals.append(f"Valid TLS certificate (Issued by {tls_details.get('issuer', 'Trusted CA')})")
                if tls_details.get("is_expired"):
                    findings.append({
                        "id": "tls-expired",
                        "category": "SSL / TLS Security",
                        "title": "Expired SSL/TLS Certificate",
                        "severity": "HIGH",
                        "evidence_type": "STRONG_EVIDENCE",
                        "score_impact": 35,
                        "statusTag": "Certificate Issue",
                        "reason": "The server's cryptographic certificate has expired and is no longer trusted.",
                        "evidence": f"Expired at: {tls_details.get('not_after')}",
                        "remediation": "Renew and rebind a current SSL/TLS certificate immediately."
                    })
                    score_components.append({
                        "id": "tls_expired",
                        "title": "Expired SSL/TLS Certificate",
                        "severity": "HIGH",
                        "evidence_type": "STRONG_EVIDENCE",
                        "score_contribution": 35,
                        "confidence": "HIGH",
                        "reason": "Expired TLS certificate."
                    })
                elif tls_details.get("hostname_mismatch"):
                    findings.append({
                        "id": "tls-hostname-mismatch",
                        "category": "SSL / TLS Security",
                        "title": "Certificate Hostname Mismatch",
                        "severity": "HIGH",
                        "evidence_type": "STRONG_EVIDENCE",
                        "score_impact": 30,
                        "statusTag": "Certificate Issue",
                        "reason": f"Certificate common name/SANs do not match the target host '{hostname}'.",
                        "evidence": f"Certificate CN: {tls_details.get('subject_cn')}",
                        "remediation": "Configure certificate with matching Subject Alternative Names (SANs)."
                    })
                    score_components.append({
                        "id": "tls_mismatch",
                        "title": "Certificate Hostname Mismatch",
                        "severity": "HIGH",
                        "evidence_type": "STRONG_EVIDENCE",
                        "score_contribution": 30,
                        "confidence": "HIGH",
                        "reason": "Host name does not match certificate CN/SAN."
                    })
                elif tls_details.get("is_self_signed"):
                    findings.append({
                        "id": "tls-self-signed",
                        "category": "SSL / TLS Security",
                        "title": "Self-Signed SSL/TLS Certificate",
                        "severity": "MEDIUM",
                        "evidence_type": "MODERATE_HEURISTIC",
                        "score_impact": 20,
                        "statusTag": "Untrusted Certificate",
                        "reason": "Certificate is self-signed and not issued by a recognized Certificate Authority.",
                        "evidence": f"Issuer: {tls_details.get('issuer')}",
                        "remediation": "Deploy a certificate signed by a publicly recognized CA (e.g. Let's Encrypt)."
                    })
                    score_components.append({
                        "id": "tls_self_signed",
                        "title": "Self-Signed Certificate",
                        "severity": "MEDIUM",
                        "evidence_type": "MODERATE_HEURISTIC",
                        "score_contribution": 20,
                        "confidence": "HIGH",
                        "reason": "Self-signed certificate without public trust chain."
                    })
            else:
                analysis_limitations.append(f"TLS Inspection failed: {tls_details.get('error', 'Handshake error')}")

        # HTTP Network Request
        opener = urllib.request.build_opener(redirect_tracker)
        opener.addheaders = [
            ("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) CyberWatch-Website-Auditor/2.0"),
            ("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
        ]

        try:
            with opener.open(url, timeout=4.5) as resp:
                http_reachable = True
                final_url = resp.geturl()
                status_code = resp.getcode()
                response_headers = {k.lower(): v for k, v in resp.info().items()}
                server_header = response_headers.get("server", "N/A")
                content_type = response_headers.get("content-type", "text/html")
                html_bytes = resp.read(1500 * 1024)  # 1.5MB max
                html_content = html_bytes.decode("utf-8", errors="ignore")
                modules_completed += 1
                positive_signals.append(f"Website responded successfully (HTTP {status_code})")
        except urllib.error.HTTPError as e:
            http_reachable = True
            final_url = e.url or url
            status_code = e.code
            response_headers = {k.lower(): v for k, v in e.headers.items()}
            server_header = response_headers.get("server", "N/A")
            content_type = response_headers.get("content-type", "text/html")
            try:
                html_content = e.read(500 * 1024).decode("utf-8", errors="ignore")
            except Exception:
                html_content = ""
            modules_completed += 1
        except Exception as e:
            analysis_limitations.append(f"HTTP Connection error: {str(e)}")
    else:
        if not is_private_destination:
            analysis_limitations.append("HTTP and TLS analysis skipped due to unresolvable hostname.")

    # -------------------------------------------------------------
    # MODULE 5: HTTP Security Headers Evaluation (Conservative Scoring)
    # -------------------------------------------------------------
    security_headers_audit: Dict[str, Dict[str, Any]] = {}
    header_definitions = [
        ("strict-transport-security", "Strict-Transport-Security", "HSTS enforces HTTPS connections.", 3),
        ("content-security-policy", "Content-Security-Policy", "CSP restricts resource loading and prevents XSS.", 4),
        ("x-frame-options", "X-Frame-Options", "Protects visitors from clickjacking frame embedding.", 2),
        ("x-content-type-options", "X-Content-Type-Options", "Prevents MIME type sniffing.", 2),
        ("referrer-policy", "Referrer-Policy", "Controls referrer information leakage across origins.", 2),
        ("permissions-policy", "Permissions-Policy", "Restricts browser hardware and feature access.", 2)
    ]

    header_score_total = 0
    if http_reachable:
        modules_completed += 1
        for header_key, header_display, header_desc, points in header_definitions:
            val = response_headers.get(header_key)
            if val:
                security_headers_audit[header_display] = {"status": "Present", "value": val}
            else:
                security_headers_audit[header_display] = {"status": "Missing", "value": ""}
                header_score_total += points
                findings.append({
                    "id": f"header-missing-{header_key}",
                    "category": "Security Headers",
                    "title": f"Missing Security Header: {header_display}",
                    "severity": "LOW",
                    "evidence_type": "SECURITY_CONFIGURATION",
                    "score_impact": points,
                    "statusTag": "Configuration Observation",
                    "reason": f"Header '{header_display}' is not configured on the web server.",
                    "evidence": f"Header '{header_key}' absent in HTTP response.",
                    "remediation": f"Configure '{header_display}' in web server settings."
                })

        capped_header_score = min(header_score_total, 15)
        if capped_header_score > 0:
            score_components.append({
                "id": "security_headers_missing",
                "title": "Missing HTTP Security Hardening Headers",
                "severity": "LOW",
                "evidence_type": "SECURITY_CONFIGURATION",
                "score_contribution": capped_header_score,
                "confidence": "HIGH",
                "reason": f"Multiple recommended defense-in-depth headers not configured (capped at {capped_header_score} pts)."
            })
    else:
        analysis_limitations.append("Security headers inspection unavailable because HTTP response was not received.")

    # -------------------------------------------------------------
    # MODULE 6: Redirect Analysis
    # -------------------------------------------------------------
    redirect_hops = redirect_tracker.redirects
    if redirect_hops:
        modules_completed += 1
        if url.startswith("http://") and final_url.startswith("https://"):
            positive_signals.append("Automatic HTTP to HTTPS redirect upgrade active")

        final_parsed = urlparse(final_url)
        final_domain = (final_parsed.hostname or "").lower()
        if final_domain and final_domain != domain and not final_domain.endswith("." + registered_domain):
            findings.append({
                "id": "cross-domain-redirect",
                "category": "Redirect Analysis",
                "title": "Cross-Domain Redirect to External Destination",
                "severity": "MEDIUM",
                "evidence_type": "MODERATE_HEURISTIC",
                "score_impact": 20,
                "statusTag": "Observed Redirect",
                "reason": f"Website redirects visitors to an external, unrelated domain '{final_domain}'.",
                "evidence": f"{url} -> {final_url}",
                "remediation": "Ensure cross-domain redirects point to verified partner destinations."
            })
            score_components.append({
                "id": "cross_domain_redirect",
                "title": "Cross-Domain Redirect",
                "severity": "MEDIUM",
                "evidence_type": "MODERATE_HEURISTIC",
                "score_contribution": 20,
                "confidence": "HIGH",
                "reason": f"Redirects across domain boundary to {final_domain}."
            })
    else:
        if http_reachable:
            modules_completed += 1
            positive_signals.append("Direct response with no unexpected redirect chain")

    # -------------------------------------------------------------
    # MODULE 7, 8 & 9: HTML Content, Forms & Context-Aware Brand Analysis
    # -------------------------------------------------------------
    html_parser = AdvancedWebsiteHTMLParser(domain, final_url)
    detected_tech: List[Dict[str, str]] = []

    if html_content:
        modules_completed += 1
        try:
            html_parser.feed(html_content)
        except Exception:
            pass

        # Technology detection
        if "cf-ray" in response_headers or server_header.lower() == "cloudflare":
            detected_tech.append({"name": "Cloudflare", "category": "CDN & Security"})
        if "wp-content" in html_content or "wp-includes" in html_content:
            detected_tech.append({"name": "WordPress", "category": "CMS"})
        if "_next/static" in html_content:
            detected_tech.append({"name": "Next.js", "category": "Frontend Framework"})
        if "bootstrap" in html_content:
            detected_tech.append({"name": "Bootstrap", "category": "CSS Framework"})
        if "tailwind" in html_content:
            detected_tech.append({"name": "Tailwind CSS", "category": "CSS Framework"})
        if "react" in html_content or "_reactroot" in html_content.lower():
            detected_tech.append({"name": "React", "category": "JavaScript Library"})
        if "nginx" in server_header.lower():
            detected_tech.append({"name": "Nginx", "category": "Web Server"})
        elif "apache" in server_header.lower():
            detected_tech.append({"name": "Apache", "category": "Web Server"})

        # Form Security & Password submission check
        for form in html_parser.forms:
            action = form.get("action", "").strip()
            resolved_action = urljoin(final_url, action) if action else final_url
            parsed_action = urlparse(resolved_action)
            action_host = (parsed_action.hostname or "").lower()
            action_scheme = parsed_action.scheme.lower()

            # Insecure cleartext password submission
            if form.get("has_password") and action_scheme == "http":
                findings.append({
                    "id": "form-http-password",
                    "category": "Form Security",
                    "title": "Cleartext Password Form Submission",
                    "severity": "CRITICAL",
                    "evidence_type": "STRONG_EVIDENCE",
                    "score_impact": 40,
                    "statusTag": "High Risk Form",
                    "reason": "A form collecting user passwords submits credentials over unencrypted HTTP.",
                    "evidence": f"Form action target: {resolved_action}",
                    "remediation": "Ensure all authentication forms submit to strict HTTPS endpoints."
                })
                score_components.append({
                    "id": "cleartext_password_form",
                    "title": "Cleartext Password Form Action",
                    "severity": "CRITICAL",
                    "evidence_type": "STRONG_EVIDENCE",
                    "score_contribution": 40,
                    "confidence": "HIGH",
                    "reason": "Credentials submitted over unencrypted channel."
                })

            # Cross-Domain password submission (potential credential harvester)
            if form.get("has_password") and action_host and action_host != domain and not action_host.endswith("." + registered_domain):
                if not any(action_host.endswith(sso) for sso in [".okta.com", ".auth0.com", "accounts.google.com", "login.microsoftonline.com"]):
                    findings.append({
                        "id": "form-cross-domain-password",
                        "category": "Form Security",
                        "title": "Cross-Domain Password Submission Form",
                        "severity": "HIGH",
                        "evidence_type": "STRONG_EVIDENCE",
                        "score_impact": 35,
                        "statusTag": "Suspicious Form",
                        "reason": f"Password input submits credentials to an external third-party domain '{action_host}'.",
                        "evidence": f"Target endpoint: {resolved_action}",
                        "remediation": "Restrict credential submission to trusted same-origin authentication servers."
                    })
                    score_components.append({
                        "id": "cross_domain_password_form",
                        "title": "Cross-Domain Credential Submission",
                        "severity": "HIGH",
                        "evidence_type": "STRONG_EVIDENCE",
                        "score_contribution": 35,
                        "confidence": "HIGH",
                        "reason": f"Password submitted to unrelated domain: {action_host}"
                    })

        # Mixed Active Content check
        if scheme == "https" or final_url.startswith("https://"):
            insecure_resources = [s["src"] for s in html_parser.scripts if s.get("src", "").startswith("http://")]
            insecure_styles = [s for s in html_parser.stylesheets if s.startswith("http://")]
            if insecure_resources or insecure_styles:
                findings.append({
                    "id": "mixed-active-content",
                    "category": "Content & Resources",
                    "title": "Mixed Active Content Insecurity",
                    "severity": "MEDIUM",
                    "evidence_type": "MODERATE_HEURISTIC",
                    "score_impact": 15,
                    "statusTag": "Mixed Content",
                    "reason": "HTTPS page loads active scripts or stylesheets over unencrypted HTTP.",
                    "evidence": f"First mixed resource: {insecure_resources[0] if insecure_resources else insecure_styles[0]}",
                    "remediation": "Rewrite all external asset links to secure HTTPS."
                })
                score_components.append({
                    "id": "mixed_active_content",
                    "title": "Mixed Active Content",
                    "severity": "MEDIUM",
                    "evidence_type": "MODERATE_HEURISTIC",
                    "score_contribution": 15,
                    "confidence": "HIGH",
                    "reason": "Insecure active resources on HTTPS origin."
                })

        # Obfuscated JavaScript flags
        if html_parser.obfuscated_js_indicators > 2:
            findings.append({
                "id": "obfuscated-js",
                "category": "Content & Resources",
                "title": "Obfuscated Inline JavaScript Patterns",
                "severity": "LOW",
                "evidence_type": "MODERATE_HEURISTIC",
                "score_impact": 10,
                "statusTag": "Code Pattern",
                "reason": "Inline scripts use dynamic string evaluation or decoding patterns (eval/unescape).",
                "evidence": f"Detected {html_parser.obfuscated_js_indicators} dynamic evaluation patterns.",
                "remediation": "Refactor scripts to use standard modern JavaScript modules without eval."
            })
            score_components.append({
                "id": "obfuscated_inline_js",
                "title": "Obfuscated JavaScript Patterns",
                "severity": "LOW",
                "evidence_type": "MODERATE_HEURISTIC",
                "score_contribution": 10,
                "confidence": "MEDIUM",
                "reason": "Dynamic eval / unescape calls in inline scripts."
            })
    else:
        if http_reachable:
            analysis_limitations.append("Website returned empty HTML body content.")

    # -------------------------------------------------------------
    # MODULE 10: Live Multi-Source Threat Intelligence Lookup
    # -------------------------------------------------------------
    ti_result = query_all_threat_intelligence(url)
    ti_sources = ti_result.get("sources_queried", [])
    ti_findings = ti_result.get("findings", [])
    ti_configured_count = ti_result.get("configured_sources", 0)
    ti_total_count = ti_result.get("total_sources", 4)
    ti_executed_count = ti_result.get("executed_sources", 0)

    has_verified_threat = False
    for tf in ti_findings:
        findings.append(tf)
        has_verified_threat = True
        score_components.append({
            "id": tf["id"],
            "title": tf["title"],
            "severity": "CRITICAL",
            "evidence_type": "VERIFIED_THREAT",
            "score_contribution": 95,
            "confidence": "HIGH",
            "reason": tf["reason"]
        })

    if ti_executed_count > 0:
        modules_completed += 1
        if not has_verified_threat:
            positive_signals.append(f"Threat intelligence feeds queried cleanly ({ti_executed_count} active feeds)")
    else:
        analysis_limitations.append("External threat intelligence feeds not configured (API keys missing).")

    # Positive signal fallback if no phishing indicators
    if not any(f.get("category") == "Phishing & Brand Security" for f in findings):
        positive_signals.append("No phishing or brand spoofing patterns detected")

    positive_signals = positive_signals[:5]

    # -------------------------------------------------------------
    # DETERMINISTIC RISK SCORE CALCULATION & HEURISTIC CAP
    # -------------------------------------------------------------
    raw_score = sum(c.get("score_contribution", 0) for c in score_components)

    is_verified = any(c.get("evidence_type") == "VERIFIED_THREAT" for c in score_components)
    if is_verified:
        final_score = min(100, max(90, raw_score))
    else:
        final_score = min(85, raw_score)

    final_score = max(0, min(100, int(round(final_score))))

    # Risk Level classification
    if final_score >= 90:
        risk_level = "CRITICAL"
        security_verdict = "CRITICAL RISK"
    elif final_score >= 50:
        risk_level = "HIGH"
        security_verdict = "HIGH RISK"
    elif final_score >= 20:
        risk_level = "MODERATE"
        security_verdict = "MODERATE RISK"
    else:
        risk_level = "LOW"
        security_verdict = "LOW RISK"

    # Confidence calculation
    if dns_resolved and http_reachable and (ti_executed_count > 0 or len(findings) > 0):
        confidence = "HIGH"
    elif dns_resolved and http_reachable:
        confidence = "MODERATE"
    else:
        confidence = "LIMITED"

    # Coverage calculations
    local_percent = int(round((modules_completed / total_modules) * 100))
    local_coverage_status = "FULL" if local_percent >= 80 else "PARTIAL"

    ti_coverage_percent = int(round((ti_configured_count / ti_total_count) * 100))
    ti_coverage_status = "FULL" if ti_configured_count >= ti_total_count else ("PARTIAL" if ti_configured_count > 0 else "NOT CONFIGURED")

    # Explanations
    if findings:
        summary_explanation = f"{len(findings)} security observation{'s were' if len(findings) > 1 else ' was'} identified during technical inspection."
    else:
        summary_explanation = "Technical checks completed cleanly with zero security concerns detected across active inspection modules."

    # Recommendations
    recommendations_list = []
    if risk_level in ["CRITICAL", "HIGH"]:
        recommendations_list.append("Exercise extreme caution. Do not enter passwords, payment cards, or sensitive personal data on this website.")
        recommendations_list.append("Verify the official domain spelling and authenticity before continuing.")
    elif risk_level == "MODERATE":
        recommendations_list.append("Review the security hardening findings and ensure HTTPS encryption is active before submitting sensitive credentials.")
    else:
        recommendations_list.append("Continue following standard safe browsing hygiene.")
        recommendations_list.append("Always verify the exact domain spelling when signing into personal accounts.")

    # Unique external resource domains
    ext_scripts = [s["src"] for s in html_parser.scripts if s.get("src")]
    unique_ext_domains = set()
    for s_url in ext_scripts + html_parser.stylesheets + [i["src"] for i in html_parser.iframes if i.get("src")]:
        try:
            p = urlparse(urljoin(final_url, s_url))
            if p.hostname and p.hostname.lower() != domain:
                unique_ext_domains.add(p.hostname.lower())
        except Exception:
            pass

    return {
        "url": url,
        "domain": domain,
        "scan_id": None,
        "timestamp": timestamp,
        "risk_score": final_score,
        "risk_level": risk_level,
        "security_verdict": security_verdict,
        "confidence": confidence,
        "explanation": summary_explanation,
        "status": "completed",
        "findings": findings,
        "score_components": score_components,
        "positive_signals": positive_signals,
        "analysis_limitations": analysis_limitations,
        "recommendations": recommendations_list,
        "local_analysis_coverage": {
            "status": local_coverage_status,
            "percent": local_percent,
            "modules_completed": modules_completed,
            "total_modules": total_modules
        },
        "threat_intelligence_coverage": {
            "status": ti_coverage_status,
            "percent": ti_coverage_percent,
            "sources_configured": ti_configured_count,
            "sources_total": ti_total_count
        },
        "threat_intelligence_sources": ti_sources,
        "threat_intelligence": ti_result,
        "security_headers": security_headers_audit,
        "technologies": detected_tech,
        "external_resources": {
            "scripts": len(ext_scripts),
            "css": len(html_parser.stylesheets),
            "images": len(html_parser.images),
            "iframes": len(html_parser.iframes),
            "unique_domains": len(unique_ext_domains),
            "domains_list": sorted(list(unique_ext_domains))
        },
        "technical_details": {
            "dns": {
                "resolved": dns_resolved,
                "resolved_ips": resolved_ips,
                "is_private": is_private_destination,
                "error": dns_error
            },
            "tls": tls_details,
            "http": {
                "reachable": http_reachable,
                "status_code": status_code,
                "server": server_header,
                "content_type": content_type,
                "final_url": final_url
            },
            "redirects": {
                "count": len(redirect_hops),
                "chain": redirect_hops
            },
            "content": {
                "title": html_parser.title.strip() if html_parser.title else "N/A",
                "meta_description": html_parser.meta_description.strip() if html_parser.meta_description else "N/A",
                "canonical": html_parser.canonical_url.strip() if html_parser.canonical_url else "N/A",
                "language": html_parser.language or "N/A",
                "forms_count": len(html_parser.forms),
                "has_password_input": html_parser.has_password_input,
                "has_credit_card_input": html_parser.has_credit_card_input,
                "has_login_button": html_parser.has_login_button,
                "obfuscated_js_flags": html_parser.obfuscated_js_indicators
            },
            "forms": html_parser.forms,
            "scripts": html_parser.scripts,
            "iframes": html_parser.iframes
        }
    }
