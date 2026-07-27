from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.integration import Integration
from app.models.integration_run import IntegrationRun
from app.schemas.integration_run import (
    IntegrationRunCreate,
    IntegrationRunResponse,
)


router = APIRouter(
    prefix="/integration-runs",
    tags=["Integration Runs"]
)


# CREATE an integration run
@router.post("/", response_model=IntegrationRunResponse)
def create_integration_run(
    run: IntegrationRunCreate,
    db: Session = Depends(get_db)
):
    # Check that the integration exists
    integration = db.query(Integration).filter(
        Integration.id == run.integration_id
    ).first()

    if integration is None:
        raise HTTPException(
            status_code=404,
            detail="Integration not found"
        )

    db_run = IntegrationRun(
        integration_id=run.integration_id,
        status=run.status,
        completed_at=run.completed_at,
        records_processed=run.records_processed,
        error_message=run.error_message
    )

    db.add(db_run)
    db.commit()
    db.refresh(db_run)

    return db_run


# GET all integration runs
@router.get("/", response_model=list[IntegrationRunResponse])
def get_integration_runs(
    db: Session = Depends(get_db)
):
    runs = db.query(IntegrationRun).all()

    return runs


# GET all runs for a specific integration
@router.get(
    "/integration/{integration_id}",
    response_model=list[IntegrationRunResponse]
)
def get_runs_by_integration(
    integration_id: int,
    db: Session = Depends(get_db)
):
    # Check that the integration exists
    integration = db.query(Integration).filter(
        Integration.id == integration_id
    ).first()

    if integration is None:
        raise HTTPException(
            status_code=404,
            detail="Integration not found"
        )

    runs = db.query(IntegrationRun).filter(
        IntegrationRun.integration_id == integration_id
    ).all()

    return runs


# GET integration run by ID
@router.get("/{run_id}", response_model=IntegrationRunResponse)
def get_integration_run(
    run_id: int,
    db: Session = Depends(get_db)
):
    run = db.query(IntegrationRun).filter(
        IntegrationRun.id == run_id
    ).first()

    if run is None:
        raise HTTPException(
            status_code=404,
            detail="Integration run not found"
        )

    return run