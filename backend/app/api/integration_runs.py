from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.integration import Integration
from app.models.integration_run import IntegrationRun
from app.schemas.integration_run import (
    IntegrationRunCreate,
    IntegrationRunUpdate,
    IntegrationRunResponse,
)


router = APIRouter(
    prefix="/integration-runs",
    tags=["Integration Runs"]
)


# CREATE / START an integration run
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

    # Every new run starts in Running state
    db_run = IntegrationRun(
        integration_id=run.integration_id,
        status="Running",
        records_processed=0,
        completed_at=None,
        error_message=None
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


# UPDATE / COMPLETE an integration run
@router.put("/{run_id}", response_model=IntegrationRunResponse)
def update_integration_run(
    run_id: int,
    run_update: IntegrationRunUpdate,
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

    # A completed run cannot be completed again
    if run.status != "Running":
        raise HTTPException(
            status_code=409,
            detail="Integration run is already completed"
        )

    run.status = run_update.status
    run.records_processed = run_update.records_processed
    run.error_message = run_update.error_message

    # Backend automatically records completion time
    run.completed_at = datetime.utcnow()

    db.commit()
    db.refresh(run)

    return run


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