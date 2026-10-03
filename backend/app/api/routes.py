from fastapi import APIRouter
from pydantic import BaseModel

from app.services.route_service import (
    route_points,
    a_star_grid
)


router = APIRouter(
    prefix="/api/routes",
    tags=["Routes"]
)


class RouteRequest(BaseModel):

    origin_lat: float

    origin_lon: float

    target_lat: float

    target_lon: float

    hazards: list[dict] = []


@router.post("/calculate")
def calculate_route(
    payload: RouteRequest
):

    return route_points(

        (
            payload.origin_lat,
            payload.origin_lon
        ),

        (
            payload.target_lat,
            payload.target_lon
        ),

        payload.hazards
    )


class GridRequest(BaseModel):

    width: int = 20

    height: int = 20

    start: tuple[int, int] = (
        0,
        0
    )

    goal: tuple[int, int] = (
        19,
        19
    )

    blocked: list[
        tuple[int, int]
    ] = []


@router.post("/astar")
def calculate_astar(
    payload: GridRequest
):

    path = a_star_grid(

        payload.width,

        payload.height,

        payload.start,

        payload.goal,

        payload.blocked
    )

    return {
        "path": path
    }