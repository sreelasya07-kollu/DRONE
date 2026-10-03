import asyncio
import random

from fastapi import APIRouter
from pydantic import BaseModel

from app.websocket.manager import (
    manager
)


router = APIRouter(
    prefix="/api/simulation",
    tags=["Simulation"]
)


class SimulationRequest(BaseModel):

    ticks: int = 10

    interval_seconds: float = 0.5


@router.post("/run")
async def run_simulation(
    payload: SimulationRequest
):

    ticks = max(
        1,
        min(
            payload.ticks,
            100
        )
    )

    events = []

    for tick in range(ticks):

        event = {

            "tick":
                tick + 1,

            "victims_detected":
                random.randint(
                    0,
                    4
                ),

            "hazards_detected":
                random.randint(
                    0,
                    2
                ),

            "drone_battery":
                round(
                    random.uniform(
                        35,
                        100
                    ),
                    1
                ),

            "system_status":
                "operational"
        }

        events.append(event)

        await manager.broadcast({

            "type":
                "simulation",

            "data":
                event
        })

        await asyncio.sleep(
            max(
                0,
                min(
                    payload.interval_seconds,
                    3
                )
            )
        )

    return {
        "status":
            "completed",

        "events":
            events
    }