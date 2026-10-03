from app.ai.yolo_detector import YOLODetector


_detector = None


def get_detector():

    global _detector

    if _detector is None:
        _detector = YOLODetector()

    return _detector


def detect_image(
    path,
    confidence=0.35
):

    detector = get_detector()

    return detector.predict(
        path,
        confidence
    )