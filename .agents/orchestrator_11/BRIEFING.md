# BRIEFING — 2026-09-23T21:50:15Z

## Mission
Build ConvectNow: an operational convective-scale nowcasting system (0–6h lead time, 1–2 km resolution) for MoES / NCMRWF (SIH PS-26084).

## 🔒 My Identity
- Archetype: teamwork_preview_orchestrator
- Roles: orchestrator, user_liaison, human_reporter, successor
- Working directory: /Users/gauravkumarnayak/Desktop/new sih/.agents/orchestrator_11
- Original parent: parent (ID: a24a3749-d4d9-4593-b623-9ae2e5c576b4)
- Original parent conversation ID: a24a3749-d4d9-4593-b623-9ae2e5c576b4

## 🔒 My Workflow
- **Pattern**: Project Orchestration (Dual Track: Implementation + E2E Testing)
- **Scope document**: /Users/gauravkumarnayak/Desktop/new sih/.agents/orchestrator_11/PROJECT.md
1. **Decompose**: Survey and decompose the 5 major requirements (R1: Ingestion, R2: Nowcasting, R3: Hazard Engine, R4: WebGIS Dashboard & ETA, R5: Verification & Replay).
2. **Dispatch & Execute**:
   - Survey phase: 3 parallel Explorers dispatched.
   - Milestone execution: Explorer -> Worker -> Reviewer -> Gate.
3. **On failure**: Retry -> Replace -> Skip -> Redistribute -> Redesign.
4. **Succession**: Threshold at 16 spawns.

## 🔒 Key Constraints
- NEVER write, modify, or create source code files directly.
- NEVER run build/test commands yourself — require workers to do so.
- NEVER investigate or explore the problem at the code level — dispatch Explorers.
- You MAY use file-editing tools ONLY for metadata/state files (.md) in your .agents/ folder.
- When invoking subagents, ALWAYS set Model: "pro" or Model: "flash" explicitly. NEVER omit Model or use "inherit".
- DO NOT CHEAT integrity policy strictly enforced.

## Current Parent
- Conversation ID: a24a3749-d4d9-4593-b623-9ae2e5c576b4
- Updated: 2026-09-23T21:49:15Z

## Key Decisions Made
- Architecture follows CONVECTNOW_PRD.md and SIH PS-26084 requirements.
- Metadata and tracking hosted in /Users/gauravkumarnayak/Desktop/new sih/.agents/orchestrator_11.
- Initial survey phase with 3 Explorers across: (1) Ingestion & Unified Cube, (2) Nowcasting & Hazard Physics, (3) WebGIS Dashboard & Verification Suite.

## Team Roster
| Agent | Type | Work Item | Status | Conv ID |
|-------|------|-----------|--------|---------|
| explorer_survey_1 | teamwork_preview_explorer | Survey R1: Ingestion & Unified Cube | in-progress | 276d6707-f9d2-4f44-83f1-66e8c72b2505 |
| explorer_survey_2 | teamwork_preview_explorer | Survey R2 & R3: Nowcast & Hazards | in-progress | c3095aba-2d28-494d-938b-335be3f64e50 |
| explorer_survey_3 | teamwork_preview_explorer | Survey R4 & R5: WebGIS & Verification | in-progress | 1861f1ea-80fc-42c4-b60b-08473664f012 |

## Succession Status
- Succession required: no
- Spawn count: 3 / 16
- Pending subagents: 276d6707-f9d2-4f44-83f1-66e8c72b2505, c3095aba-2d28-494d-938b-335be3f64e50, 1861f1ea-80fc-42c4-b60b-08473664f012
- Predecessor: none
- Successor: not yet spawned

## Active Timers
- Heartbeat cron: be5f2328-fe0a-4ef6-b874-48f1f9f00f44/task-12
- Safety timer: none

## Artifact Index
- /Users/gauravkumarnayak/Desktop/new sih/.agents/orchestrator_11/BRIEFING.md — Persistent memory
- /Users/gauravkumarnayak/Desktop/new sih/.agents/orchestrator_11/progress.md — Liveness & execution progress
- /Users/gauravkumarnayak/Desktop/new sih/.agents/orchestrator_11/task_plan.md — Detailed task plan
- /Users/gauravkumarnayak/Desktop/new sih/.agents/orchestrator_11/PROJECT.md — Global architecture, milestones & feature inventory
- /Users/gauravkumarnayak/Desktop/new sih/.agents/orchestrator_11/findings.md — Synthesized technical findings
- /Users/gauravkumarnayak/Desktop/new sih/.agents/orchestrator_11/GATE_STATUS.md — Milestone gate verdicts
- /Users/gauravkumarnayak/Desktop/new sih/.agents/orchestrator_11/DEAD_ENDS.md — Dead ends log
