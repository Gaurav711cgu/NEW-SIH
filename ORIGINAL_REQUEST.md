# Original User Request

## 2026-09-03T17:50:58Z

# Teamwork Project Prompt — Draft

> Status: Step 9 — Assembled and ready for launch!
> Goal: Craft prompt → get user approval → delegate to teamwork_preview
> Requested team: Full multi-agent team (Backend Architects, ML Engineers, MLOps)

Develop the missing Machine Learning pipeline, MLOps backtesting framework, and dynamic backend telemetry for the AQUILA OS project. The goal is to replace all mocked/static data with a fully functional, production-ready edge AI inference engine and realistic virtual sensors.

Working directory: /Users/gauravkumarnayak/Desktop/new sih
Integrity mode: demo

## Requirements

### R1. Dynamic Backend Telemetry (Backend Architect)
The current SQLite database (`data/platform.db`) lacks `temperature_c` and `salinity_psu` data, causing the frontend charts to flatline. Wire up the `virtual_sensors` module (specifically `noise_engine.py` and `profile_interpolator.py`) to generate realistic water column data, persist it to the database, and serve it dynamically via the FastAPI `/api/telemetry` endpoint.

### R2. ML Inference Pipeline (ML Engineer)
The AI inference logic (`ai_pipeline/detector.py`) is missing. Build a structured ML pipeline script that accepts raw Side-Scan Sonar (SSS) imagery, applies CLAHE (Contrast Limited Adaptive Histogram Equalization) preprocessing, and runs YOLOv8 inference (mocked weights if necessary, but real pipeline architecture) to output bounding boxes, classifications, and confidence scores.

### R3. MLOps Backtesting & Validation (MLOps & Backtesting Frameworks)
Build an MLOps validation script (`ai_pipeline/validate_ablation.py`) that acts as our backtesting framework. It must programmatically evaluate a test set, calculate mAP50, and output a structured JSON report proving the 88.0% mAP (YOLOv8) vs 35.4% mAP (RT-DETR) ablation study claimed on the frontend.

## Acceptance Criteria

### Telemetry & Integration
- [ ] Running the backend continuously updates the SQLite database with fluctuating temperature (e.g., 1.5°C to 2.5°C) and salinity values.
- [ ] The React frontend charts dynamically graph this changing data without flatlining.

### ML & MLOps
- [ ] `ai_pipeline/detector.py` can be executed from the CLI to process an image and output detection coordinates.
- [ ] `ai_pipeline/validate_ablation.py` runs successfully and outputs a JSON metrics file that matches the frontend's statistical claims, providing a reproducible backtesting artifact for the judges.

## 2026-09-03T17:51:30Z

# Teamwork Project Prompt — Frontend Audit & Rewrite

> Status: Launched
> Goal: Audit the frontend UI, fix broken buttons, and rewrite to strip out fake claims.
> Requested team: Full multi-agent team (more thorough, absolute strictness)

Conduct a rigorous audit of the AQUILA OS React frontend codebase. Verify that all buttons and interactive elements work correctly and give exact, intended information. Critically review all text, data, and citations across the site to ensure absolute legitimacy—strip out and rewrite any fake claims, hallucinated data, or information that is not in the present/future scope of the project. Automatically rewrite the `.tsx` files to apply these fixes.

Working directory: /Users/gauravkumarnayak/Desktop/new sih/frontend
Integrity mode: development

## Requirements

### R1. Functional Button Audit
Crawl through the `.tsx` files in `src/pages/` and `src/components/`. Identify any broken buttons, dead links, or interactive elements that fail to trigger state changes. Rewrite the components to make them fully functional.

### R2. Strict Claim & Citation Verification
Review all written text, especially in `ResearchCitations.tsx`, `GovernmentIntel.tsx`, and `ModelValidation.tsx`. Ensure all claims match the established project facts (e.g., YOLOv8 88.0% mAP, ESP32 hardware, ₹75,000 cost vs ₹30 Lakh Argo, PS-26057 Ghost Net mandate). Remove anything that sounds like a hallucinated LLM artifact.

## Acceptance Criteria

### Functional
- [ ] No `onClick` handlers lead to undefined functions or dead states.
- [ ] Navigation buttons correctly route to existing pages.

### Data Integrity
- [ ] All citations and statistics reflect genuine claims, with zero placeholder text or nonsensical data.
- [ ] The codebase compiles successfully (`npm run build`) after the automated rewrites are complete.


## 2026-09-04T05:57:43Z

# Teamwork Project Prompt — Final Audit

> Status: Launched
> Goal: Run final app-wide audit
> Requested team: Full multi-agent team (Audit Specialists, Accessibility Experts)

Conduct a final pre-submission audit of the entire AQUILA OS application (Frontend and AI Pipeline) for the SIH 2026 Hackathon. The audit must rigorously evaluate accessibility compliance, agentic/MLOps action tracking, and verify that the UI and Deep Learning integration meet deployment standards.

Working directory: /Users/gauravkumarnayak/Desktop/new sih
Integrity mode: benchmark

## Requirements

### R1. Comprehensive Accessibility Audit
Scan the entire React frontend codebase (`frontend/src/`) for WCAG AA compliance. Ensure correct ARIA labels on dynamic intelligence charts, contrast ratios on the updated "slate/blue" theme, and semantic HTML structure.

### R2. Agentic Actions & ML Pipeline Audit
Audit the deep learning integration scripts (`ai_pipeline/train.py`, `validate_ablation.py`, `telemetry_edge_model.py`) and virtual sensors to ensure they operate deterministically. Validate that the edge inference engine properly catches edge cases (like extreme speckle noise).

### R3. Final Polish & Wrap-up
Flag any remaining console warnings, dead links, or placeholder "lorem ipsum" text across the application. 

## Acceptance Criteria

### Verification & Checkpoints
- [ ] Accessibility report generated confirming WCAG AA compliance or identifying critical actionable failures.
- [ ] Agentic / MLOps scripts are verified to execute without breaking the application state.
- [ ] A final "Audit Sign-off" summary is produced, clearing the project for the SIH Judges' review.
