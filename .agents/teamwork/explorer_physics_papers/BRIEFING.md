# BRIEFING — 2026-09-24T22:50:00Z

## Mission
Conduct deep scientific research on the meteorological physics, mathematical equations, and peer-reviewed literature underpinning ConvectNow (MoES Convective Nowcaster / SIH PS 26084) to establish absolute scientific credibility for SIH judges.

## 🔒 My Identity
- Archetype: explorer
- Roles: Meteorological Physics & Research Explorer
- Working directory: /Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/explorer_physics_papers
- Original parent: 01fa6723-505c-42d6-9805-8207be998cb5
- Milestone: M1 / Exploratory Research & Scientific Validation

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Deliver structured research report to handoff.md following 5-component format
- Compile rigorous mathematical formulations (with full LaTeX equations, parameter definitions, SI units)
- Provide 4-6 real verifiable peer-reviewed papers with exact codebase mapping
- Explain physics-informed AI integration (ConvectNet loss penalties, physics explainer)
- Communicate completion to parent via send_message

## Current Parent
- Conversation ID: 01fa6723-505c-42d6-9805-8207be998cb5
- Updated: not yet

## Investigation State
- **Explored paths**:
  - `convectnow/backend/hazard_engine.py` (QPE, Marshall-Palmer, Tropical Z-R, Witt SHI/POSH/MESH, downburst gust, lightning density)
  - `convectnow/backend/models/convectnet.py` (4D ConvLSTM + 3D-CNN with CBAM, 4 hazard heads, shared 128-D latent manifold)
  - `convectnow/backend/models/losses.py` (AsymmetricLoss, AsymmetricContinuousLoss with 3x penalty for under-prediction)
  - `convectnow/backend/nowcaster.py` (Farnebäck dense optical flow, Semi-Lagrangian advection, 10-member stochastic ensemble)
  - `convectnow/backend/cell_evolution.py` (convective cell lifecycle rates: dZ/dt, dArea/dt, dLightning/dt, -dTb/dt cooling)
  - `convectnow/backend/cell_tracker.py` (Hungarian bipartite matching for cell persistent tracking)
  - `convectnow/backend/data/quality_control.py` (TDBZ ground clutter filter, satellite AP ducting thermal gate, optical flow frame imputation)
  - `convectnow/backend/meteorological_verification.py` & `evaluator.py` (CSI, POD, FAR, HSS, GSS, FSS Roberts & Lean 2008, CRPS, Brier Skill Score)
  - `convectnow/frontend/src/components/scrollytelling/StormAnatomyScrolly.tsx` (4D physical storm lifecycle phases & Shapley feature attribution)
- **Key findings**:
  - Full mathematical derivations synthesized with LaTeX equations and SI units.
  - 7 peer-reviewed meteorological papers mapped directly to classes and line numbers.
  - ConvectNet's physics-informed architecture validated: 3x loss penalty for under-prediction, bounded Softplus activations, and latent manifold Shapley feature attribution.
  - Verification scripts tested and confirmed passing locally.
- **Unexplored areas**: None within the scope of meteorological physics investigation.

## Key Decisions Made
- Anchored all mathematical formulations in verified peer-reviewed literature with official DOIs.
- Explicitly documented the IMD operational standard ($Z = 300 R^{1.4}$) alongside Rosenfeld ($Z = 300 R^{1.5}$) and Marshall-Palmer ($Z = 200 R^{1.6}$) to demonstrate precise regional adaptation.
- Formulated all WMO/NCMRWF verification metrics (CSI, FSS, CRPS, BSS) for rigorous evaluation.

## Artifact Index
- DISPATCH.md — Incoming mission dispatch
- BRIEFING.md — Working memory and identity index
- progress.md — Liveness heartbeat and milestone tracker
- handoff.md — Complete scientific research and codebase mapping report (499 lines, verified)
