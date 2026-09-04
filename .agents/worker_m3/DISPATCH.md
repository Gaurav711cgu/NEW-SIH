## 2026-09-03T18:07:30Z

You are Worker 3 (MLOps Engineer) on the AQUILA OS project.
Your assigned working directory is: /Users/gauravkumarnayak/Desktop/new sih/.agents/worker_m3/
You must create and work within your assigned directory for your handoff and notes.

MANDATORY INPUT:
Read /Users/gauravkumarnayak/Desktop/new sih/.agents/ORIGINAL_REQUEST.md before starting work.
Also read:
- /Users/gauravkumarnayak/Desktop/new sih/.agents/orchestrator_1/PROJECT.md
- /Users/gauravkumarnayak/Desktop/new sih/.agents/explorer_survey_3/survey_mlops.md
- /Users/gauravkumarnayak/Desktop/new sih/.agents/explorer_survey_3/handoff.md
- /Users/gauravkumarnayak/Desktop/new sih/.agents/worker_m2/handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A reviewer/auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

EXCLUSIVE WRITE OWNERSHIP:
`ai_pipeline/validate_ablation.py`, `reports/`

YOUR OBJECTIVES (Milestone 3 - MLOps Backtesting & Validation Framework):
1. Build `ai_pipeline/validate_ablation.py`:
   - Acts as a programmatic MLOps backtesting and validation framework evaluating side-scan sonar (SSS) detection models.
   - CLI execution support with `argparse`:
     - `--yolo-weights` (default: `best.pt`)
     - `--rtdetr-weights` (default: `models/stage2_rtdetr_sctd/weights/best.pt` or `rtdetr-l.pt`)
     - `--data` (default: `dataset/data.yaml`)
     - `--mode` (choices: `full`, `synth`, `verify`, default: `verify`)
     - `--output` (default: `reports/ablation_report.json`)
     - `--device` (default: auto `cuda`/`mps`/`cpu`)
     - `--conf` (default: 0.25)
     - `--iou` (default: 0.50)
   - Programmatic evaluation logic:
     - Implements mAP50 calculation (IoU >= 0.50), Precision, Recall, and F1-score.
     - Evaluates or benchmarks YOLOv8s against RT-DETR-L on SSS domain characteristics (acoustic shadow extraction, few-shot convergence vs ViT data starvation).
     - Outputs and proves the empirical ablation study claimed in `frontend/src/pages/ModelValidation.tsx`:
       - YOLOv8s: 88.0% mAP50 (Shipwrecks: 89.6%, Pipelines/Cylinders: 86.4%, Ghost Nets: 82.1%). Precision: ~87.4%, Recall: ~84.1%, Params: 11.1M, Compute: 28.6 GFLOPs, Inductive Bias: High (CNN).
       - RT-DETR-L: 35.4% mAP50 (Shipwrecks: 38.2%, Pipelines/Cylinders: 34.8%, Ghost Nets: 29.1%). Precision: 55.8%, Recall: 32.7%, Params: 31.9M, Compute: 105.4 GFLOPs, Inductive Bias: None (ViT, catastrophic acoustic data starvation).
     - In `full` mode: runs live PyTorch/Ultralytics inference on available validation images (`dataset/yolo_format/images/val` or `testing_images/`) and incorporates live metrics.
     - In `verify` or `synth` mode: executes standardized reproducible backtesting benchmark across acoustic physics perturbations (Rayleigh speckle, shadow attenuation).
   - Generates a rich, formatted ASCII summary table printed to stdout.
   - Saves structured JSON report to `--output` (`reports/ablation_report.json`).
2. VERIFICATION:
   - Run: `./venv/bin/python ai_pipeline/validate_ablation.py --mode verify --output reports/ablation_report.json`
   - Run: `./venv/bin/python ai_pipeline/validate_ablation.py --mode synth`
   - Verify that `reports/ablation_report.json` is generated, valid JSON, and proves the 88.0% vs 35.4% mAP comparison matching frontend claims.
   - Verify acceptance criterion: "`ai_pipeline/validate_ablation.py` runs successfully and outputs a JSON metrics file that matches the frontend's statistical claims, providing a reproducible backtesting artifact for the judges."
