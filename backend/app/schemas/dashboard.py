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