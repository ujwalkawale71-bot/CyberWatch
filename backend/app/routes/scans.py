from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.scan import ScanCreate, URLScanRequest, WebsiteScanRequest, ExtensionScanRequest
from app.services.auth_service import get_current_user
from app.services.scan_service import run_threat_scan
from app.services.url_scanner import analyze_url_heuristics, normalize_url
from app.services.website_scanner import scan_website_security
from app.services.extension_service import analyze_extension
from app.models.scan import Scan
from app.models.alert import Alert
from datetime import datetime, timezone

router = APIRouter(prefix="/api/scans", tags=["Threat Scanning"])

@router.post("")
def create_scan(request: ScanCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if request.scan_type not in ["URL", "Website", "Extension"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid scan type. Allowed: URL, Website, Extension"
        )
    
    scan = run_threat_scan(db, current_user.id, request.target, request.scan_type)
    return {
        "success": True,
        "message": "Scan completed successfully",
        "data": {
            "id": scan.id,
            "target": scan.target,
            "scan_type": scan.scan_type,
            "risk_score": scan.risk_score,
            "risk_level": scan.risk_level,
            "status": scan.status,
            "created_at": scan.created_at,
            "completed_at": scan.completed_at,
            "result": scan.result
        }
    }

@router.post("/url")
def create_url_scan(request: URLScanRequest, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    url = request.url.strip()
    if not url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="URL string cannot be empty"
        )
    if len(url) > 2048:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="URL length exceeds maximum limit of 2048 characters"
        )
        
    normalized = normalize_url(url)
    score, level, confidence, findings = analyze_url_heuristics(normalized)
    
    # Save completed scan in database
    scan = Scan(
        user_id=current_user.id,
        target=url,
        scan_type="URL",
        risk_score=score,
        risk_level=level,
        status="Completed",
        created_at=datetime.now(timezone.utc),
        completed_at=datetime.now(timezone.utc),
        result={
            "url": url,
            "confidence": confidence,
            "findings": findings
        }
    )
    
    db.add(scan)
    db.commit()
    db.refresh(scan)
    
    # Auto-generate Alert in database if HIGH or CRITICAL
    if level in ["HIGH", "CRITICAL"]:
        alert = Alert(
            user_id=current_user.id,
            scan_id=scan.id,
            title="Phishing URL Detected" if level == "CRITICAL" else "Suspicious URL Detected",
            severity=level,
            description=f"Heuristic analysis flagged URL: {url} as {level} with a threat score of {score}.",
            status="Unresolved"
        )
        db.add(alert)
        db.commit()
        
    return {
        "success": True,
        "data": {
            "scan_id": scan.id,
            "url": url,
            "risk_score": score,
            "risk_level": level,
            "confidence": confidence,
            "status": "completed",
            "findings": findings
        }
    }

@router.post("/website")
def create_website_scan(request: WebsiteScanRequest, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    url = request.url.strip()
    if not url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="URL string cannot be empty"
        )
    if len(url) > 2048:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="URL length exceeds maximum limit of 2048 characters"
        )
        
    try:
        result = scan_website_security(url)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected scanning error occurred: {str(e)}"
        )
        
    # Save in Scan model database
    scan = Scan(
        user_id=current_user.id,
        target=url,
        scan_type="Website",
        risk_score=result["risk_score"],
        risk_level=result["risk_level"],
        status="Completed",
        created_at=datetime.now(timezone.utc),
        completed_at=datetime.now(timezone.utc),
        result=result
    )
    
    db.add(scan)
    db.commit()
    db.refresh(scan)
    
    # Auto-generate Alert in database if HIGH or CRITICAL
    if result["risk_level"] in ["HIGH", "CRITICAL"]:
        alert = Alert(
            user_id=current_user.id,
            scan_id=scan.id,
            title="Vulnerable Website Detected" if result["risk_level"] == "CRITICAL" else "Suspicious Website Indicators",
            severity=result["risk_level"],
            description=f"Website security scan flagged URL {url} as {result['risk_level']} with a threat score of {result['risk_score']}.",
            status="Unresolved"
        )
        db.add(alert)
        db.commit()
        
    return {
        "success": True,
        "data": {
            "scan_id": scan.id,
            "url": result["url"],
            "risk_score": result["risk_score"],
            "risk_level": result["risk_level"],
            "confidence": result.get("confidence", 0.95),
            "status": "completed",
            "summary": result["summary"],
            "findings": result["findings"],
            "security_headers": result["security_headers"],
            "technology": result["technology"],
            "external_resources": result["external_resources"],
            "redirects": result["redirects"],
            "metadata": result.get("metadata", {})
        }
    }

@router.post("/extension")
def create_extension_scan(
    request: ExtensionScanRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Require at least one identifying piece of information
    has_id = bool((request.extension_id or "").strip())
    has_name = bool((request.name or "").strip())
    has_permissions = bool(request.permissions or request.host_permissions)

    if not (has_id or has_name or has_permissions):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "At least one of 'extension_id', 'name', or 'permissions' "
                "must be provided to perform an extension scan."
            )
        )

    # Validate manifest_version if provided
    if request.manifest_version is not None and request.manifest_version not in [2, 3]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid manifest_version. Must be 2 or 3."
        )

    # Run the deterministic extension analyzer
    try:
        result = analyze_extension(
            extension_id=request.extension_id,
            name=request.name,
            version=request.version,
            description=request.description,
            manifest_version=request.manifest_version,
            permissions=request.permissions,
            host_permissions=request.host_permissions,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Extension analysis error: {str(e)}"
        )

    target_label = request.extension_id or request.name or "Extension Scan"
    score = result["score"]
    risk_level = result["risk_level"]

    # Persist in canonical Scan table
    scan = Scan(
        user_id=current_user.id,
        target=target_label,
        scan_type="Extension",
        risk_score=float(score),
        risk_level=risk_level,
        status="Completed",
        created_at=datetime.now(timezone.utc),
        completed_at=datetime.now(timezone.utc),
        result=result
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)

    # Auto-generate Alert for HIGH or CRITICAL
    if risk_level in ["HIGH", "CRITICAL"]:
        alert = Alert(
            user_id=current_user.id,
            scan_id=scan.id,
            title=(
                "Dangerous Extension Detected" if risk_level == "CRITICAL"
                else "High-Risk Extension Detected"
            ),
            severity=risk_level,
            description=(
                f"Extension analysis flagged '{target_label}' as {risk_level} "
                f"with a threat score of {score}."
            ),
            status="Unresolved"
        )
        db.add(alert)
        db.commit()

    return {
        "success": True,
        "message": "Extension scan completed successfully",
        "data": {
            "scan_id": scan.id,
            "extension_id": result["extension_id"],
            "name": result["name"],
            "version": result["version"],
            "manifest_version": result["manifest_version"],
            "risk_score": score,
            "risk_level": risk_level,
            "permissions_analyzed": result["permissions_analyzed"],
            "host_permissions_analyzed": result["host_permissions_analyzed"],
            "permission_findings": result["permission_findings"],
            "host_findings": result["host_findings"],
            "combination_findings": result["combination_findings"],
            "manifest_finding": result["manifest_finding"],
            "metadata_issues": result["metadata_issues"],
            "summary": result["summary"],
            "engine": result["engine"],
            "status": "completed",
        }
    }

@router.get("/history")
def get_history(db: Session = Depends(get_db), current_user = Depends(get_current_user)):

    scans = db.query(Scan).filter(Scan.user_id == current_user.id).order_by(Scan.created_at.desc()).all()
    scan_list = [
        {
            "id": s.id,
            "target": s.target,
            "scan_type": s.scan_type,
            "risk_score": s.risk_score,
            "risk_level": s.risk_level,
            "status": s.status,
            "created_at": s.created_at,
            "completed_at": s.completed_at,
            "result": s.result
        }
        for s in scans
    ]
    return {
        "success": True,
        "message": "Scan history retrieved successfully",
        "data": scan_list
    }

@router.get("")
def get_scans(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if current_user.role in ["Administrator", "Security Analyst"]:
        scans = db.query(Scan).all()
    else:
        scans = db.query(Scan).filter(Scan.user_id == current_user.id).all()
        
    scan_list = [
        {
            "id": s.id,
            "user_id": s.user_id,
            "target": s.target,
            "scan_type": s.scan_type,
            "risk_score": s.risk_score,
            "risk_level": s.risk_level,
            "status": s.status,
            "created_at": s.created_at,
            "completed_at": s.completed_at
        }
        for s in scans
    ]
    return {
        "success": True,
        "message": "Scans retrieved successfully",
        "data": scan_list
    }

@router.get("/{scan_id}")
def get_scan_by_id(scan_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan record not found"
        )
    
    if current_user.role not in ["Administrator", "Security Analyst"] and scan.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden to scan record"
        )
        
    return {
        "success": True,
        "message": "Scan details retrieved successfully",
        "data": {
            "id": scan.id,
            "user_id": scan.user_id,
            "target": scan.target,
            "scan_type": scan.scan_type,
            "risk_score": scan.risk_score,
            "risk_level": scan.risk_level,
            "status": scan.status,
            "created_at": scan.created_at,
            "completed_at": scan.completed_at,
            "result": scan.result
        }
    }
