# Project Plan: AQUILA OS Development

## Objectives
Deliver the missing Machine Learning pipeline, MLOps backtesting framework, and dynamic backend telemetry for AQUILA OS per ORIGINAL_REQUEST.md.

## Phases and Milestones

### Phase 0: Survey & Architectural Mapping
- Dispatch 3 parallel Explorers:
  - Explorer 1: Survey Backend & Telemetry (`virtual_sensors/`, `backend/`, `data/platform.db`, `/api/telemetry`).
  - Explorer 2: Survey Frontend Telemetry Consumption (`frontend/` or UI components graphing temperature & salinity).
  - Explorer 3: Survey ML Pipeline (`ai_pipeline/`, SSS dataset/samples, YOLOv8 weights/dependencies, ablation claims).
- Synthesize findings into `PROJECT.md`.

### Phase 1: R1 - Dynamic Backend Telemetry
- Explorer / Spec Analysis: Map exact schema of `platform.db` and integration points in `virtual_sensors/noise_engine.py` & `profile_interpolator.py`.
- Worker: Wire virtual sensors to continuously generate fluctuating `temperature_c` (1.5°C to 2.5°C) and `salinity_psu`, persist to SQLite, update FastAPI `/api/telemetry` endpoint.
- Reviewer: Verify endpoint returns fluctuating data without flatlining and DB writes succeed.

### Phase 2: R2 - ML Inference Pipeline
- Explorer: Detail requirements for `ai_pipeline/detector.py`, SSS image format, CLAHE parameters, YOLOv8 model loading/execution, output schema (bboxes, class, conf).
- Worker: Implement `ai_pipeline/detector.py` with CLAHE preprocessing and YOLOv8 pipeline, CLI interface.
- Reviewer: Run CLI tests on sample SSS images, verify bounding boxes and confidence outputs.

### Phase 3: R3 - MLOps Backtesting & Validation Framework
- Explorer: Inspect test dataset, ground truths, frontend ablation metrics (88.0% mAP for YOLOv8 vs 35.4% mAP for RT-DETR).
- Worker: Build `ai_pipeline/validate_ablation.py` computing mAP50 and exporting structured JSON report.
- Reviewer: Execute script, verify JSON format and reproduced metrics.

### Phase 4: Full System E2E Verification & Reporting
- Run end-to-end acceptance checks:
  - Telemetry updates continuously without flatlining.
  - `detector.py` runs via CLI.
  - `validate_ablation.py` reproduces JSON metrics.
- Prepare final victory report and deliver to sentinel.
