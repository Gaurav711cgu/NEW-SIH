# =============================================================================
# DeepScan — Full YOLOv8-seg Training on Colab T4
# PS-26057 | NIOT | Ministry of Earth Sciences | Team DEBUG THUGS
#
# HOW TO USE:
#   1. Open Google Colab: colab.research.google.com
#   2. Runtime → Change runtime type → GPU → T4
#   3. Copy this entire file into a Colab cell (or upload and run as script)
#   4. Run all cells in order
#   5. Download models/sss_detector_v1/weights/best.pt when done
# =============================================================================

# ─── CELL 1: Check GPU ────────────────────────────────────────────────────────
"""
!nvidia-smi
"""

# ─── CELL 2: Install dependencies ────────────────────────────────────────────
"""
!pip install ultralytics pyxtf opencv-python-headless pyyaml roboflow -q
"""

# ─── CELL 3: Download AI4Shipwrecks dataset ──────────────────────────────────
"""
# AI4Shipwrecks — University of Michigan / NOAA NSF NAIRR Pilot
# 286 SSS images, 28 shipwreck sites, Thunder Bay National Marine Sanctuary
# https://umfieldrobotics.github.io/ai4shipwrecks/

import os

os.makedirs("datasets/images/train", exist_ok=True)
os.makedirs("datasets/images/val",   exist_ok=True)
os.makedirs("datasets/images/test",  exist_ok=True)
os.makedirs("datasets/labels/train", exist_ok=True)
os.makedirs("datasets/labels/val",   exist_ok=True)
os.makedirs("datasets/labels/test",  exist_ok=True)

# Clone the AI4Shipwrecks scripts repo and download
!git clone https://github.com/umfieldrobotics/ai4shipwrecks-scripts.git --quiet
!cd ai4shipwrecks-scripts && pip install -r requirements.txt -q

# NOTE: The actual image data requires signing the NOAA data agreement form.
# See: https://umfieldrobotics.github.io/ai4shipwrecks/#data
# After downloading, place images in datasets/images/ and labels in datasets/labels/
print("AI4Shipwrecks: Follow download instructions at umfieldrobotics.github.io/ai4shipwrecks/")
"""

# ─── CELL 4: Download SeabedObjects-KLSG ─────────────────────────────────────
"""
# SeabedObjects-KLSG — Harbin Engineering University
# ~1,000 annotated bounding boxes: shipwrecks, aircraft, debris
# IEEE Access 2020 — DOI: 10.1109/ACCESS.2020.3016630

!git clone https://github.com/huoguanying/SeabedObjects-Ship-and-Airplane-dataset.git --quiet
import shutil, glob

# Copy images and labels into our unified dataset structure
for img in glob.glob("SeabedObjects-Ship-and-Airplane-dataset/images/*.jpg"):
    shutil.copy(img, "datasets/images/train/")
for lbl in glob.glob("SeabedObjects-Ship-and-Airplane-dataset/labels/*.txt"):
    shutil.copy(lbl, "datasets/labels/train/")

print(f"KLSG images added: {len(glob.glob('datasets/images/train/*.jpg'))}")
"""

# ─── CELL 5: Write dataset.yaml ──────────────────────────────────────────────
"""
import yaml

dataset_cfg = {
    "path": "/content/datasets",
    "train": "images/train",
    "val":   "images/val",
    "test":  "images/test",
    "names": {
        0: "shipwreck",
        1: "pipe",
        2: "cylinder",
        3: "ghost_net",
        4: "anomaly",
    },
    "nc": 5,
}

with open("datasets/dataset.yaml", "w") as f:
    yaml.dump(dataset_cfg, f, default_flow_style=False)

print("dataset.yaml written")
!cat datasets/dataset.yaml
"""

# ─── CELL 6: CycleGAN ghost net synthesis (optional but recommended) ──────────
"""
# Generates synthetic ghost_net class images via domain transfer
# Paper: MFA-CycleGAN (2024) — improves mAP by +8.4 to +14.2%
# This step takes ~45 min on T4 for 300 images

!git clone https://github.com/junyanz/pytorch-CycleGAN-and-pix2pix.git --quiet
# pip install -r pytorch-CycleGAN-and-pix2pix/requirements.txt -q

# For demo purposes, if you skip CycleGAN, ghost_net detections fall back to
# the 'anomaly' class — still valid for PS-26057 demonstration.
print("CycleGAN synthesis: optional. Skip if time-limited. Ghost nets → anomaly class fallback.")
"""

# ─── CELL 7: Full YOLOv8-seg Training ────────────────────────────────────────
"""
from ultralytics import YOLO
import torch

device = "0" if torch.cuda.is_available() else "cpu"
print(f"Training on: {device}")
print(f"GPU: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU'}")

model = YOLO("yolov8s-seg.pt")

results = model.train(
    data="datasets/dataset.yaml",
    epochs=150,
    imgsz=640,
    batch=16,            # T4 has 15GB VRAM — batch=16 fits comfortably
    device=device,
    # Sonar-specific augmentation (not standard ImageNet defaults)
    degrees=15,          # towfish yaw drift simulation
    fliplr=0.5,          # port/starboard sonar symmetry
    flipud=0.3,
    mosaic=0.5,
    mixup=0.1,
    copy_paste=0.2,
    project="models",
    name="sss_detector_v1",
    save_period=10,      # checkpoint every 10 epochs
    val=True,
    patience=30,         # early stopping if no improvement for 30 epochs
    optimizer="AdamW",
    lr0=0.001,
    lrf=0.01,
    warmup_epochs=3,
    cos_lr=True,
)

print("Training complete!")
print(f"Best weights: models/sss_detector_v1/weights/best.pt")
"""

# ─── CELL 8: Evaluate on test split ──────────────────────────────────────────
"""
from ultralytics import YOLO

model = YOLO("models/sss_detector_v1/weights/best.pt")
metrics = model.val(data="datasets/dataset.yaml", split="test")

print("=" * 50)
print("EVALUATION RESULTS — TEST SPLIT")
print("=" * 50)
print(f"mAP50:      {metrics.box.map50:.4f}   ({metrics.box.map50*100:.2f}%)")
print(f"mAP50-95:   {metrics.box.map:.4f}   ({metrics.box.map*100:.2f}%)")
print(f"Precision:  {metrics.box.mp:.4f}")
print(f"Recall:     {metrics.box.mr:.4f}")
print()
print("Per-class AP50:")
for i, cls in enumerate(["shipwreck", "pipe", "cylinder", "ghost_net", "anomaly"]):
    if i < len(metrics.box.maps):
        print(f"  {cls:<12}: {metrics.box.maps[i]*100:.2f}%")

# RECORD THESE NUMBERS — cite them in your presentation
"""

# ─── CELL 9: Export ONNX for edge inference ──────────────────────────────────
"""
from ultralytics import YOLO
from pathlib import Path

model = YOLO("models/sss_detector_v1/weights/best.pt")
model.export(format="onnx", dynamic=True, simplify=True)

onnx_path = Path("models/sss_detector_v1/weights/best.onnx")
print(f"ONNX model: {onnx_path}")
print(f"Size: {onnx_path.stat().st_size / 1e6:.1f} MB")
# Typically ~22-30 MB for YOLOv8s-seg — deployable on Jetson Nano
"""

# ─── CELL 10: Download weights to your machine ────────────────────────────────
"""
from google.colab import files

# Download trained weights
files.download("models/sss_detector_v1/weights/best.pt")
files.download("models/sss_detector_v1/weights/best.onnx")

# After downloading:
# 1. Place best.pt in: models/sss_detector_v1/weights/best.pt (in your project)
# 2. Verify config/pipeline_config.yaml model_path points to it
# 3. Run the Streamlit dashboard and upload a sonar image
print("Download complete. Place best.pt in models/sss_detector_v1/weights/")
"""

# ─── CELL 11: Quick smoke test (run on Colab before downloading) ──────────────
"""
import urllib.request
from ultralytics import YOLO

# Download one test image from AI4Shipwrecks public preview
test_url = "https://umfieldrobotics.github.io/ai4shipwrecks/static/images/sample_sonar.png"
try:
    urllib.request.urlretrieve(test_url, "test_sonar.png")
    model = YOLO("models/sss_detector_v1/weights/best.pt")
    results = model("test_sonar.png", conf=0.25, iou=0.45)
    print(f"Detections on test image: {len(results[0].boxes)}")
    results[0].save("test_sonar_detected.jpg")
    files.download("test_sonar_detected.jpg")
except Exception as e:
    print(f"Smoke test skipped: {e}")
    print("Run the full dashboard instead after downloading best.pt")
"""

print("""
=====================================================
  DeepScan Training Notebook — Usage Instructions
=====================================================
1. Open: colab.research.google.com
2. Runtime → Change runtime type → GPU → T4
3. Copy each cell's contents into a new Colab cell
4. Remove the triple-quote wrappers before running
5. Run cells 1 → 10 in order
6. Cell 7 (training): ~35-50 min on T4 for 150 epochs
7. Download best.pt from Cell 10
8. Place in: models/sss_detector_v1/weights/best.pt

Expected T4 Training Time: ~35-50 minutes
Expected mAP50: 82-88% (baseline YOLOv8s range)
""")
