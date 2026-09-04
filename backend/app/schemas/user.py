from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    full_name: str
    email: str
    role: str = "Viewer"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True
