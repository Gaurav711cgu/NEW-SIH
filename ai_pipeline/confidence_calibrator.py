import numpy as np
from typing import List, Optional, Union, Dict, Any

SHADOW_PENALTY_FACTOR = 0.50  # detections in shadow zones penalised 50%
LOW_CONFIDENCE_THRESHOLD = 0.35

def calibrate(detections: List[Dict[str, Any]], shadow_mask: Optional[np.ndarray] = None) -> List[Dict[str, Any]]:
    """
    For each detection, checks whether its centroid falls within an
    acoustic shadow zone and applies a penalty factor if so.

    Handles both normalized coordinates [0.0, 1.0] and pixel coordinates.
    When normalized coordinates are supplied, centroids are safely scaled
    against shadow_mask dimensions (w, h) before rounding to avoid clamping to 0.

    Rationale: Objects detected in shadow zones are almost always
    false positives caused by shadow boundary artefacts rather than
    real targets. The 0.5 penalty factor was chosen conservatively
    to flag rather than suppress -- all detections remain visible on
    the dashboard, but shadow-penalised detections are visually
    distinguished and placed lower in the priority sort.
    """
    calibrated = []
    has_mask = shadow_mask is not None and hasattr(shadow_mask, "shape") and len(shadow_mask.shape) >= 2
    if has_mask:
        h, w = shadow_mask.shape[:2]
    else:
        h, w = (1, 1)

    for det in detections:
        bbox = det.get("bbox", [0.0, 0.0, 0.0, 0.0])
        if isinstance(bbox, dict):
            x = float(bbox.get("x", 0.0))
            y = float(bbox.get("y", 0.0))
            bw = float(bbox.get("w", 0.0))
            bh = float(bbox.get("h", 0.0))
        elif isinstance(bbox, (list, tuple)) and len(bbox) >= 4:
            x, y, bw, bh = [float(v) for v in bbox[:4]]
        else:
            x, y, bw, bh = 0.0, 0.0, 0.0, 0.0

        if has_mask and (w > 1 or h > 1):
            # Check if bbox is in normalized coordinates [0.0, 1.0]
            if max(x, y, bw, bh) <= 1.0:
                cx = int(round((x + bw / 2.0) * w))
                cy = int(round((y + bh / 2.0) * h))
            else:
                cx = int(round(x + bw / 2.0))
                cy = int(round(y + bh / 2.0))

            cx = max(0, min(cx, w - 1))
            cy = max(0, min(cy, h - 1))
            in_shadow = bool(shadow_mask[cy, cx] > 0)
        else:
            in_shadow = False

        raw_conf = float(det.get("confidence", det.get("confidence_raw", 0.0)))
        cal_conf = raw_conf * SHADOW_PENALTY_FACTOR if in_shadow else raw_conf

        out_det = dict(det)
        # Ensure class aliases exist for geotagger and database layers
        if "class" not in out_det and "class_name" in out_det:
            out_det["class"] = out_det["class_name"]
        if "object_class" not in out_det and "class_name" in out_det:
            out_det["object_class"] = out_det["class_name"]

        out_det.update({
            "confidence_raw":  round(raw_conf, 3),
            "confidence_cal":  round(cal_conf, 3),
            "shadow_penalty":  in_shadow,
            "below_threshold": cal_conf < LOW_CONFIDENCE_THRESHOLD,
        })
        calibrated.append(out_det)

    return sorted(calibrated, key=lambda d: d["confidence_cal"], reverse=True)
