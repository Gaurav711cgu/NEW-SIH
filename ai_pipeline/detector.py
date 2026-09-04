"""
ai_pipeline/detector.py
-----------------------
AQUILA OS — Side-Scan Sonar (SSS) ML Inference Pipeline.
Integrates CLAHE acoustic preprocessing, Ultralytics YOLO/RT-DETR inference,
normalized bounding boxes [0.0, 1.0], confidence calibration, and full CLI interface.
"""

import os
import sys
import time
import argparse
import json
import logging
from pathlib import Path
from dataclasses import dataclass, asdict
from typing import List, Optional, Union, Dict, Any
import cv2
import numpy as np

# Ensure project root and ai_pipeline package are in sys.path
SCRIPT_DIR = Path(__file__).resolve().parent
ROOT_DIR = SCRIPT_DIR.parent
for p in (str(ROOT_DIR), str(SCRIPT_DIR)):
    if p not in sys.path:
        sys.path.insert(0, p)

# Package-safe imports with dual fallback
try:
    from ai_pipeline.preprocessor import preprocess_sss, PreprocessedImage
    from ai_pipeline.confidence_calibrator import calibrate
    from ai_pipeline.geotagger import geotag_detections
    from ai_pipeline.reporter import write_report, to_json
except ImportError:
    from preprocessor import preprocess_sss, PreprocessedImage
    from confidence_calibrator import calibrate
    from geotagger import geotag_detections
    from reporter import write_report, to_json

log = logging.getLogger(__name__)

# Class taxonomy mapping: raw dataset/model classes to human-readable names
CLASS_MAPPING: Dict[Union[int, str], str] = {
    0: "shipwreck",
    1: "aircraft",
    2: "human",
    "ship": "shipwreck",
    "boat": "shipwreck",
    "vessel": "shipwreck",
    "aircraft": "aircraft",
    "airplane": "aircraft",
    "human": "human",
    "person": "human",
    "cylinder": "uxo_mine",
    "mine": "uxo_mine",
    "pipe": "pipeline_cable",
    "pipeline": "pipeline_cable",
    "net": "ghost_net",
    "ghost_net": "ghost_net",
    "anomaly": "anomaly",
}

# Visualization colors in BGR
CLASS_COLORS_BGR: Dict[str, tuple] = {
    "shipwreck": (255, 229, 0),     # Cyan
    "ghost_net": (200, 128, 255),   # Pink
    "uxo_mine": (68, 68, 239),      # Red
    "pipeline_cable": (0, 215, 255),# Gold
    "aircraft": (184, 163, 148),    # Slate
    "human": (74, 222, 128),        # Green
    "anomaly": (180, 180, 180),     # Gray
}


@dataclass
class Detection:
    """
    Standardized SSS Target Detection.
    Bounding box coordinates are strictly normalized in [0.0, 1.0] as [x, y, w, h]
    where (x, y) is the top-left origin.
    """
    bbox: List[float]  # [x, y, w, h] normalized in [0.0, 1.0]
    confidence: float
    class_name: str
    class_id: int

    def to_dict(self) -> Dict[str, Any]:
        """Return serialized dictionary with normalized coordinates and compatibility aliases."""
        return {
            "bbox": [round(float(c), 4) for c in self.bbox],
            "confidence": round(float(self.confidence), 4),
            "class_name": str(self.class_name),
            "class_id": int(self.class_id),
            # Downstream module compatibility aliases:
            "class": str(self.class_name),
            "object_class": str(self.class_name),
        }

    def __getitem__(self, item: str) -> Any:
        return self.to_dict()[item]


class SonarDetector:
    """
    AQUILA OS Production-grade Side-Scan Sonar (SSS) Inference Engine.
    Handles CLAHE contrast normalization, YOLO / RT-DETR model loading via Ultralytics,
    and returns standardized detections.
    """

    def __init__(
        self,
        weights_path: Optional[Union[str, Path]] = None,
        conf: float = 0.25,
        device: Optional[str] = "auto",
    ):
        self.conf = float(conf)
        self.device = self._resolve_device(device)
        self.weights_path = self._resolve_weights(weights_path)
        self.model = None
        self.model_loaded = False
        self._load_model()

    def _resolve_device(self, device: Optional[str]) -> str:
        """Select optimal compute device (CUDA -> MPS -> CPU)."""
        if device and device.lower() != "auto":
            return device.lower()
        try:
            import torch
            if torch.cuda.is_available():
                return "cuda"
            if torch.backends.mps.is_available():
                return "mps"
        except Exception:
            pass
        return "cpu"

    def _resolve_weights(self, weights_path: Optional[Union[str, Path]]) -> Path:
        """Locate valid model weights across project paths."""
        if weights_path is not None:
            # Explicit path provided: strictly validate and do NOT silently fallback
            explicit_candidates = [
                Path(weights_path),
                ROOT_DIR / weights_path,
                SCRIPT_DIR / weights_path,
            ]
            for path in explicit_candidates:
                try:
                    resolved = path.resolve()
                    if resolved.is_file():
                        return resolved
                except Exception:
                    continue
            raise FileNotFoundError(f"Specified model weights not found: {weights_path}")

        # Standard default weight locations when no explicit path is passed
        default_candidates = [
            ROOT_DIR / "best.pt",
            Path("best.pt"),
            ROOT_DIR / "models" / "sss_detector_v1" / "weights" / "best.pt",
            ROOT_DIR / "models" / "stage2_rtdetr_sctd" / "weights" / "best.pt",
            ROOT_DIR / "yolov8n.pt",
            ROOT_DIR / "rtdetr-l.pt",
        ]

        for path in default_candidates:
            try:
                resolved = path.resolve()
                if resolved.is_file():
                    return resolved
            except Exception:
                continue

        # Fallback to default expected path
        return ROOT_DIR / "best.pt"

    def _load_model(self) -> None:
        """Load YOLO or RT-DETR weights using Ultralytics."""
        if not self.weights_path.exists():
            log.warning("Weights file not found at %s. Detector will be inactive.", self.weights_path)
            self.model = None
            self.model_loaded = False
            return

        try:
            from ultralytics import YOLO
            self.model = YOLO(str(self.weights_path))
            self.model_loaded = True
            log.info("Loaded model via YOLO from %s on device %s", self.weights_path, self.device)
            return
        except Exception as exc_yolo:
            log.debug("YOLO loader attempt failed (%s). Trying RTDETR loader...", exc_yolo)

        try:
            from ultralytics import RTDETR
            self.model = RTDETR(str(self.weights_path))
            self.model_loaded = True
            log.info("Loaded model via RTDETR from %s on device %s", self.weights_path, self.device)
        except Exception as exc_rtdetr:
            log.error("Failed to load model weights from %s: %s", self.weights_path, exc_rtdetr)
            self.model = None
            self.model_loaded = False

    def run(
        self,
        image: Union[str, Path, np.ndarray],
        conf: Optional[float] = None,
        iou: float = 0.45,
        use_clahe: Optional[bool] = None,
    ) -> List[Detection]:
        """
        Execute SSS inference on an input image.

        Args:
            image: Image file path (str/Path) or numpy array (e.g., prep.enhanced).
            conf: Optional confidence threshold override.
            iou: NMS IoU threshold.
            use_clahe: If True, applies CLAHE contrast normalization.
                       Defaults to True for file paths and False for pre-enhanced numpy arrays.

        Returns:
            List of Detection objects with normalized [x, y, w, h] coordinates.
        """
        if self.model is None:
            log.warning("Inference requested but model is not loaded.")
            return []

        # Determine CLAHE necessity
        if isinstance(image, (str, Path)):
            img_path = Path(image)
            if not img_path.exists():
                raise FileNotFoundError(f"Input image does not exist: {img_path}")

            apply_clahe = True if use_clahe is None else bool(use_clahe)
            if apply_clahe:
                prep = preprocess_sss(str(img_path))
                inference_img = prep.processed
                orig_h, orig_w = prep.original.shape[:2]
            else:
                raw = cv2.imread(str(img_path))
                if raw is None:
                    raise FileNotFoundError(f"Failed to read image: {img_path}")
                inference_img = raw
                orig_h, orig_w = raw.shape[:2]
        elif isinstance(image, np.ndarray):
            apply_clahe = bool(use_clahe) if use_clahe is not None else False
            if apply_clahe:
                prep = preprocess_sss(image)
                inference_img = prep.processed
            else:
                inference_img = image
            orig_h, orig_w = image.shape[:2]
        else:
            raise ValueError(f"Unsupported image type: {type(image)}")

        threshold = float(conf) if conf is not None else self.conf

        try:
            results = self.model(
                inference_img,
                conf=threshold,
                iou=iou,
                device=self.device,
                verbose=False,
            )
        except Exception as exc:
            # If MPS fails, try CPU fallback
            if self.device != "cpu":
                log.warning("Inference failed on %s (%s). Retrying on CPU...", self.device, exc)
                results = self.model(
                    inference_img,
                    conf=threshold,
                    iou=iou,
                    device="cpu",
                    verbose=False,
                )
            else:
                raise exc

        detections: List[Detection] = []
        if not results or len(results) == 0:
            return detections

        boxes = results[0].boxes
        if boxes is None or len(boxes) == 0:
            return detections

        for box in boxes:
            cls_id = int(box.cls[0].item())
            conf_val = float(box.conf[0].item())

            # Retrieve class label
            raw_name = ""
            if hasattr(self.model, "names") and isinstance(self.model.names, dict):
                raw_name = self.model.names.get(cls_id, str(cls_id))
            elif hasattr(self.model, "names") and isinstance(self.model.names, (list, tuple)):
                raw_name = self.model.names[cls_id] if cls_id < len(self.model.names) else str(cls_id)
            else:
                raw_name = str(cls_id)

            class_name = CLASS_MAPPING.get(cls_id, CLASS_MAPPING.get(raw_name.lower(), raw_name))

            # Compute normalized [x, y, w, h] from top-left origin
            if hasattr(box, "xyxyn") and len(box.xyxyn) > 0:
                x1n, y1n, x2n, y2n = box.xyxyn[0].tolist()
            else:
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                x1n, y1n, x2n, y2n = x1 / orig_w, y1 / orig_h, x2 / orig_w, y2 / orig_h

            x = max(0.0, min(1.0, float(x1n)))
            y = max(0.0, min(1.0, float(y1n)))
            bw = max(0.0, min(1.0 - x, float(x2n - x1n)))
            bh = max(0.0, min(1.0 - y, float(y2n - y1n)))

            detections.append(
                Detection(
                    bbox=[round(x, 4), round(y, 4), round(bw, 4), round(bh, 4)],
                    confidence=round(conf_val, 4),
                    class_name=class_name,
                    class_id=cls_id,
                )
            )

        return detections

    def process_frame(
        self,
        image_path: str,
        frame_index: int = 0,
        conf: Optional[float] = None,
    ) -> List[Dict[str, Any]]:
        """
        Execute end-to-end pipeline:
        Preprocessing -> Inference -> Acoustic Shadow Calibration -> Geotagging
        """
        prep = preprocess_sss(image_path)
        detections = self.run(prep.processed, conf=conf, use_clahe=False)
        det_dicts = [d.to_dict() for d in detections]
        calibrated = calibrate(det_dicts, shadow_mask=prep.shadow_mask)
        geotagged = geotag_detections(calibrated, pings=None, frame_index=frame_index)
        return geotagged


# Backward compatibility alias
AnomalyDetector = SonarDetector


def draw_detections(
    image_path: Union[str, Path],
    detections: List[Detection],
    output_path: Union[str, Path],
) -> str:
    """Draw bounding boxes and class labels on sonar image."""
    img = cv2.imread(str(image_path))
    if img is None:
        raise FileNotFoundError(f"Cannot read image for visualization: {image_path}")

    h, w = img.shape[:2]
    for det in detections:
        x_norm, y_norm, w_norm, h_norm = det.bbox
        x1 = int(round(x_norm * w))
        y1 = int(round(y_norm * h))
        x2 = int(round((x_norm + w_norm) * w))
        y2 = int(round((y_norm + h_norm) * h))

        color = CLASS_COLORS_BGR.get(det.class_name, (0, 229, 255))
        cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)

        label = f"{det.class_name} {det.confidence * 100:.1f}%"
        (tw, th), baseline = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
        cv2.rectangle(img, (x1, max(0, y1 - th - 6)), (x1 + tw + 6, max(th + 6, y1)), color, -1)
        cv2.putText(
            img,
            label,
            (x1 + 3, max(th, y1 - 4)),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.5,
            (0, 0, 0),
            1,
            cv2.LINE_AA,
        )

    out_p = Path(output_path)
    out_p.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(out_p), img)
    return str(out_p)


def main():
    parser = argparse.ArgumentParser(
        description="AQUILA OS — Side-Scan Sonar (SSS) Detection Engine CLI"
    )
    parser.add_argument("image", help="Path to raw SSS sonar image (e.g. testing_images/01_shipwreck_large_waterfall.jpg)")
    parser.add_argument("--weights", default=None, help="Path to model weights (default: best.pt)")
    parser.add_argument("--conf", type=float, default=0.25, help="Confidence threshold (default: 0.25)")
    parser.add_argument("--device", default="auto", help="Compute device: auto, cpu, mps, cuda (default: auto; use 'cpu' for fast single-image CLI runs without Apple Silicon MPS shader compile overhead)")
    parser.add_argument("--no-clahe", action="store_true", help="Disable CLAHE preprocessing")
    parser.add_argument("--save", nargs="?", const="", default=None, help="Save annotated image with drawn boxes")
    parser.add_argument("--output", "-o", default=None, help="Output JSON path for detection coordinates")

    args = parser.parse_args()

    image_path = Path(args.image)
    if not image_path.exists():
        print(f"Error: Input image not found at '{image_path}'", file=sys.stderr)
        sys.exit(1)

    t0 = time.perf_counter()
    try:
        detector = SonarDetector(weights_path=args.weights, conf=args.conf, device=args.device)
    except FileNotFoundError as exc:
        print(f"Error: {exc}", file=sys.stderr)
        sys.exit(1)

    if not detector.model_loaded:
        print(f"Error: Failed to load model weights from '{args.weights or 'best.pt'}'.", file=sys.stderr)
        sys.exit(1)

    # Read image dimensions
    raw_img = cv2.imread(str(image_path))
    if raw_img is None:
        print(f"Error: Unable to read image file '{image_path}'", file=sys.stderr)
        sys.exit(1)
    orig_h, orig_w = raw_img.shape[:2]

    # Run detection
    t_inf = time.perf_counter()
    detections = detector.run(str(image_path), conf=args.conf, use_clahe=not args.no_clahe)
    elapsed_ms = (time.perf_counter() - t_inf) * 1000

    # Formatted CLI output
    print("=" * 86)
    print("AQUILA OS — Side-Scan Sonar (SSS) Detection Engine")
    print("=" * 86)
    print(f"Input Image : {image_path} ({orig_w}x{orig_h})")
    print(f"Model       : {detector.weights_path.name} ({detector.model.__class__.__name__})")
    print(f"Device      : {detector.device} | Conf: {args.conf:.2f} | CLAHE: {'Disabled' if args.no_clahe else 'Enabled'}")
    print(f"Latency     : {elapsed_ms:.1f} ms")
    print("-" * 86)

    if len(detections) == 0:
        print(f"No targets detected above confidence threshold {args.conf:.2f}.")
    else:
        print(f"Found {len(detections)} detection(s):")
        print("-" * 86)
        print(f"{'#':<3} {'Class':<15} {'Conf':<8} {'[ x_norm,  y_norm,  w_norm,  h_norm ]':<40} {'[ x1,  y1,  x2,  y2 ]'}")
        print("-" * 86)
        for i, det in enumerate(detections, 1):
            xn, yn, wn, hn = det.bbox
            x1 = int(round(xn * orig_w))
            y1 = int(round(yn * orig_h))
            x2 = int(round((xn + wn) * orig_w))
            y2 = int(round((yn + hn) * orig_h))

            norm_str = f"[{xn:7.4f}, {yn:7.4f}, {wn:7.4f}, {hn:7.4f}]"
            px_str = f"[{x1:4d}, {y1:4d}, {x2:4d}, {y2:4d}]"
            print(f"{i:<3} {det.class_name:<15} {det.confidence * 100:5.1f}%  {norm_str:<40} {px_str}")
    print("=" * 86)

    # Save visualization if requested
    if args.save is not None:
        save_path = args.save
        if not save_path:
            save_path = ROOT_DIR / "runs" / "detect" / f"pred_{image_path.name}"
        saved_file = draw_detections(image_path, detections, save_path)
        print(f"Annotated visualization saved: {saved_file}")

    # Export JSON if requested
    if args.output:
        out_path = Path(args.output)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        payload = [d.to_dict() for d in detections]
        with open(out_path, "w") as f:
            json.dump(payload, f, indent=2)
        print(f"Detection results exported to: {out_path}")


if __name__ == "__main__":
    main()

