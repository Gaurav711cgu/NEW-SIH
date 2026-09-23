# Task Plan: MoES / Antarctic Scientific Dashboard Overhaul

## Objective
Redesign the UI dashboards (`OceanState.tsx`, `GovernmentIntel.tsx`, and associated dashboard components) to achieve total authenticity for the Indian Ministry of Earth Sciences (MoES), NCPOR, and Maitri/Bharati Antarctic stations.

## Milestones & Tasks

### Phase 1: Survey & Codebase Technical Inspection
- [ ] Task 1.1: Dispatch Explorers to map all files in `frontend/src/` referencing `OceanState`, `GovernmentIntel`, dashboard telemetry panels, sensor lists, and search for occurrences of "Virtual", "Mock", "Simulation", "Fake" in user-facing UI text.
- [ ] Task 1.2: Explorer audit of text block length across `OceanState.tsx`, `GovernmentIntel.tsx`, `ResearchCitations.tsx`, `ModelValidation.tsx`, etc., identifying paragraphs exceeding 3 lines.
- [ ] Task 1.3: Explorer recommendations on scientific metrics (negative water temp, PSU salinity, dissolved oxygen, chlorophyll-a, carbon flux, ADCP, CTD, RT-DETR Sonar) and UI design enhancements (Tailwind glassmorphism, sparklines, badges).

### Phase 2: OceanState.tsx Redesign & Hardware Sensor Refactor
- [ ] Task 2.1: Dispatch Worker to refactor `OceanState.tsx` and related sensor panels.
- [ ] Task 2.2: Replace all mock/virtual sensor names with authentic hardware (CTD Profiler, Acoustic Doppler Current Profiler, SBE 43 Dissolved Oxygen, Sea-Bird Seapoint Fluorometer, RT-DETR High-Res Sonar).
- [ ] Task 2.3: Align metrics to authentic Antarctic oceanographic ranges (-1.8°C to +1.2°C, 33.8 to 34.7 PSU, etc.).
- [ ] Task 2.4: Introduce sparkline charts, status indicators, and MoES/Bharati Station telemetry linkages.

### Phase 3: GovernmentIntel.tsx Redesign & MoES / NCPOR Focus
- [ ] Task 3.1: Dispatch Worker to overhaul `GovernmentIntel.tsx`.
- [ ] Task 3.2: Break down all paragraph blocks into scannable lists, data grids, severity badges, and structured key-value cards (strict <= 3 lines per block rule).
- [ ] Task 3.3: Embed authentic Indian polar mission data: MoES Deep Ocean Mission, NCPOR Southern Ocean Expedition, Maitri & Bharati Antarctic station telemetry links, real-time SITREP format.
- [ ] Task 3.4: Add high-end UI styling: glassmorphism, glowing borders (`border-cyan-500/30`, `shadow-[0_0_15px_rgba(...)]`), micro-interactions, lucide-react iconography.
- [ ] Task 3.5: Build dedicated "Proposed System: Indigenous Autonomous Deep-Sea Architecture" section/tab in GovernmentIntel (or dedicated component) detailing:
  - Physical components: Titanium Grade 5 hull, AUV structure, payload mounting (CTD on nose, ADCP bottom-facing, RT-DETR forward SSS sonar, fluorometer portside, acoustic modem aft).
  - Interactive hardware inspection: Every component & sensor is clickable/hoverable to display a rich inspection modal/card with:
    1. Technical specs (model, power, interface, resolution/accuracy).
    2. Typical industry application (defense, commercial offshore surveying, oil & gas).
    3. MoES Indigenous & Polar Differentiator (how it is adapted uniquely for Antarctic autonomy, acoustic-satellite bridge, polar calibration).
  - Autonomous edge intelligence: Edge AI pipeline flowcards (Detection [YOLOv8/RT-DETR on Jetson Orin Nano] -> Processing [CLAHE speckle filtering] -> Converting [benthic anomaly vectorization] -> Compressing [Lossless zstandard telemetry encoding] -> Uplink [Acoustic to surface buoy -> INSAT-3DR / NavIC satellite relay]).
  - Visual layout: Structured hardware mounting schematic, animated/styled step-by-step pipeline cards, technical specification tables, no text block > 3 lines.

### Phase 4: Global Ban Scrub & Polish
- [ ] Task 4.1: Scrub all remaining occurrences of "Virtual", "Mock", or "Simulation" in dashboard navigation/headers/cards across the entire dashboard view.
- [ ] Task 4.2: Verify no single block of text exceeds 3 lines.

### Phase 5: Verification & Gate Review
- [ ] Task 5.1: Worker runs `npm run build` in `frontend/` to verify zero TypeScript or syntax errors.
- [ ] Task 5.2: Run screenshot capture via Playwright / Python test runner to generate high-resolution screenshots of the redesigned dashboards.
- [ ] Task 5.3: Dispatch Reviewer to audit code correctness, scannability, banned terms, and visual polish against acceptance criteria.
- [ ] Task 5.4: Orchestrator Gate evaluation and final handoff report.
