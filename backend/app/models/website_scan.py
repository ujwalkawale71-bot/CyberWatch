from datetime import datetime
from sqlalchemy import String, Integer, Float, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base

class WebsiteScan(Base):
    __tablename__ = "website_scans"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    url: Mapped[str] = mapped_column(String, index=True)
    status_code: Mapped[int | None] = mapped_column(Integer, nullable=True)
    final_url: Mapped[str | None] = mapped_column(String, nullable=True)
    page_title: Mapped[str | None] = mapped_column(String, nullable=True)
    content_score: Mapped[float] = mapped_column(Float)
    ssl_score: Mapped[float] = mapped_column(Float)
    structure_score: Mapped[float] = mapped_column(Float)
    reputation_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    overall_score: Mapped[float] = mapped_column(Float)
    risk_level: Mapped[str] = mapped_column(String)
    findings: Mapped[dict] = mapped_column(JSON)
    error: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
