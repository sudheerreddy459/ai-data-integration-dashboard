from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.integration import Integration
from app.models.integration_run import IntegrationRun
from app.schemas.dashboard import (
    DashboardSummaryResponse,
    IntegrationSummaryResponse,
    RecentRunResponse,
    FailureAnalyticsResponse,
    IntegrationAnalyticsResponse,
)


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


# GET overall dashboard summary
@router.get(
    "/summary",
    response_model=DashboardSummaryResponse
)
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

    # Running executions should not reduce the success rate
    completed_runs_count = successful_runs + failed_runs

    success_rate = (
        round(
            (successful_runs / completed_runs_count) * 100,
            2
        )
        if completed_runs_count > 0
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


# GET recent integration runs
# Includes integration name and structured failure information
@router.get(
    "/recent-runs",
    response_model=list[RecentRunResponse]
)
def get_recent_runs(
    limit: int = Query(
        default=5,
        ge=1,
        le=20
    ),
    db: Session = Depends(get_db)
):
    results = (
        db.query(
            IntegrationRun,
            Integration.name.label("integration_name")
        )
        .join(
            Integration,
            IntegrationRun.integration_id == Integration.id
        )
        .order_by(
            IntegrationRun.started_at.desc()
        )
        .limit(limit)
        .all()
    )

    recent_runs = []

    for run, integration_name in results:
        recent_runs.append({
            "id": run.id,
            "integration_id": run.integration_id,
            "integration_name": integration_name,
            "status": run.status,
            "started_at": run.started_at,
            "completed_at": run.completed_at,
            "records_processed": run.records_processed,
            "error_message": run.error_message,
            "error_category": run.error_category,
            "severity": run.severity,
            "duration_seconds": run.duration_seconds
        })

    return recent_runs


# GET recent failed integration runs
# Used for failure monitoring and future AI error analysis
@router.get(
    "/recent-failures",
    response_model=list[RecentRunResponse]
)
def get_recent_failures(
    limit: int = Query(
        default=5,
        ge=1,
        le=20
    ),
    db: Session = Depends(get_db)
):
    results = (
        db.query(
            IntegrationRun,
            Integration.name.label("integration_name")
        )
        .join(
            Integration,
            IntegrationRun.integration_id == Integration.id
        )
        .filter(
            IntegrationRun.status == "Failed"
        )
        .order_by(
            IntegrationRun.started_at.desc()
        )
        .limit(limit)
        .all()
    )

    recent_failures = []

    for run, integration_name in results:
        recent_failures.append({
            "id": run.id,
            "integration_id": run.integration_id,
            "integration_name": integration_name,
            "status": run.status,
            "started_at": run.started_at,
            "completed_at": run.completed_at,
            "records_processed": run.records_processed,
            "error_message": run.error_message,
            "error_category": run.error_category,
            "severity": run.severity,
            "duration_seconds": run.duration_seconds
        })

    return recent_failures


# GET failure analytics
# Groups failed runs by error category and severity
@router.get(
    "/failure-analytics",
    response_model=FailureAnalyticsResponse
)
def get_failure_analytics(
    db: Session = Depends(get_db)
):
    failed_runs = db.query(IntegrationRun).filter(
        IntegrationRun.status == "Failed"
    ).all()

    total_failures = len(failed_runs)

    by_category: dict[str, int] = {}
    by_severity: dict[str, int] = {}

    for run in failed_runs:
        # Older failures may not have structured classification
        category = run.error_category or "Unknown"
        severity = run.severity or "Unknown"

        by_category[category] = (
            by_category.get(category, 0) + 1
        )

        by_severity[severity] = (
            by_severity.get(severity, 0) + 1
        )

    return {
        "total_failures": total_failures,
        "by_category": by_category,
        "by_severity": by_severity
    }


# GET analytics for all integrations
# Shows run counts and failure rate for each integration
@router.get(
    "/integration-analytics",
    response_model=list[IntegrationAnalyticsResponse]
)
def get_integration_analytics(
    db: Session = Depends(get_db)
):
    integrations = db.query(Integration).all()

    analytics = []

    for integration in integrations:
        runs = db.query(IntegrationRun).filter(
            IntegrationRun.integration_id == integration.id
        ).all()

        total_runs = len(runs)

        successful_runs = sum(
            1 for run in runs
            if run.status == "Success"
        )

        failed_runs = sum(
            1 for run in runs
            if run.status == "Failed"
        )

        running_runs = sum(
            1 for run in runs
            if run.status == "Running"
        )

        # Failure rate considers only completed executions
        completed_runs_count = successful_runs + failed_runs

        failure_rate = (
            round(
                (failed_runs / completed_runs_count) * 100,
                2
            )
            if completed_runs_count > 0
            else 0.0
        )

        analytics.append({
            "integration_id": integration.id,
            "integration_name": integration.name,
            "total_runs": total_runs,
            "successful_runs": successful_runs,
            "failed_runs": failed_runs,
            "running_runs": running_runs,
            "failure_rate": failure_rate
        })

    # Show integrations with the highest failure rate first
    analytics.sort(
        key=lambda item: item["failure_rate"],
        reverse=True
    )

    return analytics


# GET summary for a specific integration
@router.get(
    "/integrations/{integration_id}/summary",
    response_model=IntegrationSummaryResponse
)
def get_integration_summary(
    integration_id: int,
    db: Session = Depends(get_db)
):
    # Check whether the integration exists
    integration = db.query(Integration).filter(
        Integration.id == integration_id
    ).first()

    if integration is None:
        raise HTTPException(
            status_code=404,
            detail="Integration not found"
        )

    # Get all runs for this integration
    runs = db.query(IntegrationRun).filter(
        IntegrationRun.integration_id == integration_id
    ).all()

    total_runs = len(runs)

    successful_runs = sum(
        1 for run in runs
        if run.status == "Success"
    )

    failed_runs = sum(
        1 for run in runs
        if run.status == "Failed"
    )

    total_records_processed = sum(
        run.records_processed
        for run in runs
    )

    # Running executions should not reduce the success rate
    completed_runs_count = successful_runs + failed_runs

    success_rate = (
        round(
            (successful_runs / completed_runs_count) * 100,
            2
        )
        if completed_runs_count > 0
        else 0.0
    )

    # Only completed runs with valid durations
    completed_runs = [
        run for run in runs
        if run.completed_at is not None
        and run.duration_seconds is not None
    ]

    if completed_runs:
        durations = [
            run.duration_seconds
            for run in completed_runs
        ]

        average_duration_seconds = round(
            sum(durations) / len(durations),
            2
        )
    else:
        average_duration_seconds = None

    # Find the most recent run
    last_run = max(
        runs,
        key=lambda run: run.started_at,
        default=None
    )

    if last_run is not None:
        last_run_status = last_run.status
        last_run_duration_seconds = last_run.duration_seconds
    else:
        last_run_status = None
        last_run_duration_seconds = None

    return {
        "integration_id": integration.id,
        "integration_name": integration.name,
        "total_runs": total_runs,
        "successful_runs": successful_runs,
        "failed_runs": failed_runs,
        "success_rate": success_rate,
        "total_records_processed": total_records_processed,
        "last_run_status": last_run_status,
        "average_duration_seconds": average_duration_seconds,
        "last_run_duration_seconds": last_run_duration_seconds
    }