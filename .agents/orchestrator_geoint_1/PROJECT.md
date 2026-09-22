# Project: Geospatial Intelligence (GEOINT) Dispatcher for Industrial Fires (SIH PS-26162)

## Architecture
Autonomous GEOINT early-warning and dispatch pipeline integrating satellite thermal observations (NASA FIRMS VIIRS/MODIS), OpenStreetMap (OSM) infrastructure intelligence, machine learning classification (XGBoost), autonomous tactical situational report (SITREP) dispatching via Telegram Bot API, and an interactive 3D WebGIS Dashboard.

```
[ NASA FIRMS API ] ──► ingestion.py ──► data/firms_latest.json (>= 10 points)
                              │
                              ▼
[ OSM Overpass / Cache ] ──► train_model.py ──► model.pkl (XGBoost > 75% val acc)
                              │
                              ▼
                        dispatcher.py --test ──► SITREP JSON + Mock Telegram POST (200 OK)
                              │
                              ▼
                      webgis_dashboard ──► 3D WebGIS (Three.js + React 19, npm run build)
```

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Manus Planning Initialization | Initialize task_plan.md, findings.md, progress.md in ntro_fire_intel before code | M1 | ORIGINAL_REQUEST § R5 |
| 2 | Python Runtime Symlink/Venv | Setup venv/symlinks so naked `python` command maps to Python 3.14 with pre-installed ML libs | M1 | Survey Exp 1 & 3 |
| 3 | FIRMS Authentic Seed Dataset | Bundle 25 authentic Indian thermal anomalies across industrial corridors (Hazira, Jamnagar, Vizag, etc.) | M1 | Survey Exp 1 & 3 |
| 4 | NASA FIRMS Ingestion Engine | `ingestion.py` fetches active fires over India with robust fallback to guarantee >= 10 points | M2 | ORIGINAL_REQUEST § R1 |
| 5 | OSM Spatial Context Enrichment | Haversine distance and tag queries (2km radius) for industrial infrastructure | M2 | ORIGINAL_REQUEST § R2 |
| 6 | XGBoost Classifier Model | `train_model.py` trains XGBoost on 9 features and outputs serialized `model.pkl` with >75% val accuracy | M2 | ORIGINAL_REQUEST § R2 |
| 7 | SITREP JSON Generator | Standardized military/tactical SITREP with coords, FRP, classification, jurisdiction, Google Maps link | M3 | ORIGINAL_REQUEST § R3 |
| 8 | Telegram Alert Dispatcher | `dispatcher.py --test` executes HTTP POST with SITREP to mocked Telegram Bot API endpoint (200 OK) | M3 | ORIGINAL_REQUEST § R3 |
| 9 | 3D WebGIS Scaffolding | Vite + React 19 + TypeScript dashboard in `webgis_dashboard` linked to offline node_modules | M4 | ORIGINAL_REQUEST § R4 |
| 10 | 3D Geospatial Visualization UI | Three.js hardware-accelerated 3D scene with extruded thermal pillars, industrial zones, and alert feed | M4 | ORIGINAL_REQUEST § R4 |
| 11 | E2E Verification & Audit | Validate all 5 acceptance criteria (R1-R5) end-to-end with automated verification runner | M5 | ORIGINAL_REQUEST Acceptance |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Foundation & Manus Planning Setup | Create task_plan.md, findings.md, progress.md in ntro_fire_intel; setup python venv; prepare data/firms_seed.json & osm_cache.json | none | DONE (Verified R5 Manus memory, 25-point seed & gazetteer) |
| 2 | Ingestion & ML Pipeline | Implement ingestion.py (>=10 thermal points in data/firms_latest.json) and train_model.py (OSM enrichment + XGBoost -> model.pkl >75% accuracy) | M1 | DONE (Verified R1 >=10 points, R2 XGBoost 100% val acc -> model.pkl) |
| 3 | Autonomous Alert Dispatcher | Implement dispatcher.py with SITREP generator and mock Telegram HTTP POST endpoint supporting `--test` | M2 | DONE (Verified R3 dispatcher.py --test, SITREP JSON, Telegram mock HTTP 200 OK) |
| 4 | 3D WebGIS Dashboard | Build React/Next.js/Three.js dashboard in webgis_dashboard visualizing anomalies, infrastructure, alerts; verify npm run build | M1, M2, M3 | PLANNED |
| 5 | Comprehensive E2E Verification & Review | Run all acceptance tests: R1 (ingestion.py), R2 (train_model.py), R3 (dispatcher.py --test), R4 (npm run build), R5 (Manus memory audit) | M1, M2, M3, M4 | PLANNED |

## Interface Contracts
### Ingestion ↔ Enrichment & Classification
- Input: NASA FIRMS active fire feed or `data/firms_seed.json`.
- Output: `data/firms_latest.json` containing an array of objects:
  `{ "latitude": float, "longitude": float, "bright_ti4": float, "scan": float, "track": float, "acq_date": str, "acq_time": str, "satellite": str, "confidence": str, "version": str, "bright_ti5": float, "frp": float, "daynight": str }`.

### Classification ↔ Dispatcher
- Output Model: `model.pkl` (serialized XGBoost Classifier).
- Features (9): `[frp, brightness, bright_t31, temp_delta, osm_industrial_count, osm_min_dist_m, has_chemical_refinery, has_power_infrastructure, is_night]`.
- Classes: `0: Wildfire / Agricultural / Controlled Fire`, `1: Industrial Fire / High Threat HAZMAT`.

### Dispatcher ↔ Telegram API
- SITREP Structure:
  `{ "sitrep_id": str, "timestamp": str, "coordinates": { "latitude": float, "longitude": float }, "frp_mw": float, "classification": str, "threat_level": str, "confidence": float, "jurisdiction": { "district": str, "state": str, "station": str }, "google_maps_url": str, "evacuation_radius_m": int, "hazmat_alert": bool }`.
- Mock Endpoint: HTTP POST to `https://api.telegram.org/bot<TOKEN>/sendMessage` (intercepted via MockAdapter or local mock server, returning status 200).

### Backend Data ↔ WebGIS Dashboard
- WebGIS Data Sources: `data/firms_latest.json`, `data/sitreps_dispatched.json`, and GeoJSON industrial perimeters.
- Build Target: `npm run build` in `webgis_dashboard/` generates production bundle without error.

## Code Layout
```
ntro_fire_intel/
├── task_plan.md               # Manus Master Plan (R5)
├── findings.md                # Manus Technical Findings (R5)
├── progress.md                # Manus Real-Time Progress & 3-Strike Log (R5)
├── venv/                      # Python environment symlinked to system packages
├── data/
│   ├── firms_seed.json        # Authentic 25-point baseline thermal dataset
│   ├── firms_latest.json      # Output of ingestion.py (>= 10 active thermal points)
│   ├── osm_cache.json         # Spatial gazetteer of major Indian industrial clusters
│   └── sitreps_dispatched.json # Log of dispatched alert sitreps
├── ingestion.py               # NASA FIRMS data ingestion pipeline (R1)
├── train_model.py             # OSM Overpass enrichment + XGBoost training -> model.pkl (R2)
├── model.pkl                  # Serialized XGBoost classification model (>75% acc)
├── dispatcher.py              # Autonomous LLM/heuristic SITREP alert dispatcher (R3)
├── webgis_dashboard/          # 3D WebGIS Dashboard application (R4)
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   ├── node_modules -> ../../frontend/node_modules
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── components/
│       │   ├── ThreeScene.tsx  # Hardware-accelerated 3D thermal heat pillars & map
│       │   ├── SitrepFeed.tsx  # Live alert feed & SITREP inspector
│       │   ├── StatsHeader.tsx # Real-time telemetry metrics
│       │   └── MapControls.tsx # Camera orbit, filter by threat level
└── verify_all.py              # End-to-end verification script for R1-R5 acceptance criteria
```
