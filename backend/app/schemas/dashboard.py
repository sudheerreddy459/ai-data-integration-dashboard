from pydantic import BaseModel


class DashboardSummaryResponse(BaseModel):
    total_integrations: int
    total_runs: int
    successful_runs: int
    failed_runs: int
    total_records_processed: int
    success_rate: float