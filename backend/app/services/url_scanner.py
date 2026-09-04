import re
from urllib.parse import urlparse
from typing import Dict, Any, List, Tuple

# Suspicious TLDs
SUSPICIOUS_TLDS = {
    "tk", "ml", "ga", "cf", "gq", "fit", "top", "xyz", "club", "work",
    "country", "stream", "gdn", "mom", "kim", "zip", "mov"
}

# URL shortener domains
SHORTENER_DOMAINS = {
    "bit.ly", "tinyurl.com", "t.co", "goo.gl", "is.gd", "buff.ly", "adf.ly"
}

# Phishing keywords in subdomains/paths
PHISHING_KEYWORDS = [
    "login", "signin", "verify", "account", "update", "secure", "webscr",
    "cmd", "banking", "security", "resolve", "validate", "logon", "auth",
    "verification", "signin-verification", "reset-password"
]

# Login, account, or payment brand-related keywords
BRAND_KEYWORDS = [
    "paypal", "stripe", "bank", "payment", "card", "billing", "wallet",
    "chase", "wells", "boa", "microsoft", "google", "apple", "netflix"
]

def normalize_url(url: str) -> str:
    """Normalize and format URL string."""
    url = url.strip()
    if not url:
        return ""
    # Prepend http:// if it doesn't have scheme
    if not re.match(r'^(http|https)://', url, re.IGNORECASE):
        url = "http://" + url
    return url

def analyze_url_heuristics(raw_url: str) -> Tuple[float, str, float, List[Dict[str, Any]]]:
    """
    Perform static heuristic checks on URL.
    Returns (risk_score, risk_level, confidence, findings).
    """
    url = normalize_url(raw_url)
    findings = []
    score = 0.0

    try:
        parsed = urlparse(url)
    except Exception:
        # Invalid URL parsing
        return 100.0, "CRITICAL", 0.95, [{
            "category": "URL Structure",
            "finding": "Invalid URL structure",
            "severity": "CRITICAL",
            "reason": "The URL cannot be parsed by standard urlparse utilities."
        }]

    scheme = parsed.scheme.lower()
    netloc = parsed.netloc.lower()
    path = parsed.path.lower()
    query = parsed.query.lower()

    # Split netloc to host and port
    host = netloc
    port = None
    if ":" in netloc:
        parts = netloc.split(":")
        host = parts[0]
        try:
            port = int(parts[1])
        except ValueError:
            pass

    # 1. HTTP vs HTTPS
    if scheme == "http":
        score += 5
        findings.append({
            "category": "Security Indicators",
            "finding": "Unencrypted Protocol (HTTP)",
            "severity": "LOW",
            "reason": "The connection uses unencrypted HTTP which exposes session traffic."
        })

    # 2. Raw IP address instead of domain
    # IPv4 match
    ip_match = re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', host)
    if ip_match:
        score += 25
        findings.append({
            "category": "Domain Indicators",
            "finding": "Raw IP Address Host",
            "severity": "HIGH",
            "reason": "The URL host is a raw numeric IP address instead of a registered domain, a common evasion tactic."
        })

    # 3. Excessive subdomains
    host_parts = [p for p in host.split(".") if p]
    if len(host_parts) > 4:
        score += 10
        findings.append({
            "category": "Domain Indicators",
            "finding": "Excessive Subdomains",
            "severity": "MEDIUM",
            "reason": f"The host contains {len(host_parts)} subdomain elements, which is frequently used to spoof brands."
        })

    # 4. Suspicious URL length
    if len(url) > 120:
        score += 10
        findings.append({
            "category": "URL Structure",
            "finding": "Excessive URL Length",
            "severity": "MEDIUM",
            "reason": f"The URL is extremely long ({len(url)} characters), which can obfuscate threat indicators."
        })
    elif len(url) > 80:
        score += 5
        findings.append({
            "category": "URL Structure",
            "finding": "Suspicious URL Length",
            "severity": "LOW",
            "reason": f"The URL is long ({len(url)} characters), often used to hide secondary path injections."
        })

    # 5. Suspicious characters (@ sign in host/path)
    if "@" in netloc or "@" in path:
        score += 15
        findings.append({
            "category": "URL Structure",
            "finding": "Credentials Obfuscation (@)",
            "severity": "HIGH",
            "reason": "The URL contains an '@' symbol, which can mislead users about the actual domain being loaded."
        })

    # 6. URL encoding/obfuscation (double encoding or too many percentage symbols)
    percent_count = url.count("%")
    if percent_count > 3:
        score += 15
        findings.append({
            "category": "URL Structure",
            "finding": "Excessive Percentage Encoding",
            "severity": "MEDIUM",
            "reason": "The URL contains multiple character encodings, which can be an obfuscation tactic to bypass filters."
        })

    # 7. Phishing keywords
    detected_phish_words = []
    for word in PHISHING_KEYWORDS:
        if word in host or word in path or word in query:
            detected_phish_words.append(word)
    if detected_phish_words:
        score += 15
        findings.append({
            "category": "Phishing Indicators",
            "finding": "Phishing Target Keywords",
            "severity": "HIGH",
            "reason": f"The URL matches phishing-related keywords: {', '.join(detected_phish_words)}."
        })

    # 8. Login/payment keywords
    detected_brand_words = []
    for word in BRAND_KEYWORDS:
        # Avoid false positives for legitimate main domains (e.g. google.com, paypal.com)
        if word in host:
            # Check if it is a subdomain prefix or injected in path
            if len(host_parts) > 2 and host_parts[0] == word:
                detected_brand_words.append(word)
        elif word in path or word in query:
            detected_brand_words.append(word)
            
    if detected_brand_words:
        score += 15
        findings.append({
            "category": "Phishing Indicators",
            "finding": "Injected Brand/Account Keywords",
            "severity": "HIGH",
            "reason": f"The URL contains finance or brand-specific keywords: {', '.join(detected_brand_words)}."
        })

    # 9. Suspicious TLD patterns
    tld = host_parts[-1] if len(host_parts) > 1 else ""
    if tld in SUSPICIOUS_TLDS:
        score += 10
        findings.append({
            "category": "Domain Indicators",
            "finding": "Suspicious Top-Level Domain (TLD)",
            "severity": "MEDIUM",
            "reason": f"The URL uses '.{tld}', which is statistically associated with high rates of malicious registrations."
        })

    # 10. Punycode / IDN indicators (starts with xn--)
    puny_match = any(part.startswith("xn--") for part in host_parts)
    if puny_match:
        score += 15
        findings.append({
            "category": "Domain Indicators",
            "finding": "IDN/Punycode Homograph Spoofing",
            "severity": "HIGH",
            "reason": "Punycode characters detected. This can be used to perform homograph attacks by spoofing letters."
        })

    # 11. URL shortener domains
    if host in SHORTENER_DOMAINS:
        score += 10
        findings.append({
            "category": "Domain Indicators",
            "finding": "URL Shortener Evader",
            "severity": "LOW",
            "reason": "The domain is a URL shortener, which masks the final destination path of links."
        })

    # 12. Suspicious port numbers (non-standard 80/443)
    if port and port not in [80, 443]:
        score += 10
        findings.append({
            "category": "Security Indicators",
            "finding": "Non-Standard Port Binding",
            "severity": "MEDIUM",
            "reason": f"The URL binds to port {port} instead of standard HTTPS (443) or HTTP (80)."
        })

    # 13. Repeated separators or unusual path structures
    if "//" in path or "/../" in path or "..\\" in path:
        score += 10
        findings.append({
            "category": "URL Structure",
            "finding": "Unusual Separators in Path",
            "severity": "MEDIUM",
            "reason": "The URL path has double slashes or directory traversal markers, indicating suspicious path syntax."
        })

    # Cap score at 100
    score = min(score, 100.0)

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

    # Confidence calculation: starts at 0.85, goes up to 0.95 with findings, or sits at 0.90 if perfectly clean
    if not findings:
        confidence = 0.90
    else:
        confidence = min(0.85 + (0.02 * len(findings)), 0.95)

    return round(score, 1), level, round(confidence, 2), findings
