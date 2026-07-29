from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.integration import Integration
from app.models.integration_run import IntegrationRun
from app.schemas.integration_run import (
    IntegrationRunCreate,
    IntegrationRunUpdate,
    IntegrationRunResponse,
    RunStatus,
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


# GET integration runs
# Supports:
# - status filtering
# - pagination
# - pagination validation
# - newest runs first
@router.get("/", response_model=list[IntegrationRunResponse])
def get_integration_runs(
    status: RunStatus | None = None,
    limit: int = Query(
        default=20,
        ge=1,
        le=100
    ),
    offset: int = Query(
        default=0,
        ge=0
    ),
    db: Session = Depends(get_db)
):
    query = db.query(IntegrationRun)

    # Optional status filter
    if status is not None:
        query = query.filter(
            IntegrationRun.status == status.value
        )

    # Newest runs first + pagination
    runs = query.order_by(
        IntegrationRun.started_at.desc()
    ).offset(
        offset
    ).limit(
        limit
    ).all()

    return runs


# GET runs for a specific integration
# Supports:
# - status filtering
# - pagination
# - pagination validation
# - newest runs first
@router.get(
    "/integration/{integration_id}",
    response_model=list[IntegrationRunResponse]
)
def get_runs_by_integration(
    integration_id: int,
    status: RunStatus | None = None,
    limit: int = Query(
        default=20,
        ge=1,
        le=100
    ),
    offset: int = Query(
        default=0,
        ge=0
    ),
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

    # Start query for this integration
    query = db.query(IntegrationRun).filter(
        IntegrationRun.integration_id == integration_id
    )

    # Optional status filter
    if status is not None:
        query = query.filter(
            IntegrationRun.status == status.value
        )

    # Newest runs first + pagination
    runs = query.order_by(
        IntegrationRun.started_at.desc()
    ).offset(
        offset
    ).limit(
        limit
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

    # Completed runs cannot be completed again
    if run.status != "Running":
        raise HTTPException(
            status_code=409,
            detail="Integration run is already completed"
        )

    # Complete the run
    run.status = run_update.status.value
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