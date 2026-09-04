from datetime import datetime
from sqlalchemy import String, Float, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base

class URLScan(Base):
    __tablename__ = "url_scans"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    url: Mapped[str] = mapped_column(String, index=True)
    url_structure_score: Mapped[float] = mapped_column(Float)
    domain_reputation_score: Mapped[float] = mapped_column(Float)
    ssl_score: Mapped[float] = mapped_column(Float)
    malware_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    threat_intel_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    overall_score: Mapped[float] = mapped_column(Float)
    risk_level: Mapped[str] = mapped_column(String)
    findings: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
