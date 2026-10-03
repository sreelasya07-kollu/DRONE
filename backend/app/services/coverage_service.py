import math


def generate_coverage_polygon(
    center_lat,
    center_lon,
    radius_km=1.0,
    points=16
):

    result = []

    lat_scale = 1 / 111.0

    lon_scale = 1 / (
        111.0
        *
        max(
            math.cos(
                math.radians(
                    center_lat
                )
            ),
            0.2
        )
    )

    for i in range(points):

        angle = (
            2
            *
            math.pi
            *
            i
            /
            points
        )

        result.append({
            "lat":
                center_lat
                +
                radius_km
                *
                math.sin(angle)
                *
                lat_scale,

            "lng":
                center_lon
                +
                radius_km
                *
                math.cos(angle)
                *
                lon_scale
        })

    return result