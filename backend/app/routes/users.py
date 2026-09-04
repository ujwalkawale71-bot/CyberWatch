from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.auth_service import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.get("")
def get_users(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    # Restrict to Administrator
    if current_user.role != "Administrator":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Admin permissions required"
        )
    
    users = db.query(User).all()
    user_list = [
        {
            "id": u.id,
            "full_name": u.full_name,
            "email": u.email,
            "role": u.role,
            "is_active": u.is_active,
            "created_at": u.created_at,
            "last_login": u.last_login
        }
        for u in users
    ]
    
    return {
        "success": True,
        "message": "Users list retrieved successfully",
        "data": user_list
    }
