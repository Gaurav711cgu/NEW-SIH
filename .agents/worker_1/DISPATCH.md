## 2026-09-03T18:00:14Z

You are Worker 1 on the AQUILA OS Frontend Remediation team.
Working directory: /Users/gauravkumarnayak/Desktop/new sih/.agents/worker_1
Authoritative User Request: /Users/gauravkumarnayak/Desktop/new sih/.agents/ORIGINAL_REQUEST.md (Read this file FIRST).
Project Scope: /Users/gauravkumarnayak/Desktop/new sih/PROJECT.md
Explorer 1 Analysis: /Users/gauravkumarnayak/Desktop/new sih/.agents/explorer_1/analysis.md
Target Codebase: /Users/gauravkumarnayak/Desktop/new sih/frontend

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A reviewer will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your Assigned Scope (Milestone 1: Functional Button & Navigation Remediation):
1. `src/pages/SeafloorIntelligence.tsx`:
   - Fix the dead button around line 892 ("Review / Flag for AUV Revisit") in the low-confidence triage cards.
   - Implement state (e.g. `flaggedForRevisit: Set<string>` or state array) that tracks which target card is flagged.
   - Attach an `onClick` handler that toggles the flag state for that detection ID.
   - Visually update the button/card state when flagged (e.g., show "FLAGGED FOR AUV REVISIT [CONFIRMED]" with emerald/amber styling and active badge).
2. `src/pages/GovernmentIntel.tsx`:
   - Replace the dummy `alert()` implementation in `handleExport` (lines 25-27, 537-548).
   - Implement genuine actions for all 4 export buttons:
     a. "DOWNLOAD GPX WAYPOINTS": Generate valid XML GPX string with GPS waypoints from the detection list, create a Blob with MIME `application/gpx+xml`, and trigger browser download of `aquila_mission_waypoints.gpx`.
     b. "EXPORT PDF REPORT": Execute `window.print()` to launch the native browser print / save-as-PDF dialog.
     c. "SEND TO MoES DASHBOARD": Update component state to show an active in-app submission banner/modal with reference ID `MOES-INCOIS-SIH2024-XXXX`, transmission timestamp, and success feedback.
     d. "SHARE VIA SATCOM": Update component state to show a Satcom Uplink simulation modal/banner displaying Argos-4/INSAT frequency (401.65 MHz), packet checksum, and confirmation.
3. `src/pages/Biogeochemistry.tsx`:
   - Connect the `selectedDepth` state (lines 233-246) so clicking depth slice buttons (`25m`, `50m`, `100m`, `200m`, `500m`, `1000m`) genuinely influences the view:
     - Add a visual `<ReferenceLine>` or cursor in the depth chart at `selectedDepth`.
     - Update depth inspector card metrics with interpolated values corresponding to the selected depth.
4. `src/App.tsx`:
   - Add `<Route path="*" element={<Navigate to="/ocean-state" replace />} />` as the final route in `<Routes>` so invalid URLs gracefully redirect.
5. `src/main.tsx`:
   - Import `src/index.css` (`import './index.css';`) so `.scanlines` and `.glitch-text` classes render their CRT/HUD effects properly.
6. Verification:
   - Run `npm run build` and `npx tsc --noEmit` inside `/Users/gauravkumarnayak/Desktop/new sih/frontend`. Ensure exit code 0 and zero TypeScript errors.

Write your changes report in `/Users/gauravkumarnayak/Desktop/new sih/.agents/worker_1/changes.md` and complete a structured handoff in `/Users/gauravkumarnayak/Desktop/new sih/.agents/worker_1/handoff.md`. Send a completion message when finished.
