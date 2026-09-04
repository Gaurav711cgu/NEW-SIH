# Project: AQUILA OS Final Pre-Submission Audit (SIH 2026 Hackathon)

## Architecture & Scope
AQUILA OS is an autonomous edge intelligence and ocean observation platform developed for SIH 2026.
It consists of:
1. React frontend (`frontend/src/`): Dashboard, dynamic intelligence charts, telemetry graphs, model validation, citations, and government intel UI.
2. AI Pipeline & Backend (`ai_pipeline/`, `virtual_sensors/`): Deep learning edge models, ablation validation, noise engine, telemetry models, and YOLOv8/RT-DETR inference.

## Feature Inventory & Audit Tracks
| # | Feature / Audit Area | Description | Milestone | Source | Status |
|---|----------------------|-------------|-----------|--------|--------|
| 1 | WCAG AA Accessibility Audit | ARIA labels on dynamic charts, slate/blue contrast ratios, semantic HTML in `frontend/src/` | M1 | ORIGINAL_REQUEST R1 | DONE |
| 2 | Agentic Actions & ML Pipeline Audit | Deterministic execution of `ai_pipeline/train.py`, `validate_ablation.py`, `telemetry_edge_model.py`, virtual sensors, and edge cases (extreme speckle noise) | M2 | ORIGINAL_REQUEST R2 | DONE |
| 3 | Final Polish & Hygiene Audit | Console warnings, dead links, placeholder / lorem ipsum text across the entire application | M3 | ORIGINAL_REQUEST R3 | DONE |
| 4 | Audit Sign-off & Synthesis | Cross-evaluation of audit evidence, remediation verification, and final sign-off report for judges | M4 | Acceptance Criteria | DONE |

## Milestones
| # | Name | Scope | Dependencies | Status | Key Outputs |
|---|------|-------|-------------|--------|-------------|
| 1 | M1: Accessibility Audit & Remediation | Full frontend WCAG AA, color contrast, ARIA scan & remediation | none | DONE | Dropzone accessible, skip link, contrast enhanced, reduced-motion, oxlint 0 warnings |
| 2 | M2: AI Pipeline & Edge Audit | MLOps script execution, determinism, speckle noise edge cases, integrity remediation | none | DONE | Binary ONNX autoencoder (7,086 B), train.py CLI dry-run, speckle noise IoU > 0.98 |
| 3 | M3: Polish & Hygiene Audit | Dead links, console logs/warnings, lorem ipsum | none | DONE | 0 console logs, 0 dead links, 0 lorem ipsum, exit 0 build |
| 4 | M4: Sign-off & Synthesis | Final synthesis and judge sign-off report | M1, M2, M3 | DONE | Full Audit Sign-off Artifact |
