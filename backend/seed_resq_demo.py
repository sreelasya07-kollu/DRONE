from datetime import datetime
from app.models.database import SessionLocal
from app.models.victim import Victim
from app.models.drone import Drone

db = SessionLocal()

try:
    # ---------------------------------------------------------
    # CLEAR OLD DEMO VICTIMS / DRONES
    # ---------------------------------------------------------
    db.query(Victim).delete()
    db.query(Drone).delete()

    # ---------------------------------------------------------
    # FLOOD RESPONSE VICTIMS
    # ---------------------------------------------------------
    victims = [
        {
            "name": "Victim 01",
            "latitude": 17.3910,
            "longitude": 78.4800,
            "severity": "critical",
            "people_count": 2,
            "status": "detected",
            "source": "flood_demo",
            "notes": "Trapped near flooded intersection"
        },
        {
            "name": "Victim 02",
            "latitude": 17.3895,
            "longitude": 78.4785,
            "severity": "critical",
            "people_count": 4,
            "status": "detected",
            "source": "flood_demo",
            "notes": "Family stranded on upper floor"
        },
        {
            "name": "Victim 03",
            "latitude": 17.3880,
            "longitude": 78.4820,
            "severity": "high",
            "people_count": 3,
            "status": "detected",
            "source": "flood_demo",
            "notes": "Water entering residential area"
        },
        {
            "name": "Victim 04",
            "latitude": 17.3865,
            "longitude": 78.4790,
            "severity": "high",
            "people_count": 1,
            "status": "detected",
            "source": "flood_demo",
            "notes": "Vehicle stranded in flood water"
        },
        {
            "name": "Victim 05",
            "latitude": 17.3845,
            "longitude": 78.4810,
            "severity": "high",
            "people_count": 5,
            "status": "detected",
            "source": "flood_demo",
            "notes": "Crowd requesting evacuation"
        },
        {
            "name": "Victim 06",
            "latitude": 17.3825,
            "longitude": 78.4845,
            "severity": "medium",
            "people_count": 2,
            "status": "detected",
            "source": "flood_demo",
            "notes": "Minor injuries reported"
        },
        {
            "name": "Victim 07",
            "latitude": 17.3805,
            "longitude": 78.4875,
            "severity": "medium",
            "people_count": 4,
            "status": "detected",
            "source": "flood_demo",
            "notes": "Residents awaiting evacuation"
        },
        {
            "name": "Victim 08",
            "latitude": 17.3780,
            "longitude": 78.4920,
            "severity": "medium",
            "people_count": 3,
            "status": "detected",
            "source": "flood_demo",
            "notes": "Flooded road access"
        },
        {
            "name": "Victim 09",
            "latitude": 17.3765,
            "longitude": 78.4890,
            "severity": "low",
            "people_count": 2,
            "status": "detected",
            "source": "flood_demo",
            "notes": "Safe shelter requested"
        },
        {
            "name": "Victim 10",
            "latitude": 17.3930,
            "longitude": 78.4840,
            "severity": "high",
            "people_count": 2,
            "status": "detected",
            "source": "flood_demo",
            "notes": "Water level rising"
        },
        {
            "name": "Victim 11",
            "latitude": 17.3940,
            "longitude": 78.4870,
            "severity": "critical",
            "people_count": 3,
            "status": "detected",
            "source": "flood_demo",
            "notes": "Medical assistance required"
        },
        {
            "name": "Victim 12",
            "latitude": 17.3870,
            "longitude": 78.4900,
            "severity": "medium",
            "people_count": 6,
            "status": "detected",
            "source": "flood_demo",
            "notes": "Large group awaiting rescue"
        },
        {
            "name": "Victim 13",
            "latitude": 17.3830,
            "longitude": 78.4930,
            "severity": "low",
            "people_count": 1,
            "status": "detected",
            "source": "flood_demo",
            "notes": "Safe but isolated"
        },
        {
            "name": "Victim 14",
            "latitude": 17.3795,
            "longitude": 78.4850,
            "severity": "high",
            "people_count": 4,
            "status": "detected",
            "source": "flood_demo",
            "notes": "Road access blocked"
        },
        {
            "name": "Victim 15",
            "latitude": 17.3920,
            "longitude": 78.4900,
            "severity": "medium",
            "people_count": 2,
            "status": "detected",
            "source": "flood_demo",
            "notes": "Needs evacuation assistance"
        },
    ]

    for item in victims:
        db.add(Victim(**item))

    # ---------------------------------------------------------
    # DRONE FLEET
    # ---------------------------------------------------------
    drones = [
        Drone(
            name="RESQ-DRONE-01",
            latitude=17.3910,
            longitude=78.4800,
            altitude=80,
            battery=91,
            status="available"
        ),
        Drone(
            name="RESQ-DRONE-02",
            latitude=17.3830,
            longitude=78.4920,
            altitude=65,
            battery=78,
            status="available"
        ),
        Drone(
            name="RESQ-DRONE-03",
            latitude=17.3940,
            longitude=78.4870,
            altitude=95,
            battery=68,
            status="available"
        ),
        Drone(
            name="RESQ-DRONE-04",
            latitude=17.3790,
            longitude=78.4860,
            altitude=55,
            battery=84,
            status="standby"
        ),
    ]

    for drone in drones:
        db.add(drone)

    db.commit()

    print("==========================================")
    print("RESQ-OPS DEMO DATA UPDATED")
    print("Victims:", db.query(Victim).count())
    print("Drones :", db.query(Drone).count())
    print("==========================================")

finally:
    db.close()
