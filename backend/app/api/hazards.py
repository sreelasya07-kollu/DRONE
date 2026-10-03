from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from pydantic import BaseModel

from sqlalchemy.orm import Session

from app.models.database import get_db
from app.models.hazard import Hazard


router = APIRouter(
    prefix="/api/hazards",
    tags=["Hazards"]
)


class HazardCreate(BaseModel):

    type: str

    latitude: float

    longitude: float

    severity: str = "medium"

    radius_m: float = 50

    status: str = "active"

    description: str | None = None


def serialize(hazard):

    return {
        "id": hazard.id,
        "type": hazard.type,
        "latitude": hazard.latitude,
        "longitude": hazard.longitude,
        "severity": hazard.severity,
        "radius_m": hazard.radius_m,
        "status": hazard.status,
        "description": hazard.description,
        "created_at":
            hazard.created_at
    }


@router.get("")
def list_hazards(
    db: Session = Depends(get_db)
):

    hazards = (
        db.query(Hazard)
        .order_by(
            Hazard.created_at.desc()
        )
        .all()
    )

    return [
        serialize(hazard)
        for hazard in hazards
    ]


@router.post(
    "",
    status_code=201
)
def create_hazard(
    payload: HazardCreate,
    db: Session = Depends(get_db)
):

    hazard = Hazard(
        **payload.model_dump()
    )

    db.add(hazard)

    db.commit()

    db.refresh(hazard)

    return serialize(hazard)


@router.patch(
    "/{hazard_id}/status"
)
def update_status(
    hazard_id: int,
    status: str,
    db: Session = Depends(get_db)
):

    hazard = db.get(
        Hazard,
        hazard_id
    )

    if not hazard:

        raise HTTPException(
            404,
            "Hazard not found"
        )

    hazard.status = status

    db.commit()

    return {
        "id": hazard.id,
        "status": hazard.status
    }