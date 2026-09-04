"""
Scan Service - CyberWatch Threat Detection Platform
Dispatches scans to the appropriate deterministic security engine.
"""
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.scan import Scan
from app.models.alert import Alert
from app.models.report import Report
from app.routes.scan import compute_url_threat_metrics
from app.services.website_scanner import scan_website_security
from app.services.extension_service import analyze_extension
from datetime import datetime, timezone

def run_threat_scan(db: Session, user_id: int, target: str, scan_type: str) -> Scan:
    """Execute a threat scanning sequence and record to database."""
    target_clean = (target or "").strip()
    if not target_clean:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Scan target cannot be empty"
        )

    if scan_type == "URL":
        score, risk_level, security_verdict, indicators, passed_checks, warnings, recommendations = compute_url_threat_metrics(target_clean)
        findings = {
            "target_url": target_clean,
            "threat_score": score,
            "risk_level": risk_level,
            "security_verdict": security_verdict,
            "detected_indicators": indicators,
            "passed_checks": passed_checks,
            "warnings": warnings,
            "recommendations": recommendations,
        }
    elif scan_type == "Website":
        result = scan_website_security(target_clean)
        score = result["risk_score"]
        risk_level = result["risk_level"]
        findings = result
    elif scan_type == "Extension":
        result = analyze_extension(extension_id=target_clean)
        score = result["score"]
        risk_level = result["risk_level"]
        findings = result
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported scan type: {scan_type}"
        )
    
    # Create the Scan record
    scan = Scan(
        user_id=user_id,
        target=target_clean,
        scan_type=scan_type,
        risk_score=float(score),
        risk_level=risk_level,
        status="Completed",
        created_at=datetime.now(timezone.utc),
        completed_at=datetime.now(timezone.utc),
        result=findings
    )
    
    db.add(scan)
    db.commit()
    db.refresh(scan)
    
    # Auto-generate Alert if high/critical severity
    if risk_level in ["HIGH", "CRITICAL", "High Risk", "Critical"]:
        alert = Alert(
            user_id=user_id,
            scan_id=scan.id,
            title=f"Flagged {scan_type}: Threat Detected",
            severity="CRITICAL" if risk_level in ["CRITICAL", "Critical"] else "HIGH",
            description=f"A scanner thread evaluated {target_clean} as {risk_level} risk with a score of {score}.",
            status="Unresolved"
        )
        db.add(alert)
        
    # Auto-generate Report record
    report = Report(
        user_id=user_id,
        scan_id=scan.id,
        report_type="JSON",
        status="Generated"
    )
    db.add(report)
    
    db.commit()
    db.refresh(scan)
    return scan
