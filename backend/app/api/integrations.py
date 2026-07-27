from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.integration import Integration
from app.schemas.integration import (
    IntegrationCreate,
    IntegrationUpdate,
    IntegrationResponse,
)


router = APIRouter(
    prefix="/integrations",
    tags=["Integrations"]
)


# CREATE an integration
@router.post("/", response_model=IntegrationResponse)
def create_integration(
    integration: IntegrationCreate,
    db: Session = Depends(get_db)
):
    db_integration = Integration(
        name=integration.name,
        source_system=integration.source_system,
        target_system=integration.target_system,
        status=integration.status
    )

    db.add(db_integration)
    db.commit()
    db.refresh(db_integration)

    return db_integration


# GET all integrations
@router.get("/", response_model=list[IntegrationResponse])
def get_integrations(
    db: Session = Depends(get_db)
):
    integrations = db.query(Integration).all()

    return integrations


# GET an integration by ID
@router.get("/{integration_id}", response_model=IntegrationResponse)
def get_integration(
    integration_id: int,
    db: Session = Depends(get_db)
):
    integration = db.query(Integration).filter(
        Integration.id == integration_id
    ).first()

    if integration is None:
        raise HTTPException(
            status_code=404,
            detail="Integration not found"
        )

    return integration


# UPDATE an integration by ID
@router.put("/{integration_id}", response_model=IntegrationResponse)
def update_integration(
    integration_id: int,
    integration_update: IntegrationUpdate,
    db: Session = Depends(get_db)
):
    integration = db.query(Integration).filter(
        Integration.id == integration_id
    ).first()

    if integration is None:
        raise HTTPException(
            status_code=404,
            detail="Integration not found"
        )

    integration.name = integration_update.name
    integration.source_system = integration_update.source_system
    integration.target_system = integration_update.target_system
    integration.status = integration_update.status

    db.commit()
    db.refresh(integration)

    return integration


# DELETE an integration by ID
@router.delete("/{integration_id}")
def delete_integration(
    integration_id: int,
    db: Session = Depends(get_db)
):
    integration = db.query(Integration).filter(
        Integration.id == integration_id
    ).first()

    if integration is None:
        raise HTTPException(
            status_code=404,
            detail="Integration not found"
        )

    db.delete(integration)
    db.commit()

    return {
        "message": "Integration deleted successfully"
    }