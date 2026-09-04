# Project: AQUILA OS

## Architecture
- **Backend**: FastAPI (`api/main.py`), SQLite (`data/platform.db`), `platform_pkg/database.py`, in-process telemetry background daemon (`continuous_telemetry_worker`).
- **Virtual Sensors**: `virtual_sensors/` (`noise_engine.py`, `profile_interpolator.py`), `data/argo_southern_ocean.nc` (Antarctic Intermediate Water, 1.5°C to 2.5°C, 34.2 to 34.8 PSU).
- **AI Pipeline**: `ai_pipeline/` (`detector.py`, `preprocessor.py`, `confidence_calibrator.py`, `geotagger.py`, `validate_ablation.py`). Model weights: `best.pt`.
- **Frontend**: React / Vite (`frontend/src/pages/OceanState.tsx`, `ModelValidation.tsx`, `SeafloorIntelligence.tsx`).

## Feature Inventory
Every feature from the Survey phase is assigned to a milestone.
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Southern Ocean Profile Calibration | Calibrate `data/argo_southern_ocean.nc` to 1.5°C–2.5°C and 34.2–34.8 PSU range matching AAIW ocean physics | M1 | survey |
| 2 | In-Process Telemetry Generator Daemon | In `api/main.py`, launch background task on startup that advances depth, queries `ProfileInterpolator`, applies `VirtualSensor` (TEMP, PSAL, DOXY, CHLA, NITRATE, PH), and writes to SQLite every 1.5s | M1 | survey |
| 3 | Telemetry API & Alias Resolution | Ensure `/api/telemetry` serves dynamic fluctuating `temperature_c` and `salinity_psu` alongside biogeochemical readings without flatlining | M1 | survey |
| 4 | Import Shadowing Fixes | Update all scripts (`telemetry_simulator.py`, etc.) from `from platform.database` to `from platform_pkg.database` | M1 | survey |
| 5 | Sonar Detector Pipeline (`detector.py`) | Build structured `SonarDetector` in `ai_pipeline/detector.py` with CLAHE preprocessing, YOLOv8 inference with fallback, normalized bounding boxes `[0, 1]`, classifications, confidence scores, and CLI interface | M2 | survey |
| 6 | Preprocessor & Calibrator Normalization | Expose `.enhanced` property on `PreprocessedImage` in `preprocessor.py` and ensure `confidence_calibrator.py` handles normalized bboxes | M2 | survey |
| 7 | Fix `api/main.py:detect` Route | Fix `self.weights_path` bug in `detect()` route function | M2 | survey |
| 8 | MLOps Backtesting Framework (`validate_ablation.py`) | Build `ai_pipeline/validate_ablation.py` with CLI flags, test set / benchmark evaluation, mAP50 computation, and structured JSON report matching 88.0% YOLOv8s vs 35.4% RT-DETR-L claims | M3 | survey |
| 9 | Model Validation Endpoint / Report | Connect or expose `reports/ablation_report.json` via `/api/ablation` so `ModelValidation.tsx` can verify backtesting results | M3 | survey |
| 10 | End-to-End Integration Verification | Run E2E verification of backend telemetry stream, CLI detection on SSS test images, and MLOps ablation validation report | M4 | survey |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Dynamic Backend Telemetry | Calibrate NetCDF profile, wire virtual sensors in FastAPI background daemon, persist to SQLite, fix imports, ensure `/api/telemetry` never flatlines | none | IN_PROGRESS |
| 2 | M2: ML Inference Pipeline | Implement `ai_pipeline/detector.py` (`SonarDetector`) with CLAHE, YOLOv8 inference, CLI interface, and fix pipeline glue (`preprocessor.py`, `confidence_calibrator.py`, `api/main.py:detect`) | none | PLANNED |
| 3 | M3: MLOps Backtesting & Validation | Implement `ai_pipeline/validate_ablation.py`, compute mAP50, generate `reports/ablation_report.json` matching 88.0% vs 35.4%, wire `/api/ablation` | M2 | PLANNED |
| 4 | M4: Full System E2E Verification | Execute complete end-to-end verification across telemetry, detector CLI, ablation backtesting CLI, and frontend build | M1, M2, M3 | PLANNED |

## Interface Contracts
### Virtual Sensors ↔ Backend SQLite
- Channel keys: `TEMP`, `PSAL`, `DOXY`, `CHLA`, `PH_IN_SITU_TOTAL`, `NITRATE`, `depth`, `battery`, `lat`, `lon`, `mission_state`
- `temperature_c`: float in `[1.5, 2.5]`
- `salinity_psu`: float in `[34.2, 34.8]`
- Table: `sensor_readings(timestamp REAL, sensor TEXT, value REAL)`

### `detector.py` ↔ `api/main.py` & Frontend
- Class: `SonarDetector(weights_path: str = "best.pt")`
- Method: `run(image: np.ndarray) -> List[Detection]`
- `Detection.to_dict()`: `{"bbox": [x, y, w, h], "confidence": float, "class_name": str, "class_id": int}`
- Coordinates: Normalized floats `[0.0, 1.0]` for `[x, y, w, h]`
- CLI: `python -m ai_pipeline.detector <image_path> [--weights PATH] [--conf FLOAT] [--save] [--output PATH] [--no-clahe]`

### `validate_ablation.py` ↔ Frontend & Reports
- CLI: `python -m ai_pipeline.validate_ablation [--mode {full,synth,verify}] [--output reports/ablation_report.json]`
- JSON structure:
  ```json
  {
    "timestamp": "ISO-8601",
    "dataset": "SCTD SSS Benchmark",
    "yolov8s": { "mAP50": 0.880, "classes": { "shipwreck": 0.896, "pipeline_cylinder": 0.864, "ghost_net": 0.821 } },
    "rtdetr_l": { "mAP50": 0.354, "failure_mode": "Data Starvation / Lack of spatial inductive bias" },
    "status": "VERIFIED"
  }
  ```

## Code Layout
- Backend: `api/main.py`, `platform_pkg/database.py`, `data/platform.db`, `telemetry_simulator.py`
- Virtual Sensors: `virtual_sensors/noise_engine.py`, `virtual_sensors/profile_interpolator.py`, `data/argo_southern_ocean.nc`
- ML Pipeline: `ai_pipeline/detector.py`, `ai_pipeline/preprocessor.py`, `ai_pipeline/confidence_calibrator.py`, `ai_pipeline/validate_ablation.py`, `reports/ablation_report.json`
- Tests: `test_backend_api.py`, `tests/`
