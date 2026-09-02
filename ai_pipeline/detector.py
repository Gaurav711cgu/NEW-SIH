import os
import time
from typing import List
from ultralytics import RTDETR

# Import pipeline components
from preprocessor import preprocess_sss
from confidence_calibrator import calibrate
from geotagger import geotag_detections
from reporter import write_report

class AnomalyDetector:
    """
    The main Inference Engine connecting the entire AI pipeline:
    Preprocessor -> RT-DETR Model -> Confidence Calibrator -> Geotagger -> Reporter
    """
    def __init__(self, model_path: str = "models/best.pt"):
        # Initializing the actual fine-tuned RT-DETR model instead of the PRD's YOLOv8s
        # because you successfully completed the Colab training today!
        print(f"Loading RT-DETR model from {model_path}...")
        try:
            self.model = RTDETR(model_path)
            self.model_loaded = True
        except FileNotFoundError:
            print("WARNING: Model file not found. Running in simulation mode.")
            self.model_loaded = False
            
    def process_frame(self, image_path: str, frame_index: int = 0) -> List[dict]:
        """
        Runs a single sonar image through the end-to-end pipeline.
        """
        # 1. Preprocessing (CLAHE, speckle reduction, shadow masking)
        preprocessed = preprocess_sss(image_path)
        
        # 2. Inference
        raw_detections = []
        if self.model_loaded:
            results = self.model(preprocessed.processed, conf=0.25)
            for box in results[0].boxes:
                raw_detections.append({
                    "class": self.model.names[int(box.cls)],
                    "confidence": float(box.conf),
                    "bbox": box.xyxy[0].tolist(), # [x1, y1, x2, y2]
                })
        else:
            # Simulation fallback if the model isn't uploaded yet
            raw_detections = [{
                "class": "shipwreck",
                "confidence": 0.896,
                "bbox": [100, 100, 200, 200]
            }]
            
        # 3. Confidence Calibration (Acoustic Shadow Penalty)
        calibrated_detections = calibrate(raw_detections, preprocessed.shadow_mask)
        
        # 4. Geotagging
        geotagged = geotag_detections(calibrated_detections, pings=None, frame_index=frame_index)
        
        return geotagged

if __name__ == "__main__":
    print("Testing AI Pipeline Inference Engine...")
    # This assumes there's a test image available. 
    # Just a sanity check structural layout.
    detector = AnomalyDetector()
    print("Pipeline architecture successfully assembled!")
