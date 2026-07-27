from datetime import datetime

from pydantic import BaseModel, ConfigDict


class IntegrationCreate(BaseModel):
    name: str
    source_system: str
    target_system: str
    status: str = "Active"


class IntegrationUpdate(BaseModel):
    name: str
    source_system: str
    target_system: str
    status: str


class IntegrationResponse(BaseModel):
    id: int
    name: str
    source_system: str
    target_system: str
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)