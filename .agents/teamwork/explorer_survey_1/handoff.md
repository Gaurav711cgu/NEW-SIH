# Comprehensive Architecture Survey & Integration Report

**Target Codebase**: `/Users/gauravkumarnayak/Desktop/new sih/convectnow/frontend`  
**Author**: `explorer_survey_1`  
**Timestamp**: 2026-09-25T15:35:00Z  
**Objective**: Codebase investigation, state management audit, and recommended integration architecture for **R1 (Admin Intelligence Panel)** and **R2 (Citizen Warning Interface / Mausam App POV)**.

---

## 1. Observation

### 1.1 Project Structure & Dependencies
- **File**: `/Users/gauravkumarnayak/Desktop/new sih/convectnow/frontend/package.json`
- **Core Dependencies**:
  - `react`: `^19.0.0`
  - `react-dom`: `^19.0.0`
  - `leaflet`: `^1.9.4`, `@types/leaflet`: `^1.9.16`
  - `lucide-react`: `^1.37.0`
  - `clsx`: `^2.1.1`
  - `tailwind-merge`: `^3.6.0`
- **Dev Dependencies**:
  - `vite`: `^6.0.11`
  - `typescript`: `~5.7.2`
  - `tailwindcss`: `^3.4.17`
- **Absence of Third-Party State/Router Libraries**:
  - No `react-router-dom`: routing is handled internally via React state in `App.tsx`.
  - No `zustand`, `redux`, or `@tanstack/react-query`: state is managed with React `useState` and `useEffect`.
- **Build Status**:
  - Command: `npm run build` (`tsc -b && vite build`)
  - Execution Result: Exit code `0`, built in `558ms`, generating `dist/assets/index-CGAyJi4Y.js` (450.38 kB) and `dist/assets/index-CUF7e3E7.css` (67.94 kB) with **0 TypeScript errors**.

### 1.2 Directory Layout & Component Tree
```
convectnow/frontend/
├── index.html                           # Font imports (Poppins, Archivo, Inter, JetBrains Mono) + Leaflet CSS
├── package.json                         # React 19 + Vite + Tailwind
├── tailwind.config.js                   # Blizzard tokens (ocean-950..600, ice-500, steel-800, health-*)
├── src/
│   ├── main.tsx                         # Entry point rendering <App />
│   ├── App.tsx                          # Root orchestrator with master state & view switcher
│   ├── index.css                        # Blizzard CSS classes (.btn-blizzard-primary, .card-blizzard)
│   ├── components/
│   │   ├── HazardMap.tsx                # Leaflet map, RainViewer radar, Open-Meteo, canvas overlays
│   │   ├── ETACountdown.tsx             # Target arrival countdown clocks with CAP Alert trigger
│   │   ├── HazardMeters.tsx             # 4 hazard parameters (Rain rate, POSH/MESH, Downburst, Lightning)
│   │   ├── CapAlertModal.tsx            # OASIS CAP v1.2 XML modal (copy / download)
│   │   ├── EvaluationPanel.tsx          # CSI, FSS, POD, FAR contingency verification benchmark modal
│   │   ├── ArchitecturePage.tsx         # 5-stage pipeline architecture diagram & scientific papers
│   │   ├── DataProvenanceBadge.tsx      # LIVE / DATASET / PLANNED provenance badges
│   │   ├── ConfidenceHUD.jsx            # Sensor freshness & evidence HUD
│   │   └── scrollytelling/
│   │       ├── StormAnatomyScrolly.tsx  # 5-phase 4D convective storm anatomy narrative
│   │       ├── VerticalRadarCrossSection.tsx
│   │       ├── AITelemetryHUD.tsx
│   │       ├── FeatureAttributionPanel.tsx
│   │       └── PhaseNavigationPill.tsx
│   └── pages/
│       └── HistoricalReplay.jsx         # Historical blind replay baseline comparison
```

### 1.3 Application Shell & Routing Structure (`App.tsx`)
From lines 41–42 of `src/App.tsx`:
```tsx
const [viewMode, setViewMode] = useState<'tactical' | 'anatomy' | 'public' | 'architecture'>('tactical');
```
The header (lines 179–222) features a pill switcher:
- `tactical` ("Tactical Command")
- `anatomy` ("4D Anatomy")
- `architecture` ("System Arch")
- `public` ("Public View")

When rendered:
1. `viewMode === 'architecture'`: Renders `<ArchitecturePage />` (lines 236–239).
2. `viewMode === 'anatomy'`: Renders `<StormAnatomyScrolly onBackToTactical={() => setViewMode('tactical')} />` (line 241).
3. `viewMode === 'tactical'`: Dual-column dashboard:
   - **Left/Center** (`flex-1 flex flex-col gap-3 min-w-0`):
     - `<HazardMap>` (lines 248–257)
     - 4D Timeline Scrubber Bar (lines 260–360) with Play/Pause, step backward/reset, 0–60 min slider, and Replay Event Selector.
   - **Right Aside** (`w-96 flex flex-col gap-3 shrink-0`):
     - Top half (`h-1/2`): `<ETACountdown stormCells={stormData?.storm_cells ?? []} onTriggerAlert={(cellId) => setActiveAlertCellId(cellId)} />` (lines 366–371).
     - Bottom half (`h-1/2`): `<HazardMeters summary={stormData?.hazard_summary ?? {}} selectedCell={selectedCell} onLaunchAnatomy={() => setViewMode('anatomy')} />` (lines 374–380).
4. `viewMode === 'public'`: Currently a basic card placeholder (lines 384–440) displaying:
   - "🔴 IMMEDIATE SEVERE STORM ALERT"
   - Expected Arrival & Max Intensity from `selectedCell`
   - Mandatory Safety Actions list
   - "Switch Back to Meteorological Command Dashboard" button

### 1.4 State Management & Storm Cell Data Flow
In `src/App.tsx`:
- `stormData`: Loaded from backend `http://localhost:8008/api/storm/{idx}` (lines 73–90).
- `selectedCell`: State initialized to `data.storm_cells[0]` upon fetch:
  ```tsx
  if (data.storm_cells && data.storm_cells.length > 0) {
    setSelectedCell(data.storm_cells[0]);
  }
  ```
- **How `selectedCell` is communicated**:
  - Passed down as a prop to `<HazardMap selectedCell={selectedCell} onSelectCell={setSelectedCell} ... />`
  - Passed down as a prop to `<HazardMeters selectedCell={selectedCell} ... />`
  - Consumed in the inline public view: `{selectedCell ? `${selectedCell.severity} THUNDERSTORM` : "SEVERE WEATHER ALERT"}`
- **Noticeable Current Gap in `HazardMap.tsx`**:
  - `HazardMapProps` defines `cells`, `dbzGrid`, `selectedCell`, `onSelectCell`, but `HazardMap.tsx` (lines 26–30) currently only destructures `activeLayer`, `onLayerChange`, `leadTimeMin`. It hardcodes a storm marker for Padmapur (`lat: 17.8, lng: 83.2`).
  - There is currently no shared `dispatchedAlert` state holding affected populations, rescue centers, or push alert payloads.

### 1.5 Design System & Styling Tokens
- **Defined in**: `tailwind.config.js`, `src/index.css`, and root `DESIGN.md`.
- **Palette**:
  - Background deep: `ocean-950` / `#0a0d15`
  - Primary surface: `blizzard.surface` / `ocean-900` / `#131928`
  - Elevated surface: `ocean-800` / `#20273c` / `rgba(32, 39, 60, 0.78)`
  - Brand Cyan/Electric Blue: `ice-500` / `#38a8ff`, `ice-600` / `#1888ef`
  - Emergency / Danger: `health.critical` / `#ef5a67` / `#ef4444`
  - Warning / Watch: `health.degraded` / `#f0b44d`
  - Safe / Nominal: `health.nominal` / `#43c59e` / `#10b981`
- **Class Utilities**:
  - `.card-blizzard`: Translucent card with backdrop-blur, subtle cyan border, deep shadow.
  - `.btn-blizzard-primary`: Gradient `#1888ef` → `#009fe9`, rounded-full (pill), glowing blue drop-shadow.
  - `.btn-blizzard-secondary`: Translucent cyan background, rounded-full, border cyan/18%.
  - Typography: `font-heading` (`Poppins`), `font-body` (`Archivo`/`Inter`), `font-mono` (`JetBrains Mono`).

---

## 2. Logic Chain

### 2.1 Analysis of Integration Point for R1 (Admin Intelligence Panel)
- **Requirement R1**:
  > "Create a command interface that allows administrators to select an active storm cell and view impacted populations, building risks, and distance to the nearest NDRF/SDRF rescue centers. It must include a 'Dispatch Alert' action to push warnings to the affected radius."
- **Logical Deductions**:
  1. The administrator requires geospatial situational awareness while evaluating a storm cell. If the map is hidden, the operator loses sight of the storm's radar reflectivity, heading, and lead-time progression.
  2. Therefore, R1 is best situated inside the **Tactical Command view** (`viewMode === 'tactical'`), rather than replacing the screen entirely.
  3. Inside the Tactical Command view, the right column (`w-96`) currently houses `ETACountdown` (top half) and `HazardMeters` (bottom half).
  4. By introducing a sleek **Segmented Pill Tab Control** in the bottom panel (or right sidebar header):
     - `[ ⚡ Physics Hazards | 🛡️ SDMA Disaster Intel ]`
     The operator can effortlessly switch between convective atmospheric physics (rain rate, POSH, downburst, lightning) and civil defense intelligence (impacted population, building density, nearby NDRF/SDRF units, alert dispatch).
  5. Furthermore, to support comprehensive review, an optional expand/modal trigger or dedicated top header mode (`viewMode === 'admin'`) can also be supported, but having it directly docked in the tactical aside provides seamless live workflow.
  6. **Dispatch Action Flow**: When the administrator clicks "🚨 Dispatch CAP Alert & Citizen Broadcast", it should:
     - Update shared `dispatchedAlert` state.
     - Present an active emergency status banner ("BROADCASTING TO SDMA & MAUSAM APP").
     - Show an immediate navigation button: "Preview Citizen View (Mausam App) →" which switches `viewMode` to `'public'`.

### 2.2 Analysis of Integration Point for R2 (Citizen Warning Interface - Mausam App POV)
- **Requirement R2**:
  > "Create a customer-facing UI component simulating the 'Mausam App' push notification and alert screen. When the admin dispatches an alert, this view should display the storm's ETA, NDMA-compliant SOPs (e.g., 'Seek enclosed shelter', 'Unplug appliances'), and navigation to the nearest safe rescue center."
  > "The Citizen view displays clear, scannable NDMA safety guidelines without relying on dense paragraphs."
- **Logical Deductions**:
  1. In `App.tsx`, lines 384–440, there is already an established top-level mode: `viewMode === 'public'`, labeled "Public View" in the header pill.
  2. Currently, this mode renders only a static placeholder alert card.
  3. Replacing this placeholder with a complete, dedicated component `<CitizenWarningInterface />` (or `MausamAppSimulator.tsx`) is 100% natural, directly accessible via the top header pill ("Citizen View (Mausam App)"), and preserves all other app functionality.
  4. The view should simulate a realistic mobile smartphone (iPhone / Android) running the official IMD "Mausam" app, set against the dark Blizzard theme:
     - **OS Status Bar**: JIO 5G / Airtel, 100% battery, Wi-Fi, time.
     - **Incoming Push Notification Banner**: Slides down or pulses from the top: "IMD Mausam • Severe Convective Storm Warning • Tap to view emergency SOPs".
     - **In-App Emergency Screen**:
       - Hazard severity pill (flashing red).
       - Big, high-legibility Countdown Clock ("Storm Arrival in 24m 12s").
       - **Scannable NDMA SOPs**: Clean, visual cards with iconography:
         1. 🏠 *Seek Concrete Shelter* (avoid tin sheds, balconies, trees).
         2. 🔌 *Unplug Electrical Appliances* (prevent lightning surge damage).
         3. 🌊 *Evacuate Drainage Corridors* (rapid cloudburst flash flooding).
         4. 🚗 *Halt Vehicular Transit* (low visibility, high gust rollover risk).
       - **Turn-by-Turn Shelter Navigation**:
         - Card displaying "Nearest Safe Shelter: Sector-7 Multi-Purpose Cyclone Shelter (1.2 km)".
         - Walking / Driving time estimate (4 min walk).
         - Interactive route map preview and turn-by-turn guidance steps.
         - One-tap SOS call buttons (`112` National Emergency, `1077` District Disaster Room).
     - **Side Controller / Judge Test Bench**:
       - Alongside the phone frame, provide an interactive simulation controller:
         - "Trigger New Alert Broadcast"
         - Storm Cell Selector (`CELL-701`, `CELL-702`)
         - Language Toggle (English / हिंदी)
         - Quick link: "← Return to Tactical Command"

### 2.3 State Synchronization Between R1 and R2
- Both components need to reflect the same storm event.
- Define a unified data interface:
  ```ts
  export interface DispatchedAlertState {
    cellId: string;
    stormName: string;
    severity: 'Moderate' | 'Severe' | 'Extreme';
    peakDbz: number;
    rainRateMmh: number;
    downburstKmh: number;
    etaMinutes: number;
    targetLocation: string;
    affectedPopulation: number;
    buildingDensity: string;
    vulnerableStructuresPct: number;
    dispatchedAt: Date;
    activeRadiusKm: number;
    nearestShelter: {
      name: string;
      distanceKm: number;
      etaMinutes: number;
      type: string;
      address: string;
      capacity: number;
      contact: string;
      lat: number;
      lng: number;
    };
    nearbyRescueCenters: Array<{
      name: string;
      type: 'NDRF' | 'SDRF' | 'DEOC';
      distanceKm: number;
      etaMinutes: number;
      personnel: number;
      status: 'Ready' | 'Mobilized' | 'Standby';
      contact: string;
    }>;
    ndmaSops: Array<{
      id: string;
      icon: string;
      title: string;
      instruction: string;
      highlight: string;
    }>;
  }
  ```
- Store `dispatchedAlert` in `App.tsx` (or an `AlertDispatchContext`).
- Default to realistic fallback mock data (e.g. for `CELL-701` over Padmapur / Visakhapatnam corridor) so that even if backend `server.py` is not running, the entire dashboard and mobile simulator function with 100% interactive fidelity!

---

## 3. Caveats

1. **Backend Dependency**:
   - `server.py` runs on port 8008. During frontend development, testing, or automated CI, `server.py` may be offline.
   - *Mitigation*: The new components and `App.tsx` must supply robust fallback storm cell data (`CELL-701`, `CELL-702`) so the Admin Panel and Citizen Interface are fully testable and interactable offline.
2. **Leaflet Container Sizing**:
   - Leaflet maps require explicit height and may need `map.invalidateSize()` if containers are resized or toggled.
   - For the mobile shelter navigation in R2, using a lightweight SVG/Canvas route preview or static Leaflet mini-map with fixed dimensions avoids Leaflet layout collisions.
3. **No Existing Routing Library**:
   - The application does not use `react-router-dom`. All views must continue using the existing `viewMode` state architecture (`'tactical' | 'anatomy' | 'public' | 'architecture'`).
4. **No Other Caveats**:
   - The codebase compiles with 0 errors and adheres strictly to the Blizzard design system.

---

## 4. Conclusion & Recommended Implementation Plan

### 4.1 Recommended Integration Points Summary
| Requirement | Recommended Integration Point | Implementation File | Primary User Experience |
|---|---|---|---|
| **R1: Admin Intelligence Panel** | Right Sidebar of Tactical Command view (`viewMode === 'tactical'`), tabbed with `HazardMeters` via `[ ⚡ Physics Hazards \| 🛡️ SDMA Disaster Intel ]` | `src/components/AdminIntelligencePanel.tsx` | Operator inspects storm cell, views affected population (~148k), structural building density, lists 3 nearby NDRF/SDRF rescue stations, and clicks "Dispatch Alert" |
| **R2: Citizen Warning Interface** | Fullscreen `viewMode === 'public'` (enhanced header button "Citizen View (Mausam App)") | `src/components/CitizenWarningInterface.tsx` | Realistic mobile smartphone simulating the IMD Mausam App with push notification, live ETA countdown, scannable NDMA SOP cards, and turn-by-turn navigation to safe shelter |
| **Data & State Bridge** | Lifted state in `src/App.tsx` (`dispatchedAlert`, `setDispatchedAlert`) | `src/types/dispatch.ts` & `src/data/mockDisasterData.ts` | Immediate synchronization: clicking "Dispatch Alert" in Admin Panel instantly feeds the Citizen Warning view and updates broadcast status |

### 4.2 Component Specification for Implementation

#### Component 1: `src/components/AdminIntelligencePanel.tsx`
- **Props**:
  - `selectedCell`: current active storm cell object
  - `onSelectCell`: callback to switch active cell
  - `allCells`: list of available storm cells (`CELL-701`, `CELL-702`, etc.)
  - `onDispatchAlert`: callback receiving the compiled alert payload
  - `activeDispatchedAlert`: currently active alert (if any)
  - `onViewCitizenAlert`: callback to switch `viewMode` to `'public'`
- **Visual Structure**:
  - Header: `MoES / SDMA Tactical Command & Alert Dispatch Console` + `DataProvenanceBadge`
  - Cell Selector: Segmented pill / dropdown showing Cell ID, Severity, dBZ
  - Impact Assessment Grid:
    - **Affected Population**: calculated based on cell footprint (e.g. `148,200` in 18 km radius)
    - **Building Density & Vulnerability**: `3,240 structures/km²` (Breakdown: 48% Concrete, 34% Semi-Pucca, 18% High-Risk Tin Sheds)
    - **Hazard Level**: Cloudburst + Severe Hail alert
  - **Nearby Rescue Centers (NDRF / SDRF / DEOC)**:
    - Card 1: *NDRF 10th Battalion Regional Center* — 8.4 km | ETA 14 min | 42 personnel | Standby
    - Card 2: *SDRF Quick Response Unit (Sector 4)* — 12.6 km | ETA 22 min | 28 personnel | Mobilized
    - Card 3: *District Emergency Operation Centre (DEOC)* — 16.2 km | ETA 29 min | Operational
  - **Action Button**:
    - "🚨 Broadcast Disaster Alert (SDMA & Mausam Network)" (`btn-blizzard-primary` with pulsing emergency glow)
    - When active: displays "BROADCAST ACTIVE" + "View Citizen App (Mausam) →" CTA

#### Component 2: `src/components/CitizenWarningInterface.tsx`
- **Props**:
  - `dispatchedAlert`: active alert data from state
  - `onBackToTactical`: callback to return to command dashboard
  - `onTriggerSimulatedAlert`: callback to simulate receiving an alert
- **Visual Structure**:
  - Two-column responsive layout:
    - **Left / Center**: High-fidelity smartphone mockup (380px width, rounded-[48px], sleek bezel, speaker notch, dynamic status bar):
      - **Interactive Push Notification**:
        - App icon (Mausam blue radar), "MAUSAM • MoES / IMD • NOW", headline: "CRITICAL WEATHER ALERT: Extreme Storm Cell approaching", tap action.
      - **In-App Alert Screen**:
        - Flashing emergency badge: `EMERGENCY ALERT — SEVERE CONVECTIVE NOWCAST`
        - Big Countdown Clock: `24m 12s` remaining until impact
        - Intensity telemetry: `65 dBZ Reflectivity • 112 mm/h Cloudburst • 90 km/h Gusts`
      - **NDMA Scannable Safety SOPs (Visual Cards)**:
        - 🏠 Concrete Shelter (Avoid tin/shed roofs, trees)
        - 🔌 Unplug Appliances (Protect from lightning voltage surge)
        - 🌊 Avoid Riverbeds & Drains (Flash flood risk)
        - 🚗 Stop Vehicles Away from Poles (High gust hazards)
      - **Navigation to Nearest Safe Shelter**:
        - Shelter card: *Sector-7 Multi-Purpose Cyclone Shelter* (1.2 km away, 4 min walk)
        - Turn-by-turn route steps card with visual map thumbnail
        - SOS one-touch call buttons (`112` / `1077`)
    - **Right**: Simulation Controller & MoES Verification Hub:
      - Synchronized dispatch status indicator
      - Quick cell switch button
      - Language selector (English / हिंदी)
      - "Return to Tactical Command" button

#### Component 3: Data Contracts & Fallbacks (`src/types/dispatch.ts`, `src/data/mockDisasterData.ts`)
- Realistic Indian administrative contexts (MoES, IMD Mausam, NDMA, SDMA, NDRF 10th Bn, District Collectorates).
- Ensures seamless operation offline and online.

---

## 5. Verification Method

### 5.1 Independent Verification Commands
1. **TypeScript & Build Verification**:
   ```bash
   cd "/Users/gauravkumarnayak/Desktop/new sih/convectnow/frontend"
   npm run build
   ```
   *Expected Result*: Clean build with code `0` and 0 TypeScript compilation errors.

2. **Local Development Server**:
   ```bash
   npm run dev
   ```
   *Expected Result*: Vite server starts on `http://localhost:5174/`.

3. **Visual & Interactive Playwright Verification**:
   - Open browser or execute Playwright test on `http://localhost:5174/`.
   - Verify:
     a) Tactical Command loads with Hazard Map and Scrubber.
     b) In the right sidebar, clicking the tab `[ 🛡️ SDMA Disaster Intel ]` displays the Admin Intelligence Panel with population count, building density, rescue centers, and "Dispatch Alert" button.
     c) Clicking "Dispatch Alert" triggers the active broadcast state.
     d) Clicking "Citizen View (Mausam App)" switches view to the mobile smartphone simulation.
     e) Mobile simulator displays the push notification banner, live countdown ETA, scannable NDMA SOP cards, and shelter route navigation.
     f) Both English and Hindi language toggles work.
     g) All visual styling matches the Blizzard glassmorphism system (`card-blizzard`, `#131928`, `#0a0d15`, `#38a8ff`).

### 5.2 Invalidation Conditions
- Any TypeScript compilation error (`tsc -b`).
- Layout shifts or breaking changes to existing features (`HazardMap`, `ETACountdown`, `HazardMeters`, `StormAnatomyScrolly`, `ArchitecturePage`).
- Hardcoded crashes if `server.py` is not running.
