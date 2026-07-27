from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


# All possible statuses stored/returned for an integration run
class RunStatus(str, Enum):
    RUNNING = "Running"
    SUCCESS = "Success"
    FAILED = "Failed"


# Only statuses allowed when completing a run
class RunCompletionStatus(str, Enum):
    SUCCESS = "Success"
    FAILED = "Failed"


# Used when STARTING a new integration run
class IntegrationRunCreate(BaseModel):
    integration_id: int


# Used when COMPLETING an integration run
class IntegrationRunUpdate(BaseModel):
    status: RunCompletionStatus
    records_processed: int = Field(default=0, ge=0)
    error_message: str | None = None


# Returned by the API
class IntegrationRunResponse(BaseModel):
    id: int
    integration_id: int
    status: RunStatus
    started_at: datetime
    completed_at: datetime | None
    records_processed: int
    error_message: str | None
    duration_seconds: float | None

    model_config = ConfigDict(from_attributes=True)