from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.auth_service import get_current_user
from app.models.report import Report

router = APIRouter(prefix="/api/reports", tags=["Reports Management"])

@router.get("")
def get_reports(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if current_user.role in ["Administrator", "Security Analyst"]:
        reports = db.query(Report).all()
    else:
        reports = db.query(Report).filter(Report.user_id == current_user.id).all()
        
    report_list = [
        {
            "id": r.id,
            "user_id": r.user_id,
            "scan_id": r.scan_id,
            "report_type": r.report_type,
            "status": r.status,
            "created_at": r.created_at
        }
        for r in reports
    ]
    return {
        "success": True,
        "message": "Reports list retrieved successfully",
        "data": report_list
    }
