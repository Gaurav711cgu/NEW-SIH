import json
import csv
import io
from typing import List

def to_json(detections: List[dict]) -> str:
    return json.dumps(detections, indent=2)

def to_csv(detections: List[dict]) -> str:
    if not detections:
        return ""
    fields = ["object_class", "confidence_cal", "shadow_penalty",
              "lat", "lon", "depth_m", "timestamp", "ping_number"]
    buf = io.StringIO()
    writer = csv.DictWriter(buf, fieldnames=fields, extrasaction="ignore")
    writer.writeheader()
    writer.writerows(detections)
    return buf.getvalue()

def write_report(detections: List[dict], output_prefix: str = "report"):
    with open(f"{output_prefix}.json", "w") as f:
        f.write(to_json(detections))
    with open(f"{output_prefix}.csv", "w") as f:
        f.write(to_csv(detections))
