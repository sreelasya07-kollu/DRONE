from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import math
import requests

from app.models.database import get_db
from app.models.victim import Victim
from app.models.hazard import Hazard
from app.models.drone import Drone

router = APIRouter(
    prefix="/api/operations",
    tags=["Operations"]
)

COMMAND_CENTER = {
    "id": "COMMAND-01",
    "name": "RESQ Operations Center",
    "latitude": 17.3850,
    "longitude": 78.4867,
}


def distance_km(lat1, lon1, lat2, lon2):
    r = 6371.0

    p1 = math.radians(lat1)
    p2 = math.radians(lat2)

    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)

    a = (
        math.sin(dp / 2) ** 2
        + math.cos(p1)
        * math.cos(p2)
        * math.sin(dl / 2) ** 2
    )

    return r * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def priority_score(victim):
    severity = str(victim.severity or "").lower()

    base = {
        "critical": 100,
        "high": 80,
        "medium": 60,
        "low": 40
    }.get(severity, 40)

    people_bonus = min(int(victim.people_count or 0) * 5, 20)

    return min(base + people_bonus, 100)


def serialize_victim(v):
    score = priority_score(v)

    if score >= 90:
        priority = "CRITICAL"
    elif score >= 75:
        priority = "HIGH"
    elif score >= 55:
        priority = "MEDIUM"
    else:
        priority = "LOW"

    return {
        "id": v.id,
        "name": v.name,
        "latitude": v.latitude,
        "longitude": v.longitude,
        "severity": v.severity,
        "people_count": v.people_count,
        "status": v.status,
        "source": v.source,
        "notes": v.notes,
        "priority": priority,
        "priority_score": score
    }


def serialize_hazard(h):
    return {
        "id": h.id,
        "type": h.type,
        "latitude": h.latitude,
        "longitude": h.longitude,
        "severity": h.severity,
        "radius_m": h.radius_m,
        "status": h.status,
        "description": h.description
    }


def serialize_drone(drone, victims):
    coverage_radius = 900

    nearby = []

    for victim in victims:
        d = distance_km(
            drone.latitude,
            drone.longitude,
            victim.latitude,
            victim.longitude
        )

        if d <= coverage_radius / 1000:
            nearby.append(victim)

    people_detected = sum(
        int(v.people_count or 0)
        for v in nearby
    )

    victims_detected = len(nearby)

    return {
        "id": f"DR-{int(drone.id):02d}",
        "database_id": drone.id,
        "name": drone.name,
        "status": str(drone.status or "available").upper(),
        "latitude": drone.latitude,
        "longitude": drone.longitude,
        "altitude": drone.altitude,
        "battery": drone.battery,
        "mission_id": drone.mission_id,
        "last_update": drone.last_update,
        "coverage_radius_m": coverage_radius,
        "people_detected": people_detected,
        "victims_detected": victims_detected,
        "position": [
            drone.latitude,
            drone.longitude
        ]
    }


def get_fastest_route(destination):
    origin_lat = COMMAND_CENTER["latitude"]
    origin_lon = COMMAND_CENTER["longitude"]

    dest_lat = destination["latitude"]
    dest_lon = destination["longitude"]

    if (
        abs(origin_lat - dest_lat) < 0.00001
        and abs(origin_lon - dest_lon) < 0.00001
    ):
        return {
            "provider": "OSRM",
            "status": "same_location",
            "distance_km": 0,
            "duration_minutes": 0,
            "geometry": {
                "coordinates": [
                    [origin_lon, origin_lat],
                    [dest_lon, dest_lat]
                ],
                "type": "LineString"
            }
        }

    url = (
        "https://router.project-osrm.org/route/v1/driving/"
        f"{origin_lon},{origin_lat};"
        f"{dest_lon},{dest_lat}"
        "?overview=full&geometries=geojson&steps=true"
    )

    try:
        response = requests.get(url, timeout=8)
        response.raise_for_status()

        data = response.json()

        if data.get("routes"):
            route = data["routes"][0]

            return {
                "provider": "OSRM",
                "status": "success",
                "distance_km": round(
                    route["distance"] / 1000,
                    2
                ),
                "duration_minutes": round(
                    route["duration"] / 60,
                    1
                ),
                "geometry": route["geometry"]
            }

    except Exception as exc:
        print("OSRM route error:", exc)

    distance = distance_km(
        origin_lat,
        origin_lon,
        dest_lat,
        dest_lon
    )

    return {
        "provider": "fallback",
        "status": "estimated",
        "distance_km": round(distance, 2),
        "duration_minutes": round(distance * 3.2, 1),
        "geometry": {
            "coordinates": [
                [origin_lon, origin_lat],
                [dest_lon, dest_lat]
            ],
            "type": "LineString"
        }
    }


@router.get("/drones")
def get_drones(db: Session = Depends(get_db)):
    victims = db.query(Victim).all()
    drones = db.query(Drone).all()

    return [
        serialize_drone(d, victims)
        for d in drones
    ]


@router.get("/map")
def operations_map(
    victim_id: int | None = None,
    db: Session = Depends(get_db)
):
    victims_db = db.query(Victim).all()

    hazards_db = (
        db.query(Hazard)
        .filter(Hazard.status == "active")
        .all()
    )

    drones_db = db.query(Drone).all()

    victims = [
        serialize_victim(v)
        for v in victims_db
    ]

    hazards = [
        serialize_hazard(h)
        for h in hazards_db
    ]

    drones = [
        serialize_drone(d, victims_db)
        for d in drones_db
    ]

    destination = None

    if victim_id:
        destination = next(
            (
                v for v in victims
                if v["id"] == victim_id
            ),
            None
        )

    if destination is None and victims:
        candidates = sorted(
            victims,
            key=lambda v: (
                v["priority_score"],
                v["people_count"]
            ),
            reverse=True
        )

        destination = candidates[0]

    route = (
        get_fastest_route(destination)
        if destination
        else {
            "provider": "OSRM",
            "status": "no_destination",
            "distance_km": 0,
            "duration_minutes": 0,
            "geometry": {
                "coordinates": [],
                "type": "LineString"
            }
        }
    )

    critical = sum(
        1 for v in victims
        if str(v["severity"]).lower() == "critical"
    )

    high = sum(
        1 for h in hazards
        if str(h["severity"]).lower() in ["critical", "high"]
    )

    if critical >= 2 or high >= 3:
        threat = "CRITICAL"
    elif critical >= 1 or high >= 2:
        threat = "HIGH"
    else:
        threat = "MEDIUM"

    return {
        "command_center": COMMAND_CENTER,
        "victims": victims,
        "hazards": hazards,
        "drones": drones,
        "route": route,
        "route_destination": destination,
        "system": {
            "status": "OPERATIONAL",
            "active_mission": True,
            "threat_level": threat,
            "victims_active": len(victims),
            "hazards_active": len(hazards),
            "drones_online": len([
                d for d in drones
                if d["status"] in [
                    "AVAILABLE",
                    "ACTIVE",
                    "ONLINE"
                ]
            ]),
            "critical_victims": critical
        }
    }
