import socket
import ipaddress
import urllib.request
import urllib.error
from urllib.parse import urlparse
import re
from html.parser import HTMLParser
from typing import Dict, Any, List, Tuple

# Suspicious TLDs / Domain keywords
SUSPICIOUS_SCRIPT_TLDS = {"tk", "ml", "ga", "cf", "gq", "xyz", "club", "top"}

def is_private_ip(ip_str: str) -> bool:
    """Validate if an IP is in local, loopback, or private range."""
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

def check_ssrf_safe(url: str) -> str:
    """Resolve the URL hostname and verify it does not point to a private IP."""
    parsed = urlparse(url)
    host = parsed.hostname
    if not host:
        raise ValueError("Invalid URL: missing hostname.")
    
    # Resolve host
    try:
        ips = socket.getaddrinfo(host, None)
        for item in ips:
            ip = item[4][0]
            if is_private_ip(ip):
                raise ValueError(f"SSRF Prevention: Host {host} resolves to private/local IP {ip}.")
    except socket.gaierror:
        raise ValueError(f"DNS Resolution failed for {host}.")
        
    return host

class LogRedirectHandler(urllib.request.HTTPRedirectHandler):
    def __init__(self):
        super().__init__()
        self.redirects = []
        
    def redirect_request(self, req, fp, code, msg, hdrs, newurl):
        # Prevent SSRF on redirect destinations
        check_ssrf_safe(newurl)
        self.redirects.append(newurl)
        if len(self.redirects) > 8:
            raise urllib.request.HTTPError(newurl, 310, "Excessive redirects (limit of 8 exceeded)", hdrs, fp)
        return super().redirect_request(req, fp, code, msg, hdrs, newurl)

class CyberWatchHTMLParser(HTMLParser):
    def __init__(self, page_domain: str):
        super().__init__()
        self.page_domain = page_domain
        self.title = ""
        self.meta_description = ""
        self.canonical_url = ""
        self.language = ""
        self.forms = []
        self.scripts = []
        self.iframes = []
        self.external_links = []
        self.external_resources = {
            "scripts": [],
            "css": [],
            "images": [],
            "iframes": []
        }
        self.obfuscated_js_flags = 0
        self._in_title = False

    def handle_starttag(self, tag, attrs):
        attrs_dict = {k.lower(): v for k, v in attrs if v is not None}
        
        if tag == "html":
            self.language = attrs_dict.get("lang", "")
        elif tag == "title":
            self._in_title = True
        elif tag == "meta":
            if attrs_dict.get("name") == "description":
                self.meta_description = attrs_dict.get("content", "")
        elif tag == "link":
            rel = attrs_dict.get("rel", "").lower()
            href = attrs_dict.get("href", "")
            if rel == "canonical":
                self.canonical_url = href
            elif rel == "stylesheet" and href:
                self.external_resources["css"].append(href)
        elif tag == "form":
            self.forms.append(attrs_dict)
        elif tag == "script":
            src = attrs_dict.get("src", "")
            if src:
                self.external_resources["scripts"].append(src)
            self.scripts.append(attrs_dict)
        elif tag == "iframe":
            src = attrs_dict.get("src", "")
            if src:
                self.external_resources["iframes"].append(src)
            self.iframes.append(attrs_dict)
        elif tag == "img":
            src = attrs_dict.get("src", "")
            if src:
                self.external_resources["images"].append(src)
        elif tag == "a":
            href = attrs_dict.get("href", "")
            if href:
                self.external_links.append(href)

    def handle_data(self, data):
        if self._in_title:
            self.title += data
        # Search for inline Javascript obfuscations: eval, unescape, string.fromCharCode
        if "eval(" in data or "unescape(" in data or "string.fromcharcode" in data.lower():
            self.obfuscated_js_flags += 1

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False

def scan_website_security(target_url: str) -> Dict[str, Any]:
    """Perform full defensive scanning of the target website."""
    # Normalize
    url = target_url.strip()
    if not (url.lower().startswith("http://") or url.lower().startswith("https://")):
        url = "https://" + url

    # SSRF verification
    host = check_ssrf_safe(url)

    redirect_handler = LogRedirectHandler()
    opener = urllib.request.build_opener(redirect_handler)
    # Set standard User-Agent header
    opener.addheaders = [("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) CyberWatch/1.0")]

    findings = []
    score = 0.0

    try:
        # Load max 2MB of page response
        with opener.open(url, timeout=5.0) as response:
            final_url = response.geturl()
            status_code = response.getcode()
            headers = {k.lower(): v for k, v in response.info().items()}
            html_bytes = response.read(2 * 1024 * 1024)
            html_content = html_bytes.decode("utf-8", errors="ignore")
    except urllib.error.HTTPError as e:
        # We can still check headers if it fails with an HTTP error
        final_url = url
        status_code = e.code
        headers = {k.lower(): v for k, v in e.headers.items()}
        html_content = ""
    except Exception as e:
        # SSL errors, socket timeouts
        raise ValueError(f"Scan failed: Connection error - {str(e)}")

    # 1. HTTP vs HTTPS checks
    is_https = final_url.lower().startswith("https")
    if not is_https:
        score += 20
        findings.append({
            "category": "HTTPS / SSL",
            "title": "Insecure HTTP Protocol Enabled",
            "severity": "HIGH",
            "description": "The site loads over insecure HTTP protocol, allowing attackers to sniff session cookies and injection vectors.",
            "evidence": f"Final URL loaded was: {final_url}",
            "recommendation": "Configure a TLS/SSL certificate and redirect all port 80 requests to HTTPS."
        })

    # 2. Security Headers evaluation
    security_headers = {}
    important_headers = [
        ("Content-Security-Policy", "Content-Security-Policy", "MEDIUM", 8),
        ("Strict-Transport-Security", "Strict-Transport-Security", "MEDIUM", 5),
        ("X-Content-Type-Options", "X-Content-Type-Options", "LOW", 3),
        ("X-Frame-Options", "X-Frame-Options", "LOW", 3),
        ("Referrer-Policy", "Referrer-Policy", "LOW", 2),
        ("Permissions-Policy", "Permissions-Policy", "LOW", 2),
    ]

    for header_name, clean_name, severity, points in important_headers:
        val = headers.get(header_name.lower())
        if val:
            security_headers[clean_name] = {"status": "Present", "value": val}
        else:
            security_headers[clean_name] = {"status": "Missing", "value": ""}
            score += points
            findings.append({
                "category": "Security Headers",
                "title": f"Security Header {clean_name} is missing",
                "severity": severity,
                "description": f"The '{clean_name}' security header protects visitors from XSS, clickjacking, and mime-sniffing exploits.",
                "evidence": f"Header {header_name} not returned in server response.",
                "recommendation": f"Add the {header_name} header in the web server configuration (Nginx, Apache, or Cloudflare rules)."
            })

    # 3. HTML parsing & resources analysis
    parser = CyberWatchHTMLParser(host)
    if html_content:
        try:
            parser.feed(html_content)
        except Exception:
            pass

    # Extract technologies
    detected_tech = []
    # Cloudflare detection
    if "cf-ray" in headers or headers.get("server", "").lower() == "cloudflare":
        detected_tech.append("Cloudflare")
    # WordPress detection
    if "wp-content" in html_content or "wp-includes" in html_content:
        detected_tech.append("WordPress")
    # Next.js detection
    if "_next/static" in html_content:
        detected_tech.append("Next.js")
    # Bootstrap
    if "bootstrap" in html_content:
        detected_tech.append("Bootstrap")
    # Tailwind
    if "tailwind" in html_content:
        detected_tech.append("Tailwind")
    # React
    if "react.development.js" in html_content or "react.production.min.js" in html_content or "_reactroot" in html_content.lower():
        detected_tech.append("React")

    # Group resources
    ext_js = parser.external_resources["scripts"]
    ext_css = parser.external_resources["css"]
    ext_img = parser.external_resources["images"]
    ext_iframe = parser.external_resources["iframes"]

    # Gather unique domains
    unique_domains = set()
    for res_list in [ext_js, ext_css, ext_img, ext_iframe]:
        for src in res_list:
            try:
                parsed_src = urlparse(src)
                if parsed_src.netloc and parsed_src.netloc != host:
                    unique_domains.add(parsed_src.netloc)
            except Exception:
                pass

    # 4. Form Action Vulnerability Check (Password forms over HTTP or external domains)
    for form in parser.forms:
        action = form.get("action", "")
        # If password fields exist inside raw html, verify action is HTTPS and same-origin
        has_password = 'type="password"' in html_content
        if has_password and action:
            # Check if action is HTTP
            if action.startswith("http://"):
                score += 30
                findings.append({
                    "category": "Suspicious Indicators",
                    "title": "Insecure Password Submission Action",
                    "severity": "CRITICAL",
                    "description": "A form containing password inputs submits over HTTP, exposing plaintext user credentials to sniffing.",
                    "evidence": f"Form action target: {action}",
                    "recommendation": "Update the form action to point to an absolute HTTPS endpoint."
                })
            # Check if action is different domain
            try:
                parsed_action = urlparse(action)
                if parsed_action.netloc and parsed_action.netloc != host:
                    score += 20
                    findings.append({
                        "category": "Suspicious Indicators",
                        "title": "Cross-Domain Password Submission Form",
                        "severity": "HIGH",
                        "description": "The password input submits to an external domain, which can indicate credential harvesting.",
                        "evidence": f"Form action target domain: {parsed_action.netloc}",
                        "recommendation": "Configure forms to submit credentials only to verified subdomains or secure SSO endpoints."
                    })
            except Exception:
                pass

    # 5. Suspicious inline scripts
    if parser.obfuscated_js_flags > 0:
        score += 15
        findings.append({
            "category": "Suspicious Indicators",
            "title": "Obfuscated Inline JavaScript Detected",
            "severity": "MEDIUM",
            "description": "The page contains inline scripts containing javascript evaluation or encoding features (like eval or unescape).",
            "evidence": f"Matched {parser.obfuscated_js_flags} suspicious script calls.",
            "recommendation": "Avoid using eval() or unescape() functions, as they bypass static code analyses and expose vulnerabilities."
        })

    # 6. Suspicious iframe usage
    for iframe in parser.iframes:
        src = iframe.get("src", "")
        if src:
            try:
                parsed_src = urlparse(src)
                src_domain = parsed_src.netloc
                if src_domain:
                    # Check if TLD of script/iframe is suspicious
                    tld = src_domain.split(".")[-1]
                    if tld in SUSPICIOUS_SCRIPT_TLDS:
                        score += 10
                        findings.append({
                            "category": "Suspicious Indicators",
                            "title": "Iframe sourcing suspicious TLD",
                            "severity": "HIGH",
                            "description": f"The page loads iframe content from a suspicious TLD domain: '.{tld}'.",
                            "evidence": f"Iframe src target: {src}",
                            "recommendation": "Audit iframe elements and remove any hidden windows loaded from unvetted Registries."
                        })
            except Exception:
                pass

    # 7. Mixed content checking
    if is_https:
        mixed_resources = []
        for res_type, res_list in parser.external_resources.items():
            for res_url in res_list:
                if res_url.startswith("http://"):
                    mixed_resources.append(res_url)
        if mixed_resources:
            score += 15
            findings.append({
                "category": "Suspicious Indicators",
                "title": "Mixed Active Content Insecurity",
                "severity": "HIGH",
                "description": "The website loads stylesheets, scripts, or images over insecure HTTP, breaking the page's SSL padlock protection.",
                "evidence": f"First mixed resource matched: {mixed_resources[0]}",
                "recommendation": "Rewrite insecure asset calls to HTTPS or use relative schema endpoints (e.g. //assets.example.com)."
            })

    # 8. Excessive Redirects
    redirects_chain = redirect_handler.redirects
    if len(redirects_chain) > 3:
        score += 10
        findings.append({
            "category": "Redirect Analysis",
            "title": "Excessive Redirect Chain Detected",
            "severity": "LOW",
            "description": "The website initiates multiple redirects which slows down loading times and hides target paths.",
            "evidence": f"Detected {len(redirects_chain)} steps in redirect chain.",
            "recommendation": "Configure direct routes on the webserver and avoid nested routing loops."
        })

    # Cap score
    score = min(round(score, 1), 100.0)

    # Risk Levels
    if score >= 81:
        level = "CRITICAL"
    elif score >= 61:
        level = "HIGH"
    elif score >= 41:
        level = "MEDIUM"
    elif score >= 21:
        level = "LOW"
    else:
        level = "SAFE"

    # Confidence calculation (Static website checks are highly accurate since we fetch raw headers directly)
    confidence = 0.95 if html_content else 0.80

    # Clean description metadata
    metadata = {
        "title": parser.title.strip() if parser.title else "N/A",
        "description": parser.meta_description.strip() if parser.meta_description else "N/A",
        "canonical": parser.canonical_url.strip() if parser.canonical_url else "N/A",
        "language": parser.language if parser.language else "N/A",
        "server": headers.get("server", "N/A"),
        "content_type": headers.get("content-type", "text/html")
    }

    # Summary
    summary_text = (
        f"Security audit for {host} completed. Overall threat risk evaluated as {level} (Threat score: {score}). "
        f"We identified {len(findings)} security findings. Security headers analysis shows that "
        f"{sum(1 for h in security_headers.values() if h['status'] == 'Present')}/6 of the recommended protection headers are set."
    )

    return {
        "url": url,
        "risk_score": score,
        "risk_level": level,
        "confidence": confidence,
        "summary": summary_text,
        "findings": findings,
        "security_headers": security_headers,
        "technology": detected_tech,
        "external_resources": {
            "scripts": len(ext_js),
            "css": len(ext_css),
            "images": len(ext_img),
            "iframes": len(ext_iframe),
            "unique_domains": len(unique_domains),
            "domains_list": sorted(list(unique_domains))
        },
        "redirects": [url] + redirects_chain,
        "metadata": metadata
    }
