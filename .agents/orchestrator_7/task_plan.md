# Task Plan: MoES / Antarctic Scientific Dashboard Overhaul

## Objective
Resume and complete the comprehensive UI overhaul of the AQUILA OS frontend dashboards (`OceanState.tsx`, `GovernmentIntel.tsx`, and `ResearchCitations.tsx`), ensuring absolute authenticity for MoES and Bharati/Maitri Antarctic stations, presenting all data in scannable, premium military/scientific UI layouts with an interactive Proposed System.

## Phase Breakdown

### Phase 1: Survey & Codebase Technical Inspection (Explorers)
- [ ] Task 1.1: Dispatch Explorer 1 to audit `OceanState.tsx`, `GovernmentIntel.tsx`, and `ResearchCitations.tsx` for telemetry metrics, Antarctic scientific authenticity, and text blocks > 3 lines.
- [ ] Task 1.2: Dispatch Explorer 2 to scan the entire `frontend/src` directory for occurrences of banned terms ("Virtual", "Mock", "Fake", "Simulated" in rendered UI) and map exact file paths, line numbers, and proposed hardware replacements.
- [ ] Task 1.3: Dispatch Explorer 3 to inspect current architecture of `GovernmentIntel.tsx`, find integration point for the "Proposed System" component (Physical AUV architecture + 5-stage Edge AI pipeline: Detection -> Processing -> Converting -> Compressing -> Satellite Telemetry, with interactive hover/click cards).

### Phase 2: OceanState.tsx Redesign & Hardware Sensor Refactor (Worker)
- [ ] Task 2.1: Refactor `OceanState.tsx` to reflect genuine Southern Ocean / Antarctic telemetry (negative water temp: -1.8°C to -0.5°C, PSU salinity: 33.8 to 34.7 PSU, dissolved oxygen, chlorophyll-a).
- [ ] Task 2.2: Replace any mock/virtual sensor names with real oceanographic hardware (CTD Profiler, Acoustic Doppler Current Profiler, SBE 37 MicroCAT, Sea-Bird Fluorometer).
- [ ] Task 2.3: Break down all long descriptions into scannable key-value metric grids, sparkline charts, and status badges (strictly <= 3 lines per block).
- [ ] Task 2.4: Ensure Bharati & Maitri station telemetry links are featured cleanly.

### Phase 3: GovernmentIntel.tsx Redesign & Interactive Proposed System (Worker)
- [ ] Task 3.1: Overhaul `GovernmentIntel.tsx` to focus on Indian Deep Ocean Mission, NCPOR Southern Ocean expedition, Bharati & Maitri Antarctic station coordination.
- [ ] Task 3.2: Break down long policy and mission briefings into scannable cards, severity badges, and structured metric lists (strictly <= 3 lines per block).
- [ ] Task 3.3: Implement the interactive "Proposed System" section:
  - Physical Architecture: Titanium Grade 5 hull, AUV structure, payload mounting (CTD on nose, ADCP bottom-facing, SSS sonar array, acoustic modem aft, etc.).
  - 5-stage Edge AI Pipeline: Detection (YOLOv8/RT-DETR) -> Processing (CLAHE speckle filtering) -> Converting (benthic anomaly vectorization) -> Compressing (lossless compression) -> Satellite Telemetry (NavIC / INSAT-3DR relay).
  - Dynamic interactive cards on hover/click displaying: (a) Technical specifications, (b) Typical industry context, (c) Unique MoES differentiation/innovation.
- [ ] Task 3.4: Apply high-end military/scientific styling (glassmorphism, glowing borders, lucide-react icons, cyber/slate theme).

### Phase 4: ResearchCitations.tsx Scannability Refactoring (Worker)
- [ ] Task 4.1: Audit all citations and text blocks in `ResearchCitations.tsx`.
- [ ] Task 4.2: Eradicate all paragraphs > 3 lines, converting them into scannable citation cards, structured key-value specs, research badges, and DOI/methodology grids.
- [ ] Task 4.3: Verify all scientific citations and claims match authentic MoES/NCPOR publications and established project facts.

### Phase 5: Global Terminology Ban Scrub & TypeScript Build Verification (Worker)
- [ ] Task 5.1: Replace every remaining occurrence of "Virtual", "Mock", "Fake", or "Simulated" across all rendered UI in `frontend/src/` with authentic hardware/scientific terminology.
- [ ] Task 5.2: Execute `npm run build` or `npx tsc --noEmit` in `frontend/` and fix any compilation or type errors.

### Phase 6: Visual & Quality Gate Review (Reviewers + Screenshots)
- [ ] Task 6.1: Run Playwright screenshot capture script (`take_screenshot.py` or equivalent) across `OceanState`, `GovernmentIntel`, `ResearchCitations`, and the interactive Proposed System.
- [ ] Task 6.2: Dispatch Reviewer 1 to audit code correctness, banned term absence, scannability (<= 3 lines), and TypeScript compilation.
- [ ] Task 6.3: Dispatch Reviewer 2 to verify visual aesthetics, interactive hover/click cards, glassmorphism styling, and MoES authenticity.
- [ ] Task 6.4: Orchestrator Gate Evaluation & Final Report.
