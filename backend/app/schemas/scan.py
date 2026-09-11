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
    Supports Chrome Web Store URLs, Extension IDs, Manifest JSON objects, and Package uploads.
    """
    input_value: Optional[str] = None
    input_type: Optional[str] = None
    extension_id: Optional[str] = None
    name: Optional[str] = None
    version: Optional[str] = None
    description: Optional[str] = None
    developer: Optional[str] = None
    store_url: Optional[str] = None
    manifest_version: Optional[int] = None
    permissions: List[str] = []
    host_permissions: List[str] = []
    optional_permissions: List[str] = []
    optional_host_permissions: List[str] = []
    content_scripts: Optional[List[Dict[str, Any]]] = None
    background: Optional[Dict[str, Any]] = None
    web_accessible_resources: Optional[Any] = None
    raw_manifest: Optional[Dict[str, Any]] = None
    package_base64: Optional[str] = None


