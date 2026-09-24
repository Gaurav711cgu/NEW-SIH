# Project: ConvectNow Deep Learning Hazard Suite & Scrollytelling (MoES / NCMRWF · SIH PS-26084)

## Architecture
ConvectNow is a real-time, multi-source meteorological hazard intelligence platform fusing Doppler Weather Radar (IMD DWR), Geostationary Satellite (MOSDAC INSAT-3DR), and SEVIR benchmark storm cubes into a unified PyTorch multi-task deep neural network (`ConvectNet`), coupled with a physics-grounded AI feature attribution engine and an interactive 4D Storm Anatomy scrollytelling experience.

```
Data Ingestion Layer (M1)
├── IMD DWR GeoServer Feeds (WMS/WCS & operational GIF decoders)
├── MOSDAC INSAT-3DR Multispectral HDF5 Ingestion (TIR1, TIR2, WV)
├── SEVIR High-Res Benchmark Storm Cubes (VIL + GLM Lightning)
├── Automated Quality Control (TDBZ Clutter Rejection, AP Gating, Optical-Flow Imputation)
└── 1 km EPSG:4326 Reprojection & Multi-Modal PyTorch Dataset / DataLoader (B, C, T, H, W)
      │
      ▼
Deep Learning & Hazard Engine (M2)
└── ConvectNet: 3D-CNN / Spatiotemporal ConvLSTM Backbone
    ├── Hail Head (SHI, POSH, MESH)
    ├── Cloudburst Head (Binary Classification & Rainfall Rate >100 mm/hr)
    ├── Downburst Head (Peak Gust Velocity V_db)
    ├── Convective Initiation Head (Probability 0.0 - 1.0)
    └── Loss: Asymmetric Loss (ASL) + Asymmetric Continuous Loss (ACL)
      │
      ▼
Physics Explainer & Telemetry (M3)
├── Atmospheric Feature Attribution (VIL density, Z_max height, cooling rate, freezing level)
├── Latency Benchmark & Operational Telemetry (<50 ms SLA)
└── FastAPI Endpoints Integration (/api/convectnet/predict, /explain, /telemetry)
      │
      ▼
Interactive 4D Storm Anatomy Scrollytelling (M4)
├── 5 Physical Phases ("Anatomy of a Cloudburst: 60 Minutes to Catastrophe")
├── 60 FPS Vertical Radar Cross-Section Canvas (Z vs Height 0–18 km, 0°C & -20°C Isotherms)
├── Live JetBrains Mono Telemetry HUD & AI Shapley Attribution Display
└── Strict "Ice and Ships" Design Tokens (DESIGN.md) & WebGIS Integration
```

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | IMD DWR GeoServer Ingestion | Ingestion worker for IMD Doppler Weather Radar GeoServer feeds (WMS/WCS & operational raster decoders) | M1 | ORIGINAL_REQUEST §R1 |
| 2 | MOSDAC INSAT-3DR Ingestion | Ingestion worker for MOSDAC INSAT-3DR multispectral products (TIR1, TIR2, WV) with Planck calibration | M1 | ORIGINAL_REQUEST §R1 |
| 3 | SEVIR Storm Cube Synchronization | Dual-mode paired GLM and physics-proxy synchronization with SEVIR 1 km convective cubes | M1 | ORIGINAL_REQUEST §R1 |
| 4 | Automated Radar Quality Control | Ground clutter rejection via TDBZ texture filter, AP ducting gating, and optical-flow frame imputation | M1 | ORIGINAL_REQUEST §R1 |
| 5 | 1 km EPSG:4326 Reprojection | Closed-form mathematical reprojection of radar polar and satellite geometries to 1 km EPSG:4326 grid | M1 | ORIGINAL_REQUEST §R1 |
| 6 | Multi-Modal PyTorch Dataset & Loader | `ConvectDataset` & `DataLoader` yielding clean `(B, C=4, T=12, H=128, W=128)` tensors | M1 | ORIGINAL_REQUEST §R1 |
| 7 | ConvectNet Spatiotemporal Backbone | MPS/CPU-compatible 3D-CNN / Spatiotemporal ConvLSTM processing 4D tensor sequences `(B, C, T, H, W)` | M2 | ORIGINAL_REQUEST §R2 |
| 8 | Multi-Task Hail Head | Regression head predicting Severe Hail Index (SHI), Probability of Severe Hail (POSH), and MESH (mm) | M2 | ORIGINAL_REQUEST §R2 |
| 9 | Multi-Task Cloudburst Head | Dual-task head for binary classification and rainfall rate regression for >100 mm/hr extreme events | M2 | ORIGINAL_REQUEST §R2 |
| 10 | Multi-Task Downburst Head | Regression head predicting peak surface wind gust velocity ($V_{db}$ in km/h) | M2 | ORIGINAL_REQUEST §R2 |
| 11 | Multi-Task Convective Initiation Head | Classification/probability head outputting CI score ($0.0 - 1.0$) for newly forming updraft cores | M2 | ORIGINAL_REQUEST §R2 |
| 12 | Custom Asymmetric & Focal Losses | Asymmetric Loss (ASL, $\gamma_+=1, \gamma_-=4, m=0.05$) and Asymmetric Continuous Loss (ACL, 3x under-prediction penalty) | M2 | ORIGINAL_REQUEST §R2 |
| 13 | Training & Ablation Script | Reproducible `train_convectnet.py` with loss logging, validation metrics, ablation flags, and checkpointing | M2 | ORIGINAL_REQUEST §R2 |
| 14 | Sub-50ms Inference Engine | Ultra-fast inference engine returning all 4 hazard predictions in <50 ms (benchmarked at ~1.2 ms) | M2 | ORIGINAL_REQUEST §R2 |
| 15 | Physics Feature Attribution Module | Atmospheric contribution scoring for VIL density, $Z_{max}$ core height, cloud-top cooling rate, freezing level proximity | M3 | ORIGINAL_REQUEST §R3 |
| 16 | Operational Telemetry Tracking | Inference latency logging, prediction confidence bands, verification skill logging (CSI, FSS, POD, FAR) | M3 | ORIGINAL_REQUEST §R3 |
| 17 | FastAPI ConvectNet Integration | Serving `/api/convectnet/predict`, `/api/convectnet/explain`, and `/api/convectnet/telemetry` | M3 | ORIGINAL_REQUEST §R3 |
| 18 | 5-Phase Scrollytelling Narrative | 5-phase interactive physical lifecycle: Initiation -> Explosive Updraft -> Suspended Hail Core -> Downdraft Collapse -> Flash Flood | M4 | ORIGINAL_REQUEST §R4 |
| 19 | 60 FPS Vertical Radar Cross-Section | Canvas RHI display (Z vs Height 0–18 km), 0°C (4.5 km) & -20°C (7.5 km) isotherms, vectors & DWR colormap | M4 | ORIGINAL_REQUEST §R4 |
| 20 | Live AI Telemetry HUD & Attribution UI | JetBrains Mono HUD with interpolated metrics & ConvectNet physical driver attribution panel | M4 | ORIGINAL_REQUEST §R4 |
| 21 | "Ice and Ships" Token Alignment | Strict adherence to DESIGN.md (`ocean-950` to `ocean-600`, `ice-500` `#00e5ff`, `steel-800`, glassmorphism) | M4 | ORIGINAL_REQUEST §R4 |
| 22 | WebGIS Dashboard Navigation | ViewMode integration (`tactical`, `anatomy`, `public`) and shortcut button in HazardMeters | M4 | ORIGINAL_REQUEST §R4 |
| 23 | Clean Frontend TypeScript Build | Verification that `npm run build` succeeds with zero TypeScript/PostCSS errors | M4, M5 | ORIGINAL_REQUEST §Acceptance |
| 24 | Comprehensive E2E Verification Suite | Automated test suite covering Tiers 1-4 (Category-Partition, BVA, Pairwise, Workload) and all acceptance criteria | M5 | ORIGINAL_REQUEST §Acceptance |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Dual Real-World Data Sourcing, QC & PyTorch Dataset Pipeline | Ingestion modules for IMD DWR & MOSDAC INSAT-3DR, SEVIR synchronization, TDBZ clutter filtering, AP gating, optical-flow frame imputation, 1 km EPSG:4326 reprojection, and multi-modal PyTorch ConvectDataset / DataLoader | none | DONE |
| M2 | Unified Multi-Task PyTorch ConvectNet & Training Script | 3D-CNN / Spatiotemporal ConvLSTM backbone, 4 hazard heads (Hail, Cloudburst, Downburst, CI), Asymmetric Loss & ACL, `train_convectnet.py`, checkpointing, and sub-50 ms inference engine | M1 | PLANNED |
| M3 | Physics-Grounded AI Explainer & Telemetry Tracking | Atmospheric feature attribution engine (VIL density, $Z_{max}$ core height, cooling rate, freezing level), operational latency/confidence telemetry, and FastAPI integration | M2 | PLANNED |
| M4 | Interactive 4D Storm Anatomy Scrollytelling Experience | 5-phase scrollytelling container, 60 FPS 0–18 km vertical radar cross-section, JetBrains Mono HUD, attribution panel, "Ice and Ships" styling, and zero-error TypeScript build | none | DONE |
| M5 | E2E Integration & Comprehensive System Verification | Dual-track end-to-end testing, integration tests, benchmark validation against all acceptance criteria, and final system review | M1, M2, M3, M4 | PLANNED |

---

## Interface Contracts
### Data Ingestion (M1) ↔ Model Training & Inference (M2)
- `ConvectDataset`:
  - Input: `datasets/sevir/vil`, `datasets/sevir/lght`, or synthetic real-world stream.
  - Output item: `tensor` shape `(C=4, T=12, H=128, W=128)` dtype `torch.float32`.
  - Channel 0: Normalized Reflectivity / VIL $[0.0, 1.0]$.
  - Channel 1: Temporal Reflectivity Growth $\Delta Z = Z_t - Z_{t-1} \in [-1.0, 1.0]$.
  - Channel 2: Satellite IR Cloud-Top Cooling / Normalized $T_b \in [0.0, 1.0]$.
  - Channel 3: Normalized Lightning Flash Density $\in [0.0, 1.0]$.
  - Targets dict:
    - `'posh'`: float $[0.0, 1.0]$
    - `'mesh_mm'`: float $[0.0, 100.0]$
    - `'cloudburst_flag'`: float $\{0.0, 1.0\}$
    - `'rain_rate_mmh'`: float $[0.0, 300.0]$
    - `'gust_kmh'`: float $[0.0, 200.0]$
    - `'ci_prob'`: float $[0.0, 1.0]$

### ConvectNet (M2) ↔ Physics Explainer (M3)
- `ConvectNet.forward(x: torch.Tensor)`:
  - Input: `(B, 4, T, H, W)`
  - Output dict:
    - `'hail'`: `(B, 3)` -> `[SHI, POSH, MESH]`
    - `'cloudburst'`: `(B, 2)` -> `[logit, rain_rate]`
    - `'downburst'`: `(B, 1)` -> `[gust_velocity]`
    - `'ci'`: `(B, 1)` -> `[ci_logit]`
    - `'latent'`: `(B, 128)` -> shared convective latent embedding for attribution
- `PhysicsExplainer.explain(x: torch.Tensor, predictions: dict)`:
  - Output dict:
    - `'vil_density_score'`: float
    - `'z_max_core_score'`: float
    - `'cooling_rate_score'`: float
    - `'freezing_level_proximity_score'`: float
    - `'top_driver'`: string
    - `'summary'`: string

### Backend Server (M3) ↔ Frontend Scrollytelling (M4)
- API endpoint `GET /api/convectnet/storm-anatomy/{storm_id}`:
  - Returns JSON with phase-by-phase telemetry, vertical profiles ($Z$ vs height 0–18 km), and attribution scores matching `STORM_PHASES` TypeScript interface.

---

## Code Layout
- `convectnow/backend/data/`:
  - `ingester_imd.py`: IMD DWR GeoServer & operational GIF ingestor
  - `ingester_mosdac.py`: MOSDAC INSAT-3DR multispectral reader & calibration
  - `quality_control.py`: TDBZ clutter rejection, AP gating, and optical-flow imputation
  - `projection.py`: Pure NumPy/SciPy 1 km EPSG:4326 reprojection engine
  - `dataset_sevir.py`: Multi-modal PyTorch ConvectDataset & DataLoader
- `convectnow/backend/models/`:
  - `convectnet.py`: Spatiotemporal 3D-CNN / ConvLSTM multi-task architecture
  - `losses.py`: Custom Asymmetric Loss (ASL) and Asymmetric Continuous Loss (ACL)
  - `inference.py`: Production-grade sub-50ms inference wrapper
- `convectnow/backend/train_convectnet.py`: Self-contained training & ablation script
- `convectnow/backend/physics_explainer.py`: Atmospheric feature attribution module
- `convectnow/backend/telemetry.py`: Telemetry, latency tracking & verification logger
- `convectnow/backend/server.py`: FastAPI application serving predictions and scrollytelling data
- `convectnow/frontend/src/components/scrollytelling/`:
  - `StormAnatomyScrolly.tsx`: Master scrollytelling container
  - `VerticalRadarCrossSection.tsx`: 60 FPS HTML5 Canvas cross-section engine (0–18 km)
  - `AITelemetryHUD.tsx`: Dynamic JetBrains Mono telemetry HUD
  - `FeatureAttributionPanel.tsx`: ConvectNet atmospheric driver attribution card
  - `PhaseNavigationPill.tsx`: Fixed vertical timeline and chapter jumping control
- `convectnow/frontend/src/App.tsx`: Top-level WebGIS dashboard routing & state
- `convectnow/frontend/src/components/HazardMeters.tsx`: Integration shortcut to 4D Anatomy
- `convectnow/tests/`: Comprehensive E2E and module verification suite
