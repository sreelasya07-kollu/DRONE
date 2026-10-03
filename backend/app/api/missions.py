from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from pydantic import BaseModel

from sqlalchemy.orm import Session

from app.models.database import get_db
from app.models.mission import Mission
from app.models.drone import Drone


router = APIRouter(
    prefix="/api/missions",
    tags=["Missions"]
)


class MissionCreate(BaseModel):

    title: str

    mission_type: str = "rescue"

    status: str = "planned"

    priority: int = 50

    origin_lat: float

    origin_lon: float

    target_lat: float

    target_lon: float

    assigned_drone_id: int | None = None

    notes: str | None = None


def serialize(mission):

    return {
        "id": mission.id,
        "title": mission.title,
        "mission_type":
            mission.mission_type,
        "status": mission.status,
        "priority": mission.priority,
        "origin_lat":
            mission.origin_lat,
        "origin_lon":
            mission.origin_lon,
        "target_lat":
            mission.target_lat,
        "target_lon":
            mission.target_lon,
        "assigned_drone_id":
            mission.assigned_drone_id,
        "notes": mission.notes,
        "created_at":
            mission.created_at,
        "updated_at":
            mission.updated_at
    }


@router.get("")
def list_missions(
    db: Session = Depends(get_db)
):

    missions = (
        db.query(Mission)
        .order_by(
            Mission.created_at.desc()
        )
        .all()
    )

    return [
        serialize(mission)
        for mission in missions
    ]


@router.post(
    "",
    status_code=201
)
def create_mission(
    payload: MissionCreate,
    db: Session = Depends(get_db)
):

    mission = Mission(
        **payload.model_dump()
    )

    if mission.assigned_drone_id:

        drone = db.get(
            Drone,
            mission.assigned_drone_id
        )

        if not drone:

            raise HTTPException(
                400,
                "Assigned drone does not exist"
            )

        drone.status = "on_mission"

    db.add(mission)

    db.commit()

    db.refresh(mission)

    return serialize(mission)


@router.patch(
    "/{mission_id}/status"
)
def update_status(
    mission_id: int,
    status: str,
    db: Session = Depends(get_db)
):

    mission = db.get(
        Mission,
        mission_id
    )

    if not mission:

        raise HTTPException(
            404,
            "Mission not found"
        )

    mission.status = status

    db.commit()

    return {
        "id": mission.id,
        "status": mission.status
    }