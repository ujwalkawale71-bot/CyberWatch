"""
CyberWatch Threat Intelligence Routes
Provides endpoints for live multi-source IOC investigations and overview statistics.
"""
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.auth_service import get_optional_current_user
from app.services.threat_intelligence import (
    investigate_ioc,
    get_threat_intel_overview,
    classify_ioc,
    get_providers_status
)

router = APIRouter(prefix="/api/threat-intelligence", tags=["Threat Intelligence"])


class IOCInvestigateRequest(BaseModel):
    ioc: str = Field(..., min_length=1, max_length=2048, description="Target URL, Domain, IPv4, IPv6, or SHA-256 hash")


@router.get("/overview")
def fetch_threat_intel_overview(db: Session = Depends(get_db)):
    """
    Get live overview metrics, provider operational status, recent intelligence scans,
    and threat category distribution from the database.
    """
    try:
        data = get_threat_intel_overview(db)
        return {
            "success": True,
            "data": data
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch threat intelligence overview: {str(e)}"
        )


@router.get("/providers")
def fetch_providers_status():
    """
    Get configured threat intelligence feeds and their operational availability.
    """
    try:
        providers = get_providers_status()
        return {
            "success": True,
            "data": providers
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch provider status: {str(e)}"
        )


@router.post("/investigate")
def investigate_indicator(
    request: IOCInvestigateRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_optional_current_user)
):
    """
    Perform live multi-source threat intelligence investigation for a URL, Domain, IP, or SHA-256 hash.
    Persists scan results and generates alerts on verified threats.
    """
    ioc_clean = request.ioc.strip()
    if not ioc_clean:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Indicator of Compromise (IOC) cannot be empty."
        )

    ioc_type, _ = classify_ioc(ioc_clean)
    if ioc_type == "unknown":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported IOC format: '{ioc_clean}'. Please provide a valid URL, Domain, IPv4/IPv6, or SHA-256 hash."
        )

    user_id = current_user.id if current_user else None

    try:
        result = investigate_ioc(ioc_clean, db, user_id=user_id)
        return {
            "success": True,
            "message": "Threat intelligence investigation completed.",
            "data": result
        }
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error executing threat intelligence investigation: {str(e)}"
        )
