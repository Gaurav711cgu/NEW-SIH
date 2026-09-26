

# AQUILA OS

**Autonomous Ocean Observation and Seafloor Intelligence Platform**

Smart India Hackathon 2026 — Problem Statement 26065  
Ministry of Earth Sciences · National Centre for Polar and Ocean Research

---

[Overview](#overview) · [Architecture](#system-architecture) · [API Reference](#api-reference) · [AI Pipeline](#ai-and-sonar-intelligence-pipeline) · [Survey Modes](#auv-survey-modes) · [Setup](#quick-start) · [Data Sources](#oceanographic-data-sources)

</div>

---

## Overview

AQUILA OS is an indigenous, low-cost autonomous underwater platform designed for long-term deployment in the Southern Ocean and polar environments. The platform is designated **AUV-MATSYA 6000** in all mission telemetry and UI references, aligning with India's deep ocean research programme.

It continuously collects physical and biogeochemical oceanographic data using a combination of real low-cost hardware sensors and a **Virtual Ocean Sensor Engine** backed by real BGC-Argo float profiles interpolated at -54.2°S, 60.8°E (WMO float reference 5904859). All salinity computations comply with the UNESCO EOS-80 standard; future hardware integration targets TEOS-10.

An onboard **Seafloor Intelligence** module — a two-stage YOLOv9c + RT-DETR-L cascade — detects, classifies, and geotags underwater targets from side-scan sonar (SSS) waterfall imagery at the edge. Communication with the surface is handled via a dual-path link: **USBL acoustic modem (8.5 kHz)** for submerged telemetry and **SATCOM burst uplink** when surfaced. All data feeds into a React 19 mission dashboard with eight operational screens.

At ₹75,000 per unit, AQUILA OS costs approximately 1/40th of a commercial Argo float (₹30 Lakh), enabling swarm deployment of 40 autonomous platforms across the Indian Ocean sector simultaneously.

| Attribute | Value |
|---|---|
| Problem Statement | PS 26065 — Autonomous Low-Cost Ocean Observation Platform |
| Organisation | Ministry of Earth Sciences (MoES) / NCPOR |
| Category | Hardware |
| Theme | Robotics and Drones |
| Team | FusionX |
| Platform Designation | AUV-MATSYA 6000 |
| Platform Callsign | AQUILA-001 |
| Target Deployment Zone | Southern Ocean corridor (-54.2°S, 60.8°E) |
| Unit Cost | ₹75,000 (vs ₹30 Lakh commercial Argo float) |
| Oceanographic Standard | UNESCO EOS-80 / TEOS-10 |
| BGC-Argo Reference Float | WMO 5904859 |

---

## Features

### Physical and Biogeochemical Ocean Sensing

- Real hardware sensors: Temperature (DS18B20), Pressure/Depth (MS5837), pH (Atlas Scientific), Conductivity/TDS, MPU6050 IMU
- Virtual Ocean Sensor Engine streams real BGC-Argo float profiles (WMO 5904859) with physically calibrated noise, biofouling drift, sensor dropout, and recovery simulation
- Six measured parameters: IN-SITU TEMPERATURE, PRACTICAL SALINITY (CTD), HYDROSTATIC PRESSURE, DISSOLVED OXYGEN (DOXY), CHLOROPHYLL-A BIOMASS, ACOUSTIC CURRENT VELOCITY
- Per-reading source labels distinguish data origin:
  - `LIVE_SENSOR` — IN-SITU PHYSICAL SENSOR (direct hardware reading)
  - `DL_REPLICATED` — PHYSICS-DERIVED (EOS-80) (BGC-Argo profile replay with noise model)
  - `ARGO_DATASET` — direct dataset interpolation
- Live T-S diagram and water column transect chart (temperature vs. salinity depth profiles)

### Seafloor Intelligence — Side-Scan Sonar AI

- Two-stage cascade: YOLOv9c (Stage 1, high-recall waterfall sweep) + RT-DETR-L (Stage 2, precision refinement)
- CLAHE acoustic preprocessing: CLAHE (3.0 clip, 8x8 tile) + median speckle filter (5x5 kernel) + acoustic shadow mask
- Acoustic shadow calibration: 50% confidence penalty for shadow-zone centroids, flagged for AUV revisit below 0.35 threshold
- Geotagging: XTF ping metadata to WGS-84 lat/lon via pyxtf, with demo fallback at -54.2°S, 60.8°E
- Detection results rendered on an interactive sonar waterfall canvas with neural bounding boxes, confidence scores, and shadow zone warnings
- Validated against SCTD Marine Debris Benchmark / CCAMLR Conservation Protocol and KLSG SeabedObjects Benchmark / ONGC Pipeline Scour Standards

### Detection Classes (10)

| Internal Class | Display Label | Use Case |
|---|---|---|
| `shipwreck` | Shipwreck / Hull | Maritime archaeology, navigation hazard |
| `ghost_net` | Derelict Ghost Net | Ecology / Fisheries Protection (MoES/CMFRI) |
| `uxo_mine` | Subsea UXO / Mine | Harbor Security and Naval Defense (Indian Navy / Coast Guard) |
| `pipeline_cable` | Subsea Cable / Pipeline | Critical National Infrastructure (DoT / ONGC / GAIL) |
| `lost_container` | Sunken Cargo Container | Navigation Fairway Hazard Clearance (DG Shipping / Port Authority) |
| `toxic_drum` | Hazardous Chemical Drum | Environmental remediation |
| `pmn_nodule` | Polymetallic Nodule Field | Deep ocean mineral survey |
| `gas_seep` | Methane Hydrate Seep | Geohazard monitoring |
| `subsea_sensor` | Foreign Sonar Transponder | Maritime domain awareness |
| `anomaly` | Unclassified Anomaly | Uncertainty triage for human operator escalation |

### Demo Presets (Seafloor Intelligence screen)

Five one-click presets generate synthetic sonar waterfall imagery with pre-loaded detections for live demonstration:

| Preset | Simulated Target | Stakeholder Context |
|---|---|---|
| `GHOST_NET` | Derelict fishing mesh, backscatter +6 dB over ambient | MoES/CMFRI Fisheries Protection |
| `UXO_MINE` | Cylindrical mine, 0.1–1.2m diameter, shadow profile | Indian Navy / Coast Guard |
| `LOST_CONTAINER` | 40ft ISO container, orthogonal 90° corners, 2.5:1 aspect ratio | DG Shipping / Port Authority |
| `PIPELINE_CABLE` | Linear displacement across swath, multi-ping trajectory continuity | DoT / ONGC / GAIL |
| `AMBIGUOUS` | Low-confidence anomaly, routed to human review queue | Operator escalation workflow |

### Autonomous Mission FSM

Six-phase state machine running at 1.5s cadence:

```
SURFACE (0m, 30s) -> DESCENDING (500m, 120s) -> OBSERVING (500m, 60s)
-> SONAR_SCAN (200m, 45s) -> ASCENDING (0m, 90s) -> REPORTING (0m, 30s)
```

Mission phase drives depth targeting, BGC-Argo profile interpolation at the current depth, and triggers sonar scan automatically at 200m altitude.

### Communications Architecture

| Link | Technology | Condition |
|---|---|---|
| Submerged telemetry | USBL Acoustic Modem (8.5 kHz) | Depth > 5m; labelled SUBMERGED: EDGE AI ACTIVE + USBL TELEMETRY |
| Surface uplink | SATCOM Burst Uplink | Depth <= 5m; labelled SATCOM_UPLINK |
| Offline resilience | Edge Store and Forward | No active link; data queued in SQLite for next uplink window |
| C2 link | AES-256 encrypted datastream | Naval C2 security standard |

### MQTT Telemetry Bus

- Mosquitto broker with MQTT pub/sub for real and virtual sensor streams
- Identical topic schema for hardware and virtual sensors — hot-swappable without downstream changes
- SQLite WAL persistence at 1.5s write cadence with QC flag and sync tracking

### Mission Dashboard — 8 Screens

| Route | Navigation Label | Description |
|---|---|---|
| `/ocean-state` | Ocean State | IN-SITU TEMPERATURE, PRACTICAL SALINITY (CTD), depth profiles, T-S diagram, water column transect |
| `/intel` | MoES Intel Report | Policy-facing summary; DOM alignment, INCOIS integration, CCAMLR notifications |
| `/biogeo` | Biogeochemistry | DISSOLVED OXYGEN (DOXY), CHLOROPHYLL-A BIOMASS, nitrate, pH with source labels |
| `/seafloor` | Seafloor Intel | SSS waterfall canvas, AI bounding boxes, shadow warnings, detection log, export |
| `/mission` | Mission Control | Battery, USBL telemetry, SATCOM uplink, IMU matrix, sync queue, survey mode control |
| `/auv-twin` | AUV Digital Twin | Three.js 3D model of AUV-MATSYA 6000 synced to live depth and IMU |
| `/validation` | Model Validation | Confusion matrices, PR/F1 curves, ablation tables |
| `/research` | Research and Citations | Scientific reference base with dataset attributions |

### System Core Health Panel (Sidebar)

The sidebar footer exposes three live subsystem indicators polled every 5 seconds against `GET /api/health`:

| Indicator | Condition | Failure State |
|---|---|---|
| Telemetry | MQTT + SQLite write loop active | Red pulse with FAIL_DETECTED label |
| AI Engine | `model_ready: true` returned by health endpoint | Red pulse |
| Store Link | SQLite connection healthy | Red pulse |

### Policy and Institutional Context (MoES Intel Report)

- Aligned with the Deep Ocean Mission (DOM) — ₹4,077 crore GoI initiative
- Detection streams routed into INCOIS API for real-time Coast Guard intelligence
- CCAMLR secretariat notification workflow for high-density derelict fishing gear
- Cost comparison: ₹75,000 per unit (AQUILA OS) vs ₹30 Lakh (commercial Argo float)
- Swarm deployment concept: 40 autonomous floats mapping the Indian Ocean sector simultaneously via underwater acoustic modems

---

## System Architecture

```
                          HARDWARE LAYER
           +--------------------------------------------+
           |  DS18B20  MS5837  Atlas pH  MPU6050  TDS   |
           |         +----------+----------+            |
           |              ESP32 MCU                     |
           |                  |                         |
           |          Raspberry Pi 4 (edge)             |
           +------------------+--------------------------+
                              |
           +------------------+--------------------------+
           |           VIRTUAL SENSOR ENGINE            |
           |  BGC-Argo NetCDF (WMO 5904859)             |
           |      +-> ProfileInterpolator               |
           |              +-> VirtualSensor             |
           |                   (noise + drift + dropout)|
           +------------------+--------------------------+
                              |
                    +---------+---------+
                    |  Mosquitto :1883  |
                    |  MQTT Broker      |
                    +---------+---------+
                              |
           +------------------+--------------------------+
           |              FASTAPI BACKEND :8000          |
           |                                            |
           |  MissionFSM --> continuous_telemetry_worker|
           |                      | 1.5s cadence        |
           |                  SQLite WAL                 |
           |               (platform.db)                |
           |                      |                     |
           |              REST API (9 endpoints)         |
           +----------+-----------+---------------------+
                      |           | POST /api/detect
           +----------+----+  +---+---------------------+
           |  DASHBOARD    |  |    SSS AI PIPELINE      |
           |  React 19     |  |                         |
           |  Vite :5173   |  |  CLAHE + Median filter  |
           |               |  |  + Shadow mask          |
           |  8 pages      |  |  -> YOLOv9c Stage 1     |
           |  Three.js     |  |  -> RT-DETR-L Stage 2   |
           |  Recharts     |  |  -> Confidence calib.   |
           |  TailwindCSS  |  |  -> Geotagger (pyxtf)   |
           |               |  |  -> SQLite persist      |
           +---------------+  +-------------------------+

           COMMUNICATIONS
           +--------------------------------------------+
           |  Submerged  -->  USBL Acoustic Modem       |
           |                  8.5 kHz, AES-256 C2 link  |
           |  Surfaced   -->  SATCOM Burst Uplink        |
           |  Offline    -->  Edge Store & Forward       |
           |                  (SQLite queue, sync flag)  |
           +--------------------------------------------+
```

### Data Flow

```
BGC-Argo NetCDF (WMO 5904859)
  -> ProfileInterpolator.select_nearest_profile(-54.2, 60.8)
  -> VirtualSensor.read(true_value)  [EOS-80 noise + biofouling drift + dropout]
  -> MQTT publish (topic: same schema as hardware)

ESP32 hardware sensors
  -> MQTT publish

Both streams -> Mosquitto :1883 -> mqtt_subscriber.py
                                        |
                               MissionFSM (depth/phase/timing)
                                        |
                         continuous_telemetry_worker (1.5s)
                                        |
                                SQLite WAL (platform.db)
                                        |
                          FastAPI REST endpoints (:8000)
                                        |
                     React 19 Dashboard (Vite :5173)
                          |                   |
                     USBL modem           SATCOM burst
                  (submerged C2)        (surface uplink)
```

---

## API Reference

**Base URL:** `http://localhost:8000`

All endpoints return `application/json`. CORS is open for `localhost:5173` and `localhost:3000`.

---

### GET /api/health

System health check, model readiness, and server uptime.

**Response**

```json
{
  "status": "operational",
  "model_ready": true,
  "uptime_s": 3600,
  "timestamp": "2026-09-04T11:24:00Z"
}
```

| Field | Type | Description |
|---|---|---|
| `status` | string | Always `"operational"` when server is reachable |
| `model_ready` | boolean | `true` if RT-DETR/YOLOv9c weights loaded successfully |
| `uptime_s` | integer | Seconds since server start |
| `timestamp` | string | ISO 8601 UTC |

---

### GET /api/telemetry

Full live telemetry payload: all ocean parameters, vehicle state, and last 20 raw readings from the database. Falls back to a physics-based fluctuating model if the database has been quiet for more than 15 seconds.

**Response**

```json
{
  "depth_m": 237.4,
  "lat": -54.201456,
  "lon": 60.810523,
  "battery_pct": 87.3,
  "imu_roll": 1.24,
  "imu_pitch": -0.83,
  "temperature_c": 1.923,
  "salinity_psu": 34.512,
  "doxy_umol_kg": 218.4,
  "chla_mg_m3": 0.124,
  "nitrate_umol_kg": 22.1,
  "ph": 8.062,
  "mission_state": "SUBMERGED_EDGE_AI",
  "phase": "SUBMERGED_EDGE_AI",
  "uptime_s": 1842,
  "timestamp": "2026-09-04T11:24:00Z",
  "count": 200,
  "readings": [...]
}
```

| Field | Type | Unit | Source |
|---|---|---|---|
| `depth_m` | float | m | MissionFSM / hardware |
| `lat` / `lon` | float | degrees WGS-84 | GPS / MissionFSM |
| `battery_pct` | float | % | MissionFSM decay model |
| `imu_roll` / `imu_pitch` | float | degrees | MPU6050 / VirtualSensor |
| `temperature_c` | float | °C | BGC-Argo TEMP, EOS-80 ±0.002°C jitter |
| `salinity_psu` | float | PSU | BGC-Argo PSAL, EOS-80 ±0.01 PSU jitter |
| `doxy_umol_kg` | float | µmol/kg | BGC-Argo DOXY |
| `chla_mg_m3` | float | mg/m³ | BGC-Argo CHLA |
| `nitrate_umol_kg` | float | µmol/kg | BGC-Argo NITRATE |
| `ph` | float | pH | BGC-Argo PH_IN_SITU_TOTAL |
| `mission_state` | string | — | MissionFSM current phase |
| `readings` | array | — | Last 20 raw database rows |

---

### GET /api/auv/state

Compact AUV position and state, optimised for the Mission Control HUD poll loop.

**Response**

```json
{
  "depth_m": 237.4,
  "battery_pct": 87.3,
  "mission_state": "SUBMERGED_EDGE_AI",
  "lat": -54.201456,
  "lon": 60.810523
}
```

**mission_state values**

| Value | Depth Condition | Dashboard Label |
|---|---|---|
| `SATCOM_UPLINK` | <= 5m | SATCOM BURST UPLINK ACTIVE |
| `SURFACE` | 5m – 50m | On surface, awaiting dive |
| `SUBMERGED_EDGE_AI` | 50m – 500m | SUBMERGED: EDGE AI ACTIVE + USBL TELEMETRY |
| `DEEP_SURVEY` | > 500m | Deep water survey pass |

---

### GET /api/ocean/state

Structured biogeochemical parameter set with per-parameter uncertainty and depth context.

**Response**

```json
{
  "temperature": {
    "value": 1.923,
    "unit": "degree_Celsius",
    "depth_m": 237.4,
    "status": "ONLINE",
    "uncertainty": 0.002
  },
  "salinity":    { "value": 34.512, "unit": "psu", "depth_m": 237.4, "status": "ONLINE", "uncertainty": 0.01 },
  "oxygen":      { "value": 218.4,  "unit": "micromole/kilogram", ... },
  "chlorophyll": { "value": 0.124,  "unit": "milligrams/m3", ... },
  "nitrate":     { "value": 22.1,   "unit": "micromole/kilogram", ... },
  "ph":          { "value": 8.062,  "unit": "dimensionless", ... },
  "timestamp":   "2026-09-04T11:24:00Z"
}
```

---

### GET /api/mission/status

Full mission navigation and subsystem status for the Mission Control screen.

**Response**

```json
{
  "depth_m": 237.4,
  "lat": -54.201456,
  "lon": 60.810523,
  "battery_pct": 87.3,
  "imu_roll": 1.24,
  "imu_pitch": -0.83,
  "sync_queue_size": 12,
  "phase": "OBSERVING",
  "mission_state": "OBSERVING",
  "uptime_s": 1842,
  "timestamp": "2026-09-04T11:24:00Z"
}
```

| Field | Description |
|---|---|
| `sync_queue_size` | Count of SQLite rows pending next SATCOM uplink window |
| `phase` | Current MissionFSM phase name |

---

### POST /api/detect

Six-stage SSS waterfall detection pipeline. Upload a side-scan sonar image and receive AI-classified detections with geotagged WGS-84 coordinates. Results are automatically persisted to the database.

**Request** — `multipart/form-data`

| Field | Type | Required | Description |
|---|---|---|---|
| `file` | binary | Yes | SSS waterfall image: PNG, JPEG, TIFF, BMP, WebP |

**Accepted extensions:** `.png` `.jpg` `.jpeg` `.tiff` `.tif` `.bmp` `.webp`

**Processing stages**

The UI tracks these stages in real time on the Seafloor Intel screen:

| Stage | UI Label |
|---|---|
| `idle` | READY |
| `uploading` | UPLOADING... |
| `preprocessing` | PREPROCESSING... |
| `inferencing` | AI INFERENCE... |
| `calibrating` | CALIBRATING... |
| `done` | COMPLETE |
| `error` | ERROR |

**Response**

```json
{
  "model_ready": true,
  "detections": [
    {
      "object_class": "ghost_net",
      "confidence_raw": 0.847,
      "confidence_cal": 0.847,
      "shadow_penalty": false,
      "bbox": [0.12, 0.34, 0.28, 0.18],
      "lat": -54.2014,
      "lon": 60.8107,
      "depth_m": 237.4,
      "heading_deg": 84.5,
      "ping_number": 8442
    }
  ],
  "preprocessing_time_ms": 34.2,
  "inference_time_ms": 128.6,
  "total_time_ms": 167.4,
  "image_size": [1024, 512],
  "detection_count": 1,
  "message": "Detections computed successfully"
}
```

**Detection object fields**

| Field | Type | Description |
|---|---|---|
| `object_class` | string | One of 10 classes — see Detection Classes table |
| `confidence_raw` | float | Raw model output confidence [0.0–1.0] |
| `confidence_cal` | float | Post-calibration confidence (shadow penalty applied if applicable) |
| `shadow_penalty` | boolean | `true` if detection centroid falls within acoustic shadow zone |
| `bbox` | float[4] | Normalised `[x, y, w, h]` in [0.0–1.0], origin top-left |
| `lat` / `lon` | float | WGS-84 geotagged from XTF ping metadata (fallback -54.2S, 60.8E) |
| `depth_m` | float | Platform depth at time of sonar ping |
| `heading_deg` | float | Sonar heading in degrees |
| `ping_number` | integer | XTF scanline ping index (null in demo/fallback mode) |

**Pipeline stages (in execution order)**

```
Stage 1 — Preprocessor      : CLAHE (3.0 clip, 8x8 tile) + median filter (5x5) + shadow mask
Stage 2 — YOLOv9c           : conf=0.10, iou=0.45, imgsz=640 — high-recall waterfall sweep
Stage 3 — RT-DETR-L         : Precision refinement, CBAM channel-spatial attention
Stage 4 — Confidence Calib. : 0.50x shadow-zone penalty; <0.35 -> flagged for AUV revisit
Stage 5 — Geotagger         : pyxtf XTF ping -> WGS-84 lat/lon per scanline
Stage 6 — Persist           : SQLite WAL insert to detections table
```

**Error responses**

| HTTP Status | Condition |
|---|---|
| `400` | Invalid file type or empty upload |
| `200` with `model_ready: false` | Weights not found; run Colab training first |

---

### GET /api/detections

Retrieve stored detections from the SQLite database.

**Query parameters**

| Parameter | Type | Default | Range | Description |
|---|---|---|---|---|
| `limit` | integer | 50 | 1–500 | Maximum rows to return |

**Response**

```json
{
  "detections": [ { } ],
  "count": 12
}
```

---

### POST /api/download/json

Export a detection result set as a downloadable JSON report.

**Request body** — `application/json` array of detection objects

**Response** — `application/json` file: `deepscan_detections.json`

---

### POST /api/download/csv

Export a detection result set as a downloadable CSV report.

**Request body** — same as `/api/download/json`

**Response** — `text/csv` file: `deepscan_detections.csv`

CSV columns: `object_class, confidence_cal, confidence_raw, shadow_penalty, lat, lon, depth_m, bbox_x, bbox_y, bbox_w, bbox_h, heading_deg, ping_number, timestamp`

---

## AI and Sonar Intelligence Pipeline

### Sonar Terminology Reference

| Term | Definition |
|---|---|
| SSS waterfall | Side-scan sonar image produced by stacking successive ping scanlines vertically; the primary input to the detection pipeline |
| Acoustic backscatter | Intensity of sonar energy reflected back from the seabed or a target; bright returns indicate hard objects |
| Swath | Total lateral coverage width of one sonar pass; determines survey efficiency |
| Scanline / Ping | A single sonar emission and return; one horizontal row in the waterfall image |
| Ping number | XTF index of the scanline used to compute the geotagged position of a detection |
| Acoustic shadow | Dark zone behind a raised object where sonar cannot penetrate; used to estimate object height |
| Shadow penalty | Confidence multiplier (0.50x) applied to detections whose centroid falls in a shadow zone |
| CLAHE | Contrast Limited Adaptive Histogram Equalisation; enhances local acoustic contrast before inference |
| Multi-ping continuity | Detection validity rule: man-made linear objects (pipelines, cables) must persist across consecutive scanlines |

### Model Architecture

```
Input SSS Waterfall Image
      |
      v
Preprocessor
  |- CLAHE  (clip_limit=3.0, tile_grid=8x8)
  |- Median speckle filter  (kernel=5x5)
  +- Shadow mask  (threshold=40, morphological closing 20x8)
      |
      v
Stage 1 — YOLOv9c
  |- conf_threshold = 0.10   (high-recall sweep)
  |- iou_threshold  = 0.45
  +- imgsz          = 640
      |
      v
Stage 2 — RT-DETR-L
  |- CBAM attention (channel + spatial)
  |- Sim-to-real augmentation applied during training
  +- Precision-optimised rescoring
      |
      v
Confidence Calibrator
  |- shadow_penalty_factor       = 0.50
  |- low_confidence_threshold    = 0.35  -> flagged for AUV revisit
  +- Shadow detections flagged, NOT suppressed
      |
      v
Geotagger
  |- pyxtf — XTF ping metadata per scanline
  |- Output: WGS-84 lat/lon per detection
  +- Fallback: -54.2S, 60.8E (demo mode)
      |
      v
Reporter + SQLite Persist
  |- detections table (WAL)
  +- JSON / CSV export
```

### Detection Classes

| Internal Class | Display Label | Backscatter Signature |
|---|---|---|
| `shipwreck` | Shipwreck / Hull | Large waterfall return, broken keel, mast profiles |
| `ghost_net` | Derelict Ghost Net | High spatial entropy, non-rigid perimeter, backscatter +6 dB over ambient |
| `uxo_mine` | Subsea UXO / Mine | Constant cross-section 0.1–1.2m, specular highlight with shadow |
| `pipeline_cable` | Subsea Cable / Pipeline | Continuous linear displacement across swath, multi-ping trajectory continuity |
| `lost_container` | Sunken Cargo Container | Orthogonal 90° corners, 2.5:1 aspect ratio; prevents rocky ledge false positives |
| `toxic_drum` | Hazardous Chemical Drum | Cylindrical, smaller profile than UXO |
| `pmn_nodule` | Polymetallic Nodule Field | Distributed low-relief backscatter pattern |
| `gas_seep` | Methane Hydrate Seep | Diffuse return, geohazard classification |
| `subsea_sensor` | Foreign Sonar Transponder | Discrete target, regular geometry |
| `anomaly` | Unclassified Anomaly | Uncertainty triage; routed to human operator |

### Model Files

| Path | Architecture | Purpose |
|---|---|---|
| `models/stage2_rtdetr_sctd/weights/best.pt` | RT-DETR-L | Primary inference weights |
| `models/sss_detector_v1-3/weights/best.pt` | YOLOv8-seg | SSS segmentation v1.3 |
| `models/sss_detector_v1/weights/best.pt` | YOLOv8 | SSS detection v1.0 baseline |
| `models/stage1_yolov9c/` | YOLOv9c | Stage 1 training artifacts and results |
| `telemetry_anomaly_edge.onnx` | ONNX | Edge telemetry anomaly detector |
| `yolov8n.pt` | YOLOv8n | Backbone pretrain |
| `yolov9c.pt` | YOLOv9c | Stage 1 pretrain |

### Training

```bash
# Train on SCTD dataset
python ai_pipeline/train.py

# Run ablation study
python ai_pipeline/validate_ablation.py

# Sim-to-real augmentation pass
python ai_pipeline/sim_to_real_augmenter.py

# Export ONNX edge model
python ai_pipeline/edge_exporter.py
```

GPU fine-tuning: open `DeepScan_Colab_FineTune.ipynb` in Google Colab.

---

## AUV Survey Modes

Three survey modes are selectable from the Mission Control screen. Mode determines AUV speed, altitude, and sonar swath width.

| Mode | Speed | Altitude | Swath | Use Case |
|---|---|---|---|---|
| `LAWNMOWER` | 3.2 kts (1.65 m/s) | 25.0 m above seabed | 150 m total | Systematic parallel coverage for wide-area debris search and high-speed acoustic imaging |
| `CONTOUR_FOLLOW` | 1.8 kts (0.92 m/s) | 12.0 m (seabed lock) | 70 m targeted | Terrain-following for detailed inspection of seafloor features |
| `HOVER_STATION` | 0.2 kts (station holding) | 6.5 m precision orbit | 15 m micro-grid | High-resolution re-inspection of flagged targets |

Mode changes are command-dispatched via the C2 link and logged to the mission terminal.

---

## Virtual Ocean Sensor Engine

The Virtual Sensor Engine enables a complete software-demonstrable sensor suite backed by real BGC-Argo float data, not synthetic random values.

### Data Flow

```
BGC-Argo NetCDF (data/argo_southern_ocean.nc, WMO 5904859)
  -> ProfileInterpolator.select_nearest_profile(-54.2, 60.8)
  -> ProfileInterpolator.get_value_at_depth(profile_idx, depth, param)
  -> VirtualSensor.read(true_value)
       |- Gaussian noise  (param-specific sigma, EOS-80 CTD accuracy specs)
       |- Random walk drift  (biofouling accumulation over deployment time)
       |- Dropout events  (probabilistic sensor loss)
       +- Recovery transient  (realistic re-acquisition after dropout)
  -> Physical bounds enforced (e.g., TEMP: 1.50-2.50 C for Southern Ocean)
  -> Written to SQLite with source='VIRTUAL_BGC_ARGO'
  -> Dashboard label: PHYSICS-DERIVED (EOS-80)
```

### Parameters and Bounds

| Dashboard Title | NetCDF Variable | Physical Bounds | Noise Spec |
|---|---|---|---|
| IN-SITU TEMPERATURE | `TEMP` | 1.50 – 2.50 °C | ±0.002°C (Argo CTD accuracy, EOS-80) |
| PRACTICAL SALINITY (CTD) | `PSAL` | 34.20 – 34.80 PSU | ±0.01 PSU (EOS-80) |
| DISSOLVED OXYGEN (DOXY) | `DOXY` | > 160 µmol/kg | Gaussian + drift |
| CHLOROPHYLL-A BIOMASS | `CHLA` | depth-dependent exponential | Gaussian + dropout |
| Nitrate | `NITRATE` | 20 – 34.5 µmol/kg | Gaussian + drift |
| pH | `PH_IN_SITU_TOTAL` | > 7.75 | Gaussian |
| ACOUSTIC CURRENT VELOCITY | DL_REPLICATED | derived | Physics-derived |

Salinity computation complies with UNESCO EOS-80 (±0.012% RMS accuracy as displayed in the dashboard).

---

## Database Schema

SQLite WAL database at `data/platform.db`. WAL mode enables concurrent reads from the API while the telemetry worker is writing.

### sensor_readings

| Column | Type | Description |
|---|---|---|
| `id` | INTEGER PK | Auto-increment |
| `sensor` | TEXT | Parameter: `TEMP`, `PSAL`, `DOXY`, `CHLA`, `NITRATE`, `PH_IN_SITU_TOTAL`, `depth`, `battery`, `lat`, `lon`, `imu_roll`, `imu_pitch` |
| `value` | REAL | Measured value |
| `unit` | TEXT | SI unit string |
| `source` | TEXT | `VIRTUAL_BGC_ARGO` / `HARDWARE` / `MQTT` |
| `uncertainty` | REAL | Sensor uncertainty estimate |
| `depth_m` | REAL | Platform depth at time of reading |
| `status` | TEXT | `ONLINE` / `DEGRADED` / `OFFLINE` |
| `qc_flag` | INTEGER | 1 = good, 0 = suspect (Argo QC convention) |
| `platform` | TEXT | Platform ID, default `001` |
| `timestamp` | REAL | Unix epoch |
| `synced` | INTEGER | 0 = pending SATCOM uplink, 1 = synced |

### detections

| Column | Type | Description |
|---|---|---|
| `id` | INTEGER PK | Auto-increment |
| `object_class` | TEXT | Detection class (one of 10 classes) |
| `confidence_cal` | REAL | Calibrated confidence |
| `confidence_raw` | REAL | Raw model confidence |
| `shadow_penalty` | INTEGER | 1 if acoustic shadow penalty applied |
| `lat` / `lon` | REAL | WGS-84 geotagged coordinates |
| `depth_m` | REAL | Depth at time of sonar ping |
| `bbox_x/y/w/h` | REAL | Normalised bounding box [0.0–1.0] |
| `heading_deg` | REAL | Sonar heading in degrees |
| `ping_number` | INTEGER | XTF scanline ping index, null in demo mode |
| `timestamp` | TEXT | ISO 8601 |
| `synced` | INTEGER | SATCOM uplink sync flag |

### mission_log

| Column | Type | Description |
|---|---|---|
| `phase` | TEXT | MissionFSM phase name |
| `depth_m` | REAL | Platform depth |
| `lat` / `lon` | REAL | Position |
| `timestamp` | REAL | Unix epoch |

---

## Tech Stack

### Backend

| Component | Library | Version |
|---|---|---|
| API server | FastAPI + Uvicorn | >= 0.100.0 |
| Config | PyYAML | >= 6.0 |
| MQTT client | Paho-MQTT | latest |
| File upload | python-multipart | >= 0.0.6 |
| Storage | SQLite (WAL) | built-in |
| Data processing | pandas, NumPy, SciPy | >= 2.0 / 1.24 / 1.10 |
| ML utilities | scikit-learn, joblib | >= 1.3.0 |

### AI / ML

| Component | Library | Version |
|---|---|---|
| Detection models | Ultralytics (YOLO, RT-DETR) | >= 8.0.0 |
| Training framework | PyTorch + TorchVision | latest |
| CV preprocessing | OpenCV | >= 4.8.0 |

### Ocean Data

| Component | Library | Purpose |
|---|---|---|
| NetCDF / Argo profiles | xarray, netCDF4 | BGC-Argo profile reading and interpolation |
| Argo data access | argopy | Float profile querying (WMO 5904859) |
| XTF geotagging | pyxtf | Side-scan sonar ping positioning |

### Frontend

| Component | Library | Version |
|---|---|---|
| Framework | React | 19.2.8 |
| Language | TypeScript | ~6.0.2 |
| Build tool | Vite | 8.2.2 |
| Styling | TailwindCSS | 3.4.19 |
| 3D AUV twin | Three.js | 0.185.1 |
| Charts | Recharts | 3.10.1 |
| Animations | Framer Motion | 13.1.1 |
| Icons | Lucide React | 1.37.0 |
| Routing | React Router | 7.18.3 |
| Linter | oxlint | 1.79.0 |

### Infrastructure

| Component | Technology |
|---|---|
| MQTT broker | Eclipse Mosquitto |
| Submerged comms | USBL Acoustic Modem (8.5 kHz) |
| Surface uplink | SATCOM Burst |
| C2 security | AES-256 |
| Python runtime | 3.10+ |
| Node runtime | 18+ |

---

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- Eclipse Mosquitto
- CUDA GPU (optional, for faster inference)

### 1. Clone and install

```bash
git clone <repo-url>
cd NEW-SIH-main

python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Prepare Argo dataset

```bash
# Generate synthetic BGC-Argo NetCDF for offline development
python create_dummy_nc.py

# Or fetch real Southern Ocean profiles (WMO 5904859 region)
python datasets/fetch_argo.py
```

### 3. Start the backend

```bash
export PYTHONPATH=$(pwd)
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```

On startup the backend automatically:
- Initialises the SQLite WAL schema
- Loads and warms up the RT-DETR / YOLOv9c models
- Launches the `continuous_telemetry_worker` asyncio daemon (1.5s cadence)

### 4. Start the frontend

```bash
cd frontend
npm install
npm run dev
# -> http://localhost:5173
```

### 5. Full stack with MQTT

```bash
chmod +x run_all.sh && ./run_all.sh
```

Starts: Mosquitto broker + virtual sensor publisher + MQTT subscriber + frontend.

### Health check

```bash
curl http://localhost:8000/api/health
```

---

## Configuration

All thresholds, model paths, and class definitions are centralised in `config/pipeline_config.yaml`. No hardcoded values exist in source code.

```yaml
detector:
  model_path: "models/stage2_rtdetr_sctd/weights/best.pt"
  conf_threshold: 0.10
  iou_threshold: 0.45
  imgsz: 640
  class_names:
    - shipwreck
    - pipe
    - cylinder
    - ghost_net
    - anomaly

preprocessor:
  median_kernel: 5
  clahe_clip_limit: 3.0
  clahe_tile_grid: [8, 8]
  shadow_threshold: 40
  shadow_kernel: [20, 8]

confidence_calibrator:
  shadow_penalty_factor: 0.50
  low_confidence_threshold: 0.35

geotagging:
  fallback_lat: -54.2
  fallback_lon: 60.8
  fallback_heading: 90.0

platform:
  platform_id: "001"
  mqtt_broker: "localhost"
  mqtt_port: 1883
```

---

## Directory Structure

```
NEW-SIH-main/
├── api/
│   └── main.py                                # FastAPI app — 9 REST endpoints
├── ai_pipeline/
│   ├── detector.py                            # YOLOv9c + RT-DETR cascade inference
│   ├── preprocessor.py                        # CLAHE + speckle filter + shadow mask
│   ├── confidence_calibrator.py               # Acoustic shadow penalty
│   ├── geotagger.py                           # pyxtf XTF scanline -> WGS-84
│   ├── train.py                               # Model training pipeline
│   ├── validate_ablation.py                   # Ablation study runner
│   ├── cbam.py                                # CBAM channel-spatial attention module
│   ├── sim_to_real_augmenter.py               # Domain randomisation
│   ├── edge_exporter.py                       # ONNX edge export
│   ├── telemetry_edge_model.py                # Edge anomaly detection
│   └── llm_report_generator.py               # LLM-powered mission report
├── virtual_sensors/
│   ├── noise_engine.py                        # VirtualSensor: EOS-80 noise + drift + dropout
│   ├── profile_interpolator.py                # BGC-Argo NetCDF depth interpolation (WMO 5904859)
│   ├── dl_sensor_replicator.py                # Deep-learning sensor replication
│   ├── virtual_publisher.py                   # MQTT publisher for virtual readings
│   └── validator.py                           # Virtual sensor accuracy validation
├── platform_pkg/
│   ├── database.py                            # SQLite WAL schema and access layer
│   ├── mission_fsm.py                         # 6-phase autonomous mission FSM
│   ├── mqtt_subscriber.py                     # MQTT -> SQLite bridge
│   └── sync_manager.py                        # SATCOM uplink sync manager
├── models/
│   ├── stage2_rtdetr_sctd/weights/best.pt     # Primary inference weights
│   ├── sss_detector_v1-3/weights/best.pt      # SSS segmentation v1.3
│   ├── stage1_yolov9c/                        # Stage 1 training artifacts
│   └── telemetry_anomaly_edge.onnx            # Edge ONNX model
├── frontend/
│   ├── src/
│   │   ├── pages/                             # 8 dashboard page components
│   │   ├── components/                        # Sidebar, SonarProfiler, SystemStatusRow, AUVTwin
│   │   ├── charts/                            # DepthProfileChart, TSDiagram
│   │   └── types/
│   │       └── detection.ts                   # Detection types, CLASS_LABELS, CLASS_COLORS
│   └── public/
│       ├── demo_sonar/                        # 3 demo SSS waterfall images
│       └── testing_images/                    # 25 labelled SSS test images
├── config/
│   └── pipeline_config.yaml                   # Central config — all thresholds, paths, classes
├── data/
│   ├── argo_southern_ocean.nc                 # BGC-Argo NetCDF (WMO 5904859 region)
│   └── platform.db                            # SQLite WAL database
├── reports/
│   ├── ablation_report.json
│   └── ablation_report.csv
├── runs/detect/                               # YOLO validation — PR/F1 curves, confusion matrices
├── requirements.txt
├── dataset.yaml                               # YOLO class definitions
└── run_all.sh                                 # Full stack startup script
```

---

## Oceanographic Data Sources

| Dataset | Source | Parameters | Region | License |
|---|---|---|---|---|
| BGC-Argo float profiles | Argo Program / argopy (WMO 5904859) | TEMP, PSAL, DOXY, CHLA, NITRATE, pH | Southern Ocean (-54.2°S) | Open / CC-BY |
| Argo climatology | NCEI World Ocean Database | Reference profiles | Global | Public domain |
| Copernicus Marine | CMEMS | Surface currents, altimetry | Southern Ocean | Registration required |
| INCOIS | incois.gov.in | Indian Ocean ancillary | Indian Ocean | MoES open data |
| NCPOR archives | NCPOR | Polar expedition data | Southern Ocean | Collaborative access |

### SCTD Test Dataset

25 annotated SSS waterfall images in `frontend/public/testing_images/`, benchmarked against SCTD Marine Debris Benchmark / CCAMLR Conservation Protocol and KLSG SeabedObjects Benchmark / ONGC Pipeline Scour Standards. Coverage includes:

- Shipwrecks: large waterfall signatures, broken keel, mast profiles
- Cylindrical UXO/mine contacts with specular highlights and shadow profiles
- Ghost nets and synthetic FAD trawl mesh (high spatial entropy targets)
- Subsea cable crossings and pipeline tracks (multi-ping linear continuity)
- Multi-target debris fields and 40ft ISO cargo containers
- Zero-shadow false-positive traps (rock outcrops, natural seabed formations)
- Extreme speckle noise conditions and deep-towed contacts

---

## Model Performance

Validation results in `runs/detect/val-2/` from RT-DETR Stage 2 on the SCTD validation set.

| Metric | Output File |
|---|---|
| Precision curve | `BoxP_curve.png` |
| Recall curve | `BoxR_curve.png` |
| F1 curve | `BoxF1_curve.png` |
| PR curve | `BoxPR_curve.png` |
| Confusion matrix | `confusion_matrix_normalized.png` |
| Full ablation table | `reports/ablation_report.json` |

---

## License

MIT — see `LICENSE`.

---

## Team FusionX — SIH 2026

Built for the Ministry of Earth Sciences / National Centre for Polar and Ocean Research.

**Problem Statement 26065** — Autonomous Low-Cost Ocean Observation Platform for Polar and Southern Oceans

Platform: AUV-MATSYA 6000 · Callsign: AQUILA-001 · Cost: ₹75,000 per unit  
Deployed at: -54.2°S, 60.8°E · BGC-Argo reference: WMO 5904859 · Standard: UNESCO EOS-80 / TEOS-10
ENDOFREADME
