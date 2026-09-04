from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class Report(Base):
    __tablename__ = "reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    scan_id: Mapped[int] = mapped_column(Integer, ForeignKey("scans.id"), nullable=True)
    report_type: Mapped[str] = mapped_column(String, default="JSON")  # PDF, HTML, JSON
    status: Mapped[str] = mapped_column(String, default="Pending")  # Generated, Pending, Failed
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User")
    scan = relationship("Scan")
