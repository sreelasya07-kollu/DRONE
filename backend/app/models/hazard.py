from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    Float,
    String,
    DateTime,
    Text
)

from app.models.database import Base


class Hazard(Base):

    __tablename__ = "hazards"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    type = Column(
        String(80),
        nullable=False
    )

    latitude = Column(
        Float,
        nullable=False
    )

    longitude = Column(
        Float,
        nullable=False
    )

    severity = Column(
        String(30),
        default="medium"
    )

    radius_m = Column(
        Float,
        default=50
    )

    status = Column(
        String(30),
        default="active"
    )

    description = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )