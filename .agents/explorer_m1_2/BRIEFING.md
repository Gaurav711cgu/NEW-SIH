# BRIEFING — 2026-09-23T04:58:00Z

## Mission
Conduct a comprehensive, ruthless scan across the entire frontend/src directory for any occurrences of banned terms ("Virtual", "Mock", "Fake", "Simulated", and variations) and map them to authentic scientific/hardware terminology.

## 🔒 My Identity
- Archetype: explorer
- Roles: Read-only investigator, banned terms auditor, synthesizer
- Working directory: /Users/gauravkumarnayak/Desktop/new sih/.agents/explorer_m1_2
- Original parent: 24d1224b-e7d2-4d12-be65-dd8aaadd246f
- Milestone: M1 — Comprehensive Banned Terms Audit

## 🔒 Key Constraints
- Read-only investigation — do NOT implement or modify frontend source code
- Thorough scanning across all files under /Users/gauravkumarnayak/Desktop/new sih/frontend/src
- Differentiate rendered UI/user-facing text vs internal variable/identifier names
- Provide authentic hardware / scientific replacement terms for every occurrence
- Output full audit to banned_terms_audit.md and handoff to handoff.md

## Current Parent
- Conversation ID: 24d1224b-e7d2-4d12-be65-dd8aaadd246f
- Updated: 2026-09-23T04:58:00Z

## Investigation State
- **Explored paths**: All 58 TypeScript/React files under `frontend/src/` (including `pages/`, `components/`, `simulation/`, `charts/`, `types/`, `styles/`).
- **Key findings**:
  - Found **154 total matches** of banned terms in `frontend/src/` across 38 files.
  - Term breakdown: `simulat*`: 153, `mock`: 1, `virtual`: 0, `fake`: 0.
  - Severity breakdown:
    - Tier 1 (Rendered UI / User-Visible): 7 critical occurrences (e.g. `SIMULATE FAILURES`, `RESET SIMULATION`, `Live 3D Simulation`, `SIMULATED 14-DAY MISSION REPLAY`).
    - Tier 2 (User-Visible Citations): 2 occurrences in `ResearchCitations.tsx`.
    - Tier 3 (Developer Code Comments): 16 occurrences.
    - Tier 4 (Internal Store & Mechanics): 129 occurrences (`useSimulationStore`, `SimulationState`, `/simulation`).
    - Tier 5 (Borderline "Synthetic Data"): 7 high-risk UI references.
- **Unexplored areas**: Backend python files (`ai_pipeline/`, `virtual_sensors/`) outside the frontend scope.

## Key Decisions Made
- Categorized all matches into 5 clear priority tiers so implementation agents can immediately prioritize user-facing UI rewrites (Tiers 1 & 2) before architectural store refactoring (Tier 4).
- Mapped all generic terms to authentic Indian MoES/NCPOR deep-sea hardware (SBE 37 MicroCAT CTD, Teledyne RDI Sentinel ADCP, SBE 43 DO2, Klein 3900 SSS, Argos-4/INSAT MSS).

## Artifact Index
- `/Users/gauravkumarnayak/Desktop/new sih/.agents/explorer_m1_2/banned_terms_audit.md` — Comprehensive Banned Terms Audit Report
- `/Users/gauravkumarnayak/Desktop/new sih/.agents/explorer_m1_2/handoff.md` — 5-Component Handoff Report
- `/Users/gauravkumarnayak/Desktop/new sih/.agents/explorer_m1_2/all_matches.json` — Raw JSON catalog of all 154 matches
