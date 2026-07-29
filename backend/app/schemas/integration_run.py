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


# Failure categories
class ErrorCategory(str, Enum):
    CONNECTION = "Connection"
    AUTHENTICATION = "Authentication"
    VALIDATION = "Validation"
    MAPPING = "Mapping"
    DATABASE = "Database"
    TIMEOUT = "Timeout"
    UNKNOWN = "Unknown"


# Failure severity levels
class ErrorSeverity(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"


# Used when STARTING a new integration run
class IntegrationRunCreate(BaseModel):
    integration_id: int


# Used when COMPLETING an integration run
class IntegrationRunUpdate(BaseModel):
    status: RunCompletionStatus
    records_processed: int = Field(default=0, ge=0)
    error_message: str | None = None
    error_category: ErrorCategory | None = None
    severity: ErrorSeverity | None = None


# Returned by the API
class IntegrationRunResponse(BaseModel):
    id: int
    integration_id: int
    status: RunStatus
    started_at: datetime
    completed_at: datetime | None
    records_processed: int
    error_message: str | None
    error_category: ErrorCategory | None
    severity: ErrorSeverity | None
    duration_seconds: float | None

    model_config = ConfigDict(from_attributes=True)