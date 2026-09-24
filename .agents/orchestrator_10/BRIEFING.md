# BRIEFING — 2026-09-24T02:59:35Z

## Mission
Build ConvectNow: an operational convective-scale nowcasting system (0–6h lead time, 1–2 km resolution) for MoES / NCMRWF (SIH PS-26084) across R1 (Ingestion & Cube), R2 (Dual-Horizon Nowcasting), R3 (Hazard Physics Engine), R4 (WebGIS Command & ETA), and R5 (Scientific Verification & Replays).

## 🔒 My Identity
- Archetype: teamwork_preview_orchestrator
- Roles: orchestrator, user_liaison, human_reporter, successor
- Working directory: /Users/gauravkumarnayak/Desktop/new sih/.agents/orchestrator_10
- Original parent: parent
- Original parent conversation ID: a24a3749-d4d9-4593-b623-9ae2e5c576b4

## 🔒 My Workflow
- **Pattern**: Project Pattern (Survey -> Decompose & Delegate -> Iteration Loop -> Dual Track: Implementation + E2E Verification)
- **Scope document**: /Users/gauravkumarnayak/Desktop/new sih/PROJECT.md
1. **Decompose**: Survey codebase & requirements with 3 Explorers. Establish PROJECT.md with architecture, feature inventory, code layout, milestones, and interface contracts.
2. **Dispatch & Execute**:
   - Implementation Track: Milestone sub-orchestrators / workers with Explorer -> Worker -> Reviewer verification cycle.
   - E2E Verification Track: Requirement-driven test suite with test runners, synthetic/replay event verification, and meteorology metrics.
3. **On failure**:
   - Retry: nudge stuck agent or re-send task
   - Replace: spawn fresh agent with partial progress
   - Skip: proceed without (only if non-critical)
   - Redistribute: split stuck agent's remaining work
   - Redesign: re-partition decomposition
4. **Succession**: Spawn successor at 16 cumulative spawns when all subagents complete.
- **Work items**:
  1. Survey & Initial Codebase Reconnaissance [in-progress]
  2. Project Architecture & Milestone Plan (PROJECT.md) [pending]
  3. M1: Multi-Source Ingestion & Unified Analysis Cube (R1) [pending]
  4. M2: Dual-Horizon Spatio-Temporal Nowcasting Engine (R2) [pending]
  5. M3: Four-Parameter Convective Hazard Physics Engine (R3) [pending]
  6. M4: Real-Time WebGIS Command Dashboard & ETA Dispatcher (R4) [pending]
  7. M5: Scientific Verification & Replay Suite (R5) [pending]
  8. Final Milestone: E2E Integration, Verification & Demonstration [pending]
- **Current phase**: 0 (Survey & Reconnaissance)
- **Current focus**: Surveying existing codebase in /Users/gauravkumarnayak/Desktop/new sih/convectnow

## 🔒 Key Constraints
- DISPATCH-ONLY orchestrator: NEVER write, modify, or create source code files directly.
- NEVER run build/test commands yourself — require workers/reviewers to do so.
- NEVER investigate or explore code directly — dispatch Explorers.
- Use file-editing tools ONLY for metadata/state files (.md) in .agents/ folder or PROJECT.md.
- Never reuse a subagent after it has delivered its handoff — always spawn fresh.
- Always communicate with caller via send_message (Recipient: a24a3749-d4d9-4593-b623-9ae2e5c576b4).

## Current Parent
- Conversation ID: a24a3749-d4d9-4593-b623-9ae2e5c576b4
- Updated: 2026-09-24T02:59:35Z

## Key Decisions Made
- Selected Project Pattern with dual-track (Implementation + E2E Verification).
- Starting with Phase 0 Survey via 3 parallel Explorers to map existing files in `convectnow` and assess baseline libraries, dependencies, and structure.

## Team Roster
| Agent | Type | Work Item | Status | Conv ID |
|-------|------|-----------|--------|---------|
| explorer_survey_1 | teamwork_preview_explorer | Survey: Codebase & Environment Recon | in-progress | c822c6a3-3066-4cb5-b8d9-7b87362d9ca5 |
| explorer_survey_2 | teamwork_preview_explorer | Survey: R1-R3 Scientific & Physics Engine | in-progress | 0e2d4ad1-0bad-432b-9833-fad8bc4003ab |
| explorer_survey_3 | teamwork_preview_explorer | Survey: R4-R5 WebGIS Dashboard & Verification | in-progress | ac61a844-dad0-4d1c-b7f2-ffec81782475 |

## Succession Status
- Succession required: no
- Spawn count: 3 / 16
- Pending subagents: c822c6a3-3066-4cb5-b8d9-7b87362d9ca5, 0e2d4ad1-0bad-432b-9833-fad8bc4003ab, ac61a844-dad0-4d1c-b7f2-ffec81782475
- Predecessor: none
- Successor: not yet spawned

## Active Timers
- Heartbeat cron: 26cd34eb-3344-4dc7-a072-2131edd8cb38/task-10
- Safety timer: none
- On succession: kill all timers before spawning successor
- On context truncation: run manage_task(Action="list") — re-create if missing

## Artifact Index
- /Users/gauravkumarnayak/Desktop/new sih/.agents/ORIGINAL_REQUEST.md — Authoritative User Request
- /Users/gauravkumarnayak/Desktop/new sih/.agents/orchestrator_10/DISPATCH.md — Initial dispatch prompt
- /Users/gauravkumarnayak/Desktop/new sih/.agents/orchestrator_10/BRIEFING.md — Persistent working memory
- /Users/gauravkumarnayak/Desktop/new sih/.agents/orchestrator_10/progress.md — Liveness heartbeat & status tracking
