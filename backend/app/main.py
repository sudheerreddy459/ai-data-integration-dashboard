from fastapi import FastAPI

from app.api.health import router as health_router
from app.api.integrations import router as integrations_router
from app.api.integration_runs import router as integration_runs_router
from app.api.dashboard import router as dashboard_router
from app.config import settings


app = FastAPI(
    title=settings.APP_NAME,
    description="Backend APIs for enterprise integration monitoring",
    version=settings.APP_VERSION,
)

app.include_router(health_router)
app.include_router(integrations_router)
app.include_router(integration_runs_router)
app.include_router(dashboard_router)


@app.get("/")
def home():
    return {
        "message": f"Welcome to {settings.APP_NAME}"
    }