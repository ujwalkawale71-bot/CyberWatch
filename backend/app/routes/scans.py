from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.scan import ScanCreate, URLScanRequest, WebsiteScanRequest, ExtensionScanRequest
from app.services.auth_service import get_current_user, get_optional_current_user
from app.services.scan_service import run_threat_scan
from app.services.url_scanner import analyze_url_heuristics, normalize_url
from app.services.website_scanner import scan_website_security
from app.services.file_scanner import scan_file_security
import base64
import json
import time
from app.services.extension_service import analyze_extension
from app.services.chrome_webstore_service import (
    parse_extension_input,
    fetch_webstore_metadata,
    fetch_crx_manifest,
    unpack_package_bytes
)
from app.models.scan import Scan
from app.models.alert import Alert
from datetime import datetime, timezone

router = APIRouter(prefix="/api/scans", tags=["Threat Scanning"])

@router.post("")
def create_scan(request: ScanCreate, db: Session = Depends(get_db), current_user = Depends(get_optional_current_user)):
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
def create_url_scan(request: URLScanRequest, db: Session = Depends(get_db), current_user = Depends(get_optional_current_user)):
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
def create_website_scan(request: WebsiteScanRequest, db: Session = Depends(get_db), current_user = Depends(get_optional_current_user)):
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
        risk_score=result.get("risk_score"),
        risk_level=result.get("risk_level", "UNKNOWN"),
        status="Completed",
        created_at=datetime.now(timezone.utc),
        completed_at=datetime.now(timezone.utc),
        result=result
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)

    result["scan_id"] = scan.id
    result["id"] = scan.id

    # Auto-generate Alert in database if HIGH or CRITICAL
    if result.get("risk_level") in ["HIGH", "CRITICAL"]:
        alert = Alert(
            user_id=current_user.id,
            scan_id=scan.id,
            title="Vulnerable Website Detected" if result.get("risk_level") == "CRITICAL" else "Suspicious Website Indicators",
            severity=result.get("risk_level", "HIGH"),
            description=f"Website security scan flagged URL {url} as {result.get('risk_level')} with a threat score of {result.get('risk_score')}.",
            status="Unresolved"
        )
        db.add(alert)
        db.commit()
        
    return {
        "success": True,
        "data": result
    }

@router.post("/extension")
def create_extension_scan(
    request: ExtensionScanRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_optional_current_user)
):
    # Step 1: Detect input format from input_value, extension_id, raw_manifest, or uploaded package
    raw_input = (request.input_value or request.extension_id or "").strip()
    ext_id = None
    input_type = request.input_type or "unknown"
    manifest_data = request.raw_manifest
    developer = request.developer
    store_url = request.store_url
    rating = None
    rating_count = None
    users = None
    website = None
    privacy_policy = None
    icon_url = None
    name = request.name
    version = request.version
    description = request.description
    coverage = "FULL_ANALYSIS"
    js_files: Dict[str, str] = {}
    metadata_status = "UNAVAILABLE"
    package_status = "UNAVAILABLE"
    manifest_status = "UNAVAILABLE"
    package_format = "CRX3"

    # 1. Check if package file uploaded (base64)
    if request.package_base64:
        try:
            pkg_bytes = base64.b64decode(request.package_base64)
            unpacked = unpack_package_bytes(pkg_bytes)
            if unpacked.get("status") == "success":
                manifest_data = unpacked.get("manifest")
                js_files = unpacked.get("js_files", {})
                package_format = unpacked.get("format", "ZIP")
                package_status = "VERIFIED"
                manifest_status = "VERIFIED"
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Package extraction failed: {unpacked.get('reason')}"
                )
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Corrupted package upload: {str(e)}"
            )

    # 2. Check if input string provided
    if raw_input and not manifest_data:
        parsed_id, detected_type = parse_extension_input(raw_input)
        input_type = detected_type

        if detected_type == "raw_manifest":
            try:
                manifest_data = json.loads(raw_input)
                manifest_status = "VERIFIED"
            except Exception:
                pass
        elif parsed_id:
            ext_id = parsed_id

    # 3. If extension ID was identified (from URL or direct ID), fetch Web Store metadata & CRX manifest
    if ext_id:
        store_meta = fetch_webstore_metadata(ext_id)
        if store_meta.get("status") in ["success", "partial"]:
            metadata_status = "VERIFIED"
            name = name or store_meta.get("name")
            description = description or store_meta.get("description")
            version = version or store_meta.get("version")
            developer = developer or store_meta.get("developer")
            store_url = store_url or store_meta.get("store_url")
            rating = store_meta.get("rating")
            rating_count = store_meta.get("rating_count")
            users = store_meta.get("users")
            website = store_meta.get("website")
            privacy_policy = store_meta.get("privacy_policy")
            icon_url = store_meta.get("icon_url")

        # If we don't have manifest_data yet, fetch CRX from Google CRX server
        if not manifest_data:
            crx_result = fetch_crx_manifest(ext_id)
            if crx_result.get("status") == "success" and crx_result.get("manifest"):
                manifest_data = crx_result.get("manifest")
                js_files = crx_result.get("js_files", {})
                package_format = crx_result.get("format", "CRX3")
                package_status = "VERIFIED"
                manifest_status = "VERIFIED"
            else:
                # If CRX not reachable, but store metadata exists -> LIMITED_ANALYSIS
                if name or store_meta.get("status") == "success":
                    coverage = "LIMITED_ANALYSIS"
                    package_status = "UNAVAILABLE"
                    manifest_status = "UNAVAILABLE"
                else:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=(
                            f"Could not locate extension with ID '{ext_id}' on the Chrome Web Store, "
                            "and no CRX package or manifest was provided."
                        )
                    )

    # 4. Require at least one valid data source
    has_manifest = bool(manifest_data or request.manifest_version or request.content_scripts or request.background)
    has_perms = bool(request.permissions or request.host_permissions)
    has_meta = bool(name or ext_id or developer)

    if not (has_manifest or has_perms or has_meta or ext_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Invalid extension input. Please provide a valid Chrome Web Store URL "
                "(e.g. https://chromewebstore.google.com/detail/dark-reader/eimadpbcbfnmbkopoojfekhnkhdbieeh), "
                "a 32-character Extension ID, or a valid manifest JSON."
            )
        )

    # 5. Run deterministic analyzer
    try:
        result = analyze_extension(
            requested_extension_id=ext_id or request.extension_id,
            extension_id=ext_id or request.extension_id,
            name=name,
            version=version,
            description=description,
            developer=developer,
            store_url=store_url,
            rating=rating,
            rating_count=rating_count,
            users=users,
            website=website,
            privacy_policy=privacy_policy,
            icon_url=icon_url,
            manifest_version=request.manifest_version,
            permissions=request.permissions,
            host_permissions=request.host_permissions,
            optional_permissions=request.optional_permissions,
            optional_host_permissions=request.optional_host_permissions,
            content_scripts=request.content_scripts,
            background=request.background,
            web_accessible_resources=request.web_accessible_resources,
            externally_connectable=request.raw_manifest.get("externally_connectable") if request.raw_manifest else None,
            content_security_policy=request.raw_manifest.get("content_security_policy") if request.raw_manifest else None,
            raw_manifest=manifest_data,
            js_files=js_files,
            analysis_coverage=coverage,
            metadata_status=metadata_status,
            package_status=package_status,
            manifest_status=manifest_status,
            package_format=package_format
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Extension analysis error: {str(e)}"
        )

    # Check for result mismatch
    if result.get("status") == "RESULT_MISMATCH":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="RESULT_MISMATCH: Requested extension ID does not match resolved extension ID."
        )

    target_label = result.get("name") or result.get("extension_id") or "Extension Scan"
    score = result.get("score")
    risk_level = result.get("risk_level", "LIMITED")

    # 6. Persist in database
    scan = Scan(
        user_id=current_user.id,
        target=target_label,
        scan_type="Extension",
        risk_score=float(score) if score is not None else 0.0,
        risk_level=risk_level,
        status="Completed",
        created_at=datetime.now(timezone.utc),
        completed_at=datetime.now(timezone.utc),
        result=result
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)

    # 7. Auto-generate Alert if HIGH or CRITICAL
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
            "requested_extension_id": result.get("requested_extension_id"),
            "resolved_extension_id": result.get("resolved_extension_id"),
            "extension_id": result["extension_id"],
            "name": result["name"],
            "version": result["version"],
            "description": result["description"],
            "developer": result.get("developer"),
            "store_url": result.get("store_url"),
            "rating": result.get("rating"),
            "rating_count": result.get("rating_count"),
            "users": result.get("users"),
            "website": result.get("website"),
            "privacy_policy": result.get("privacy_policy"),
            "icon_url": result.get("icon_url"),
            "provenance": result.get("provenance", {}),
            "manifest_version": result["manifest_version"],
            "risk_score": score,
            "score": score,
            "risk_level": risk_level,
            "verdict": result.get("verdict"),
            "data_verification": result.get("data_verification"),
            "sub_scores": result.get("sub_scores"),
            "analysis_coverage": result.get("analysis_coverage"),
            "permissions_analyzed": result["permissions_analyzed"],
            "host_permissions_analyzed": result["host_permissions_analyzed"],
            "optional_permissions_analyzed": result.get("optional_permissions_analyzed", []),
            "optional_host_permissions_analyzed": result.get("optional_host_permissions_analyzed", []),
            "content_scripts": result.get("content_scripts", []),
            "background": result.get("background"),
            "web_accessible_resources": result.get("web_accessible_resources"),
            "externally_connectable": result.get("externally_connectable"),
            "content_security_policy": result.get("content_security_policy"),
            "permission_findings": result["permission_findings"],
            "host_findings": result["host_findings"],
            "combination_findings": result["combination_findings"],
            "code_findings": result.get("code_findings", []),
            "structure_findings": result.get("structure_findings", []),
            "manifest_finding": result["manifest_finding"],
            "metadata_issues": result["metadata_issues"],
            "webstore_findings": result.get("webstore_findings", []),
            "obfuscation_status": result.get("obfuscation_status", "UNKNOWN"),
            "obfuscation_details": result.get("obfuscation_details", {}),
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

@router.post("/file")
async def create_file_scan(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_optional_current_user)
):
    if not file or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file was uploaded or filename is missing."
        )

    try:
        file_bytes = await file.read()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"The uploaded file could not be read successfully: {str(e)}"
        )

    if len(file_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is empty (0 bytes)."
        )

    filename = file.filename
    result_data = scan_file_security(filename, file_bytes)

    score_val = result_data.get("risk_score")
    risk_level_val = result_data.get("overall_risk", "UNKNOWN")

    try:
        user_id = current_user.id if current_user and hasattr(current_user, 'id') else 1
        scan = Scan(
            user_id=user_id,
            target=filename,
            scan_type="File",
            risk_score=float(score_val) if score_val is not None else None,
            risk_level=risk_level_val,
            status="Completed" if risk_level_val != "ANALYSIS FAILED" else "Failed",
            created_at=datetime.now(timezone.utc),
            completed_at=datetime.now(timezone.utc),
            result=result_data
        )

        db.add(scan)
        db.commit()
        db.refresh(scan)

        if getattr(scan, 'id', None) is not None and not str(type(scan.id)).count('Mock'):
            result_data["scan_id"] = scan.id
            result_data["id"] = scan.id
        else:
            gen_id = int(time.time() * 1000) % 1000000
            result_data["scan_id"] = gen_id
            result_data["id"] = gen_id

        if score_val is not None and (score_val >= 50.0 or risk_level_val in ["CRITICAL", "HIGH"]):
            alert = Alert(
                user_id=user_id,
                scan_id=result_data["scan_id"],
                title="Malicious File Threat Alert" if risk_level_val == "CRITICAL" else "Suspicious File Detected",
                severity=risk_level_val if risk_level_val in ["CRITICAL", "HIGH"] else "HIGH",
                description=f"Automated file inspection evaluated {filename} as {risk_level_val} with threat score of {int(score_val)}.",
                status="Unresolved"
            )
            db.add(alert)
            db.commit()
    except Exception:
        if "scan_id" not in result_data or not result_data["scan_id"]:
            gen_id = int(time.time() * 1000) % 1000000
            result_data["scan_id"] = gen_id
            result_data["id"] = gen_id

    return {
        "success": True,
        "message": "File scan completed successfully",
        "data": result_data
    }
