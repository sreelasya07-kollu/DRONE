from fastapi import APIRouter
from pydantic import BaseModel

from app.services.rag_service import (
    answer,
    retrieve
)

from app.ai.priority_model import (
    predict_priority
)


router = APIRouter(
    prefix="/api/ai",
    tags=["RESQ AI"]
)


class Query(BaseModel):

    query: str


class PriorityRequest(BaseModel):

    severity: str = "medium"

    people_count: int = 1

    hazard_nearby: bool = False

    waiting_minutes: int = 0

    vulnerable: bool = False


@router.post("/ask")
def ask(
    payload: Query
):

    return answer(
        payload.query
    )


@router.post("/retrieve")
def rag_retrieve(
    payload: Query
):

    return {
        "results":
            retrieve(
                payload.query
            )
    }


@router.post("/priority")
def priority(
    payload: PriorityRequest
):

    score = predict_priority(
        payload.model_dump()
    )

    return {
        "score":
            score
    }