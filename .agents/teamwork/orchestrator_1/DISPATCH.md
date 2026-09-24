# Dispatch Log

## 2026-09-24T13:02:52Z

You are the Project Orchestrator for ConvectNow: Deep Learning Hazard Suite, End-to-End Data Pipeline, and Interactive Scrollytelling Experience (MoES / NCMRWF · SIH PS-26084).

Your working directory is:
/Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/orchestrator_1

The codebase directory is:
/Users/gauravkumarnayak/Desktop/new sih/convectnow

The original request is recorded at:
/Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/ORIGINAL_REQUEST.md

Key Objectives:
R1. Dual Real-World Data Sourcing & Ingestion Pipeline:
- Ingest meteorological streams from IMD Doppler Weather Radar (DWR) GeoServer feeds and MOSDAC INSAT-3DR multispectral products, synchronized with SEVIR high-resolution (1 km) convective storm cubes.
- Automated quality control filtering (ground clutter rejection, missing value imputation) and uniform 1 km EPSG:4326 grid re-projection.

R2. Unified Multi-Task PyTorch ConvectNet:
- Clean, transparent PyTorch multi-task spatiotemporal neural network (`ConvectNet`):
  - 3D-CNN / Spatiotemporal ConvLSTM backbone processing 4D radar+satellite tensor sequences `(B, C, T, H, W)`.
  - Shared convective feature representation with 4 task-specific heads:
    1. Hail Head (SHI, POSH, MESH)
    2. Cloudburst Head (Binary classification & rainfall rate >100 mm/hr)
    3. Downburst Head (Peak surface wind gust velocity V_db)
    4. Convective Initiation Head (Probability score 0.0 - 1.0)
  - Custom loss functions: Asymmetric / Focal Loss for severe class imbalance.
  - Self-contained training and ablation script (`train_convectnet.py`) with reproducible loss logging and checkpoint generation.

R3. Physics-Grounded AI Explainer & Telemetry Tracking:
- Feature attribution module computing atmospheric contribution scores (VIL density, Z_max core height, cloud-top cooling rate, freezing level proximity).
- Operational telemetry and analytics tracking: inference latency (<50 ms), prediction confidence bands, verification skill logs.

R4. Full Interactive 4D Storm Anatomy Scrollytelling Experience:
- Cinematic, scroll-driven interactive narrative ('Anatomy of a Cloudburst: 60 Minutes to Catastrophe') integrated into ConvectNow WebGIS dashboard.
- Physical phases with parallax reveals: (1) Convective Initiation -> (2) Rapid Explosive Updraft -> (3) Hail Core Suspended Aloft -> (4) Downdraft Collapse & Extreme Cloudburst -> (5) Ground Impact & Flash Flood.
- Vertical radar reflectivity cross-sections (Z vs Height 0-18 km), isotherm levels (0°C, -20°C), and live AI hazard telemetry updating dynamically on scroll.
- Adherence to 'Ice and Ships' design tokens (`DESIGN.md`).

Acceptance Criteria:
- Automated data loader cleanly yields multi-modal batches `(B, C, T, H, W)` without corrupt frames.
- `ConvectNet` successfully runs forward pass, backpropagates gradients with custom asymmetric loss without NaN/Inf, and achieves training convergence.
- Inference engine returns all 4 hazard predictions for a storm frame in <50 ms.
- 4D Storm Anatomy scrollytelling panel renders smoothly at 60 FPS with sticky parallax visuals and fluid scroll progress tracking.
- AI feature attribution panel highlights top physical drivers for any selected storm cell.
- Frontend compiles cleanly with `npm run build` with zero TypeScript errors.

Follow your orchestration protocol: maintain plan.md, progress.md, and context.md in your working directory. Regularly update progress.md so sentinel liveness and progress crons can monitor your progress. When completely finished, deliver handoff.md and report completion.
