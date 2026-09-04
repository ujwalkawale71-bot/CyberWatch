from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.auth_service import get_current_user
from app.models.alert import Alert

router = APIRouter(prefix="/api/alerts", tags=["Alerts Management"])

@router.get("")
def get_alerts(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if current_user.role in ["Administrator", "Security Analyst"]:
        alerts = db.query(Alert).all()
    else:
        alerts = db.query(Alert).filter(Alert.user_id == current_user.id).all()
        
    alert_list = [
        {
            "id": a.id,
            "user_id": a.user_id,
            "scan_id": a.scan_id,
            "title": a.title,
            "severity": a.severity,
            "description": a.description,
            "status": a.status,
            "created_at": a.created_at
        }
        for a in alerts
    ]
    return {
        "success": True,
        "message": "Alerts list retrieved successfully",
        "data": alert_list
    }

@router.put("/{alert_id}/resolve")
def resolve_alert(alert_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
        
    if current_user.role not in ["Administrator", "Security Analyst"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation forbidden: Admin or Analyst role required"
        )
        
    alert.status = "Resolved"
    db.commit()
    db.refresh(alert)
    
    return {
        "success": True,
        "message": "Alert resolved successfully",
        "data": {
            "id": alert.id,
            "status": alert.status
        }
    }
