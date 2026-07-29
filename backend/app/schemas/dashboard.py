from datetime import datetime

from pydantic import BaseModel


# Overall dashboard summary
class DashboardSummaryResponse(BaseModel):
    total_integrations: int
    total_runs: int
    successful_runs: int
    failed_runs: int
    total_records_processed: int
    success_rate: float


# Summary for a specific integration
class IntegrationSummaryResponse(BaseModel):
    integration_id: int
    integration_name: str
    total_runs: int
    successful_runs: int
    failed_runs: int
    success_rate: float
    total_records_processed: int
    last_run_status: str | None
    average_duration_seconds: float | None
    last_run_duration_seconds: float | None


# Recent integration run shown on the dashboard
class RecentRunResponse(BaseModel):
    id: int
    integration_id: int
    integration_name: str
    status: str
    started_at: datetime
    completed_at: datetime | None
    records_processed: int
    error_message: str | None
    error_category: str | None
    severity: str | None
    duration_seconds: float | None

    # Failure analytics for dashboard charts
class FailureAnalyticsResponse(BaseModel):
    total_failures: int
    by_category: dict[str, int]
    by_severity: dict[str, int]