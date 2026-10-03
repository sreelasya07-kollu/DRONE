import math
import heapq


def haversine_km(
    lat1,
    lon1,
    lat2,
    lon2
):

    radius = 6371.0

    p1 = math.radians(lat1)
    p2 = math.radians(lat2)

    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)

    a = (
        math.sin(dp / 2) ** 2
        +
        math.cos(p1)
        * math.cos(p2)
        * math.sin(dl / 2) ** 2
    )

    return 2 * radius * math.asin(
        math.sqrt(a)
    )


def route_points(
    origin,
    destination,
    hazards=None,
    steps=12
):

    lat1, lon1 = origin
    lat2, lon2 = destination

    hazards = hazards or []

    points = []

    for i in range(steps + 1):

        t = i / steps

        lat = lat1 + (
            lat2 - lat1
        ) * t

        lon = lon1 + (
            lon2 - lon1
        ) * t

        points.append({
            "lat": lat,
            "lng": lon
        })

    distance = haversine_km(
        lat1,
        lon1,
        lat2,
        lon2
    )

    penalty = 0

    for hazard in hazards:

        hazard_distance = haversine_km(
            lat1,
            lon1,
            hazard["latitude"],
            hazard["longitude"]
        )

        if hazard_distance < 2:
            penalty += 0.25

    final_distance = (
        distance * (1 + penalty)
    )

    return {
        "distance_km": round(
            final_distance,
            3
        ),
        "estimated_minutes": round(
            final_distance * 3.2
        ),
        "points": points,
        "hazard_avoidance": penalty > 0
    }


def a_star_grid(
    width,
    height,
    start,
    goal,
    blocked=None
):

    blocked = set(blocked or [])

    def heuristic(a, b):

        return (
            abs(a[0] - b[0])
            +
            abs(a[1] - b[1])
        )

    open_set = [
        (
            heuristic(start, goal),
            0,
            start
        )
    ]

    came_from = {}

    cost_so_far = {
        start: 0
    }

    while open_set:

        _, current_cost, current = (
            heapq.heappop(open_set)
        )

        if current == goal:

            path = [current]

            while current in came_from:

                current = came_from[current]

                path.append(current)

            return list(
                reversed(path)
            )

        x, y = current

        neighbours = [
            (x + 1, y),
            (x - 1, y),
            (x, y + 1),
            (x, y - 1)
        ]

        for neighbour in neighbours:

            nx, ny = neighbour

            if not (
                0 <= nx < width
                and
                0 <= ny < height
            ):
                continue

            if neighbour in blocked:
                continue

            new_cost = (
                current_cost + 1
            )

            if new_cost < cost_so_far.get(
                neighbour,
                float("inf")
            ):

                cost_so_far[neighbour] = new_cost

                came_from[neighbour] = current

                priority = (
                    new_cost
                    +
                    heuristic(
                        neighbour,
                        goal
                    )
                )

                heapq.heappush(
                    open_set,
                    (
                        priority,
                        new_cost,
                        neighbour
                    )
                )

    return []