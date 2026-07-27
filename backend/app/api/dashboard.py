from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.integration import Integration
from app.models.integration_run import IntegrationRun
from app.schemas.dashboard import DashboardSummaryResponse


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(
    db: Session = Depends(get_db)
):
    total_integrations = db.query(
        func.count(Integration.id)
    ).scalar()

    total_runs = db.query(
        func.count(IntegrationRun.id)
    ).scalar()

    successful_runs = db.query(
        func.count(IntegrationRun.id)
    ).filter(
        IntegrationRun.status == "Success"
    ).scalar()

    failed_runs = db.query(
        func.count(IntegrationRun.id)
    ).filter(
        IntegrationRun.status == "Failed"
    ).scalar()

    total_records_processed = db.query(
        func.coalesce(
            func.sum(IntegrationRun.records_processed),
            0
        )
    ).scalar()

    success_rate = (
        round((successful_runs / total_runs) * 100, 2)
        if total_runs > 0
        else 0.0
    )

    return {
        "total_integrations": total_integrations,
        "total_runs": total_runs,
        "successful_runs": successful_runs,
        "failed_runs": failed_runs,
        "total_records_processed": total_records_processed,
        "success_rate": success_rate
    }