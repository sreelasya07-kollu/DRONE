from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    Float,
    String,
    DateTime
)

from app.models.database import Base


class Drone(Base):

    __tablename__ = "drones"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(100),
        nullable=False
    )

    latitude = Column(
        Float,
        default=17.385
    )

    longitude = Column(
        Float,
        default=78.4867
    )

    altitude = Column(
        Float,
        default=50
    )

    battery = Column(
        Float,
        default=100
    )

    status = Column(
        String(30),
        default="available"
    )

    mission_id = Column(
        Integer,
        nullable=True
    )

    last_update = Column(
        DateTime,
        default=datetime.utcnow
    )