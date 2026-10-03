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


class Mission(Base):

    __tablename__ = "missions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    title = Column(
        String(150),
        nullable=False
    )

    mission_type = Column(
        String(60),
        default="rescue"
    )

    status = Column(
        String(30),
        default="planned"
    )

    priority = Column(
        Integer,
        default=50
    )

    origin_lat = Column(
        Float,
        nullable=False
    )

    origin_lon = Column(
        Float,
        nullable=False
    )

    target_lat = Column(
        Float,
        nullable=False
    )

    target_lon = Column(
        Float,
        nullable=False
    )

    assigned_drone_id = Column(
        Integer,
        nullable=True
    )

    notes = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )