"""
ai_pipeline/detector.py
-----------------------
YOLOv8 inference engine for Side-Scan Sonar imagery with SAHI capabilities.
Implements Slicing Aided Hyper Inference (Sliding Window) for massive government-grade waterfall imagery.
"""
import sys
import types
import importlib.metadata
import yaml
import logging
import numpy as np
import cv2
from pathlib import Path
from dataclasses import dataclass, field
from typing import List, Optional, Tuple, Dict, Any

# Ensure torchvision and its metadata lookup succeed on Python 3.14
try:
    import torchvision
    if not hasattr(torchvision, "ops"):
        raise ImportError("torchvision.ops missing")
except (ImportError, ModuleNotFoundError, Exception):
    tv = types.ModuleType("torchvision")
    tv.__version__ = "0.18.0"
    tv_ops = types.ModuleType("torchvision.ops")

    def _nms_fallback(boxes, scores, iou_threshold):
        import torch
        if len(boxes) == 0:
            return torch.empty(0, dtype=torch.int64)
        x1, y1, x2, y2 = boxes[:, 0], boxes[:, 1], boxes[:, 2], boxes[:, 3]
        areas = (x2 - x1) * (y2 - y1)
        order = scores.argsort(descending=True)
        keep = []
        while order.numel() > 0:
            if order.numel() == 1:
                keep.append(order.item())
                break
            i = order[0].item()
            keep.append(i)
            xx1 = torch.maximum(x1[i], x1[order[1:]])
            yy1 = torch.maximum(y1[i], y1[order[1:]])
            xx2 = torch.minimum(x2[i], x2[order[1:]])
            yy2 = torch.minimum(y2[i], y2[order[1:]])
            w = torch.clamp(xx2 - xx1, min=0.0)
            h = torch.clamp(yy2 - yy1, min=0.0)
            inter = w * h
            ovr = inter / (areas[i] + areas[order[1:]] - inter)
            inds = (ovr <= iou_threshold).nonzero().squeeze()
            if inds.numel() == 0:
                break
            order = order[inds + 1] if inds.ndim > 0 else order[inds.item() + 1: inds.item() + 2]
        return torch.tensor(keep, dtype=torch.int64)

    tv_ops.nms = _nms_fallback
    tv.ops = tv_ops
    sys.modules["torchvision"] = tv
    sys.modules["torchvision.ops"] = tv_ops

_orig_version = importlib.metadata.version
def _safe_metadata_version(distribution_name: str) -> str:
    try:
        return _orig_version(distribution_name)
    except importlib.metadata.PackageNotFoundError:
        if distribution_name == "torchvision":
            return "0.18.0"
        raise
importlib.metadata.version = _safe_metadata_version

log = logging.getLogger(__name__)

CONFIG_PATH = Path(__file__).resolve().parent.parent / "config" / "pipeline_config.yaml"

def _load_config() -> dict:
    if not CONFIG_PATH.exists():
        return {}
    with open(CONFIG_PATH, "r") as f:
        return yaml.safe_load(f) or {}

@dataclass
class Detection:
    class_id:       int
    class_name:     str
    confidence:     float
    bbox:           List[float]  # [x, y, w, h] absolute pixels or normalized
    confidence_raw: Optional[float] = None
    confidence_cal: Optional[float] = None
    shadow_penalty: bool = False
    lat:            Optional[float] = None
    lon:            Optional[float] = None
    depth_m:        Optional[float] = None
    heading_deg:    Optional[float] = None
    ping_number:    Optional[int] = None
    timestamp:      Optional[str] = None
    mask:           Optional[np.ndarray] = field(default=None, repr=False)

    def __post_init__(self):
        if self.confidence_raw is None:
            self.confidence_raw = round(float(self.confidence), 4)
        if self.confidence_cal is None:
            self.confidence_cal = round(float(self.confidence), 4)

    def to_dict(self) -> dict:
        return {
            "object_class":   self.class_name,
            "class":          self.class_name,
            "class_id":       self.class_id,
            "confidence":     round(float(self.confidence), 4),
            "confidence_raw": round(float(self.confidence_raw if self.confidence_raw is not None else self.confidence), 4),
            "confidence_cal": round(float(self.confidence_cal if self.confidence_cal is not None else self.confidence), 4),
            "shadow_penalty": bool(self.shadow_penalty),
            "bbox":           [round(float(v), 2) for v in self.bbox],
            "lat":            self.lat,
            "lon":            self.lon,
            "depth_m":        self.depth_m,
            "heading_deg":    self.heading_deg,
            "ping_number":    self.ping_number,
            "timestamp":      self.timestamp,
            "has_mask":       self.mask is not None,
        }

class SonarDetector:
    def __init__(self):
        cfg = _load_config()
        det_cfg = cfg.get("detector", {})

        # Default weights path
        default_model = Path(__file__).parent.parent / "models" / "sss_detector_v1" / "weights" / "best.pt"
        model_path = Path(det_cfg.get("model_path", str(default_model)))
        
        self.model = None
        if model_path.exists():
            try:
                from ultralytics import RTDETR, YOLO
                try:
                    self.model = RTDETR(str(model_path))
                    log.info(f"Loaded RT-DETR Transformer model from {model_path}")
                except Exception:
                    self.model = YOLO(str(model_path))
                    log.info(f"Loaded YOLO model from {model_path}")
            except Exception as exc:
                log.error(f"Model load exception: {exc}")
        else:
            log.error(f"Model not found at {model_path}")

        self.conf_threshold = float(det_cfg.get("conf_threshold", 0.25))
        self.iou_threshold  = float(det_cfg.get("iou_threshold", 0.45))
        self.imgsz          = int(det_cfg.get("imgsz", 640))
        self.class_names    = det_cfg.get("class_names", {0: 'shipwreck', 1: 'pipe', 2: 'cylinder', 3: 'ghost_net', 4: 'anomaly'})

    def _nms(self, detections: List[Detection], iou_threshold: float = 0.5) -> List[Detection]:
        """Non-Maximum Suppression to merge overlapping boxes from sliced windows."""
        if not detections:
            return []
        
        scores = [d.confidence for d in detections]
        cv2_boxes = [d.bbox for d in detections]
        indices = cv2.dnn.NMSBoxes(cv2_boxes, scores, self.conf_threshold, iou_threshold)
        
        if len(indices) > 0:
            return [detections[i] for i in np.array(indices).flatten()]
        return []

    def run(self, image: np.ndarray) -> List[Detection]:
        if self.model is None or image is None or image.size == 0:
            return []

        h, w = image.shape[:2]
        slice_size = self.imgsz
        all_detections = []
        
        # If image is relatively small, run standard inference
        if max(h, w) <= slice_size * 1.5:
            return self._infer_slice(image, 0, 0)

        log.info(f"Massive image detected ({w}x{h}). Initiating Slicing Aided Hyper Inference (SAHI).")
        
        overlap = 0.2
        step = int(slice_size * (1 - overlap))
        
        for y in range(0, h, step):
            for x in range(0, w, step):
                y1, y2 = y, min(y + slice_size, h)
                x1, x2 = x, min(x + slice_size, w)
                
                window = image[y1:y2, x1:x2]
                slice_dets = self._infer_slice(window, offset_x=x1, offset_y=y1)
                all_detections.extend(slice_dets)
                
        final_detections = self._nms(all_detections)
        log.info(f"SAHI Complete. Merged {len(all_detections)} slice detections into {len(final_detections)} unique objects.")
        return final_detections

    def _infer_slice(self, image_slice: np.ndarray, offset_x: int, offset_y: int) -> List[Detection]:
        if image_slice.ndim == 2:
            rgb = np.stack([image_slice, image_slice, image_slice], axis=-1)
        elif image_slice.shape[2] == 1:
            rgb = np.concatenate([image_slice, image_slice, image_slice], axis=2)
        else:
            rgb = image_slice

        results = self.model.predict(
            source=rgb,
            conf=self.conf_threshold,
            iou=self.iou_threshold,
            verbose=False,
        )

        detections = []
        for result in results:
            if result.boxes is None:
                continue
            
            for box in result.boxes:
                cls_id = int(box.cls[0].item())
                conf = float(box.conf[0].item())
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                
                abs_x = float(x1) + offset_x
                abs_y = float(y1) + offset_y
                w_box = float(x2 - x1)
                h_box = float(y2 - y1)
                
                CLASS_MAPPINGS = {
                    "ship": "shipwreck",
                    "aircraft": "fuselage_debris",
                    "human": "diver_anomaly",
                }
                if hasattr(self.model, "names") and isinstance(self.model.names, dict) and cls_id in self.model.names:
                    model_cls = self.model.names[cls_id]
                    cls_name = CLASS_MAPPINGS.get(model_cls, model_cls)
                elif isinstance(self.class_names, list) and cls_id < len(self.class_names):
                    cls_name = self.class_names[cls_id]
                elif isinstance(self.class_names, dict):
                    cls_name = self.class_names.get(cls_id, str(cls_id))
                else:
                    cls_name = f"object_{cls_id}"

                detections.append(Detection(
                    class_id=cls_id,
                    class_name=cls_name,
                    confidence=conf,
                    confidence_raw=conf,
                    confidence_cal=conf,
                    bbox=[abs_x, abs_y, w_box, h_box]
                ))
                
        return detections

def detect(image_path_or_array, telemetry=None) -> dict:
    try:
        if isinstance(image_path_or_array, str):
            img = cv2.imread(image_path_or_array)
        else:
            img = image_path_or_array
            
        detector = SonarDetector()
        if detector.model is None:
            return {"detections": [], "model_ready": False, "message": "Model not found"}
            
        detections_obj = detector.run(img)
        detections = []
        for d in detections_obj:
            det_dict = d.to_dict()
            if telemetry:
                det_dict["lat"] = telemetry.get("lat", 0.0)
                det_dict["lon"] = telemetry.get("lon", 0.0)
            detections.append(det_dict)
            
        return {"detections": detections, "model_ready": True, "message": "Success"}
    except Exception as e:
        return {"detections": [], "model_ready": False, "message": str(e)}
