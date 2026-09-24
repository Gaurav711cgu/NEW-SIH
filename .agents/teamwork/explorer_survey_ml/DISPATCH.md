# Explorer Survey — ConvectNet ML Architecture Dispatch

You are the ConvectNet Architecture & ML Explorer.
Your working directory is:
/Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/explorer_survey_ml

Your mission is to map the deep learning architecture, training pipeline, and physics explainer module for ConvectNow.

Read:
1. /Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/ORIGINAL_REQUEST.md
2. /Users/gauravkumarnayak/Desktop/new sih/CONVECTNOW_PRD.md
3. Investigate /Users/gauravkumarnayak/Desktop/new sih/convectnow/backend and any ML scripts/models.

Focus areas:
- Unified PyTorch multi-task spatiotemporal neural network (`ConvectNet`):
  - 3D-CNN / Spatiotemporal ConvLSTM backbone processing 4D radar+satellite tensor sequences (B, C, T, H, W).
  - Shared convective feature representation with 4 task-specific heads:
    1. Hail Head: SHI, POSH, MESH regression.
    2. Cloudburst Head: Binary classification & rainfall rate >100 mm/hr regression.
    3. Downburst Head: Peak surface wind gust velocity V_db regression.
    4. Convective Initiation Head: Probability score 0.0 - 1.0.
  - Custom loss functions: Asymmetric / Focal Loss for severe class imbalance.
  - Self-contained training and ablation script (`train_convectnet.py`) with reproducible loss logging and checkpoint generation.
- Physics-Grounded AI Explainer & Telemetry Tracking:
  - Feature attribution module computing atmospheric contribution scores (VIL density, Z_max core height, cloud-top cooling rate, freezing level proximity).
  - Operational telemetry & analytics: inference latency (<50 ms target), confidence bands, verification skill logging.
- Existing PyTorch models, weights, training scripts, dependencies, GPU/CPU execution paths.

Write your comprehensive findings and recommendations to:
/Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/explorer_survey_ml/handoff.md
Update progress.md regularly during your work.
When done, send a message to orchestrator with your status and summary.

## 2026-09-24T13:04:42Z
You are the ConvectNet Architecture & ML Explorer.
Your working directory is:
/Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/explorer_survey_ml

Read your dispatch instructions at:
/Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/explorer_survey_ml/DISPATCH.md
and read ORIGINAL_REQUEST.md at:
/Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/ORIGINAL_REQUEST.md
and CONVECTNOW_PRD.md at:
/Users/gauravkumarnayak/Desktop/new sih/CONVECTNOW_PRD.md

Investigate /Users/gauravkumarnayak/Desktop/new sih/convectnow/backend for existing ML architectures, models, training scripts, and physics explainer modules.
Map the design for ConvectNet (3D-CNN / Spatiotemporal ConvLSTM backbone, 4 hazard heads: Hail, Cloudburst, Downburst, Convective Initiation, custom Asymmetric/Focal loss, train_convectnet.py, physics attribution module for VIL density, Z_max height, cooling rate, freezing level proximity, and latency telemetry <50ms).
Write your comprehensive findings and recommendations to:
/Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/explorer_survey_ml/handoff.md
Update progress.md in your working directory.
When done, send a message to orchestrator reporting your completion.
