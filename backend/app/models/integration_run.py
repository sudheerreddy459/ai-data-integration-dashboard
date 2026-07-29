from datetime import datetime

from sqlalchemy import String, DateTime, Integer, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class IntegrationRun(Base):
    __tablename__ = "integration_runs"

    id: Mapped[int] = mapped_column(primary_key=True)

    integration_id: Mapped[int] = mapped_column(
        ForeignKey("integrations.id"),
        nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    started_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True
    )

    records_processed: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False
    )

    error_message: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    # Structured category for failed executions
    # Examples: Connection, Authentication, Validation, Mapping
    error_category: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    # Severity of the failure
    # Examples: Low, Medium, High, Critical
    severity: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True
    )

    @property
    def duration_seconds(self) -> float | None:
        if self.completed_at is None:
            return None

        duration = (
            self.completed_at - self.started_at
        ).total_seconds()

        if duration < 0:
            return None

        return round(duration, 2)