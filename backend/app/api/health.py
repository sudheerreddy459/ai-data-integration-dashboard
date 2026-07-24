from datetime import datetime
from fastapi import APIRouter
from app.config import settings
from app.utils.logger import logger

router = APIRouter(
    prefix="/health",
    tags=["Health"]
)

@router.get("/")
def health_check():
    logger.info("Health endpoint accessed")

    return {
        "status": "UP",
        "application": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "timestamp": datetime.utcnow().isoformat(),
        "environment": "Development"
    }