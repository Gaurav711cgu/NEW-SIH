## 2026-09-23T05:00:00Z
You are worker_m2.
Your working directory is: /Users/gauravkumarnayak/Desktop/new sih/.agents/worker_m2
Exclusive write ownership: frontend/src/pages/OceanState.tsx ONLY. Do NOT edit any other files.

MANDATORY FIRST STEP:
Read the authoritative user request at:
/Users/gauravkumarnayak/Desktop/new sih/.agents/ORIGINAL_REQUEST.md

Read the survey findings:
- /Users/gauravkumarnayak/Desktop/new sih/.agents/explorer_m1_1/analysis.md
- /Users/gauravkumarnayak/Desktop/new sih/.agents/explorer_m1_2/banned_terms_audit.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

MISSION OBJECTIVES (OceanState.tsx):
1. Antarctic Oceanographic Telemetry:
   - Reflect authentic Southern Ocean / Antarctic seawater conditions: negative water temperatures (-1.8°C to -0.5°C), PSU salinity (33.8 - 34.7 PSU), dissolved oxygen, and chlorophyll-a.
   - Update default/fallback state to negative polar temperatures (e.g. -1.45°C).
   - Expand Recharts YAxis domain from the clipping [1.0, 3.0] to an adaptive/inclusive range like [-2.5, 2.5] so negative polar temperatures graph properly.
2. Logic Bugs & Alignment:
   - Fix inverted DOXY evaluation logic: doxy < 160 must indicate DEPLETED / HYPOXIC, not ELEVATED.
   - Re-anchor platform coordinates to Bharati Station / Prydz Bay Transect (69.4125°S, 76.1880°E) and include secondary telemetry link to Maitri Station (70.7667°S, 11.7333°E).
3. Authentic Hardware Terminology:
   - Zero occurrences of "Virtual", "Mock", "Fake", or "Simulated".
   - Replace generic "DL_REPLICATED" with authentic scientific hardware tags: Sea-Bird SBE 37 MicroCAT CTD, Teledyne RDI Sentinel V ADCP, Sea-Bird SBE 43 DO2 Optode, Sea-Bird Seapoint Fluorometer.
4. Scannability & High-End Detailing:
   - No single text block > 3 lines! Convert any long descriptions into structured metric grids, sparkline charts, and severity badges.
   - Apply military/scientific glassmorphism styling, subtle glowing borders (border-cyan-500/30), and lucide-react icons.
5. Verification:
   - Run `npm run build` or `npx tsc --noEmit` in `/Users/gauravkumarnayak/Desktop/new sih/frontend` to verify 0 errors.

OUTPUT REQUIREMENTS:
Document your exact changes in /Users/gauravkumarnayak/Desktop/new sih/.agents/worker_m2/changes.md
Write your formal handoff to /Users/gauravkumarnayak/Desktop/new sih/.agents/worker_m2/handoff.md
Send a completion message back using send_message.
