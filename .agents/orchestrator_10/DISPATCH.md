## 2026-09-24T02:59:35Z

You are the Project Orchestrator (teamwork_preview_orchestrator).
Your agent working directory for metadata (BRIEFING.md, task_plan.md, progress.md, findings.md) is:
`/Users/gauravkumarnayak/Desktop/new sih/.agents/orchestrator_10`

The project codebase directory is:
`/Users/gauravkumarnayak/Desktop/new sih/convectnow`

The authoritative user request is recorded in:
`/Users/gauravkumarnayak/Desktop/new sih/.agents/ORIGINAL_REQUEST.md` (specifically under header `## 2026-09-23T21:28:32Z`).

Project Summary & Requirements:
Build ConvectNow: an operational convective-scale nowcasting system (0–6h lead time, 1–2 km resolution) for the Ministry of Earth Sciences (MoES) / NCMRWF (SIH PS-26084).
- R1: Multi-Source Ingestion & Unified Analysis Cube (Radar NEXRAD proxy + IMD stub, Satellite GOES/INSAT-3DR TIR/WV proxy, GLM lightning, NWP HRRR fields -> 1km EPSG:4326 5-min cadence xarray analysis cube, GateFilter, velocity dealiasing).
- R2: Dual-Horizon Spatio-Temporal Nowcasting Engine (0-2h PySTEPS Lagrangian advection with VET 24-member ensemble; 2-6h EarthFormer/SimVP spatiotemporal model + HRRR BMA blending; TINT cell tracking).
- R3: Four-Parameter Convective Hazard Physics Engine (Lightning strike density XGBoost + SHAP, Severe Hail SHI/POSH Witt et al. 1998, Downburst wind velocity Wet-Bulb Zero/MDAP, Cloudburst detection Z-R >100mm/hr morphological filter).
- R4: Real-Time WebGIS Command Dashboard & ETA Dispatcher (React / MapLibre GL / Leaflet, animated 1-2km hazard rasters, cell centroids/vectors/severity tiers, arrival countdowns ETA +/- uncertainty, Tactical Command vs Public Warning Card, NDMA CAP v1.2 XML export).
- R5: Scientific Verification & Replay Suite (CSI >= 0.35 at 1h, POD, FAR, FSS at 5/10/20/40km, Brier score, 3 replay event packets: Kolkata Kalbaisakhi, Delhi Downburst, Uttarakhand Cloudburst).

Please decompose the project, spawn specialized workers/reviewers as needed following the Teamwork architecture, maintain progress in your working directory, and deliver a production-ready, fully verified implementation.
When complete, notify parent with full victory report.
