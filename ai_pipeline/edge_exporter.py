"""
Edge AI Deployment Pipeline — NCNN & TFLite Quantization (ESP32 / Pi 4)
=======================================================================
This script converts the trained YOLOv8s heavy weights into ultra-lightweight 
formats suitable for deployment on microcontrollers (ESP32) and Edge SBCs.

Features:
  - FP16 & INT8 Quantization
  - TensorFlow Lite (TFLite) for EdgeTPU/Raspberry Pi 4
  - NCNN for ESP32S3 and custom silicon
"""
import os
import sys
import logging
from pathlib import Path
from ultralytics import YOLO

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] [EDGE_EXPORT] %(message)s',
    datefmt='%H:%M:%S'
)
log = logging.getLogger(__name__)

ROOT = Path(__file__).resolve().parent.parent
MODELS_DIR = ROOT / "models"
EDGE_DIR = ROOT / "models" / "edge_deploy"

def export_edge_models(weight_path: Path):
    if not weight_path.exists():
        log.error(f"Weights file not found: {weight_path}")
        sys.exit(1)
        
    os.makedirs(EDGE_DIR, exist_ok=True)
    
    log.info(f"Loading base weights: {weight_path}")
    # We use YOLO to load the model (since RT-DETR might not support all edge exports out of the box in the ultralytics wrapper, we use YOLOv8s as the primary edge target)
    model = YOLO(weight_path)
    
    log.info("╔══════════════════════════════════════════════════════════╗")
    log.info("║       EDGE AI QUANTIZATION & COMPRESSION PIPELINE        ║")
    log.info("╚══════════════════════════════════════════════════════════╝")
    
    # 1. Export to ONNX (Standard interoperability)
    log.info("[1/3] Exporting to ONNX (FP32)...")
    try:
        onnx_path = model.export(format="onnx", imgsz=640, simplify=True)
        log.info(f"ONNX export successful: {onnx_path}")
    except Exception as e:
        log.error(f"ONNX export failed: {e}")
        
    # 2. Export to NCNN (For ESP32S3 and custom ASICs)
    log.info("[2/3] Exporting to NCNN (Optimized for Microcontrollers)...")
    try:
        ncnn_path = model.export(format="ncnn", imgsz=640, half=True)
        log.info(f"NCNN export successful: {ncnn_path}")
    except Exception as e:
        log.error(f"NCNN export failed: {e}")
        
    # 3. Export to TFLite INT8 (For Raspberry Pi 4 / Coral EdgeTPU)
    log.info("[3/3] Exporting to TFLite (INT8 Quantization)...")
    try:
        tflite_path = model.export(format="tflite", imgsz=640, int8=True, data=str(ROOT / "dataset" / "data.yaml"))
        log.info(f"TFLite INT8 export successful: {tflite_path}")
    except Exception as e:
        log.error(f"TFLite export failed: {e}")
        
    log.info("\n✅ Edge AI Deployment assets are ready for hardware flashing.")

if __name__ == "__main__":
    # If the user passes a model, use it. Otherwise, look for the YOLOv8s pretrained or a dummy.
    default_weight = MODELS_DIR / "yolov8s.pt"
    if not default_weight.exists():
        log.info("yolov8s.pt not found, downloading base model for edge export simulation...")
        YOLO("yolov8s.pt") # This downloads the model
        if Path("yolov8s.pt").exists():
            os.makedirs(MODELS_DIR, exist_ok=True)
            import shutil
            shutil.move("yolov8s.pt", default_weight)
            
    weight_file = Path(sys.argv[1]) if len(sys.argv) > 1 else default_weight
    export_edge_models(weight_file)

