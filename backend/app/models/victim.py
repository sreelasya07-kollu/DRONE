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


class Victim(Base):

    __tablename__ = "victims"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(120),
        nullable=True
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

    people_count = Column(
        Integer,
        default=1
    )

    status = Column(
        String(30),
        default="detected"
    )

    source = Column(
        String(50),
        default="manual"
    )

    notes = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )