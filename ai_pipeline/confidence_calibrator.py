"""
ai_pipeline/confidence_calibrator.py
------------------------------------
Advanced confidence calibration based on Acoustic Shadow Exploitation.
Objects on the seafloor MUST cast an acoustic shadow. If YOLO detects an object
without an adjacent acoustic shadow zone, a physics-based confidence penalty is applied.
"""
import cv2
import numpy as np
import logging
from typing import List, Optional, Union

logger = logging.getLogger(__name__)

class ConfidenceCalibrator:
    """
    Confidence calibrator using Acoustic Shadow verification.
    """
    def __init__(self, shadow_threshold: int = 40, penalty_factor: float = 0.75):
        self.shadow_threshold = shadow_threshold
        self.penalty_factor = penalty_factor

    def calibrate(
        self,
        detections: list,
        original_image: Optional[np.ndarray] = None,
        shadow_mask: Optional[np.ndarray] = None
    ) -> list:
        return calibrate(detections, shadow_mask=shadow_mask, original_image=original_image)


def calibrate(
    detections: List[dict],
    shadow_mask: Optional[np.ndarray] = None,
    original_image: Optional[np.ndarray] = None,
    penalty_factor: float = 0.75,
    shadow_threshold: int = 40
) -> List[dict]:
    """
    Calibrates detection confidences by checking if an acoustic shadow exists adjacent to each detection box.
    """
    if not detections:
        return []

    # If shadow mask or original image is provided, perform spatial shadow analysis
    img_h, img_w = (0, 0)
    if shadow_mask is not None and shadow_mask.size > 0:
        img_h, img_w = shadow_mask.shape[:2]
    elif original_image is not None and original_image.size > 0:
        img_h, img_w = original_image.shape[:2]
        if len(original_image.shape) == 3:
            gray = cv2.cvtColor(original_image, cv2.COLOR_BGR2GRAY)
        else:
            gray = original_image
        _, shadow_mask = cv2.threshold(gray, shadow_threshold, 255, cv2.THRESH_BINARY_INV)

    calibrated_list = []
    for det in detections:
        d = dict(det) if isinstance(det, dict) else det.to_dict()
        
        raw_conf = float(d.get("confidence_raw", d.get("confidence", 0.5)))
        d["confidence_raw"] = round(raw_conf, 4)
        
        bbox = d.get("bbox", [0, 0, 0, 0])
        if isinstance(bbox, (list, tuple)) and len(bbox) == 4 and img_w > 0 and img_h > 0:
            bx, by, bw, bh = bbox
            # Normalized or absolute coordinates
            if bw <= 1.0 and bh <= 1.0 and img_w > 1 and img_h > 1:
                px_x = int(bx * img_w)
                px_y = int(by * img_h)
                px_w = int(bw * img_w)
                px_h = int(bh * img_h)
            else:
                px_x = int(bx)
                px_y = int(by)
                px_w = int(bw)
                px_h = int(bh)

            # Region to the right / bottom of acoustic contact where shadow is expected
            shadow_scan_x = min(px_x + px_w, img_w - 1)
            shadow_scan_y = min(px_y, img_h - 1)
            shadow_scan_w = min(max(px_w, 10), img_w - shadow_scan_x)
            shadow_scan_h = min(max(px_h, 10), img_h - shadow_scan_y)

            if shadow_scan_w > 0 and shadow_scan_h > 0 and shadow_mask is not None:
                patch = shadow_mask[shadow_scan_y:shadow_scan_y + shadow_scan_h, shadow_scan_x:shadow_scan_x + shadow_scan_w]
                if patch.size > 0:
                    shadow_ratio = np.count_nonzero(patch) / patch.size
                    if shadow_ratio < 0.10:
                        # Insufficient shadow: apply penalty
                        d["shadow_penalty"] = True
                        d["confidence_cal"] = round(raw_conf * penalty_factor, 4)
                    else:
                        d["shadow_penalty"] = False
                        d["confidence_cal"] = round(raw_conf, 4)
                else:
                    d["shadow_penalty"] = False
                    d["confidence_cal"] = round(raw_conf, 4)
            else:
                d["shadow_penalty"] = False
                d["confidence_cal"] = round(raw_conf, 4)
        else:
            d["shadow_penalty"] = d.get("shadow_penalty", False)
            d["confidence_cal"] = round(float(d.get("confidence_cal", raw_conf)), 4)

        calibrated_list.append(d)

    return calibrated_list
