# Project: AQUILA OS Frontend Audit & Rewrite

## Architecture
- **Framework**: React 19 + TypeScript + Vite + Tailwind CSS
- **Visualization**: Recharts, Three.js (@react-three/fiber, @react-three/drei), Lucide React
- **Directory Layout**:
  - `src/pages/`: Main application views (OceanState, GovernmentIntel, Biogeochemistry, SeafloorIntelligence, MissionControl, AUVTwin, ModelValidation, ResearchCitations)
  - `src/components/layout/`: Navigation sidebar (`Sidebar.tsx`), status row (`SystemStatusRow.tsx`), mission context (`MissionContext.tsx`)
  - `src/components/ui/`: UI primitives
  - `src/styles/`: `globals.css` and `index.css`

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | F1. Fix Dead Triage Button | Add functional `onClick` to "Review / Flag for AUV Revisit" in `SeafloorIntelligence.tsx:892` | M1 | Survey (Explorer 1, 3) |
| 2 | F2. Functional Export Actions | Replace dummy `alert()` calls in `GovernmentIntel.tsx:537-548` with real GPX download, `window.print()` PDF trigger, MoES and Satcom action states | M1 | Survey (Explorer 1, 3) |
| 3 | F3. Connect Depth Slicing | Connect `selectedDepth` in `Biogeochemistry.tsx:233-246` to depth chart / inspection slice | M1 | Survey (Explorer 1) |
| 4 | F4. Wildcard Route Resiliency | Add `<Route path="*" element={<Navigate to="/ocean-state" replace />} />` in `src/App.tsx` | M1 | Survey (Explorer 1, 3) |
| 5 | F5. Ingest HUD Index Styles | Import `src/index.css` in `src/main.tsx` to enable `.scanlines` and `.glitch-text` HUD styling | M1 | Survey (Explorer 3) |
| 6 | F6. Standardize Model Claims | Purge stale `YOLOv9` and active `RT-DETR` claims in `ResearchCitations.tsx` and `AUVTwin.tsx`; unify on `YOLOv8s` (88.0% mAP50) and isolate RT-DETR to `ModelValidation.tsx` baseline (35.4% mAP50) | M2 | Survey (Explorer 2, 3) |
| 7 | F7. Ground Hardware Specs | Align hardware across all pages to ESP32 DevKit v1 + Raspberry Pi 4 4GB (₹6,100 BOM); fix Pi 5 typo in `OceanState.tsx:498`; mark Jetson Orin NX as post-selection upgrade | M2 | Survey (Explorer 2, 3) |
| 8 | F8. Unify Unit Economics | Highlight scale unit cost of ₹75,000 – ₹1,00,000 vs ₹25–30 Lakh commercial Argo float; clean up inflated component comparisons in `AUVTwin.tsx` | M2 | Survey (Explorer 2) |
| 9 | F9. Purge Fake Citations & Hallucinations | Disentangle Urick/Blondel citations in `ResearchCitations.tsx`; clean CLAHE/CBAM citations; remove fake SAHI/EOS-80 Random Forest/ghost net in AI4Shipwrecks; replace residual `DeepScan` with `AQUILA` | M2 | Survey (Explorer 2, 3) |
| 10 | F10. Consolidate Problem Mandate | Consolidate `PS-1`, `PS-2`, `PS-26065` to official Smart India Hackathon `Problem Statement PS-26057`; strip Indian Monsoon forecasting and "Infinite Energy" claims | M2 | Survey (Explorer 2) |
| 11 | F11. Clean Compilation Verification | Verify `npm run build` and `npx tsc --noEmit` exit code 0 | M3 | Survey (Explorer 3) |
| 12 | F12. Full Gate Review & Sentinel Report | Independent verification of all interactive elements and factual claims, then report completion to sentinel | M3 | Project Brief |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Button | 1 | M1: Button & Navigation Remediation | Features F1, F2, F3, F4, F5 in `SeafloorIntelligence.tsx`, `GovernmentIntel.tsx`, `Biogeochemistry.tsx`, `App.tsx`, `main.tsx` | none | PLANNED | Navigation Remediation | Features F1, F2, F3, F4, F5 in `SeafloorIntelligence.tsx`, `GovernmentIntel.tsx`, `Biogeochemistry.tsx`, `App.tsx`, `main.tsx` | none | IN_PROGRESS |
| 2 | M2: Claim | 2 | M2: Claim & Citation Verification | Features F6, F7, F8, F9, F10 in `ResearchCitations.tsx`, `AUVTwin.tsx`, `OceanState.tsx`, `ModelValidation.tsx`, `GovernmentIntel.tsx`, `Biogeochemistry.tsx` | M1 | PLANNED | Citation Verification | Features F6, F7, F8, F9, F10 in `ResearchCitations.tsx`, `AUVTwin.tsx`, `OceanState.tsx`, `ModelValidation.tsx`, `GovernmentIntel.tsx`, `Biogeochemistry.tsx` | M1 | IN_PROGRESS |
| 3 | M3: Integration Verification | 3 | M3: Integration Verification & Gate Review | Features F11, F12, F13, F14 | M1, M2 | PLANNED | Gate Review | Features F11, F12, F13, F14 | M1, M2 | IN_PROGRESS |

## Interface Contracts
### Button Handlers
- `SeafloorIntelligence.tsx`: Flag button updates state of flagged items with visual feedback badge (`FLAGGED FOR AUV REVISIT`).
- `GovernmentIntel.tsx`:
  - GPX export triggers Blob download of XML formatted GPX waypoints (`waypoints.gpx`).
  - PDF export triggers `window.print()`.
  - MoES export triggers submission modal/toast with timestamp and reference ID.
  - Satcom export triggers satcom burst transmission simulation modal/toast with packet hex.
- `Biogeochemistry.tsx`:
  - `selectedDepth` sets a reference line on the depth transect chart and displays sliced metric telemetry for that depth.
- `App.tsx`:
  - Unknown routes redirect to `/ocean-state`.

## Code Layout
- `frontend/src/App.tsx`: Routing
- `frontend/src/main.tsx`: Entry point & CSS imports
- `frontend/src/pages/SeafloorIntelligence.tsx`: Side-scan sonar analysis & triage queue
- `frontend/src/pages/GovernmentIntel.tsx`: MoES & regulatory intel and export actions
- `frontend/src/pages/Biogeochemistry.tsx`: Water column depth profiles & BGC analysis
- `frontend/src/pages/ResearchCitations.tsx`: Academic citations, DOIs, and scientific foundations
- `frontend/src/pages/AUVTwin.tsx`: 3D digital twin, hardware BOM, and edge sensor architecture
- `frontend/src/pages/OceanState.tsx`: Real-time telemetry, ocean state dashboard
- `frontend/src/pages/ModelValidation.tsx`: ML model benchmarks, ablation studies, and metrics
