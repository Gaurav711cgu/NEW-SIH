# Project: MoES / Antarctic Scientific Dashboard Overhaul

## Architecture
- **Framework**: React 19 + Vite + TypeScript + Tailwind CSS + Lucide Icons.
- **Location**: `/Users/gauravkumarnayak/Desktop/new sih/frontend`.
- **Target Dashboards**:
  - `frontend/src/pages/OceanState.tsx` (Benthic & Water Column Telemetry, Sensor Feeds, Hydrodynamics).
  - `frontend/src/pages/GovernmentIntel.tsx` (MoES / NCPOR Deep Ocean Mission, Maitri / Bharati Station Links, Policy, SITREP, Proposed System).
  - `frontend/src/pages/ResearchCitations.tsx` (MoES/NCPOR Publications, Scientific Papers, High-Density Scannable Cards).
  - Related dashboard sub-components, telemetry panels, sidebars, and navigation links.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | MoES / NCPOR Scientific Focus | Hydrodynamics, biogeochemistry, carbon sequestration, plankton/chlorophyll, Bharati/Maitri station links | M1, M2 | ORIGINAL_REQUEST §R1 |
| 2 | Strict Ban on "Virtual" / "Mock" | Eliminate "Virtual", "Mock", "Simulation", "Fake"; present actual hardware (CTD, ADCP, RT-DETR Sonar) | M1, M5 | ORIGINAL_REQUEST §R2 |
| 3 | Scannable, High-Density UI | Break down paragraphs into bullet points, data grids, sparkline charts, severity badges; max 3 lines per block | M2, M3, M4 | ORIGINAL_REQUEST §R3 |
| 4 | Proposed System: Indigenous & Autonomous | Physical AUV structure + 5-stage Edge AI pipeline (Detection->Processing->Converting->Compressing->Satellite uplink) with interactive hover/click cards (Specs, Industry Context, MoES Innovation) | M3 | ORIGINAL_REQUEST §R4 |
| 5 | ResearchCitations Scannability | Eradicate long paragraphs in ResearchCitations.tsx; convert to scannable cards, badges, and key-value specs | M4 | ORIGINAL_REQUEST §R3 |
| 6 | Peak UI Detailing & Military/Gov Aesthetics | Glassmorphism, subtle glowing borders, custom scrollbars, crisp lucide-react icons, operational telemetry feel | M2, M3, M4 | ORIGINAL_REQUEST §R4 |
| 7 | Clean TypeScript Build & Visual Verification | Zero errors on `npm run build` or `npx tsc --noEmit`; screenshot capture via Playwright showing high-end aesthetic | M6 | ORIGINAL_REQUEST §Verification |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Survey & Technical Assessment | Audit OceanState.tsx, GovernmentIntel.tsx, ResearchCitations.tsx for text blocks, banned terms, telemetry metrics, and Proposed System integration | none | DONE |
| M2 | OceanState.tsx Redesign | Refactor hydrodynamics, water column, hardware sensors (CTD, ADCP), sparklines, Antarctic ranges (-1.8°C, PSU) | M1 | DONE |
| M3 | GovernmentIntel.tsx & Proposed System | MoES / NCPOR Deep Ocean Mission, Bharati / Maitri station feeds, scannable SITREPs, and interactive Proposed System component | M1 | DONE |
| M4 | ResearchCitations.tsx Redesign | Break down all citations and research text into scannable cards, badges, methodology grids (<= 3 lines per block) | M1 | DONE |
| M5 | Global Ban Scrub & TypeScript Build | Remove any residual banned terms ("Virtual", "Mock", "Fake", "Simulated") across frontend/src, ensure clean build | M2, M3, M4 | DONE |
| M6 | Visual & Quality Gate Review | Capture screenshots via Playwright script, verify layout aesthetics, interactive components, reviewer sign-off | M5 | DONE |

## Interface Contracts
### Dashboard Component Contracts
- Zero TypeScript compile errors against Vite/React 19 build.
- Lucide React icons utilized consistently for operational hierarchy.
- Color palette: Deep obsidian/slate background (`bg-slate-950`), cyber/scientific cyan/emerald/amber status indicators, high-contrast typography (`text-slate-100`, `text-slate-400`).
- Responsive grid layouts with clear borders (`border-slate-800` / `border-cyan-500/20`), backdrop blur (`backdrop-blur-md`).
- Strict Scannability: No rendered text block exceeding 3 lines.
- Zero occurrences of banned terms ("Virtual", "Mock", "Fake", "Simulated") in user-facing UI.

## Code Layout
- `frontend/src/pages/OceanState.tsx`: Oceanographic telemetry and sensor analytics.
- `frontend/src/pages/GovernmentIntel.tsx`: MoES / NCPOR intelligence briefing and polar station telemetry.
- `frontend/src/pages/ResearchCitations.tsx`: Scientific literature citations and MoES reference catalog.
- `frontend/src/components/`: Reusable navigation, layout, HUD, and ProposedSystem widgets.
- `take_screenshot.py`: Playwright visual verification harness.
