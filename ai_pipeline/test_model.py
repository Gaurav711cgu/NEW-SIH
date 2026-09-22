import numpy as np
import torch
import cv2
from cbam import CBAM, ECABlock
from detector import SonarDetector

def test_cbam():
    x = torch.randn(2, 256, 40, 40)
    cbam = CBAM(256)
    eca = ECABlock(256)
    print("CBAM shape:", cbam(x).shape)
    print("ECA shape:", eca(x).shape)

def test_detector():
    # Create a dummy image
    img = np.random.randint(0, 255, (640, 640, 3), dtype=np.uint8)
    
    # We will initialize detector with yolov8n.pt
    detector = SonarDetector(weights_path="yolov8n.pt", device="cpu")
    
    # Test with SAHI enabled at confidence 0.0 to guarantee output
    detections = detector.run(img, conf=0.0, use_clahe=False, use_sahi=True)
    print("Detections found:", len(detections))
    for d in detections[:5]: # Print first 5 for brevity
        print(d.to_dict())
    if len(detections) > 5:
        print(f"... and {len(detections)-5} more.")

if __name__ == "__main__":
    test_cbam()
    test_detector()
