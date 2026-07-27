from datetime import datetime

from pydantic import BaseModel, ConfigDict


class IntegrationRunCreate(BaseModel):
    integration_id: int
    status: str
    completed_at: datetime | None = None
    records_processed: int = 0
    error_message: str | None = None


class IntegrationRunResponse(BaseModel):
    id: int
    integration_id: int
    status: str
    started_at: datetime
    completed_at: datetime | None
    records_processed: int
    error_message: str | None

    model_config = ConfigDict(from_attributes=True)