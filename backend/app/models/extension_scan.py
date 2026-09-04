from datetime import datetime
from sqlalchemy import String, Integer, Float, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base

class ExtensionScan(Base):
    __tablename__ = "extension_scans"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    extension_name: Mapped[str | None] = mapped_column(String, nullable=True)
    manifest_version: Mapped[int | None] = mapped_column(Integer, nullable=True)
    permission_risk_score: Mapped[float] = mapped_column(Float)
    host_permission_risk_score: Mapped[float] = mapped_column(Float)
    overall_score: Mapped[float] = mapped_column(Float)
    risk_level: Mapped[str] = mapped_column(String)
    permissions: Mapped[list] = mapped_column(JSON)
    findings: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
