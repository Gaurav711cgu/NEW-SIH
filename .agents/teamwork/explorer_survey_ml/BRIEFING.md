# BRIEFING — 2026-09-24T18:35:00+05:30

## Mission
Investigate ConvectNow ML architectures, models, training scripts, physics explainer, and map the comprehensive design for ConvectNet multi-task spatiotemporal deep learning pipeline.

## 🔒 My Identity
- Archetype: explorer
- Roles: ConvectNet Architecture & ML Explorer
- Working directory: /Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/explorer_survey_ml
- Original parent: d0784e53-b81c-499e-9374-bb22d977699a
- Milestone: Phase 1 ConvectNow Codebase Survey & ConvectNet Design Mapping

## 🔒 Key Constraints
- Read-only investigation — do NOT implement source code in convectnow/backend (reports/analysis in own folder only)
- Map unified PyTorch multi-task spatiotemporal neural network (`ConvectNet`) with 3D-CNN / Spatiotemporal ConvLSTM backbone (B, C, T, H, W)
- 4 task-specific heads: Hail, Cloudburst, Downburst, Convective Initiation
- Custom Asymmetric / Focal Loss formulation for severe class imbalance
- Self-contained training & ablation script (`train_convectnet.py`) design
- Physics-Grounded AI Explainer module (VIL density, Z_max core height, cooling rate, freezing level proximity)
- Operational telemetry & latency target <50 ms

## Current Parent
- Conversation ID: d0784e53-b81c-499e-9374-bb22d977699a
- Updated: 2026-09-24T18:40:15+05:30

## Investigation State
- **Explored paths**: `convectnow/backend/{server, hazard_engine, nowcaster, ingester, evaluator}.py`, `datasets/sevir/`, `CONVECTNOW_PRD.md`, `ORIGINAL_REQUEST.md`
- **Key findings**:
  - Existing backend is purely classical CV (Farnebäck optical flow) and single-frame empirical formulas.
  - Zero deep learning models currently integrated in `backend`.
  - PyTorch 2.12.1 is available with Apple Silicon MPS acceleration.
  - Discovered and solved PyTorch MPS limitation (`aten::_adaptive_avg_pool3d` unsupported) via 2D spatial pooling on temporal-squeezed feature maps.
  - Verified 3D-CNN inference latency of ~1.2 ms on Apple MPS/CPU and ConvLSTM latency of 8.4 ms on CPU (both far below 50 ms SLA).
  - Formulated Asymmetric Loss (ASL) and Asymmetric Continuous Loss (ACL) for severe class imbalance.
  - Formulated Physics Attribution module grounded in VIL density, Z_max core height, cloud-top cooling rate, and freezing level proximity.
- **Unexplored areas**: None for ML survey scope. Implementation phase will build the modules.

## Key Decisions Made
- Recommended lightweight 3D-CNN backbone with temporal collapse for maximum parallel throughput (<2 ms).
- Proposed 4 multi-task hazard heads sharing a unified 128-dim convective latent embedding.
- Designed dual asymmetric loss to handle <2% severe hazard frequency.
- Packaged complete findings into 5-component `handoff.md`.

## Artifact Index
- DISPATCH.md — Dispatch instructions and mission description
- BRIEFING.md — Persistent situational awareness
- progress.md — Liveness heartbeat and milestone tracking
- handoff.md — 5-component comprehensive investigation & architecture mapping report
