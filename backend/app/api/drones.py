from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from pydantic import BaseModel

from sqlalchemy.orm import Session

from app.models.database import get_db
from app.models.drone import Drone


router = APIRouter(
    prefix="/api/drones",
    tags=["Drones"]
)


class DroneCreate(BaseModel):

    name: str

    latitude: float = 17.385

    longitude: float = 78.4867

    altitude: float = 50

    battery: float = 100

    status: str = "available"


class DronePosition(BaseModel):

    latitude: float

    longitude: float

    altitude: float | None = None

    battery: float | None = None

    status: str | None = None


def serialize(drone):

    return {
        "id": drone.id,
        "name": drone.name,
        "latitude": drone.latitude,
        "longitude": drone.longitude,
        "altitude": drone.altitude,
        "battery": drone.battery,
        "status": drone.status,
        "mission_id":
            drone.mission_id,
        "last_update":
            drone.last_update
    }


@router.get("")
def list_drones(
    db: Session = Depends(get_db)
):

    drones = (
        db.query(Drone)
        .order_by(Drone.id)
        .all()
    )

    return [
        serialize(drone)
        for drone in drones
    ]


@router.post(
    "",
    status_code=201
)
def create_drone(
    payload: DroneCreate,
    db: Session = Depends(get_db)
):

    drone = Drone(
        **payload.model_dump()
    )

    db.add(drone)

    db.commit()

    db.refresh(drone)

    return serialize(drone)


@router.patch(
    "/{drone_id}/position"
)
def update_position(
    drone_id: int,
    payload: DronePosition,
    db: Session = Depends(get_db)
):

    drone = db.get(
        Drone,
        drone_id
    )

    if not drone:

        raise HTTPException(
            404,
            "Drone not found"
        )

    drone.latitude = (
        payload.latitude
    )

    drone.longitude = (
        payload.longitude
    )

    if payload.altitude is not None:

        drone.altitude = (
            payload.altitude
        )

    if payload.battery is not None:

        drone.battery = max(
            0,
            min(
                100,
                payload.battery
            )
        )

    if payload.status is not None:

        drone.status = (
            payload.status
        )

    db.commit()

    db.refresh(drone)

    return serialize(drone)