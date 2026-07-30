from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.integration import Integration
from app.models.integration_run import IntegrationRun
from app.schemas.ai_analysis import FailureAnalysisResponse
from app.services.ai_analysis import analyse_failure


router = APIRouter(
    prefix="/ai-analysis",
    tags=["AI Analysis"]
)


# Analyse a specific failed integration run
@router.get(
    "/failures/{run_id}",
    response_model=FailureAnalysisResponse
)
def get_failure_analysis(
    run_id: int,
    db: Session = Depends(get_db)
):
    # Find the integration run
    run = db.query(IntegrationRun).filter(
        IntegrationRun.id == run_id
    ).first()

    if run is None:
        raise HTTPException(
            status_code=404,
            detail="Integration run not found"
        )

    # Only failed runs can be analysed
    if run.status != "Failed":
        raise HTTPException(
            status_code=400,
            detail="Only failed integration runs can be analysed"
        )

    # Find the integration
    integration = db.query(Integration).filter(
        Integration.id == run.integration_id
    ).first()

    if integration is None:
        raise HTTPException(
            status_code=404,
            detail="Integration not found"
        )

    # Analyse failure using the service layer
    analysis = analyse_failure(
        error_message=run.error_message,
        error_category=run.error_category,
        severity=run.severity
    )

    return {
        "run_id": run.id,
        "integration_id": run.integration_id,
        "integration_name": integration.name,
        "error_message": run.error_message,
        "error_category": run.error_category,
        "severity": run.severity,
        "probable_cause": analysis["probable_cause"],
        "recommendation": analysis["recommendation"]
    }