import numpy as np
import json
from preprocessor import preprocess_sss
from geotagger import geotag_detections
from reporter import to_json

def run_pipeline():
    # 1. Preprocessor
    # Create dummy image
    img = np.random.randint(0, 255, (100, 100), dtype=np.uint8)
    preprocessed = preprocess_sss(img)
    print("Preprocessed shadow coverage:", preprocessed.shadow_coverage_pct)
    
    # 2. Geotagger
    detections = [
        {
            "class": "mine",
            "confidence_raw": 0.85,
            "confidence_cal": 0.80,
            "shadow_penalty": 0.05,
            "bbox": [10, 10, 30, 30]
        }
    ]
    geotagged = geotag_detections(detections, pings=None, frame_index=0, depth_m=50.0)
    
    # 3. Reporter
    report_json = to_json(geotagged)
    print(report_json)

if __name__ == "__main__":
    run_pipeline()
