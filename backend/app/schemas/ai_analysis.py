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

    # Indicates whether the analysis came from
    # OpenAI or the rule-based fallback
    analysis_source: str