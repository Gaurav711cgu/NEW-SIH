"""
ai_pipeline/reporter.py
------------------------
Generates structured JSON and CSV anomaly reports from geotagged detections.

Fields conform to the PS-26057 specification:
  - exact location (lat/lon)
  - bounding dimensions (x, y, w, h)
  - classification (object_class)
  - calibrated and raw confidence
  - shadow penalty flag
  - timestamp and ping_number

Output is fully serializable — no numpy types, no floats that break json.dumps.
"""

import json
import csv
import io
import math
from pathlib import Path
from typing import List


# CSV fields include ALL detection attributes required by PS-26057
CSV_FIELDS = [
    "object_class",
    "confidence_cal",
    "confidence_raw",
    "shadow_penalty",
    "lat",
    "lon",
    "depth_m",
    "bbox_x",
    "bbox_y",
    "bbox_w",
    "bbox_h",
    "heading_deg",
    "ping_number",
    "timestamp",
]


class _SafeEncoder(json.JSONEncoder):
    """Converts numpy scalars and non-finite floats so json.dumps never crashes."""
    def default(self, obj):
        try:
            import numpy as np
            if isinstance(obj, (np.integer,)):
                return int(obj)
            if isinstance(obj, (np.floating,)):
                return float(obj)
            if isinstance(obj, np.ndarray):
                return obj.tolist()
        except ImportError:
            pass
        return super().default(obj)

    def encode(self, obj):
        return super().encode(obj)

    def iterencode(self, obj, _one_shot=False):
        return super().iterencode(obj, _one_shot)


def _flatten_detection(det: dict) -> dict:
    """
    Expand nested 'bbox' field into flat columns for CSV compatibility.
    Handles both list format [x, y, w, h] and dict format {x, y, w, h}.
    Converts all values to plain Python types (no numpy scalars).
    """
    flat = {}
    for k, v in det.items():
        if k == "bbox":
            if isinstance(v, (list, tuple)) and len(v) == 4:
                flat["bbox_x"], flat["bbox_y"], flat["bbox_w"], flat["bbox_h"] = (
                    float(v[0]), float(v[1]), float(v[2]), float(v[3])
                )
            elif isinstance(v, dict):
                flat["bbox_x"] = float(v.get("x", 0))
                flat["bbox_y"] = float(v.get("y", 0))
                flat["bbox_w"] = float(v.get("w", 0))
                flat["bbox_h"] = float(v.get("h", 0))
        else:
            # Convert numpy types to plain Python
            if hasattr(v, "item"):
                flat[k] = v.item()
            elif isinstance(v, float) and (math.isnan(v) or math.isinf(v)):
                flat[k] = None
            else:
                flat[k] = v
    return flat


def to_json(detections: List[dict]) -> str:
    """Serialize detection list to formatted JSON. Safe for all numpy types."""
    return json.dumps(detections, indent=2, cls=_SafeEncoder)


def to_csv(detections: List[dict]) -> str:
    """Serialize detection list to CSV with flat bounding box columns."""
    if not detections:
        return ""
    flattened = [_flatten_detection(d) for d in detections]
    buf = io.StringIO()
    writer = csv.DictWriter(
        buf,
        fieldnames=CSV_FIELDS,
        extrasaction="ignore",
        lineterminator="\n",
    )
    writer.writeheader()
    writer.writerows(flattened)
    return buf.getvalue()


def write_report(detections: List[dict], output_prefix: str = "report") -> None:
    """
    Write both JSON and CSV reports to disk.
    Creates parent directories if they do not exist.
    """
    prefix_path = Path(output_prefix)
    prefix_path.parent.mkdir(parents=True, exist_ok=True)

    json_path = prefix_path.with_suffix(".json")
    csv_path  = prefix_path.with_suffix(".csv")

    try:
        with open(json_path, "w", encoding="utf-8") as f:
            f.write(to_json(detections))
    except (OSError, IOError) as e:
        raise IOError(f"Failed to write JSON report to {json_path}: {e}") from e

    try:
        with open(csv_path, "w", encoding="utf-8", newline="") as f:
            f.write(to_csv(detections))
    except (OSError, IOError) as e:
        raise IOError(f"Failed to write CSV report to {csv_path}: {e}") from e
