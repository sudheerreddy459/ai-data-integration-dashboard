from pydantic import BaseModel


class FailureAnalysisResponse(BaseModel):
    run_id: int
    integration_id: int
    integration_name: str

    error_message: str | None
    error_category: str | None
    severity: str | None

    probable_cause: str
    recommendation: str