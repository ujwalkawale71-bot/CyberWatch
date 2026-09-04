from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.scan import URLScanRequest
from app.services.auth_service import get_current_user
from app.services.url_scanner import normalize_url, SUSPICIOUS_TLDS, SHORTENER_DOMAINS, PHISHING_KEYWORDS, BRAND_KEYWORDS
from app.models.scan import Scan
from app.models.alert import Alert
from datetime import datetime, timezone
import re
from urllib.parse import urlparse

router = APIRouter(prefix="/api/scan", tags=["Threat URL Scan"])

def is_random_looking_domain(host: str) -> bool:
    parts = host.split(".")
    if not parts:
        return False
    domain_name = parts[0]
    
    # 1. High number count
    numbers = sum(c.isdigit() for c in domain_name)
    if numbers > 4:
        return True
        
    # 2. Too long without vowels or high consonant ratio
    if len(domain_name) > 12:
        vowels = sum(c.lower() in 'aeiouy' for c in domain_name)
        consonants = len(domain_name) - vowels - numbers
        if vowels == 0 or (consonants / vowels) > 4:
            return True
            
    # 3. Too many dashes
    if domain_name.count("-") > 2:
        return True
        
    return False

def compute_url_threat_metrics(url: str):
    normalized = normalize_url(url)
    try:
        parsed = urlparse(normalized)
    except Exception:
        return 100, "Critical", "Critical", ["Invalid URL structure"], [], ["https", "domain_structure", "url_pattern", "suspicious_indicators", "redirect_shortener"], ["Do not navigate to this address. The URL structure is invalid."]
        
    scheme = parsed.scheme.lower()
    netloc = parsed.netloc.lower()
    path = parsed.path.lower()
    query = parsed.query.lower()
    
    host = netloc
    port = None
    if ":" in netloc:
        parts = netloc.split(":")
        host = parts[0]
        try:
            port = int(parts[1])
        except ValueError:
            pass
            
    score = 0.0
    indicators = []
    
    # Checklist flags
    https = True
    domain_structure = True
    url_pattern = True
    suspicious_indicators = True
    redirect_shortener = True

    # 1. HTTP vs HTTPS
    if scheme == "http":
        score += 30
        https = False
        indicators.append("Unencrypted connection (HTTP)")
        
    # 2. IP address used instead of domain
    ip_match = re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', host)
    if ip_match:
        score += 35
        domain_structure = False
        indicators.append("IP address used as hostname")
        
    # 3. Random-looking domain
    if is_random_looking_domain(host):
        score += 15
        domain_structure = False
        indicators.append("Randomized or high entropy domain host")
        
    # 4. Excessive subdomains
    host_parts = [p for p in host.split(".") if p]
    if len(host_parts) > 4:
        score += 15
        domain_structure = False
        indicators.append(f"Excessive subdomain hierarchy ({len(host_parts)} parts)")
        
    # 5. Excessive domain length
    primary_domain = host_parts[-2] if len(host_parts) > 1 else host
    if len(primary_domain) > 45:
        score += 15
        domain_structure = False
        indicators.append(f"Excessive primary domain name length ({len(primary_domain)} chars)")

    # 6. Excessive URL length
    if len(url) > 120:
        score += 15
        url_pattern = False
        indicators.append(f"Excessive URL length ({len(url)} characters)")
    elif len(url) > 80:
        score += 8
        indicators.append(f"Long URL structure ({len(url)} characters)")
        
    # 7. URL shortener usage
    if host in SHORTENER_DOMAINS:
        score += 35
        redirect_shortener = False
        indicators.append("URL shortener detected")
        
    # 8. Suspicious keywords (phishing keywords)
    target_keywords = [
        "login", "verify", "account", "secure", "update", "authentication",
        "password", "confirmation", "billing", "payment", "signin", "wallet"
    ]
    matched_keywords = [w for w in target_keywords if w in host or w in path or w in query]
    if matched_keywords:
        keyword_score = min(12 * len(matched_keywords), 36)
        score += keyword_score
        suspicious_indicators = False
        indicators.append(f"Suspicious keywords: {', '.join(matched_keywords)}")
        
    # 9. Suspicious TLDs
    tld = host_parts[-1] if len(host_parts) > 1 else ""
    if tld in SUSPICIOUS_TLDS:
        score += 20
        domain_structure = False
        indicators.append(f"Suspicious TLD (.{tld})")
        
    # 10. Excessive hyphens in host
    if host.count("-") > 2:
        score += 10
        domain_structure = False
        indicators.append(f"Excessive hyphens count in hostname ({host.count('-')})")
        
    # 11. @ symbol in URL
    if "@" in url:
        score += 25
        url_pattern = False
        indicators.append("Credentials separator (@) in URL")
        
    # 12. Suspicious encoding (excessive percent signs)
    percent_count = url.count("%")
    if percent_count > 3:
        score += 15
        url_pattern = False
        indicators.append(f"Excessive percentage-encoded characters ({percent_count})")
        
    # 13. Suspicious query parameter open redirects
    redirect_params = ["url", "redirect", "next", "target", "dest", "return"]
    found_redirects = [p for p in redirect_params if f"{p}=" in query]
    if found_redirects:
        score += 15
        url_pattern = False
        indicators.append(f"Potential open redirect parameter: {', '.join(found_redirects)}")
        
    # 14. Brand impersonation indicators
    matched_brands = []
    for w in BRAND_KEYWORDS:
        if w in host:
            # Check if it's NOT the primary registered domain name
            if len(host_parts) > 2 and host_parts[-2] != w:
                matched_brands.append(w)
        elif w in path or w in query:
            matched_brands.append(w)
    if matched_brands:
        score += 25
        suspicious_indicators = False
        indicators.append(f"Potential brand impersonation indicator matching: {', '.join(matched_brands)}")
        
    # 15. Punycode / IDN domains
    if any(part.startswith("xn--") for part in host_parts):
        score += 25
        domain_structure = False
        indicators.append("Punycode IDN domain name (homograph spoofing risk)")
        
    # 16. Custom ports
    if port and port not in [80, 443]:
        score += 15
        url_pattern = False
        indicators.append(f"Non-standard port binding ({port})")
        
    # 17. Suspicious URL patterns (double slashes / traversal)
    if "//" in path or "/../" in path or "..\\" in path:
        score += 15
        url_pattern = False
        indicators.append("Traversal or unusual path separation pattern")
        
    # Cap score
    score = min(score, 100.0)
    
    # Ranges: 0–19 = SAFE, 20–39 = LOW, 40–59 = MEDIUM, 60–79 = HIGH, 80–100 = CRITICAL
    # Verdict: Safe, Low Risk, Suspicious, High Risk, Critical
    if score >= 80:
        risk_level = "CRITICAL"
        security_verdict = "Critical"
    elif score >= 60:
        risk_level = "HIGH"
        security_verdict = "High Risk"
    elif score >= 40:
        risk_level = "MEDIUM"
        security_verdict = "Suspicious"
    elif score >= 20:
        risk_level = "LOW"
        security_verdict = "Low Risk"
    else:
        risk_level = "SAFE"
        security_verdict = "Safe"
        
    # Generate recommendations
    recommendations = []
    if not indicators:
        recommendations.append("The URL appears clean. Continue browsing safely.")
    else:
        if not https:
            recommendations.append("Ensure you do not enter passwords or card details on unencrypted HTTP domains.")
        if not domain_structure:
            recommendations.append("Verify the actual registrar and DNS origin. Avoid clicking direct links to numeric IPs or homographs.")
        if not suspicious_indicators or score > 40:
            recommendations.append("This URL contains brand spoofing or credential phishing elements. Verify link context before login.")
        if not redirect_shortener:
            recommendations.append("This URL uses a shortener. Use a preview service to check the final target domain.")
        recommendations.append("Report any suspicious messages or emails containing this link to SecOps.")
        
    passed_checks = []
    warnings = []
    
    if https:
        passed_checks.append("https")
    else:
        warnings.append("https")
        
    if domain_structure:
        passed_checks.append("domain_structure")
    else:
        warnings.append("domain_structure")
        
    if url_pattern:
        passed_checks.append("url_pattern")
    else:
        warnings.append("url_pattern")
        
    if suspicious_indicators:
        passed_checks.append("suspicious_indicators")
    else:
        warnings.append("suspicious_indicators")
        
    if redirect_shortener:
        passed_checks.append("redirect_shortener")
    else:
        warnings.append("redirect_shortener")
        
    return int(score), risk_level, security_verdict, indicators, passed_checks, warnings, recommendations

@router.post("/url")
def scan_url(request: URLScanRequest, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    url = request.url.strip()
    if not url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="URL string cannot be empty"
        )
        
    # Perform analysis
    score, risk_level, security_verdict, indicators, passed_checks, warnings, recommendations = compute_url_threat_metrics(url)
    
    # Extract domain name
    normalized = normalize_url(url)
    domain = url
    try:
        parsed = urlparse(normalized)
        if parsed.netloc:
            domain = parsed.netloc
    except Exception:
        pass
        
    scan_timestamp = datetime.now(timezone.utc).isoformat()
    scheme = "https"
    try:
        parsed = urlparse(normalized)
        scheme = parsed.scheme or "https"
    except Exception:
        pass

    port = None
    if ":" in domain:
        parts = domain.split(":")
        domain = parts[0]
        try:
            port = int(parts[1])
        except ValueError:
            pass
            
    # Generate natural explanation
    if score == 0:
        explanation = "The URL has been scanned and meets all security protocol checks. No threat indicators were found."
    else:
        explanation = f"Scanned URL flagged with threat score of {score}. Structural warnings identified: {', '.join(indicators)}."

    result_data = {
        "target_url": url,
        "normalized_url": normalized,
        "hostname": domain,
        "domain": domain,
        "protocol": scheme,
        "port": port,
        "detected_indicators": indicators,
        "passed_checks": passed_checks,
        "warnings": warnings,
        "threat_intelligence_result": None,
        "threat_score": score,
        "risk_level": risk_level,
        "security_verdict": security_verdict,
        "explanation": explanation,
        "recommendations": recommendations,
        "timestamp": scan_timestamp
    }
    
    # Save completed scan in database using standard Scan model structure
    scan = Scan(
        user_id=current_user.id,
        target=url,
        scan_type="URL",
        risk_score=float(score),
        risk_level=risk_level,
        status="Completed",
        created_at=datetime.now(timezone.utc),
        completed_at=datetime.now(timezone.utc),
        result=result_data
    )
    
    db.add(scan)
    db.commit()
    db.refresh(scan)
    
    # Auto-generate Alert in database if High Risk or Critical
    if score >= 60:
        alert = Alert(
            user_id=current_user.id,
            scan_id=scan.id,
            title="Suspicious URL Threat Alert" if score < 80 else "Critical Phishing Threat Detected",
            severity="HIGH" if score < 80 else "CRITICAL",
            description=f"Automated threat inspection evaluated {url} as {risk_level} with threat index of {score}.",
            status="Unresolved"
        )
        db.add(alert)
        db.commit()
        
    return {
        "success": True,
        "message": "URL scan completed successfully",
        "data": result_data
    }
