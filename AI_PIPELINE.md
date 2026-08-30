# AI Detection Pipeline — PS-26057

## Overview

The AI pipeline ingests side-scan sonar imagery, applies acoustic preprocessing, runs object detection and segmentation, calibrates confidence scores using acoustic shadow analysis, and produces geotagged JSON and CSV anomaly reports. The pipeline is the primary software deliverable for PS-26057.

---

## Pipeline Stages

```
SSS Image (PNG or XTF frame)
        |
        v
[1] PREPROCESSOR
    CLAHE contrast enhancement
    Median speckle filter
    Acoustic shadow zone detection
    Motion artifact correction (from ping header)
        |
        v
[2] INFERENCE ENGINE
    YOLOv8-seg
    Single model: detection boxes + segmentation masks
    Classes: shipwreck, pipe, cylinder, ghost_net, anomaly
        |
        v
[3] CONFIDENCE CALIBRATOR
    Shadow zone intersection check
    Penalty factor applied if centroid in shadow
    Temperature scaling for calibration
        |
        v
[4] GEOTAGGING ENGINE
    XTF ping header parser (pyxtf)
    Per-detection: lat, lon, depth, heading, timestamp
        |
        v
[5] REPORTER
    JSON report (primary)
    CSV report (secondary)
    SQLite persistence
```

---

## Preprocessing

```python
# ai_pipeline/preprocessor.py

import cv2
import numpy as np
from dataclasses import dataclass


@dataclass
class PreprocessedImage:
    original: np.ndarray
    processed: np.ndarray
    shadow_mask: np.ndarray
    shadow_coverage_pct: float


def preprocess_sss(image_path: str) -> PreprocessedImage:
    """
    Applies the standard SSS preprocessing chain.

    Justification for each step:

    Median filter: Side-scan sonar images contain multiplicative speckle
    noise from coherent acoustic interference. Median filtering is preferred
    over Gaussian for speckle because it preserves edges (debris boundaries)
    while suppressing noise, consistent with published SSS processing
    literature (Cervenka and de Moustier, 1993).

    CLAHE: Sonar imagery has strong contrast variation along the range
    direction (near-field strong return, far-field weak return). CLAHE
    normalises local contrast without clipping global brightness, making
    targets at different ranges equally visible to the detector.

    Shadow masking: Acoustic shadows are the primary source of false
    positives in SSS target detection. Objects occlude insonification
    and produce a dark band in the direction away from the sonar.
    Natural rock formations produce similar shadows. Identifying shadow
    zones allows downstream confidence calibration.
    """
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        raise FileNotFoundError(f"Cannot read image: {image_path}")

    # Stage 1: Speckle reduction
    denoised = cv2.medianBlur(img, 5)

    # Stage 2: CLAHE
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(denoised)

    # Stage 3: Acoustic shadow detection
    # Shadow zones appear as sustained low-intensity regions
    # adjacent to high-intensity returns (object highlights)
    _, dark_mask = cv2.threshold(enhanced, 40, 255, cv2.THRESH_BINARY_INV)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (20, 8))
    shadow_zones = cv2.morphologyEx(dark_mask, cv2.MORPH_CLOSE, kernel)

    coverage = float(np.sum(shadow_zones > 0)) / shadow_zones.size

    return PreprocessedImage(
        original=img,
        processed=enhanced,
        shadow_mask=shadow_zones,
        shadow_coverage_pct=round(coverage * 100, 1)
    )
```

---

## Training

### Datasets

| Dataset | Images | Labels | Format | Source |
|---|---|---|---|---|
| AI4Shipwrecks | 286 | Pixel-wise binary segmentation | PNG mask | Univ. of Michigan Deep Blue Data |
| SeabedObjects-KLSG | 1190 | Bounding box + class | XML | Published, ResearchGate |
| Ghost net synthetic | ~300 (generated) | Bounding box | YOLO txt | CycleGAN, optical source |

### Label Conversion

```python
# datasets/convert_labels.py

import cv2
import numpy as np
from pathlib import Path

CLASS_MAP = {
    "shipwreck": 0,
    "pipe":      1,
    "cylinder":  2,
    "ghost_net": 3,
    "anomaly":   4,
}


def mask_to_yolo_bbox(mask_path: str, class_id: int, img_w: int, img_h: int) -> list:
    mask = cv2.imread(mask_path, cv2.IMREAD_GRAYSCALE)
    contours, _ = cv2.findContours(
        mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )
    bboxes = []
    for cnt in contours:
        if cv2.contourArea(cnt) < 100:
            continue
        x, y, w, h = cv2.boundingRect(cnt)
        cx = (x + w / 2) / img_w
        cy = (y + h / 2) / img_h
        nw = w / img_w
        nh = h / img_h
        bboxes.append(f"{class_id} {cx:.6f} {cy:.6f} {nw:.6f} {nh:.6f}")
    return bboxes
```

### Training Script

```python
# ai_pipeline/train.py

from ultralytics import YOLO

model = YOLO("yolov8s-seg.pt")

results = model.train(
    data="datasets/dataset.yaml",
    epochs=150,
    imgsz=640,
    batch=16,
    device=0,
    augment=True,
    degrees=15,       # sonar images can be from any orientation
    fliplr=0.5,
    flipud=0.3,
    mosaic=0.5,
    mixup=0.1,
    copy_paste=0.2,
    project="models",
    name="sss_detector_v1",
    save_period=10,
    val=True,
)

# Export for edge inference on Raspberry Pi
model_best = YOLO("models/sss_detector_v1/weights/best.pt")
model_best.export(format="onnx", dynamic=True, simplify=True)
```

### dataset.yaml

```yaml
path: datasets
train: images/train
val:   images/val
test:  images/test

nc: 5
names:
  - shipwreck
  - pipe
  - cylinder
  - ghost_net
  - anomaly
```

---

## Ghost Net Synthetic Data Generation

No public SSS dataset contains labeled ghost net (abandoned fishing net) images. Ghost nets are the primary debris class named in PS-26057. Synthetic training data is generated using a CycleGAN domain transfer from optical fishing net images to SSS-style images.

```bash
git clone https://github.com/junyanz/pytorch-CycleGAN-and-pix2pix
cd pytorch-CycleGAN-and-pix2pix
pip install -r requirements.txt

# Directory structure:
# datasets/net2sonar/trainA/  <- optical fishing net images (~200)
# datasets/net2sonar/trainB/  <- SSS background images from SeabedObjects

python train.py \
  --dataroot datasets/net2sonar \
  --name net2sonar_v1 \
  --model cycle_gan \
  --batch_size 4 \
  --n_epochs 150 \
  --gpu_ids 0 \
  --no_dropout
```

Checkpoint at epoch 50 and epoch 100. If generated images show sonar-like texture on net shapes, proceed. If mode collapse is observed (all outputs identical), reduce batch size to 2 and increase learning rate decay.

If CycleGAN training fails within the project timeline, the ghost_net class is removed from the model and replaced with the anomaly class. Judges are informed: "Ghost net SSS labelling is an open problem in the field. We built a synthetic data generation pipeline; the current prototype routes unclassified linear anomalies to the anomaly class for human review, which is the operationally correct behaviour."

---

## Confidence Calibration

```python
# ai_pipeline/confidence_calibrator.py

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
```

---

## Geotagging Engine

```python
# ai_pipeline/geotagger.py

import pyxtf
import time
from typing import List, Optional


def parse_xtf(xtf_path: str) -> list:
    """
    Reads an XTF file and returns a list of ping headers.
    Each ping header contains position, orientation, and timing data.
    """
    (fh, packets) = pyxtf.xtf_read(xtf_path)
    pings = packets.get(pyxtf.XTFHeaderType.sonar, [])
    return pings


def geotag_detections(
    detections: List[dict],
    pings: list,
    frame_index: int,
    depth_m: float = 0.0
) -> List[dict]:
    """
    Maps each detection to its originating sonar ping, extracts
    position from the ping header, and returns enriched records.

    For demo without a real XTF file: pass pings=None and a synthetic
    position is generated from the mission GPS position. The pipeline
    structure is identical.
    """
    tagged = []

    for det in detections:
        if pings and frame_index < len(pings):
            ping = pings[frame_index]
            lat = ping.SensorYcoordinate
            lon = ping.SensorXcoordinate
            heading = ping.SensorHeading
            ping_number = ping.PingNumber
            ts = (f"{ping.Year}-{ping.Month:02d}-{ping.Day:02d}"
                  f"T{ping.Hour:02d}:{ping.Minute:02d}:{ping.Second:02d}Z")
        else:
            # Synthetic position for dataset replay demo
            lat = -54.2 + frame_index * 0.0001
            lon = 60.8  + frame_index * 0.0001
            heading = 90.0
            ping_number = frame_index
            ts = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

        tagged.append({
            "object_class":   det["class"],
            "confidence_raw": det["confidence_raw"],
            "confidence_cal": det["confidence_cal"],
            "shadow_penalty": det["shadow_penalty"],
            "lat":            round(lat, 6),
            "lon":            round(lon, 6),
            "depth_m":        depth_m,
            "heading_deg":    round(heading, 1),
            "bbox":           det["bbox"],
            "ping_number":    ping_number,
            "timestamp":      ts,
        })

    return tagged
```

---

## Reporter

```python
# ai_pipeline/reporter.py

import json
import csv
import io
from typing import List


def to_json(detections: List[dict]) -> str:
    return json.dumps(detections, indent=2)


def to_csv(detections: List[dict]) -> str:
    if not detections:
        return ""
    fields = ["object_class", "confidence_cal", "shadow_penalty",
              "lat", "lon", "depth_m", "timestamp", "ping_number"]
    buf = io.StringIO()
    writer = csv.DictWriter(buf, fieldnames=fields, extrasaction="ignore")
    writer.writeheader()
    writer.writerows(detections)
    return buf.getvalue()


def write_report(detections: List[dict], output_prefix: str = "report"):
    with open(f"{output_prefix}.json", "w") as f:
        f.write(to_json(detections))
    with open(f"{output_prefix}.csv", "w") as f:
        f.write(to_csv(detections))
```

---

## Evaluation Protocol

Before the demo, run evaluation on the held-out test split (20% of AI4Shipwrecks). Record and retain the following metrics:

```bash
python -c "
from ultralytics import YOLO
model = YOLO('models/sss_detector_v1/weights/best.pt')
results = model.val(data='datasets/dataset.yaml', split='test')
print(results.box.maps)   # per-class AP50
print(results.box.map50)  # overall mAP50
"
```

The output of this command is the factual answer to the judge question "what is your model's accuracy?" Do not present these numbers before running the evaluation. Present only numbers that come from actual evaluation on the withheld test split.
