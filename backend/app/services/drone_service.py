from datetime import datetime


def estimate_mission_feasibility(
    drone,
    target_lat,
    target_lon,
    distance_km
):

    required_battery = min(
        95,
        max(
            5,
            distance_km * 8
        )
    )

    return {
        "drone_id": drone.id,
        "battery": drone.battery,
        "required_battery_percent": round(
            required_battery,
            1
        ),
        "feasible": (
            drone.battery
            >= required_battery + 10
        ),
        "estimated_flight_minutes": round(
            distance_km * 3
        )
    }


def update_drone_position(
    drone,
    latitude,
    longitude,
    battery=None,
    status=None
):

    drone.latitude = latitude
    drone.longitude = longitude

    if battery is not None:

        drone.battery = max(
            0,
            min(100, battery)
        )

    if status:
        drone.status = status

    drone.last_update = datetime.utcnow()