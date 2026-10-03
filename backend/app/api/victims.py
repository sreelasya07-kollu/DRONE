from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from pydantic import (
    BaseModel,
    Field
)

from sqlalchemy.orm import Session

from app.models.database import get_db
from app.models.victim import Victim

from app.services.priority_service import (
    calculate_priority,
    priority_label
)


router = APIRouter(
    prefix="/api/victims",
    tags=["Victims"]
)


class VictimCreate(BaseModel):

    name: str | None = None

    latitude: float

    longitude: float

    severity: str = "medium"

    people_count: int = Field(
        default=1,
        ge=1
    )

    status: str = "detected"

    source: str = "manual"

    notes: str | None = None


@router.get("")
def list_victims(
    db: Session = Depends(get_db)
):

    victims = (
        db.query(Victim)
        .order_by(
            Victim.created_at.desc()
        )
        .all()
    )

    result = []

    for victim in victims:

        score = calculate_priority(
            victim.severity,
            victim.people_count
        )

        result.append({

            "id": victim.id,

            "name": victim.name,

            "latitude":
                victim.latitude,

            "longitude":
                victim.longitude,

            "severity":
                victim.severity,

            "people_count":
                victim.people_count,

            "status":
                victim.status,

            "source":
                victim.source,

            "notes":
                victim.notes,

            "priority_score":
                score,

            "priority":
                priority_label(score)
        })

    return result


@router.post(
    "",
    status_code=201
)
def create_victim(
    payload: VictimCreate,
    db: Session = Depends(get_db)
):

    victim = Victim(
        **payload.model_dump()
    )

    db.add(victim)

    db.commit()

    db.refresh(victim)

    score = calculate_priority(
        victim.severity,
        victim.people_count
    )

    return {
        "id": victim.id,
        **payload.model_dump(),
        "priority_score": score,
        "priority":
            priority_label(score)
    }


@router.get("/{victim_id}")
def get_victim(
    victim_id: int,
    db: Session = Depends(get_db)
):

    victim = db.get(
        Victim,
        victim_id
    )

    if not victim:

        raise HTTPException(
            status_code=404,
            detail="Victim not found"
        )

    return {
        "id": victim.id,
        "name": victim.name,
        "latitude": victim.latitude,
        "longitude": victim.longitude,
        "severity": victim.severity,
        "people_count":
            victim.people_count,
        "status": victim.status,
        "source": victim.source,
        "notes": victim.notes
    }


@router.patch(
    "/{victim_id}/status"
)
def update_status(
    victim_id: int,
    status: str,
    db: Session = Depends(get_db)
):

    victim = db.get(
        Victim,
        victim_id
    )

    if not victim:

        raise HTTPException(
            status_code=404,
            detail="Victim not found"
        )

    victim.status = status

    db.commit()

    return {
        "id": victim.id,
        "status": victim.status
    }