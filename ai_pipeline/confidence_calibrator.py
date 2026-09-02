import numpy as np
from typing import List

SHADOW_PENALTY_FACTOR = 0.50  # detections in shadow zones penalised 50%
LOW_CONFIDENCE_THRESHOLD = 0.35

def calibrate(detections: List[dict], shadow_mask: np.ndarray) -> List[dict]:
    """
    For each detection, checks whether its centroid falls within an
    acoustic shadow zone and applies a penalty factor if so.

    Rationale: Objects detected in shadow zones are almost always
    false positives caused by shadow boundary artefacts rather than
    real targets. The 0.5 penalty factor was chosen conservatively
    to flag rather than suppress -- all detections remain visible on
    the dashboard, but shadow-penalised detections are visually
    distinguished and placed lower in the priority sort.
    """
    calibrated = []
    h, w = shadow_mask.shape

    for det in detections:
        x, y, bw, bh = det["bbox"]
        cx = int(x + bw / 2)
        cy = int(y + bh / 2)
        cx = max(0, min(cx, w - 1))
        cy = max(0, min(cy, h - 1))

        in_shadow = bool(shadow_mask[cy, cx] > 0)
        raw_conf  = det["confidence"]
        cal_conf  = raw_conf * SHADOW_PENALTY_FACTOR if in_shadow else raw_conf

        calibrated.append({
            **det,
            "confidence_raw":    round(raw_conf, 3),
            "confidence_cal":    round(cal_conf, 3),
            "shadow_penalty":    in_shadow,
            "below_threshold":   cal_conf < LOW_CONFIDENCE_THRESHOLD,
        })

    return sorted(calibrated, key=lambda d: d["confidence_cal"], reverse=True)
