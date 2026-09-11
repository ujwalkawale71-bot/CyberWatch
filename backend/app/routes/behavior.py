"""
CyberWatch Behaviour Monitor API Router
Provides 100% Real Evidence-Based Behaviour Analytics and Anomaly Pattern Detection.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.auth_service import get_optional_current_user
from app.services.behavior_service import get_behavior_analytics

router = APIRouter(prefix="/api/behavior", tags=["Behaviour Anomaly Engine"])

@router.get("/stats")
def get_behavior_stats(
    time_range: str = Query("7d", alias="range", pattern="^(24h|7d|30d|all)$"),
    db: Session = Depends(get_db),
    current_user = Depends(get_optional_current_user)
):
    """
    Computes real-time dynamic behaviour analytics, correlated anomaly patterns,
    timeline metrics, and recent security events.
    """
    data = get_behavior_analytics(db=db, time_range=time_range, current_user=current_user)
    return {
        "success": True,
        "data": data
    }
