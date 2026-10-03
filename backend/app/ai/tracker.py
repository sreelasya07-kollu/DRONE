import math


class CentroidTracker:

    def __init__(
        self,
        max_distance=80
    ):

        self.next_id = 1

        self.objects = {}

        self.max_distance = (
            max_distance
        )

    def update(
        self,
        detections
    ):

        centers = []

        for detection in detections:

            x1, y1, x2, y2 = (
                detection["bbox"]
            )

            center_x = (
                x1 + x2
            ) / 2

            center_y = (
                y1 + y2
            ) / 2

            centers.append(
                (
                    center_x,
                    center_y,
                    detection
                )
            )

        updated = {}

        used = set()

        for object_id, (
            old_x,
            old_y,
            old_detection
        ) in self.objects.items():

            best_index = None

            best_distance = (
                self.max_distance
            )

            for index, (
                x,
                y,
                detection
            ) in enumerate(centers):

                if index in used:
                    continue

                distance = math.hypot(
                    x - old_x,
                    y - old_y
                )

                if distance < best_distance:

                    best_distance = distance
                    best_index = index

            if best_index is not None:

                x, y, detection = (
                    centers[best_index]
                )

                detection[
                    "track_id"
                ] = object_id

                updated[
                    object_id
                ] = (
                    x,
                    y,
                    detection
                )

                used.add(
                    best_index
                )

        for index, (
            x,
            y,
            detection
        ) in enumerate(centers):

            if index in used:
                continue

            detection[
                "track_id"
            ] = self.next_id

            updated[
                self.next_id
            ] = (
                x,
                y,
                detection
            )

            self.next_id += 1

        self.objects = updated

        return [
            value[2]
            for value
            in updated.values()
        ]