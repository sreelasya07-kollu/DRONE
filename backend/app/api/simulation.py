import asyncio
import random

from fastapi import APIRouter
from pydantic import BaseModel

from app.models.database import SessionLocal
from app.models.victim import Victim
from app.models.drone import Drone
from app.websocket.manager import manager

router = APIRouter(
    prefix="/api/simulation",
    tags=["Simulation"]
)


class SimulationRequest(BaseModel):
    ticks: int = 8
    interval_seconds: float = 0.8


@router.post("/run")
async def run_simulation(payload: SimulationRequest):

    ticks = max(1, min(payload.ticks, 12))
    interval = max(0.1, min(payload.interval_seconds, 3))

    events = []
    db = SessionLocal()

    try:
        victims = db.query(Victim).all()
        drones = db.query(Drone).all()

        # Reset demo state
        for victim in victims:
            if victim.status in ["rescued", "priority"]:
                victim.status = "detected"

        for drone in drones:
            drone.status = "available"

        db.commit()

        for tick in range(1, ticks + 1):

            if tick == 1:
                message = "Urban flood response simulation initiated"

            elif tick == 2:
                message = "Flood zone expanded — additional victims identified"

                available = [
                    v for v in victims
                    if v.status == "detected"
                ]

                if available:
                    selected = random.choice(available)
                    selected.status = "priority"

            elif tick == 3:
                message = "Drone surveillance units dispatched"

                for drone in drones[:3]:
                    drone.status = "active"

            elif tick == 4:
                message = "Critical victim priority queue recalculated"

                critical = [
                    v for v in victims
                    if str(v.severity).lower() == "critical"
                ]

                if critical:
                    critical[0].status = "priority"

            elif tick == 5:
                message = "Fastest rescue route recalculated around hazards"

            elif tick == 6:
                message = "Rescue unit reached priority victim"

                priority = [
                    v for v in victims
                    if v.status == "priority"
                ]

                if priority:
                    priority[0].status = "rescued"

            elif tick == 7:
                message = "Drone surveillance detected additional people"

            else:
                message = "Emergency response coordination continuing"

            event = {
                "tick": tick,
                "type": "SIMULATION",
                "message": message,
                "severity": (
                    "CRITICAL"
                    if tick in [2, 4]
                    else "INFO"
                )
            }

            events.append(event)
            db.commit()

            try:
                await manager.broadcast({
                    "type": "simulation_event",
                    **event
                })
            except Exception:
                pass

            await asyncio.sleep(interval)

        for drone in drones:
            if drone.status == "active":
                drone.status = "available"

        db.commit()

        complete = {
            "tick": ticks,
            "type": "SIMULATION_COMPLETE",
            "message": "Urban flood response simulation completed",
            "severity": "SUCCESS"
        }

        events.append(complete)

        try:
            await manager.broadcast({
                "type": "simulation_complete",
                **complete
            })
        except Exception:
            pass

        return {
            "scenario": "URBAN_FLOOD_RESPONSE",
            "completed": True,
            "ticks": ticks,
            "events": events
        }

    finally:
        db.close()
