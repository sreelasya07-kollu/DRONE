from fastapi import (
    FastAPI,
    WebSocket,
    WebSocketDisconnect
)
from app.routes.operations import router as operations_router
from fastapi.middleware.cors import (
    CORSMiddleware
)

from app.config import (
    APP_NAME,
    APP_VERSION,
    CORS_ORIGINS
)

from app.models.database import (
    init_db,
    SessionLocal
)

from app.models.victim import Victim
from app.models.hazard import Hazard
from app.models.drone import Drone
from app.models.mission import Mission

from app.websocket.manager import (
    manager
)

from app.api import (
    health,
    victims,
    hazards,
    drones,
    missions,
    routes,
    detection,
    simulation,
    ai
)


app = FastAPI(

    title=APP_NAME,

    version=APP_VERSION,

    description=(
        "AI-powered Emergency "
        "Response and Rescue "
        "Operations Platform"
    )
)


app.add_middleware(

    CORSMiddleware,

    allow_origins=
        CORS_ORIGINS,

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]
)

app.include_router(operations_router)
app.include_router(
    health.router
)

app.include_router(
    victims.router
)

app.include_router(
    hazards.router
)

app.include_router(
    drones.router
)

app.include_router(
    missions.router
)

app.include_router(
    routes.router
)

app.include_router(
    detection.router
)

app.include_router(
    simulation.router
)

app.include_router(
    ai.router
)


@app.on_event("startup")
def startup():

    init_db()

    seed_demo_data()


def seed_demo_data():

    db = SessionLocal()

    try:

        # -------------------------
        # VICTIMS
        # -------------------------

        if db.query(Victim).count() == 0:

            victims = [

                Victim(

                    name="Victim A",

                    latitude=17.3850,

                    longitude=78.4867,

                    severity="critical",

                    people_count=2,

                    status="detected",

                    source="demo"
                ),

                Victim(

                    name="Victim B",

                    latitude=17.3910,

                    longitude=78.4800,

                    severity="high",

                    people_count=1,

                    status="detected",

                    source="demo"
                ),

                Victim(

                    name="Victim C",

                    latitude=17.3780,

                    longitude=78.4920,

                    severity="medium",

                    people_count=3,

                    status="detected",

                    source="demo"
                )
            ]

            db.add_all(
                victims
            )

        # -------------------------
        # HAZARDS
        # -------------------------

        if db.query(Hazard).count() == 0:

            hazards = [

                Hazard(

                    type="Flooded Road",

                    latitude=17.388,

                    longitude=78.482,

                    severity="high",

                    radius_m=120,

                    status="active",

                    description=
                        "Demo flood zone"
                ),

                Hazard(

                    type="Road Debris",

                    latitude=17.381,

                    longitude=78.490,

                    severity="medium",

                    radius_m=60,

                    status="active",

                    description=
                        "Demo road obstruction"
                )
            ]

            db.add_all(
                hazards
            )

        # -------------------------
        # DRONES
        # -------------------------

        if db.query(Drone).count() == 0:

            drones = [

                Drone(

                    name=
                        "RESQ-DRONE-01",

                    latitude=17.385,

                    longitude=78.4867,

                    altitude=80,

                    battery=91,

                    status="available"
                ),

                Drone(

                    name=
                        "RESQ-DRONE-02",

                    latitude=17.390,

                    longitude=78.480,

                    altitude=60,

                    battery=74,

                    status="available"
                )
            ]

            db.add_all(
                drones
            )

        # -------------------------
        # MISSION
        # -------------------------

        if db.query(Mission).count() == 0:

            mission = Mission(

                title=
                    "Urban Rescue Operation",

                mission_type=
                    "rescue",

                status=
                    "active",

                priority=
                    92,

                origin_lat=
                    17.385,

                origin_lon=
                    78.4867,

                target_lat=
                    17.391,

                target_lon=
                    78.480,

                notes=
                    "RESQ-OPS demonstration mission"
            )

            db.add(
                mission
            )

        db.commit()

    finally:

        db.close()


@app.get("/")
def root():

    return {

        "name":
            APP_NAME,

        "version":
            APP_VERSION,

        "status":
            "running",

        "docs":
            "/docs",

        "health":
            "/api/health",

        "websocket":
            "/ws"
    }


@app.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket
):

    await manager.connect(
        websocket
    )

    try:

        await websocket.send_json({

            "type":
                "connected",

            "message":
                "RESQ-OPS realtime channel connected"
        })

        while True:

            data = (
                await websocket
                .receive_json()
            )

            await manager.broadcast({

                "type":
                    "client_event",

                "data":
                    data
            })

    except WebSocketDisconnect:

        manager.disconnect(
            websocket
        )

    except Exception:

        manager.disconnect(
            websocket
        )