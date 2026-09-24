# Original User Request

## 2026-09-24T13:00:59Z

# Teamwork Project Prompt — ConvectNow Deep Learning & Scrollytelling Suite

> Status: Launched
> Goal: Multi-task PyTorch deep learning models for convective hazards, dual real-world data pipelines, physics-informed AI explainer, and interactive 4D storm anatomy scrollytelling experience (SIH PS-26084)
> Requested team: Full multi-agent team (Deep Learning Specialists, Data Engineers, Scroll Architects, Met Experts)

Build the Deep Learning Hazard Suite, End-to-End Data Pipeline, and Interactive Scrollytelling Experience for ConvectNow (MoES / NCMRWF · SIH PS-26084). The system ingests multi-source data (IMD DWR, MOSDAC INSAT-3DR, and SEVIR benchmarks), trains a unified Karpathy-grade PyTorch multi-task network (ConvectNet) for simultaneous prediction of Severe Hail, Cloudbursts, Downbursts, and Convective Initiation, provides physics-grounded AI feature attribution, and presents an interactive 4D scrollytelling experience exploring the physical lifecycle of severe convective storms.

Working directory: /Users/gauravkumarnayak/Desktop/new sih/convectnow
Integrity mode: development

## Requirements

### R1. Dual Real-World Data Sourcing & Ingestion Pipeline (/data-engineer, /data-scientist)
- Ingest real-world meteorological streams from live IMD Doppler Weather Radar (DWR) GeoServer feeds and MOSDAC INSAT-3DR multispectral products, synchronized with SEVIR high-resolution (1 km) convective storm cubes for reproducible evaluation.
- Implement robust asynchronous ingestion workers with automated quality-control filtering (ground clutter rejection, missing value imputation) and coordinate re-projection onto a uniform 1 km EPSG:4326 grid.

### R2. Unified Multi-Task PyTorch ConvectNet (/ml-engineer, /andrej-karpathy)
- Build a clean, zero-bloat, transparent PyTorch multi-task spatiotemporal neural network (`ConvectNet`):
  - 3D-CNN / Spatiotemporal ConvLSTM backbone processing 4D radar+satellite tensor sequences `(B, C, T, H, W)`.
  - Shared convective feature representation with 4 task-specific heads:
    1. **Hail Head**: Regression for Severe Hail Index (SHI), Probability of Severe Hail (POSH), and Maximum Estimated Size of Hail (MESH).
    2. **Cloudburst Head**: Binary classification and rainfall rate regression for $>100\text{ mm/hr}$ extreme events.
    3. **Downburst Head**: Peak surface wind gust velocity ($V_{db}$) regression.
    4. **Convective Initiation Head**: Probability score ($0.0 - 1.0$) for newly forming updraft cores.
  - Custom loss functions: Asymmetric Loss / Focal Loss to overcome severe class imbalance for rare high-impact events.
  - Self-contained training and ablation script (`train_convectnet.py`) with reproducible loss logging and checkpoint generation.

### R3. Physics-Grounded AI Explainer & Telemetry Tracking (/ai-analyzer, /analytics-tracking)
- Feature attribution module computing atmospheric contribution scores (e.g. VIL density, $Z_{max}$ core height, cloud-top cooling rate, freezing level proximity) for every detected storm cell.
- Operational telemetry and analytics tracking: inference latency, prediction confidence bands, and verification skill logs.

### R4. Full Interactive 4D Storm Anatomy Scrollytelling Experience (/scroll-experience)
- Build a cinematic, scroll-driven interactive narrative ("Anatomy of a Cloudburst: 60 Minutes to Catastrophe") integrated into the ConvectNow WebGIS dashboard:
  - Step-by-step physical phases with parallax reveals: (1) Convective Initiation $\to$ (2) Rapid Explosive Updraft $\to$ (3) Hail Core Suspended Aloft $\to$ (4) Downdraft Collapse & Extreme Cloudburst $\to$ (5) Ground Impact & Flash Flood.
  - Interactive vertical radar reflectivity cross-sections ($Z$ vs Height $0–18\text{ km}$), isotherm levels ($0^\circ\text{C}$, $-20^\circ\text{C}$), and live AI hazard telemetry updating dynamically as the user scrolls.
  - Full adherence to the "Ice and Ships" design tokens ([`DESIGN.md`](file:///Users/gauravkumarnayak/Desktop/new%20sih/DESIGN.md): `ocean-950` to `ocean-600`, `ice-500` `#00e5ff`, `steel-800`, `JetBrains Mono` for telemetry).

## Acceptance Criteria

### Deep Learning & Pipeline
- [ ] Automated data loader cleanly yields multi-modal batches `(B, C, T, H, W)` without corrupt frames.
- [ ] `ConvectNet` successfully runs forward pass, backpropagates gradients with custom asymmetric loss without NaN/Inf, and achieves training convergence.
- [ ] Inference engine returns all 4 hazard predictions for a storm frame in $<50\text{ ms}$.

### Scrollytelling & UI Integration
- [ ] The 4D Storm Anatomy scrollytelling panel renders smoothly at 60 FPS with sticky parallax visuals and fluid scroll progress tracking.
- [ ] The AI feature attribution panel highlights the top physical drivers for any selected storm cell.
- [ ] Frontend compiles cleanly with `npm run build` with zero TypeScript errors.
