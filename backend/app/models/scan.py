from datetime import datetime, timezone
from sqlalchemy import String, Integer, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class Scan(Base):
    __tablename__ = "scans"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    target: Mapped[str] = mapped_column(String, nullable=False)
    scan_type: Mapped[str] = mapped_column(String, nullable=False)  # URL, Website, Extension
    risk_score: Mapped[float] = mapped_column(Float, default=0.0)
    risk_level: Mapped[str] = mapped_column(String, default="SAFE")  # CRITICAL, HIGH, MEDIUM, LOW, SAFE
    status: Mapped[str] = mapped_column(String, default="Pending")  # Completed, Pending, Failed
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    result: Mapped[dict] = mapped_column(JSON, nullable=True)

    user = relationship("User")
