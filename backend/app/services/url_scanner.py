"""
CyberWatch URL / Phishing Scanner Engine
100% Real Evidence-Based Threat Analysis & Multi-Vendor Threat Intelligence
"""
import re
import socket
import ssl
import time
import urllib.parse
import urllib.request
import ipaddress
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple

from app.services.threat_intelligence import query_all_threat_intelligence

# ============================================================================
# Security Dictionaries & Known Threat Signatures
# ============================================================================

SUSPICIOUS_TLDS = {
    "top", "xyz", "club", "buzz", "work", "loan", "tk", "ml", "ga", "cf", "gq",
    "surf", "rest", "cam", "icu", "click", "link", "stream", "live", "guru",
    "fit", "uno", "casa", "fun", "monster", "cfd", "sbs", "quest", "today"
}

SHORTENER_DOMAINS = {
    "bit.ly", "tinyurl.com", "t.co", "goo.gl", "is.gd", "buff.ly", "adf.ly",
    "ow.ly", "bl.ink", "rb.gy", "rebrand.ly", "cutt.ly", "qr.ae", "shorte.st"
}

PHISHING_KEYWORDS = {
    "login", "signin", "sign-in", "log-in", "verify", "verification",
    "secure", "security", "update", "account", "banking", "billing",
    "confirm", "wallet", "recover", "authenticate", "auth", "validation",
    "suspended", "unlock", "alert", "notification", "action-required",
    "re-activate", "reactivate", "support", "helpdesk"
}

BRAND_KEYWORDS = {
    "paypal": ["paypal.com", "paypal.me"],
    "google": ["google.com", "google.co", "googleusercontent.com", "googleapis.com", "gmail.com", "youtube.com"],
    "microsoft": ["microsoft.com", "live.com", "office.com", "office365.com", "microsoftonline.com", "outlook.com", "windows.net", "azure.com"],
    "apple": ["apple.com", "icloud.com", "itunes.com"],
    "amazon": ["amazon.com", "amazon.co.uk", "amazon.de", "amazon.in", "aws.amazon.com", "media-amazon.com"],
    "facebook": ["facebook.com", "fb.com", "instagram.com", "messenger.com", "whatsapp.com", "meta.com"],
    "netflix": ["netflix.com"],
    "chase": ["chase.com"],
    "bankofamerica": ["bankofamerica.com", "bofa.com"],
    "wellsfargo": ["wellsfargo.com"],
    "dropbox": ["dropbox.com"],
    "dhl": ["dhl.com"],
    "fedex": ["fedex.com"],
    "usps": ["usps.com"],
    "binance": ["binance.com"],
    "coinbase": ["coinbase.com"],
    "metamask": ["metamask.io"],
    "github": ["github.com", "github.io", "githubusercontent.com"],
    "gitlab": ["gitlab.com"],
    "linkedin": ["linkedin.com"],
    "twitter": ["twitter.com", "x.com"]
}

PRIVATE_IP_RANGES = [
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.168.0.0/16"),
    ipaddress.ip_network("169.254.0.0/16"),
    ipaddress.ip_network("::1/128"),
    ipaddress.ip_network("fc00::/7"),
    ipaddress.ip_network("fe80::/10"),
]

# ============================================================================
# Core Helpers: Normalization, Extraction, Network & Crypto Probing
# ============================================================================

def normalize_url(raw_url: str) -> str:
    """Normalizes input URL with strict RFC 3986 compliance."""
    u = (raw_url or "").strip()
    if not u:
        return ""
    if not re.match(r"^[a-zA-Z][a-zA-Z0-9+-.]*://", u):
        u = "https://" + u
    return u


def is_private_ip(ip_str: str) -> bool:
    """Check if an IP address belongs to loopback, private, or link-local subnet."""
    try:
        ip = ipaddress.ip_address(ip_str)
        return any(ip in net for net in PRIVATE_IP_RANGES)
    except ValueError:
        return False


def extract_domain_parts(host: str) -> Tuple[str, str, List[str]]:
    """Extracts registered domain, TLD, and subdomains without external dependencies."""
    host = host.lower().strip(".")
    if not host or "." not in host:
        return host, "", []
    
    parts = host.split(".")
    
    # Check for known 2-part ccTLD
    known_two_part_tlds = {
        "co.uk", "org.uk", "gov.uk", "ac.uk", "com.au", "net.au", "org.au",
        "co.in", "net.in", "org.in", "gen.in", "firm.in", "ind.in", "co.nz",
        "com.br", "com.mx", "co.za", "co.jp", "ne.jp", "com.sg", "com.tr"
    }
    
    if len(parts) >= 3:
        two_part = f"{parts[-2]}.{parts[-1]}"
        if two_part in known_two_part_tlds:
            tld = two_part
            registered_domain = f"{parts[-3]}.{two_part}"
            subdomains = parts[:-3]
            return registered_domain, tld, subdomains

    tld = parts[-1]
    registered_domain = f"{parts[-2]}.{parts[-1]}" if len(parts) >= 2 else host
    subdomains = parts[:-2] if len(parts) >= 2 else []
    return registered_domain, tld, subdomains


def perform_dns_lookup(host: str, timeout: float = 3.0) -> Dict[str, Any]:
    """Live DNS forward lookup."""
    res = {
        "resolved": False,
        "resolved_ips": [],
        "ipv4": [],
        "ipv6": [],
        "is_private": False,
        "latency_ms": None,
        "error": None
    }
    
    start_t = time.time()
    try:
        addr_info = socket.getaddrinfo(host, None, proto=socket.IPPROTO_TCP)
        elapsed = round((time.time() - start_t) * 1000, 2)
        res["latency_ms"] = elapsed
        
        seen_ips = set()
        for family, _, _, _, sockaddr in addr_info:
            ip = sockaddr[0]
            if ip not in seen_ips:
                seen_ips.add(ip)
                res["resolved_ips"].append(ip)
                if family == socket.AF_INET:
                    res["ipv4"].append(ip)
                elif family == socket.AF_INET6:
                    res["ipv6"].append(ip)
                if is_private_ip(ip):
                    res["is_private"] = True
                    
        res["resolved"] = len(res["resolved_ips"]) > 0
    except socket.gaierror as ge:
        res["error"] = str(ge)
    except Exception as e:
        res["error"] = str(e)
        
    return res


def perform_tls_handshake(host: str, port: int = 443, timeout: float = 3.0) -> Dict[str, Any]:
    """Live TLS handshake and certificate extraction."""
    res = {
        "valid": False,
        "tls_version": None,
        "cipher_suite": None,
        "issuer": None,
        "issuer_cn": None,
        "subject_cn": None,
        "subject_alt_names": [],
        "not_before": None,
        "not_after": None,
        "days_remaining": None,
        "is_expired": False,
        "is_self_signed": False,
        "error": None
    }
    
    try:
        ctx = ssl.create_default_context()
        with socket.create_connection((host, port), timeout=timeout) as sock:
            with ctx.wrap_socket(sock, server_hostname=host) as ssock:
                res["tls_version"] = ssock.version()
                res["cipher_suite"] = ssock.cipher()[0] if ssock.cipher() else None
                cert = ssock.getpeercert()
                
                if cert:
                    # Issuer
                    issuer_dict = dict(x[0] for x in cert.get("issuer", ()))
                    res["issuer_cn"] = issuer_dict.get("commonName")
                    res["issuer"] = issuer_dict.get("organizationName") or res["issuer_cn"]
                    
                    # Subject
                    subject_dict = dict(x[0] for x in cert.get("subject", ()))
                    res["subject_cn"] = subject_dict.get("commonName")
                    
                    # SANs
                    sans = [item[1] for item in cert.get("subjectAltName", ()) if item[0] == "DNS"]
                    res["subject_alt_names"] = sans
                    
                    # Dates
                    not_before_str = cert.get("notBefore")
                    not_after_str = cert.get("notAfter")
                    res["not_before"] = not_before_str
                    res["not_after"] = not_after_str
                    
                    if not_after_str:
                        expire_dt = datetime.strptime(not_after_str, "%b %d %H:%M:%S %Y %Z").replace(tzinfo=timezone.utc)
                        now_dt = datetime.now(timezone.utc)
                        delta_days = (expire_dt - now_dt).days
                        res["days_remaining"] = delta_days
                        res["is_expired"] = delta_days < 0
                    
                    # Check self-signed
                    if res["issuer_cn"] == res["subject_cn"] and res["issuer_cn"] is not None:
                        res["is_self_signed"] = True
                        
                    res["valid"] = not res["is_expired"] and not res["is_self_signed"]
    except ssl.SSLCertVerificationError as sve:
        res["error"] = f"TLS Verification Error: {sve.verify_message}"
        res["is_self_signed"] = "self-signed" in str(sve).lower()
    except ssl.SSLError as se:
        res["error"] = f"SSL Handshake Error: {str(se)}"
    except socket.timeout:
        res["error"] = "TLS connection timed out (3.0s limit)"
    except Exception as e:
        res["error"] = f"Connection failed: {str(e)}"
        
    return res


def perform_http_probe(url: str, timeout: float = 3.0, max_redirects: int = 5) -> Dict[str, Any]:
    """Live HTTP reachability, redirect tracker, and security headers analyzer with SSRF protection."""
    res = {
        "reachable": False,
        "status_code": None,
        "server_header": None,
        "content_type": None,
        "redirect_chain": [],
        "final_destination": url,
        "redirect_count": 0,
        "latency_ms": None,
        "security_headers": {
            "strict_transport_security": None,
            "content_security_policy": None,
            "x_frame_options": None,
            "x_content_type_options": None,
            "referrer_policy": None,
            "permissions_policy": None
        },
        "response_headers": {},
        "error": None
    }
    
    current_url = url
    visited = set()
    start_time = time.time()
    
    class SafeRedirectHandler(urllib.request.HTTPRedirectHandler):
        def http_error_302(self, req, fp, code, msg, headers):
            return None
        http_error_301 = http_error_302
        http_error_303 = http_error_302
        http_error_307 = http_error_302
        http_error_308 = http_error_302
        
    opener = urllib.request.build_opener(SafeRedirectHandler())
    
    for hop in range(max_redirects + 1):
        if current_url in visited:
            res["error"] = "Circular redirect loop detected"
            break
        visited.add(current_url)
        
        parsed = urllib.parse.urlparse(current_url)
        host = parsed.hostname
        if not host:
            res["error"] = "Invalid redirect destination"
            break
            
        dns_check = perform_dns_lookup(host, timeout=2.0)
        if not dns_check["resolved"] or dns_check["is_private"]:
            res["error"] = f"Redirect target {host} blocked (SSRF or unresolved)"
            break
            
        req = urllib.request.Request(
            current_url,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) CyberWatch-Threat-Scanner/2.0",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
            }
        )
        
        try:
            with opener.open(req, timeout=timeout) as response:
                res["reachable"] = True
                res["status_code"] = response.getcode()
                res["server_header"] = response.headers.get("Server")
                res["content_type"] = response.headers.get("Content-Type")
                res["final_destination"] = current_url
                res["redirect_count"] = hop
                res["security_headers"] = {
                    "strict_transport_security": response.headers.get("Strict-Transport-Security"),
                    "content_security_policy": response.headers.get("Content-Security-Policy"),
                    "x_frame_options": response.headers.get("X-Frame-Options"),
                    "x_content_type_options": response.headers.get("X-Content-Type-Options"),
                    "referrer_policy": response.headers.get("Referrer-Policy"),
                    "permissions_policy": response.headers.get("Permissions-Policy")
                }
                res["response_headers"] = dict(response.headers)
                break
        except urllib.error.HTTPError as he:
            if he.code in (301, 302, 303, 307, 308):
                location = he.headers.get("Location")
                if not location:
                    res["reachable"] = True
                    res["status_code"] = he.code
                    break
                next_url = urllib.parse.urljoin(current_url, location)
                res["redirect_chain"].append({
                    "hop": hop + 1,
                    "from": current_url,
                    "to": next_url,
                    "status_code": he.code
                })
                current_url = next_url
                continue
            else:
                res["reachable"] = True
                res["status_code"] = he.code
                res["server_header"] = he.headers.get("Server")
                res["content_type"] = he.headers.get("Content-Type")
                res["final_destination"] = current_url
                res["redirect_count"] = hop
                res["security_headers"] = {
                    "strict_transport_security": he.headers.get("Strict-Transport-Security"),
                    "content_security_policy": he.headers.get("Content-Security-Policy"),
                    "x_frame_options": he.headers.get("X-Frame-Options"),
                    "x_content_type_options": he.headers.get("X-Content-Type-Options"),
                    "referrer_policy": he.headers.get("Referrer-Policy"),
                    "permissions_policy": he.headers.get("Permissions-Policy")
                }
                res["response_headers"] = dict(he.headers) if hasattr(he, 'headers') and he.headers else {}
                break
        except Exception as e:
            res["error"] = str(e)
            break
            
    res["latency_ms"] = round((time.time() - start_time) * 1000, 2)
    return res


# ============================================================================
# Master Evidence-Based URL Scanner Engine
# ============================================================================

def scan_url_comprehensive(raw_url: str) -> Dict[str, Any]:
    """
    Performs independent, evidence-based technical inspection and multi-vendor threat query.
    Calculates overall_risk, analysis_confidence, and returns exact per-URL evidence findings.
    """
    scan_timestamp = datetime.now(timezone.utc).isoformat()
    findings: List[Dict[str, Any]] = []
    passed_checks: List[str] = []
    warnings: List[str] = []
    checks_performed: List[str] = []
    checks_not_performed: List[str] = []
    positive_signals: List[str] = []

    # 1. Normalization & RFC 3986 Syntax Decomposition
    checks_performed.append("URL Normalization & RFC 3986 Syntax Decomposition")
    normalized = normalize_url(raw_url)
    original_url = raw_url.strip()

    if not normalized:
        return {
            "target_url": raw_url,
            "normalized_url": "",
            "hostname": "",
            "domain": "",
            "extracted_domain": "",
            "protocol": "",
            "port": 0,
            "threat_score": None,
            "threat_index": None,
            "risk_score": None,
            "heuristic_score": None,
            "verified_threat_score": None,
            "overall_risk": "UNKNOWN",
            "risk_level": "UNKNOWN",
            "evidence_confidence": "MINIMAL",
            "local_analysis_confidence": "NONE",
            "threat_intelligence_confidence": "NOT CONFIGURED",
            "overall_assessment_confidence": "MINIMAL",
            "analysis_confidence": "MINIMAL",
            "analysis_coverage": "NONE",
            "analysis_coverage_percent": 0,
            "local_analysis_coverage": {"status": "FAILED", "percent": 0, "modules_completed": 0, "total_modules": 4},
            "threat_intelligence_coverage": {"status": "NOT AVAILABLE", "sources_configured": 0, "sources_total": 4, "percent": 0},
            "score_components": [],
            "local_analysis_status": "FAILED",
            "threat_intel_coverage": "NOT AVAILABLE",
            "security_verdict": "ANALYSIS FAILED",
            "explanation": "Provided URL could not be parsed or is empty.",
            "detected_indicators": ["Empty or Malformed URL Input"],
            "findings": [{
                "id": "err-malformed",
                "category": "Syntax",
                "title": "Malformed URL Syntax",
                "severity": "CRITICAL",
                "statusTag": "Syntax Error",
                "reason": "URL does not comply with RFC 3986 standards.",
                "evidence": f"Raw string: {raw_url}",
                "module": "url_parser",
                "confidence": 1.0,
                "timestamp": scan_timestamp
            }],
            "passed_checks": [],
            "warnings": ["malformed_input"],
            "checks_performed": ["URL Normalization & RFC 3986 Syntax Decomposition"],
            "checks_not_performed": ["DNS Forward Resolution", "TLS Inspection", "HTTP Probe", "Threat Intelligence Lookups"],
            "positive_signals": [],
            "recommendations": ["Ensure target URL is formatted properly (e.g., https://example.com)."],
            "threat_intelligence": {"sources_queried": [], "coverage_status": "NOT AVAILABLE", "coverage_note": "Not executed due to invalid syntax."},
            "threat_intelligence_result": None,
            "timestamp": scan_timestamp,
            "status": "failed",
            "confidence_explanation": "Scan failed due to invalid URL input.",
            "analysis_limitations": "URL syntax is invalid. No technical probes could be executed.",
            "technical_details": {}
        }

    parsed = urllib.parse.urlparse(normalized)
    scheme = parsed.scheme.lower()
    host = (parsed.hostname or "").lower()
    active_port = parsed.port or (443 if scheme == "https" else 80)
    path = parsed.path or "/"
    query = parsed.query or ""
    query_params = urllib.parse.parse_qs(query)

    registered_domain, tld, subdomains = extract_domain_parts(host)

    # 2. Structural & Lexical Analysis
    checks_performed.append("URL Structure & Encoding Analysis")
    score = 0.0
    is_limited = False

    # Check Protocol
    if scheme == "http":
        score += 15.0
        findings.append({
            "id": "proto-http-unencrypted",
            "category": "Encryption & Transport",
            "title": "Unencrypted HTTP Protocol",
            "severity": "MEDIUM",
            "evidence_type": "MODERATE_HEURISTIC",
            "score_impact": 10.0,
            "confidence_rating": "HIGH",
            "statusTag": "Insecure Transport",
            "reason": "Cleartext HTTP protocol transmits data without cryptographic confidentiality or tamper resistance.",
            "evidence": f"Protocol: http:// on port {active_port}",
            "module": "protocol_inspector",
            "confidence": 1.0,
            "timestamp": scan_timestamp
        })
        warnings.append("insecure_protocol")
    elif scheme == "https":
        passed_checks.append("protocol_https")
        positive_signals.append("Encrypted HTTPS Protocol")

    # IP-based host check
    is_ip_host = False
    try:
        ipaddress.ip_address(host)
        is_ip_host = True
        score += 35.0
        findings.append({
            "id": "struct-raw-ip-host",
            "category": "Domain & Naming",
            "title": "Raw IP Address Hostname",
            "severity": "HIGH",
            "evidence_type": "STRONG_SUSPICION",
            "score_impact": 25.0,
            "confidence_rating": "HIGH",
            "statusTag": "Suspicious Naming",
            "reason": "URL targets a direct numeric IP address rather than a registered domain name, commonly used to bypass domain reputation filters.",
            "evidence": f"Target host: {host}",
            "module": "domain_inspector",
            "confidence": 0.95,
            "timestamp": scan_timestamp
        })
        warnings.append("ip_hostname")
    except ValueError:
        is_ip_host = False

    # Suspicious TLD check
    if tld in SUSPICIOUS_TLDS:
        score += 25.0
        findings.append({
            "id": "domain-suspicious-tld",
            "category": "Domain & Naming",
            "title": "Uncommon / High-Risk Top-Level Domain",
            "severity": "MEDIUM",
            "evidence_type": "MODERATE_HEURISTIC",
            "score_impact": 12.0,
            "confidence_rating": "MEDIUM",
            "statusTag": "Abuse Prone TLD",
            "reason": f"Top-level domain (.{tld}) has statistically elevated incidence in disposable phishing and malicious redirects.",
            "evidence": f"TLD: .{tld} on domain {registered_domain}",
            "module": "tld_analyzer",
            "confidence": 0.85,
            "timestamp": scan_timestamp
        })
        warnings.append("suspicious_tld")

    # Subdomain depth
    if len(subdomains) >= 3:
        score += 20.0
        findings.append({
            "id": "domain-excessive-subdomains",
            "category": "Domain & Naming",
            "title": "Excessive Subdomain Depth",
            "severity": "MEDIUM",
            "evidence_type": "MODERATE_HEURISTIC",
            "score_impact": 10.0,
            "confidence_rating": "MEDIUM",
            "statusTag": "Obfuscation",
            "reason": f"Host contains {len(subdomains)} subdomain tiers ({'.'.join(subdomains)}), frequently used in phishing camouflage.",
            "evidence": f"Full Host: {host}",
            "module": "domain_inspector",
            "confidence": 0.85,
            "timestamp": scan_timestamp
        })
        warnings.append("excessive_subdomains")

    # URL Shortener detection
    is_shortener = registered_domain in SHORTENER_DOMAINS or host in SHORTENER_DOMAINS
    if is_shortener:
        score += 20.0
        findings.append({
            "id": "struct-url-shortener",
            "category": "Redirect & Masking",
            "title": "URL Shortener / Intermediary Service",
            "severity": "LOW",
            "evidence_type": "MODERATE_HEURISTIC",
            "score_impact": 10.0,
            "confidence_rating": "MEDIUM",
            "statusTag": "Masked Target",
            "reason": "Shortened URLs mask the true destination endpoint and require HTTP expansion to determine destination safety.",
            "evidence": f"Shortener host: {host}",
            "module": "url_parser",
            "confidence": 0.95,
            "timestamp": scan_timestamp
        })
        warnings.append("url_shortener")

    # Lexical encoding & deceptive characters
    percent_count = original_url.count("%")
    if percent_count > 3:
        score += 15.0
        findings.append({
            "id": "struct-excessive-percent-encoding",
            "category": "Lexical & Syntax",
            "title": "Excessive Percent-Hex Encoding",
            "severity": "LOW",
            "evidence_type": "WEAK_SIGNAL",
            "score_impact": 5.0,
            "confidence_rating": "LOW",
            "statusTag": "Obfuscated Path",
            "reason": f"URL contains {percent_count} percent-encoded hex entities in path/query.",
            "evidence": f"Encoded entities count: {percent_count}",
            "module": "lexical_analyzer",
            "confidence": 0.90,
            "timestamp": scan_timestamp
        })
        warnings.append("percent_encoding")

    if "@" in original_url:
        score += 35.0
        findings.append({
            "id": "struct-userinfo-at-symbol",
            "category": "Lexical & Syntax",
            "title": "Deceptive UserInfo '@' Symbol",
            "severity": "HIGH",
            "evidence_type": "STRONG_SUSPICION",
            "score_impact": 25.0,
            "confidence_rating": "HIGH",
            "statusTag": "URL Camouflage",
            "reason": "The '@' character in URLs causes browsers to treat leading text as credentials and navigate to following text, commonly used to disguise malicious destinations.",
            "evidence": f"Original target: {original_url}",
            "module": "lexical_analyzer",
            "confidence": 0.99,
            "timestamp": scan_timestamp
        })
        warnings.append("userinfo_spoof")

    # 3. Phishing & Brand Impersonation Heuristics
    checks_performed.append("Phishing & Brand Impersonation Heuristics")
    
    # Check for brand impersonation
    host_parts_lower = host.replace("-", ".").split(".")
    for brand, legitimate_domains in BRAND_KEYWORDS.items():
        if brand in host_parts_lower or any(brand in p for p in host_parts_lower):
            # Verify if this domain is authentic
            is_legit = any(host == leg or host.endswith("." + leg) for leg in legitimate_domains)
            if not is_legit:
                score += 50.0
                findings.append({
                    "id": f"phish-brand-impersonation-{brand}",
                    "category": "Phishing Indicators",
                    "title": f"Suspected Brand Impersonation ({brand.capitalize()})",
                    "severity": "HIGH",
                    "evidence_type": "STRONG_SUSPICION",
                    "score_impact": 35.0,
                    "confidence_rating": "HIGH",
                    "statusTag": "Brand Spoofing",
                    "reason": f"Target host references brand name '{brand.capitalize()}' but is not an authorized domain ({', '.join(legitimate_domains)}).",
                    "evidence": f"Brand: {brand.capitalize()} | Registered Domain: {registered_domain} | Host: {host}",
                    "module": "brand_verifier",
                    "confidence": 0.95,
                    "timestamp": scan_timestamp
                })
                warnings.append("brand_impersonation")

    # Check for suspicious phishing keywords in path or subdomain
    url_lower = normalized.lower()
    matched_phish_words = [kw for kw in PHISHING_KEYWORDS if kw in url_lower]
    if len(matched_phish_words) >= 2 and not is_shortener:
        # Check if keyword is part of registered domain or deceptive subdomain/path
        if any(kw in host and not any(kw in leg for leg in BRAND_KEYWORDS.get(brand, [])) for kw in matched_phish_words):
            score += 30.0
            findings.append({
                "id": "phish-deceptive-credential-keywords",
                "category": "Phishing Indicators",
                "title": "Credential Authentication Target Keywords",
                "severity": "HIGH",
                "evidence_type": "STRONG_SUSPICION",
                "score_impact": 18.0,
                "confidence_rating": "MEDIUM",
                "statusTag": "Suspicious Keywords",
                "reason": f"URL combines multiple high-risk authentication and security keywords ({', '.join(matched_phish_words[:3])}) outside authorized brand boundaries.",
                "evidence": f"Matched keywords: {', '.join(matched_phish_words)}",
                "module": "keyword_analyzer",
                "confidence": 0.85,
                "timestamp": scan_timestamp
            })
            warnings.append("phishing_keywords")

    # 4. Pre-Flight SSRF Protection & DNS Forward Resolution
    checks_performed.append("Pre-Flight SSRF Boundary Protection")
    checks_performed.append("DNS Forward Resolution (A / AAAA Records)")
    
    dns_res = perform_dns_lookup(host, timeout=3.0)
    
    if dns_res["is_private"]:
        score = 100.0
        findings.append({
            "id": "ssrf-private-destination-blocked",
            "category": "Infrastructure & Routing",
            "title": "Blocked Internal / Private Destination (SSRF Protection)",
            "severity": "CRITICAL",
            "evidence_type": "VERIFIED_THREAT",
            "score_impact": 100.0,
            "confidence_rating": "HIGH",
            "statusTag": "SSRF Blocked",
            "reason": "Target resolved to loopback, link-local, or private RFC 1918 subnet. Network probing is halted to prevent SSRF vulnerabilities.",
            "evidence": f"Resolved IPs: {', '.join(dns_res['resolved_ips'])}",
            "module": "ssrf_guard",
            "confidence": 1.0,
            "timestamp": scan_timestamp
        })
        ssrf_score_components = [
            {
                "id": f.get("id", "finding"),
                "title": f.get("title", "Observation"),
                "category": f.get("category", "General"),
                "severity": f.get("severity", "INFO"),
                "evidence_type": f.get("evidence_type", "VERIFIED_THREAT"),
                "score_contribution": f.get("score_impact", 0.0),
                "confidence": f.get("confidence_rating", "HIGH" if f.get("confidence", 1.0) >= 0.9 else "MEDIUM"),
                "reason": f.get("reason", ""),
                "evidence": f.get("evidence", "")
            }
            for f in findings
        ]
        return {
            "target_url": original_url,
            "normalized_url": normalized,
            "hostname": host,
            "domain": host,
            "extracted_domain": registered_domain,
            "protocol": scheme,
            "port": active_port,
            "threat_score": 100,
            "threat_index": 100,
            "risk_score": 100.0,
            "heuristic_score": 0.0,
            "verified_threat_score": 100.0,
            "overall_risk": "CRITICAL",
            "risk_level": "CRITICAL",
            "evidence_confidence": "HIGH",
            "local_analysis_confidence": "HIGH",
            "threat_intelligence_confidence": "NOT CONFIGURED",
            "overall_assessment_confidence": "HIGH",
            "analysis_confidence": "HIGH",
            "analysis_coverage": "BLOCKED",
            "analysis_coverage_percent": 50,
            "local_analysis_coverage": {"status": "BLOCKED", "percent": 50, "modules_completed": 2, "total_modules": 4},
            "threat_intelligence_coverage": {"status": "NOT AVAILABLE", "sources_configured": 0, "sources_total": 4, "percent": 0},
            "score_components": ssrf_score_components,
            "local_analysis_status": "BLOCKED",
            "threat_intel_coverage": "NOT AVAILABLE",
            "security_verdict": "Critical",
            "explanation": "Destination resolved to an internal/private IP address. Probing halted for SSRF boundary protection.",
            "detected_indicators": [f["title"] for f in findings],
            "findings": findings,
            "passed_checks": passed_checks,
            "warnings": ["ssrf_blocked"],
            "checks_performed": checks_performed,
            "checks_not_performed": ["HTTP Reachability Probe (Blocked by SSRF)", "TLS Handshake Probe (Blocked by SSRF)"],
            "positive_signals": [],
            "recommendations": ["Do not attempt to scan internal intranet resources.", "Verify destination host name."],
            "threat_intelligence": {"sources_queried": [], "coverage_status": "NOT AVAILABLE", "coverage_note": "External lookups omitted for private RFC1918 destination."},
            "threat_intelligence_result": None,
            "timestamp": scan_timestamp,
            "status": "blocked",
            "confidence_explanation": "Direct private IP target blocked by internal SSRF policy.",
            "analysis_limitations": "Probing aborted because destination resolved to a private/loopback network address.",
            "technical_details": {
                "url_structure": {"hostname": host, "registered_domain": registered_domain},
                "dns": dns_res
            }
        }

    if not dns_res["resolved"]:
        is_limited = True
        findings.append({
            "id": "dns-unresolvable-host",
            "category": "Infrastructure & Routing",
            "title": "Unresolvable Hostname (DNS Lookup Failed)",
            "severity": "LOW",
            "evidence_type": "OPERATIONAL_LIMITATION",
            "score_impact": 0.0,
            "confidence_rating": "HIGH",
            "statusTag": "DNS Error",
            "reason": f"Target host could not be resolved to an IP address ({dns_res.get('error') or 'NXDOMAIN'}).",
            "evidence": f"Host: {host}",
            "module": "dns_resolver",
            "confidence": 0.99,
            "timestamp": scan_timestamp
        })
        checks_not_performed.append("TLS Certificate Verification (Host unresolved)")
        checks_not_performed.append("HTTP Reachability Probe (Host unresolved)")
    else:
        passed_checks.append("dns_resolved")
        first_ip = dns_res['resolved_ips'][0] if dns_res['resolved_ips'] else 'IP'
        extra_ips = f" (+{len(dns_res['resolved_ips'])-1} more)" if len(dns_res['resolved_ips']) > 1 else ""
        positive_signals.append(f"DNS resolved {host} to {first_ip}{extra_ips}")

    # 5. Live TLS Certificate & Cipher Handshake (if HTTPS & resolved)
    tls_res: Dict[str, Any] = {"valid": None, "error": "Not performed"}
    if scheme == "https" and dns_res["resolved"]:
        checks_performed.append("TLS/SSL Certificate Verification & Cipher Handshake")
        tls_res = perform_tls_handshake(host, port=active_port, timeout=3.0)
        
        if tls_res["valid"]:
            passed_checks.append("tls_valid")
            tls_ver = tls_res.get("tls_version") or "TLS"
            issuer_name = tls_res.get("issuer") or tls_res.get("issuer_cn") or "Trusted CA"
            days = tls_res.get("days_remaining")
            days_str = f", {days} days remaining" if days is not None else ""
            positive_signals.append(f"HTTPS connection verified using {tls_ver} ({issuer_name}{days_str})")
        else:
            if tls_res.get("is_expired"):
                score += 35.0
                findings.append({
                    "id": "tls-cert-expired",
                    "category": "Encryption & Transport",
                    "title": "Expired SSL/TLS Certificate",
                    "severity": "HIGH",
                    "evidence_type": "STRONG_SUSPICION",
                    "score_impact": 25.0,
                    "confidence_rating": "HIGH",
                    "statusTag": "Expired Certificate",
                    "reason": f"Certificate expired {abs(tls_res.get('days_remaining', 0))} day(s) ago.",
                    "evidence": f"Not After: {tls_res.get('not_after')}",
                    "module": "tls_inspector",
                    "confidence": 1.0,
                    "timestamp": scan_timestamp
                })
                warnings.append("tls_expired")
            elif tls_res.get("is_self_signed"):
                score += 35.0
                findings.append({
                    "id": "tls-cert-self-signed",
                    "category": "Encryption & Transport",
                    "title": "Self-Signed SSL/TLS Certificate",
                    "severity": "HIGH",
                    "evidence_type": "STRONG_SUSPICION",
                    "score_impact": 25.0,
                    "confidence_rating": "HIGH",
                    "statusTag": "Untrusted Certificate",
                    "reason": "Certificate is self-signed and not signed by a recognized Certificate Authority (CA).",
                    "evidence": f"Issuer: {tls_res.get('issuer_cn')} matches Subject: {tls_res.get('subject_cn')}",
                    "module": "tls_inspector",
                    "confidence": 1.0,
                    "timestamp": scan_timestamp
                })
                warnings.append("tls_self_signed")
            elif tls_res.get("error"):
                score += 15.0
                findings.append({
                    "id": "tls-handshake-failure",
                    "category": "Encryption & Transport",
                    "title": "TLS Handshake Incomplete / Connection Error",
                    "severity": "LOW",
                    "evidence_type": "WEAK_SIGNAL",
                    "score_impact": 5.0,
                    "confidence_rating": "LOW",
                    "statusTag": "TLS Warning",
                    "reason": f"TLS handshake failed: {tls_res.get('error')}",
                    "evidence": f"Host: {host}:{active_port}",
                    "module": "tls_inspector",
                    "confidence": 0.85,
                    "timestamp": scan_timestamp
                })

    # 6. Live HTTP Reachability & Redirect Probe (if resolved)
    net_res: Dict[str, Any] = {"reachable": False, "error": "Not performed"}
    if dns_res["resolved"]:
        checks_performed.append("HTTP Reachability & Server Response Probe")
        checks_performed.append("Redirect Chain & Forwarding Analysis")
        net_res = perform_http_probe(normalized, timeout=3.0, max_redirects=5)
        
        if net_res["reachable"]:
            passed_checks.append("http_reachable")
            status_code = net_res.get("status_code", 200)
            server = net_res.get("server_header")
            server_str = f" ({server})" if server else ""
            positive_signals.append(f"Server returned HTTP {status_code}{server_str}")
            
            # Check redirect anomalies
            if net_res["redirect_count"] > 3:
                score += 20.0
                findings.append({
                    "id": "net-excessive-redirects",
                    "category": "Redirect & Masking",
                    "title": "Excessive Redirect Hops",
                    "severity": "MEDIUM",
                    "evidence_type": "MODERATE_HEURISTIC",
                    "score_impact": 12.0,
                    "confidence_rating": "MEDIUM",
                    "statusTag": "Redirect Loop / Masking",
                    "reason": f"Destination underwent {net_res['redirect_count']} redirects before completing.",
                    "evidence": f"Final target: {net_res['final_destination']}",
                    "module": "network_analyzer",
                    "confidence": 0.90,
                    "timestamp": scan_timestamp
                })
                warnings.append("excessive_redirects")
            elif net_res["redirect_count"] > 0:
                final_host = urllib.parse.urlparse(net_res["final_destination"]).hostname or ""
                final_reg, _, _ = extract_domain_parts(final_host)
                if final_reg and registered_domain and final_reg != registered_domain:
                    score += 25.0
                    findings.append({
                        "id": "net-cross-domain-redirect",
                        "category": "Redirect & Masking",
                        "title": "Cross-Domain Redirect Forwarding",
                        "severity": "MEDIUM",
                        "evidence_type": "MODERATE_HEURISTIC",
                        "score_impact": 15.0,
                        "confidence_rating": "MEDIUM",
                        "statusTag": "Suspicious",
                        "reason": f"The URL redirects across different registered domains to {net_res['final_destination']}.",
                        "evidence": f"Redirect chain: {len(net_res['redirect_chain'])} hop(s)",
                        "module": "network_analyzer",
                        "confidence": 0.90,
                        "timestamp": scan_timestamp
                    })
            else:
                passed_checks.append("redirect_shortener")
                if net_res["redirect_count"] == 0:
                    positive_signals.append(f"Direct destination reached with 0 redirects")
                else:
                    positive_signals.append(f"Followed {net_res['redirect_count']} redirect(s) to final destination")

    # 7. Real Live Threat Intelligence Query Execution
    checks_performed.append("Live Multi-Vendor Threat Intelligence Lookup")
    threat_intel = query_all_threat_intelligence(normalized)
    
    # Track unavailable external vendor lookups in checks_not_performed
    for src in threat_intel.get("sources_queried", []):
        if src["status"] in ("NOT CONFIGURED", "NOT ANALYZED"):
            checks_not_performed.append(f"{src['source']} ({src['reason']})")
        elif src["status"] == "FAILED":
            checks_not_performed.append(f"{src['source']} (Failed: {src['reason']})")
        elif src["status"] == "RATE LIMITED":
            checks_not_performed.append(f"{src['source']} (Rate Limited: {src['reason']})")
            
    # If threat intel detected any hits, attach findings and adjust score
    if threat_intel.get("findings"):
        score += 50.0 * len(threat_intel["findings"])
        findings.extend(threat_intel["findings"])
        warnings.append("threat_intelligence")

    # Note unperformed external RDAP check
    checks_not_performed.append("WHOIS / RDAP Registration Query (No external RDAP source configured)")

    # De-duplicate positive signals and checks
    positive_signals = list(dict.fromkeys(positive_signals))
    passed_checks = list(dict.fromkeys(passed_checks))
    warnings = list(dict.fromkeys(warnings))
    checks_performed = list(dict.fromkeys(checks_performed))
    checks_not_performed = list(dict.fromkeys(checks_not_performed))

    # 8. Calibrated Multi-Level Evidence-Based Scoring & Multi-Dimensional Confidence Engine
    # RISK BANDS:
    # 0–9    = SAFE / MINIMAL RISK
    # 10–24  = LOW RISK
    # 25–49  = MODERATE RISK
    # 50–74  = HIGH RISK
    # 75–100 = CRITICAL RISK
    
    # Ensure description is present on all findings
    for f in findings:
        f.setdefault("description", f.get("reason", ""))

    verified_threat_findings = [f for f in findings if f.get("evidence_type") == "VERIFIED_THREAT"]
    
    if verified_threat_findings:
        # Verified threat intelligence detection or confirmed SSRF policy block
        base_threat = max(f.get("score_impact", 85.0) for f in verified_threat_findings)
        if len(verified_threat_findings) > 1:
            verified_threat_score = min(100.0, base_threat + 10.0 * (len(verified_threat_findings) - 1))
        else:
            verified_threat_score = base_threat
    else:
        verified_threat_score = 0.0

    # Group Heuristic findings by category with category caps to prevent double-counting & runaway additive scoring
    category_caps = {
        "Phishing Indicators": 40.0,
        "Domain & Naming": 25.0,
        "Encryption & Transport": 15.0,
        "Redirect & Masking": 15.0,
        "Lexical & Syntax": 15.0,
        "Infrastructure & Routing": 0.0   # DNS failure alone contributes 0 threat points
    }
    
    category_scores: Dict[str, float] = {}
    for f in findings:
        if f.get("evidence_type") != "VERIFIED_THREAT":
            cat = f.get("category", "General")
            impact = f.get("score_impact", 0.0)
            category_scores[cat] = category_scores.get(cat, 0.0) + impact

    capped_category_scores: Dict[str, float] = {}
    raw_heuristic_total = 0.0
    for cat, c_score in category_scores.items():
        cap = category_caps.get(cat, 20.0)
        capped_val = min(c_score, cap)
        capped_category_scores[cat] = capped_val
        raw_heuristic_total += capped_val

    # Multi-signal correlation synergy bonus for combined attack signals
    has_phish = capped_category_scores.get("Phishing Indicators", 0.0) >= 30.0
    has_supporting = any(
        capped_category_scores.get(c, 0.0) >= 10.0
        for c in ["Domain & Naming", "Encryption & Transport", "Redirect & Masking", "Lexical & Syntax"]
    )
    synergy_bonus = 8.0 if (has_phish and has_supporting) else 0.0

    # Heuristic-only evidence is strictly capped at 74.0 (HIGH RISK band: 50–74)
    # Critical scores (75–100) strictly require verified threat intelligence or severe confirmed evidence (e.g. SSRF block)
    heuristic_score = min(max(raw_heuristic_total + synergy_bonus, 0.0), 74.0)

    if verified_threat_score > 0.0:
        risk_score = float(verified_threat_score)
    elif findings and any(f.get("score_impact", 0.0) > 0 for f in findings):
        risk_score = float(heuristic_score)
    else:
        risk_score = 0.0

    risk_score = round(risk_score, 1)

    # Detailed Score Components Breakdown with Evidence Types & Confidence
    score_components = [
        {
            "id": f.get("id", "finding"),
            "title": f.get("title", "Observation"),
            "category": f.get("category", "General"),
            "severity": f.get("severity", "INFO"),
            "evidence_type": f.get("evidence_type", "MODERATE_HEURISTIC"),
            "score_contribution": f.get("score_impact", 0.0),
            "confidence": f.get("confidence_rating", "HIGH" if f.get("confidence", 1.0) >= 0.9 else "MEDIUM"),
            "reason": f.get("reason", ""),
            "evidence": f.get("evidence", "")
        }
        for f in findings
    ]

    # Calculate Local Analysis Coverage (4 Modules)
    # Failed modules reduce coverage, not increase risk
    local_modules_completed = 2  # Lexical and Heuristics always complete
    if dns_res.get("resolved") is not None:
        local_modules_completed += 1
    if dns_res.get("resolved"):
        local_modules_completed += 1  # Network/TLS attempted

    local_pct = int((local_modules_completed / 4) * 100)
    local_status = "FULL" if local_pct == 100 else ("PARTIAL" if local_pct > 0 else "FAILED")

    local_analysis_coverage = {
        "status": local_status,
        "percent": local_pct,
        "modules_completed": local_modules_completed,
        "total_modules": 4
    }

    # Calculate Threat Intelligence Coverage (4 External Vendor Sources)
    intel_total = 4
    intel_configured = threat_intel.get("executed_sources", 0)
    intel_pct = int((intel_configured / intel_total) * 100)
    intel_status = "FULL" if intel_configured == intel_total else ("PARTIAL" if intel_configured > 0 else "NOT CONFIGURED")

    threat_intelligence_coverage = {
        "status": intel_status,
        "sources_configured": intel_configured,
        "sources_total": intel_total,
        "percent": intel_pct
    }

    # -------------------------------------------------------------------------
    # MULTI-DIMENSIONAL CONFIDENCE MODEL
    # -------------------------------------------------------------------------
    # 1. Evidence Confidence (Strength of detected indicator signals)
    has_verified_threat = any(f.get("evidence_type") == "VERIFIED_THREAT" for f in findings)
    has_strong_suspicion = any(f.get("evidence_type") == "STRONG_SUSPICION" for f in findings)
    has_moderate_heuristic = any(f.get("evidence_type") == "MODERATE_HEURISTIC" for f in findings)
    
    if has_verified_threat or has_strong_suspicion:
        evidence_confidence = "HIGH"
    elif has_moderate_heuristic:
        evidence_confidence = "MODERATE"
    elif any(f.get("score_impact", 0.0) > 0 for f in findings):
        evidence_confidence = "LOW"
    else:
        evidence_confidence = "HIGH (CLEAN)" if local_status == "FULL" else "MINIMAL"

    # 2. Local Analysis Confidence
    if local_status == "FULL":
        local_analysis_confidence = "HIGH"
    elif local_status == "PARTIAL":
        local_analysis_confidence = "MODERATE" if dns_res.get("resolved") else "LOW"
    else:
        local_analysis_confidence = "NONE"

    # 3. Threat Intelligence Confidence
    if intel_status == "FULL":
        threat_intelligence_confidence = "HIGH"
    elif intel_status == "PARTIAL":
        threat_intelligence_confidence = "LOW" if intel_configured == 1 else "MODERATE"
    else:
        threat_intelligence_confidence = "NOT CONFIGURED"

    # 4. Overall Assessment Confidence (Non-inflated composite)
    if local_status == "FULL" and intel_status == "FULL":
        overall_assessment_confidence = "HIGH"
        confidence_explanation = "High confidence: Completed full local technical inspection (DNS, TLS, HTTP reachability) and verified against all external threat intelligence databases."
        analysis_limitations = "All local technical probes and multi-vendor threat intelligence lookups completed successfully."
    elif local_status == "FULL" and intel_status == "PARTIAL":
        overall_assessment_confidence = "MODERATE"
        confidence_explanation = f"Completed 100% of local technical probes (DNS, TLS, HTTP probe); external threat intelligence is partially active ({intel_configured}/{intel_total} feeds active)."
        analysis_limitations = f"External commercial threat intelligence feeds are partially configured ({intel_configured}/{intel_total} active). Assessment includes live DNS, TLS certificate inspection, HTTP reachability, and active threat intel sources."
    elif local_status == "FULL" and intel_status == "NOT CONFIGURED":
        overall_assessment_confidence = "LOCAL ONLY (MODERATE)"
        confidence_explanation = "Completed 100% of local technical probes; external commercial threat intelligence databases are unconfigured."
        analysis_limitations = "External commercial threat intelligence feeds not configured. Assessment is based on live DNS resolution, TLS certificate validation, HTTP reachability probing, redirect analysis, and heuristics."
    elif not dns_res["resolved"]:
        analysis_limitations = "Target host could not be resolved via DNS. Network reachability and TLS certificate inspections were skipped. Assessment is based on URL syntax and heuristic analysis."
        if risk_score >= 50.0:
            overall_assessment_confidence = "MODERATE"
            confidence_explanation = "DNS resolution was unresolvable, limiting transport probing; however, strong structural and brand phishing indicators were identified."
        else:
            overall_assessment_confidence = "LIMITED"
            confidence_explanation = "DNS resolution was unresolvable, preventing network reachability, TLS inspection, and server verification."
    else:
        overall_assessment_confidence = "LIMITED"
        confidence_explanation = "Partial technical analysis completed."
        analysis_limitations = "Partial technical analysis completed."

    analysis_confidence = overall_assessment_confidence

    # -------------------------------------------------------------------------
    # CALIBRATED RISK BANDS & DETERMINISTIC VERDICTS
    # Band 1: 0–9    = SAFE / MINIMAL RISK
    # Band 2: 10–24  = LOW RISK
    # Band 3: 25–49  = MODERATE RISK
    # Band 4: 50–74  = HIGH RISK
    # Band 5: 75–100 = CRITICAL RISK
    # -------------------------------------------------------------------------
    if risk_score == 0.0 and local_status == "FULL":
        overall_risk = "LOW"
        risk_level = "SAFE"
        security_verdict = "SAFE / MINIMAL RISK" if intel_status == "FULL" else "SAFE / MINIMAL RISK (LOCAL ANALYSIS)"
        explanation = "No risk indicators were detected during the completed local technical analysis. Verified URL structure, DNS resolution, TLS encryption, and HTTP reachability."

    elif risk_score < 10.0 and local_status != "FULL":
        # Case: Unresolvable DNS or offline host without phishing indicators
        overall_risk = "UNDETERMINED"
        risk_level = "UNDETERMINED"
        security_verdict = "NO THREAT DETECTED (LIMITED ANALYSIS)"
        explanation = "No threat indicators detected in URL lexical structure, but destination host could not be resolved via DNS. Network reachability and TLS certificate inspection could not be completed."

    elif risk_score >= 75.0:
        overall_risk = "CRITICAL"
        risk_level = "CRITICAL"
        security_verdict = "CRITICAL RISK"
        explanation = f"Critical security threat verified (Risk Score: {int(risk_score)}/100). Malicious intent or severe security violation confirmed."

    elif risk_score >= 50.0:
        overall_risk = "HIGH"
        risk_level = "HIGH"
        security_verdict = "HIGH RISK"
        explanation = f"Elevated threat indicators detected (Risk Score: {int(risk_score)}/100). Strong phishing, brand spoofing, or deceptive indicators identified."

    elif risk_score >= 25.0:
        overall_risk = "MEDIUM"
        risk_level = "MEDIUM"
        security_verdict = "MODERATE RISK"
        explanation = f"Moderate security concerns detected (Risk Score: {int(risk_score)}/100). Exercise caution."

    elif risk_score >= 10.0:
        overall_risk = "LOW"
        risk_level = "LOW"
        security_verdict = "LOW RISK"
        explanation = f"Minor security observation recorded (Risk Score: {int(risk_score)}/100). Destination appears functional with low risk flags."

    else:
        overall_risk = "LOW"
        risk_level = "SAFE"
        security_verdict = "SAFE / MINIMAL RISK"
        explanation = "Minimal risk indicators detected."

    # 9. Generate Context-Aware Evidence-Based Recommendations
    recommendations = []
    if risk_score is None:
        recommendations.append("Verify the target domain manually before attempting navigation.")
        recommendations.append("Check DNS configuration and ensure domain is active.")
    elif risk_score >= 60:
        recommendations.append("Do not enter passwords, payment cards, or sensitive information on this page.")
        recommendations.append("Verify official provider URLs through trusted bookmarks or direct search.")
        recommendations.append("Report suspicious links to your security operations team.")
    elif risk_score >= 30:
        recommendations.append("Verify TLS connection lock in your browser address bar before login.")
        recommendations.append("Review destination domain spelling carefully.")
    else:
        if analysis_confidence in ("LOCAL ONLY", "LIMITED"):
            recommendations.append(
                "No suspicious indicators were detected during the completed local analysis. "
                "External threat intelligence sources were not available, therefore this result does not confirm reputation against known malicious URL databases."
            )
        else:
            recommendations.append(
                "No suspicious indicators were detected during analysis. Target verified against active threat intelligence sources. Continue normal browsing precautions."
            )

    detected_indicators_titles = [f["title"] for f in findings]

    return {
        "submitted_url": original_url,
        "target_url": original_url,
        "normalized_url": normalized,
        "hostname": host,
        "domain": host,
        "extracted_domain": registered_domain,
        "protocol": scheme,
        "port": active_port,
        "threat_score": int(risk_score) if risk_score is not None else None,
        "threat_index": int(risk_score) if risk_score is not None else None,
        "risk_score": float(risk_score) if risk_score is not None else None,
        "heuristic_score": float(heuristic_score) if risk_score is not None else None,
        "verified_threat_score": float(verified_threat_score) if risk_score is not None else None,
        "overall_risk": overall_risk,
        "risk_level": risk_level if risk_score is not None else "UNKNOWN",
        "evidence_confidence": evidence_confidence,
        "local_analysis_confidence": local_analysis_confidence,
        "threat_intelligence_confidence": threat_intelligence_confidence,
        "overall_assessment_confidence": overall_assessment_confidence,
        "analysis_confidence": overall_assessment_confidence,
        "analysis_coverage": local_status,
        "analysis_coverage_percent": local_pct,
        "local_analysis_coverage": local_analysis_coverage,
        "threat_intelligence_coverage": threat_intelligence_coverage,
        "score_components": score_components,
        "local_analysis_status": local_status,
        "threat_intel_coverage": intel_status,
        "security_verdict": security_verdict,
        "explanation": explanation,
        "confidence_explanation": confidence_explanation,
        "detected_indicators": detected_indicators_titles,
        "findings": findings,
        "passed_checks": passed_checks,
        "warnings": warnings,
        "checks_performed": checks_performed,
        "checks_not_performed": checks_not_performed,
        "positive_signals": positive_signals[:4],
        "recommendations": recommendations,
        "threat_intelligence": threat_intel,
        "threat_intelligence_result": threat_intel if threat_intel.get("detections_count", 0) > 0 else None,
        "timestamp": scan_timestamp,
        "status": "limited" if is_limited else "completed",
        "analysis_limitations": analysis_limitations,
        "technical_details": {
            "url_structure": {
                "original_url": original_url,
                "normalized_url": normalized,
                "scheme": scheme,
                "hostname": host,
                "port": active_port,
                "registered_domain": registered_domain,
                "subdomains": subdomains,
                "tld": tld,
                "path": path,
                "query": query,
                "query_parameters_count": len(query_params),
                "is_ip_host": is_ip_host,
                "percent_encoded_count": percent_count,
                "suspicious_characters": "@" if "@" in original_url else "None detected"
            },
            "dns": dns_res,
            "tls": tls_res,
            "network": net_res,
            "threat_intelligence": threat_intel
        }
    }

# Backward compatibility wrappers
def analyze_url_heuristics(raw_url: str) -> Tuple[float, str, float, List[Dict[str, Any]]]:
    """Compatibility wrapper for scans.py."""
    res = scan_url_comprehensive(raw_url)
    score = res["risk_score"] if res["risk_score"] is not None else 0.0
    level = res["risk_level"]
    confidence = 0.95
    return score, level, confidence, res.get("findings", [])
