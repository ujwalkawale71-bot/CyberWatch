from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any, List


class ScanBase(BaseModel):
    target: str
    scan_type: str


class ScanCreate(ScanBase):
    pass


class ScanResponse(ScanBase):
    id: int
    user_id: int
    risk_score: float
    risk_level: str
    status: str
    created_at: datetime
    completed_at: Optional[datetime] = None
    result: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class URLScanRequest(BaseModel):
    url: str


class WebsiteScanRequest(BaseModel):
    url: str


class ExtensionScanRequest(BaseModel):
    """
    Request body for extension scanning.
    At least one of extension_id, name, or permissions must be provided.
    All other fields are optional and improve analysis quality when present.
    """
    extension_id: Optional[str] = None
    name: Optional[str] = None
    version: Optional[str] = None
    description: Optional[str] = None
    manifest_version: Optional[int] = None
    permissions: List[str] = []
    host_permissions: List[str] = []
