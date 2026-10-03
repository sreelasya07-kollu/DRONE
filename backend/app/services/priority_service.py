SEVERITY_SCORE = {
    "critical": 100,
    "high": 80,
    "medium": 55,
    "low": 30
}


def calculate_priority(
    severity="medium",
    people_count=1,
    hazard_nearby=False,
    waiting_minutes=0,
    vulnerable=False
):

    score = SEVERITY_SCORE.get(
        str(severity).lower(),
        55
    )

    score += min(
        max(int(people_count or 1) - 1, 0) * 5,
        25
    )

    if hazard_nearby:
        score += 15

    score += min(
        max(int(waiting_minutes or 0), 0) // 5,
        15
    )

    if vulnerable:
        score += 10

    return min(score, 100)


def priority_label(score):

    if score >= 85:
        return "CRITICAL"

    if score >= 70:
        return "HIGH"

    if score >= 45:
        return "MEDIUM"

    return "LOW"