from fastapi import APIRouter

from app.config import (
    APP_NAME,
    APP_VERSION
)

from app.ai.yolo_detector import (
    YOLODetector
)


router = APIRouter(
    prefix="/api/health",
    tags=["Health"]
)


@router.get("")
def health():

    detector = YOLODetector()

    return {
        "name": APP_NAME,
        "version": APP_VERSION,
        "status": "running",
        "yolo_available":
            detector.available()
    }


@router.get("/ready")
def readiness():

    return {
        "ready": True
    }