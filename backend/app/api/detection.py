from pathlib import Path
from uuid import uuid4

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    HTTPException,
    Query
)

from app.config import UPLOAD_DIR

from app.services.detection_service import (
    detect_image
)


router = APIRouter(
    prefix="/api/detection",
    tags=["Detection"]
)


@router.post("/image")
async def detect(

    file: UploadFile = File(...),

    confidence: float = Query(
        0.35,
        ge=0,
        le=1
    )
):

    allowed_extensions = {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
        ".bmp"
    }

    extension = Path(
        file.filename or ""
    ).suffix.lower()

    if extension not in allowed_extensions:

        raise HTTPException(
            400,
            "Unsupported image type"
        )

    filename = (
        uuid4().hex
        +
        extension
    )

    path = (
        UPLOAD_DIR
        /
        filename
    )

    contents = await file.read()

    path.write_bytes(
        contents
    )

    result = detect_image(
        str(path),
        confidence
    )

    result["filename"] = filename

    return result


@router.get("/status")
def detection_status():

    from app.services.detection_service import (
        get_detector
    )

    detector = get_detector()

    return {
        "available":
            detector.available(),

        "model_path":
            str(detector.model_path),

        "error":
            detector.error
    }