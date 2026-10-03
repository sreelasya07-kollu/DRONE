from pathlib import Path

from app.config import MODEL_PATH


class YOLODetector:

    def __init__(
        self,
        model_path=None
    ):

        self.model_path = Path(
            model_path or MODEL_PATH
        )

        self.model = None
        self.error = None

        try:

            from ultralytics import YOLO

            if self.model_path.exists():

                self.model = YOLO(
                    str(self.model_path)
                )

            else:

                self.model = YOLO(
                    "yolov8n.pt"
                )

        except Exception as exc:

            self.error = str(exc)

    def available(self):

        return self.model is not None

    def predict(
        self,
        source,
        confidence=0.35
    ):

        if not self.model:

            return {
                "success": False,
                "error":
                    self.error
                    or
                    "YOLO model unavailable",

                "detections": []
            }

        results = self.model.predict(
            source=source,
            conf=confidence,
            verbose=False
        )

        detections = []

        for result in results:

            names = result.names

            boxes = result.boxes

            if boxes is None:
                continue

            for box in boxes:

                class_id = int(
                    box.cls[0]
                )

                conf = float(
                    box.conf[0]
                )

                bbox = [
                    float(value)
                    for value
                    in box.xyxy[0].tolist()
                ]

                detections.append({
                    "class_id":
                        class_id,

                    "class_name":
                        names.get(
                            class_id,
                            str(class_id)
                        ),

                    "confidence":
                        round(
                            conf,
                            4
                        ),

                    "bbox":
                        bbox
                })

        return {
            "success": True,
            "detections":
                detections,
            "count":
                len(detections)
        }