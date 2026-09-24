# Task Plan — ConvectNow (MoES / NCMRWF SIH PS-26084)

## Architecture Overview
ConvectNow is structured into five core sub-systems:
1. M1: Multi-Source Ingestion & Unified Analysis Cube (Radar, Satellite, Lightning, NWP -> 1km xarray cube at 5-min cadence, GateFilter, dealiasing).
2. M2: Dual-Horizon Spatio-Temporal Nowcasting Engine (0-2h PySTEPS Lagrangian advection + VET 24-member ensemble; 2-6h Spatiotemporal ML/SimVP/EarthFormer + HRRR BMA blending; TINT storm tracking).
3. M3: Four-Parameter Convective Hazard Physics Engine (Lightning XGBoost + SHAP, Severe Hail SHI/POSH Witt 1998, Downburst Wet-Bulb Zero/MDAP, Cloudburst Z-R >100mm/hr filter).
4. M4: Real-Time WebGIS Command Dashboard & ETA Dispatcher (React + MapLibre/Leaflet, animated 1-2km rasters, cell centroids/vectors, arrival countdowns ETA +/- uncertainty, Tactical Command vs Public Warning Card, NDMA CAP v1.2 XML export).
5. M5: Scientific Verification & Replay Suite (CSI >= 0.35 at 1h, POD, FAR, FSS at 5/10/20/40km, Brier score, 3 Indian replay events: Kolkata, Delhi, Uttarakhand).

## Step-by-Step Plan
- [ ] Phase 0: Survey & Environmental Assessment
  - Explorer 1: Survey Ingestion & Data Preprocessing (Radar NEXRAD/IMD adapter, Satellite GOES/INSAT proxy, GLM, HRRR NWP, dependencies).
  - Explorer 2: Survey Nowcasting & Hazard Engine (PySTEPS, VET, TINT tracking, ML/EarthFormer/SimVP BMA, Hail/Downburst/Lightning/Cloudburst physics).
  - Explorer 3: Survey WebGIS Frontend, API Server, & Verification Suite (React frontend setup, MapLibre/Leaflet, NDMA CAP XML, verification metrics CSI/FSS/Brier, replay datasets).
- [ ] Phase 1: Milestone 1 — Ingestion & Unified Analysis Cube
- [ ] Phase 2: Milestone 2 — Dual-Horizon Nowcasting & TINT Tracking
- [ ] Phase 3: Milestone 3 — Four-Parameter Convective Hazard Engine
- [ ] Phase 4: Milestone 4 — WebGIS Command Dashboard & ETA Dispatcher
- [ ] Phase 5: Milestone 5 — Scientific Verification & Case Study Replays
- [ ] Phase 6: Final End-to-End Verification & Handoff to Parent
