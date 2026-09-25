# Project: ConvectNow — Intelligence Dispatch & Citizen Warning System (Mausam App)

## Architecture
- **Framework**: React 19 + Vite 6 + TypeScript + Tailwind CSS 3.4 + Lucide Icons.
- **Location**: `/Users/gauravkumarnayak/Desktop/new sih/convectnow/frontend`
- **Target Components**:
  - `src/components/AdminIntelligencePanel.tsx`: MoES / SDMA command console for active storm selection, demographic exposure, building risk vulnerability, NDRF/SDRF battalion dispatch and alert radius broadcasting.
  - `src/components/CitizenWarningInterface.tsx`: Public Citizen alert interface (Mausam App POV) featuring mobile chassis simulation, incoming push notification banner, live storm arrival countdown, scannable NDMA SOP action cards, and turn-by-turn shelter navigation.
  - `src/types/dispatch.ts`: Data models and operational logic for demographic exposure, building vulnerability, NDRF battalions registry, and CAP alert broadcast payloads.
  - `src/App.tsx`: Integration into Tactical Command sidebar (toggle tab) and Public View (`viewMode === 'public'`), shared `dispatchedAlert` state.

## Feature Inventory
| # | Feature | Description | Milestone | Source | Status |
|---|---------|-------------|-----------|--------|--------|
| 1 | Storm Cell Selection & Telemetry | Select active storm cells (`CELL-701`, `CELL-702`, etc.) with centroid, velocity, heading, peak dBZ, and convective hazard profile | M1 | ORIGINAL_REQUEST §R1 | DONE |
| 2 | Demographic Risk & Population at Risk | Dynamic calculation of impacted population corridor ($A_{impact}$), critical jeopardy population ($P_{critical}$), and required evacuation count | M1 | ORIGINAL_REQUEST §R1 | DONE |
| 3 | Building Structural Vulnerability | BMTPC/NDMA 4-tier structural risk model: Type A (Kutcha/Slums), Type B (Semi-Pucca), Type C (Pucca RCC), Type D (Critical Lifeline) | M1 | ORIGINAL_REQUEST §R1 | DONE |
| 4 | Real-World NDRF/SDRF Proximity & Routing | Grounded registry of 16 NDRF battalions (Ghaziabad, Vijayawada, Cuttack, Guwahati, Arakkonam, etc.) with road distance, circuity factor, mobilization ETA, and direct radio link | M1 | ORIGINAL_REQUEST §R1 | DONE |
| 5 | Alert Radius & Dispatch Action | Configurable broadcast radius (5–50 km) with "Dispatch CAP Alert & Citizen Broadcast" button updating shared state and displaying broadcast confirmation | M1 | ORIGINAL_REQUEST §R1 | DONE |
| 6 | Mausam App Push Notification Simulator | Simulated incoming push alert from IMD Mausam with visual alert pulse, timestamp, and tap-to-open interaction | M2 | ORIGINAL_REQUEST §R2 | DONE |
| 7 | High-Visibility Storm Countdown Clock | High-contrast countdown timer showing minutes/seconds until severe storm impact at citizen location | M2 | ORIGINAL_REQUEST §R2 | DONE |
| 8 | Scannable NDMA SOP Action Cards | Clear, non-paragraph imperative guidelines with icons: (1) Seek Pucca Shelter, (2) Unplug Appliances, (3) Avoid Flood Water, (4) Stay Clear of Trees/Towers | M2 | ORIGINAL_REQUEST §R2 | DONE |
| 9 | Nearest Shelter GPS Navigation | Safe shelter card with distance, walking/driving ETA, route instructions, shelter capacity, and one-tap emergency call buttons (112, 1077, 1070) | M2 | ORIGINAL_REQUEST §R2 | DONE |
| 10 | Interactive Test Bench Controls | Controls to trigger mock dispatches, cycle storm events, toggle English/Hindi, and jump between Admin & Citizen views | M2 | ORIGINAL_REQUEST §R2 | DONE |
| 11 | Blizzard / Glassmorphism Design System | Deep obsidian/ocean canvas (`#131928`, `#0a0d15`), electric brand blue (`#38a8ff`), translucent frosted glass cards, and status health badges | M1, M2 | ORIGINAL_REQUEST §Acceptance Criteria | DONE |
| 12 | TypeScript Compilation & Visual Verification | Clean `npm run build` with zero TypeScript errors, verified with high-resolution Playwright screenshots | M3 | ORIGINAL_REQUEST §Verification | DONE |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M0 | Survey & Specification | Codebase, design tokens, and data models surveyed by 3 Explorers | None | DONE |
| M1 | Admin Intelligence Panel & Types | Implement `src/types/dispatch.ts` and `src/components/AdminIntelligencePanel.tsx`, wire into `App.tsx` | M0 | DONE |
| M2 | Citizen Warning Interface (Mausam App) | Implement `src/components/CitizenWarningInterface.tsx` and integrate into `App.tsx` public view | M1 | DONE |
| M3 | Visual Verification & Review | Playwright test script, screenshot capture, and TypeScript build verification | M1, M2 | DONE |

## Interface Contracts
### `src/types/dispatch.ts`
- Exports `DispatchedAlert`, `NDRFBattalion`, `DemographicRisk`, `NDMASopRule`, and helper functions `calculateImpactedPopulation()` and `calculateBattalionDistance()`.
- Grounded with real NDRF battalions (Ghaziabad 8th BN, Vijayawada 10th BN, Cuttack 3rd BN, Guwahati 1st BN, Arakkonam 4th BN, Haldwani 15th BN, etc.).

### `src/components/AdminIntelligencePanel.tsx`
- Props: `selectedCell: StormCell | null`, `onSelectCell: (cell: StormCell) => void`, `availableCells: StormCell[]`, `onDispatchAlert: (alert: DispatchedAlert) => void`, `onSwitchToCitizenView: () => void`.

### `src/components/CitizenWarningInterface.tsx`
- Props: `alert: DispatchedAlert | null`, `onBackToAdmin: () => void`, `onSimulateDispatch: (cellId: string) => void`.

## Code Layout
- `convectnow/frontend/src/types/dispatch.ts`: Data types, mathematical calculations, NDRF registry.
- `convectnow/frontend/src/components/AdminIntelligencePanel.tsx`: Admin command console.
- `convectnow/frontend/src/components/CitizenWarningInterface.tsx`: Mausam smartphone simulation & alert view.
- `convectnow/frontend/src/App.tsx`: State lifting (`dispatchedAlert`), tab switching, and navigation buttons.
- `convectnow/frontend/tests/visual_dispatch.spec.ts`: Playwright automated visual test.
- Visual artifacts: `.agents/teamwork/reviewer_visual_2/screenshots/`
