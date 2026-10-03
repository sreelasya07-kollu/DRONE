from app.services.priority_service import (
    calculate_priority
)


def predict_priority(features):

    return calculate_priority(
        severity=features.get(
            "severity",
            "medium"
        ),

        people_count=features.get(
            "people_count",
            1
        ),

        hazard_nearby=features.get(
            "hazard_nearby",
            False
        ),

        waiting_minutes=features.get(
            "waiting_minutes",
            0
        ),

        vulnerable=features.get(
            "vulnerable",
            False
        )
    )