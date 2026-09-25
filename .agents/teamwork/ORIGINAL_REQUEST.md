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

## 2026-09-24T22:46:09Z

# Teamwork Project Prompt — Draft

> Status: Launched
> Goal: Craft prompt → get user approval → delegate to teamwork_preview
> Requested team: Full team

Conduct deep scientific research and generate presentation-ready artifacts (architecture diagrams, bibliographies) for SIH PS 26084 (MoES Convective Nowcaster). The output must scientifically validate the MVP by perfectly mapping its inputs to real Indian government data sources (IMD DWR, INSAT-3D) and citing credible meteorological papers, proving the system is fully capable of handling live, real-world data.

Working directory: /Users/gauravkumarnayak/Desktop/new sih
Integrity mode: benchmark

## Requirements

### R1. Real-World Data Pipeline Architecture
Design a highly detailed 2D Data Flow Architecture (using Mermaid.js) that maps exactly how the MVP ingests, processes, and outputs data. It must explicitly state the real-world sources (e.g., IMD Doppler Weather Radar NetCDF files, INSAT-3DR Imager/Sounder data via MOSDAC API, IITM Lightning Location Network). No "virtual" or "simulated" terminology is allowed; frame the MVP as a production-ready staging environment waiting for live MoES streams.

### R2. Scientific Bibliography & Reference Documentation
Compile a heavily researched documentation artifact detailing the exact physics and equations used in the MVP. This must include credible, real-world research papers (e.g., Z-R relationships for rainfall, Hail detection algorithms, optical flow for nowcasting). This document will be directly copy-pasted into the team's SIH presentation slides to establish absolute credibility with the judges.

### R3. PS 26084 Alignment Audit
Review the exact wording of Smart India Hackathon Problem Statement 26084 (NCMRWF / MoES). Generate a mapping matrix showing how every single requirement of the PS (lead times, resolution, convective hazard types) is satisfied by the current MVP architecture.

## Acceptance Criteria

### Scientific Integrity & Credibility
- [ ] The architecture diagram contains zero references to "mock", "fake", or "synthetic" data.
- [ ] At least 4 real, verifiable meteorological research papers are cited with their specific application to the MVP's codebase (e.g., citing the specific algorithm used for cloudburst prediction).
- [ ] The data sources explicitly name actual Indian government portals/APIs (IMD, MOSDAC, NCMRWF).
- [ ] The output is formatted cleanly in a markdown artifact that the user can immediately use for their PowerPoint presentation.

## 2026-09-25T15:24:45Z

# Teamwork Project Prompt — Draft

> Status: Step 1 — Eliciting project idea
> Goal: Craft prompt → get user approval → delegate to teamwork_preview
> Requested team: Full team

Build an intelligence dispatch system and public alert view for the ConvectNow dashboard, allowing MoES administrators to route real-time severe weather alerts to rescue centers and citizens (via the Mausam app).

Working directory: /Users/gauravkumarnayak/Desktop/new sih/convectnow/frontend

## Requirements

### R1. Admin Intelligence Panel (MoES / SDMA)
Create a command interface that allows administrators to select an active storm cell and view impacted populations, building risks, and distance to the nearest NDRF/SDRF rescue centers. It must include a "Dispatch Alert" action to push warnings to the affected radius.

### R2. Citizen Warning Interface (Mausam App POV)
Create a customer-facing UI component simulating the "Mausam App" push notification and alert screen. When the admin dispatches an alert, this view should display the storm's ETA, NDMA-compliant SOPs (e.g., "Seek enclosed shelter", "Unplug appliances"), and navigation to the nearest safe rescue center.

## Acceptance Criteria

### Content and Layout
- [ ] The Admin panel successfully calculates and displays simulated risk metrics (population, building density) and lists nearby rescue centers.
- [ ] The Citizen view displays clear, scannable NDMA safety guidelines without relying on dense paragraphs.

### Verification
- [ ] An agent will visually verify the UI using playwright screenshots to ensure the styling matches the existing Blizzard/Glassmorphism design system.
- [ ] Both components render without TypeScript or compilation errors.


