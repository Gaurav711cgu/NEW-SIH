# Comprehensive Frontend Architecture, Routing, Build & Compilation Audit
**Target Codebase:** `/Users/gauravkumarnayak/Desktop/new sih/frontend`  
**Auditor:** Explorer 3 (Frontend Architecture & Build Specialist)  
**Date:** 2026-09-03 (UTC: 2026-09-03T17:58:30Z)  

---

## Executive Summary

A comprehensive frontend architecture, routing, build, and state management audit was executed across the AQUILA OS React 19 / TypeScript 6 codebase. 

Key Findings:
1. **Compilation Status:** The codebase compiles cleanly with `npm run build` (`tsc -b && vite build`) and `npx tsc --noEmit` exits with status `0`.
2. **Bundle Optimization:** The production bundle generates a single monolithic 1.58 MB JavaScript chunk (`dist/assets/index-CT2LyubW.js`) and a 3.22 MB uncompressed background image (`dist/assets/new_bg1-Dbyil0qz.jpg`). No route-based code splitting (`React.lazy`) is implemented.
3. **Linter Findings:** `oxlint` found **8 warnings, 0 errors**. Critical warnings include an inline component recreation antipattern in `SystemStatusRow.tsx:28` (`react(static-components)`), synchronous `setState` inside an effect in `AUVTwin.tsx:376`, and unhandled catch error variables in 3 files.
4. **Routing & Dead Links:** All 8 primary routes are correctly routed in `App.tsx` and mirrored in `Sidebar.tsx`. However, **no catch-all 404 route (`path="*"`) exists**, rendering a blank page on unknown routes. An obsolete, orphaned layout component (`AppShell.tsx`) contains broken route links (`/biogeochemistry`) and invalid image asset paths.
5. **Dead & Placeholder Buttons:** 
   - `SeafloorIntelligence.tsx:892`: Button `"Review / Flag for AUV Revisit"` is completely dead (no `onClick` handler).
   - `GovernmentIntel.tsx:537-547`: Four export buttons ("EXPORT PDF REPORT", "SEND TO MoES DASHBOARD", "DOWNLOAD GPX WAYPOINTS", "SHARE VIA SATCOM") merely trigger browser `alert()` popups.
   - `ModelValidation.tsx` and `OceanState.tsx`: 100% static read-only with no interactive filter controls or actions.
6. **Orphaned Reusable Components & Styles:** 
   - Multiple pre-built UI primitives and chart components in `src/components/ui/` (`MetricCard.tsx`, `SparklineCard.tsx`, `SonarCanvas.tsx`, `SourceBadge.tsx`) and `src/charts/` (`DepthProfileChart.tsx`, `TSDiagram.tsx`) are completely unimported and orphaned. Each page instead re-implemented duplicate inline charting and card logic.
   - `src/index.css` is never imported in `main.tsx` or `App.tsx`, leaving critical visual effects (`.scanlines`, `.glitch-text`, `.crt-flicker`, `.hex-dump`) unstyled in `ResearchCitations.tsx`, `SeafloorIntelligence.tsx`, and `SystemStatusRow.tsx`.
   - `src/App.css` contains default Vite demo boilerplate and is unimported.
7. **State Management & Network Fragmentation:** `MissionContext.tsx` is strictly read-only and is consumed only by `MissionTerminal.tsx`. Each individual page (`OceanState.tsx`, `MissionControl.tsx`, `Biogeochemistry.tsx`, `SystemStatusRow.tsx`) establishes its own independent, concurrent HTTP polling loop (`setInterval`), causing redundant network traffic and disconnected state updates. Furthermore, all fetch calls hardcode `http://localhost:8000` rather than using environment variables or Vite proxy configuration.
8. **Stale Legacy Brand Artifacts:** Legacy references to `"DeepScan"` remain in `ResearchCitations.tsx` (lines 175, 211, 229, 247) and `SeafloorIntelligence.tsx:285` (`deepscan_detections.csv`). Inconsistent model references (`YOLOv9` vs `YOLOv8s`) appear in `ResearchCitations.tsx:75` and `AUVTwin.tsx:256, 278`.

---

## 1. Package Configuration, Dependencies & Build Tooling

### 1.1 `package.json` Audit
- **Project Name:** `elite-ui` (package name not updated to `aquila-os` or `aquila-frontend`).
- **Module Type:** `"type": "module"`
- **Core Dependencies:**
  - `react`: `^19.2.8`
  - `react-dom`: `^19.2.8`
  - `react-router-dom`: `^7.18.3`
  - `framer-motion`: `^13.1.1`
  - `three`: `^0.185.1`
  - `@types/three`: `^0.185.4` — **Defect:** `@types/three` is located under `dependencies` rather than `devDependencies`.
  - `recharts`: `^3.10.1`
  - `react-zoom-pan-pinch`: `^4.0.4`
  - `lucide-react`: `^1.37.0`
  - `clsx`: `^2.1.1`, `tailwind-merge`: `^3.6.0`
- **Dev Dependencies:**
  - `vite`: `^8.2.2`
  - `@vitejs/plugin-react`: `^6.1.0`
  - `typescript`: `~6.0.2` (installed: `6.0.3`)
  - `tailwindcss`: `^3.4.19`, `postcss`: `^8.5.26`, `autoprefixer`: `^10.5.4`
  - `oxlint`: `^1.79.0` (installed: `1.80.0`)
  - `@types/react`: `^19.2.18`, `@types/react-dom`: `^19.2.4`, `@types/node`: `^24.13.3`

### 1.2 Build Tooling (`vite.config.ts`)
```typescript
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
})
```
- **Observations:**
  - Standard Vite configuration without path aliases (`@/` is not configured).
  - No proxy configuration for `/api` requests (leads to hardcoded `http://localhost:8000` URLs across components).
  - No manual chunk splitting configured (`build.rollupOptions.output.manualChunks`), resulting in a single 1.58 MB monolithic chunk.

### 1.3 TypeScript Configuration (`tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`)
- Root `tsconfig.json` uses Project References pointing to `tsconfig.app.json` and `tsconfig.node.json`.
- `tsconfig.app.json` compiler flags:
  - `"target": "es2023"`, `"module": "esnext"`, `"moduleResolution": "bundler"`
  - `"allowImportingTsExtensions": true`
  - `"verbatimModuleSyntax": true` — requires `import type` for all type-only imports.
  - `"erasableSyntaxOnly": true` — enforces ECMAScript erasable syntax (TS 5.8+ feature).
  - `"noUnusedLocals": true`, `"noUnusedParameters": true`
  - `"skipLibCheck": true`, `"noEmit": true`
  - Verification: `npx tsc --noEmit` completes cleanly with **0 errors**.

### 1.4 Loose Shell Scripts in Workspace Root
There are 11 shell scripts left in `/Users/gauravkumarnayak/Desktop/new sih/frontend/`:
- `fix_appshell.sh`, `fix_appshell2.sh`, `fix_build.sh`, `fix_gauge.sh`, `fix_realism.sh`, `fix_seafloor.sh`, `fix_syntax.sh`, `make_logo_clickable.sh`, `update_appshell.sh`, `update_downloads.sh`, `update_responsive.sh`.
- These are historical one-off `sed` and `perl` patching scripts and should be archived or removed to prevent clutter.

---

## 2. Routing Architecture & Page Catalog

### 2.1 Router Structure (`src/App.tsx`)
The routing is handled by `react-router-dom` v7 via `<BrowserRouter>`:
```tsx
<MissionProvider>
  <BrowserRouter>
    <div className="fixed inset-0 w-full h-full z-0 opacity-20 pointer-events-none"
         style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
    <div className="flex h-screen bg-abyss-950/90 text-steel-100 font-sans selection:bg-ice-500/30 overflow-hidden relative z-10 backdrop-blur-sm">
      <Sidebar />
      <main className="flex-1 overflow-hidden relative bg-abyss-900/50">
        <Routes>
          <Route path="/" element={<Navigate to="/ocean-state" replace />} />
          <Route path="/ocean-state" element={<OceanState />} />
          <Route path="/intel" element={<GovernmentIntel />} />
          <Route path="/biogeo" element={<Biogeochemistry />} />
          <Route path="/seafloor" element={<SeafloorIntelligence />} />
          <Route path="/mission" element={<MissionControl />} />
          <Route path="/auv-twin" element={<AUVTwin />} />
          <Route path="/validation" element={<ModelValidation />} />
          <Route path="/research" element={<ResearchCitations />} />
        </Routes>
      </main>
    </div>
  </BrowserRouter>
</MissionProvider>
```

### 2.2 Route Catalog

| Route Path | Component | Purpose / Domain | Status |
|---|---|---|---|
| `/` | Redirects to `/ocean-state` | Default index landing redirect | Active |
| `/ocean-state` | `OceanState.tsx` | Real-time physical oceanography (CTD, MLD, T-S profile) | Active |
| `/intel` | `GovernmentIntel.tsx` | MoES Classified Intelligence, Southern Ocean Survey Replay | Active |
| `/biogeo` | `Biogeochemistry.tsx` | BGC vertical column (DOXY, Chlorophyll-a, pH, Nitrate) | Active |
| `/seafloor` | `SeafloorIntelligence.tsx` | Sonar upload, CLAHE, YOLO inference, acoustic shadows | Active |
| `/mission` | `MissionControl.tsx` | Telemetry HUD, flight paths, C2 telecommand uplink | Active |
| `/auv-twin` | `AUVTwin.tsx` | Interactive 3D WebGL (Three.js) digital twin of AUV | Active |
| `/validation` | `ModelValidation.tsx` | YOLOv8s vs RT-DETR-L ablation study and mAP metrics | Active |
| `/research` | `ResearchCitations.tsx` | Peer-reviewed citations, UNESCO EOS-80, Urick acoustic laws | Active |
| `*` (Catch-all) | **MISSING** | 404 Error handling / Fallback redirect | **Defect: Not configured** |

### 2.3 Navigation Pathways (`src/components/layout/Sidebar.tsx`)
The primary navigation sidebar defines 8 navigation items matching the registered routes:
1. `/ocean-state` (Ocean State) — `Waves` icon
2. `/intel` (MoES Intel Report) — `FileText` icon
3. `/biogeo` (Biogeochemistry) — `Activity` icon
4. `/seafloor` (Seafloor Intel) — `Target` icon
5. `/mission` (Mission Control) — `Anchor` icon
6. `/auv-twin` (AUV Digital Twin) — `Cpu` icon
7. `/validation` (Model Validation) — `BarChart4` icon
8. `/research` (Research & Citations) — `BookOpen` icon
- Logo header: Clickable `<NavLink to="/">` with image `/aquila-logo.jpg`.
- Sovereign badge: "ATMANIRBHAR BHARAT: Sovereign Ocean Tech · 100% Domestic AI & Hardware".
- Bottom status: `<SystemStatusRow />`.

### 2.4 Routing Defects & Gaps
1. **Missing 404 Fallback:** If a user requests an unregistered URL (e.g. `/intel/report`, `/settings`, or `/biogeochemistry`), the router renders an empty `<main>` container with no error message, navigation aid, or automatic redirect back to `/ocean-state`. A `<Route path="*" element={<Navigate to="/ocean-state" replace />} />` should be added.
2. **Orphaned Layout (`AppShell.tsx`):** `src/components/layout/AppShell.tsx` is completely unused. It references invalid route `/biogeochemistry` instead of `/biogeo` and attempts to load unbundled static paths `'/src/assets/bg1.jpg'`.

---

## 3. Compilation & Build Status

### 3.1 Build Output Analysis
Running `npm run build` (`tsc -b && vite build`):
```
vite v8.2.2 building client environment for production...
transforming...
✓ 2818 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                       0.51 kB │ gzip:   0.34 kB
dist/assets/new_bg1-Dbyil0qz.jpg  3,220.06 kB
dist/assets/index-DlHXw1yn.css       46.29 kB │ gzip:   8.40 kB
dist/assets/index-CT2LyubW.js     1,578.18 kB │ gzip: 435.21 kB

[plugin builtin:vite-reporter] 
(!) Some chunks are larger than 500 kB after minification.
✓ built in 1.11s
```

#### Key Build Observations:
- **Build Status:** Exits with code `0` (Success).
- **Monolithic Bundle Warning:** 1.58 MB JavaScript output chunk. Vite warns that chunks exceed 500 kB. Implementing `React.lazy` and `Suspense` for the 8 pages will split this into manageable route chunks (~100-200 kB each) and prevent upfront loading of `three.js` (600+ kB) on pages that do not use 3D graphics.
- **Large Background Asset:** `dist/assets/new_bg1-Dbyil0qz.jpg` is **3.22 MB**! This slows down initial page load significantly. Compressing this image (e.g. to WebP/AVIF at ~150-250 kB) would improve web performance dramatically.

### 3.2 Linter Findings (`npm run lint` / `oxlint`)
Running `oxlint` on 27 files returned **8 warnings, 0 errors**:
1. `src/components/layout/MissionContext.tsx:88`: Unused catch parameter `err`.
2. `src/components/layout/MissionContext.tsx:29`: Fast refresh export warning (`export const useMission` exported alongside `MissionProvider`).
3. `src/components/layout/SystemStatusRow.tsx:15`: Unused catch parameter `err`.
4. `src/components/layout/SystemStatusRow.tsx:28`: **Critical React Antipattern:** `const StatusIndicator = ({ label, active, icon: Icon }: any) => ...` is declared **inside** the render function of `SystemStatusRow`. React re-creates this component on every single render cycle, resetting any internal DOM state and bypassing React Compiler memoization.
5. `src/pages/Biogeochemistry.tsx:64`: Unused catch parameter `err`.
6. `src/pages/AUVTwin.tsx:376`: Calling `setState` synchronously within `useEffect` triggers unnecessary cascading renders:
   ```tsx
   useEffect(() => {
     setLiveMetric(selectedSensor.baseVal);
     ...
   }, [selectedSensor]);
   ```

### 3.3 Orphaned Code & Unimported Assets

| Orphaned File | Category | Issue / Description |
|---|---|---|
| `src/index.css` | Stylesheet | Contains `.scanlines`, `.glitch-text`, `.crt-flicker`, `.hex-dump`. **Never imported in `main.tsx` or `App.tsx`**, causing scanline visual effects across `ResearchCitations.tsx` and `SeafloorIntelligence.tsx` to fail silently. |
| `src/App.css` | Stylesheet | Contains default Vite starter boilerplate (`.hero`, `#next-steps`, `.ticks`). Completely unused. |
| `src/components/layout/AppShell.tsx` | Layout Component | Unused predecessor layout with broken route `/biogeochemistry`. |
| `src/components/ui/MetricCard.tsx` | UI Primitive | High-quality telemetry card with `SourceBadge` and dropout states; completely unimported. |
| `src/components/ui/SparklineCard.tsx` | UI Primitive | High-quality telemetry sparkline card with Recharts; completely unimported. |
| `src/components/ui/SonarCanvas.tsx` | UI Primitive | Canvas-based synthetic sonar waterfall renderer; completely unimported. |
| `src/components/ui/SourceBadge.tsx` | UI Primitive | Badge for telemetry provenance (`LIVE`, `VIRTUAL`, `DATASET`, `PLANNED`); only used in unused `MetricCard` & `SparklineCard`. |
| `src/charts/DepthProfileChart.tsx` | Chart Component | Inverted vertical ocean depth profile chart using Recharts; completely unimported. |
| `src/charts/TSDiagram.tsx` | Chart Component | Temperature-Salinity scatter diagram with water mass clustering; completely unimported. |

---

## 4. State Management, Shared Services & Interactive Handler Patterns

### 4.1 Global Context Architecture (`MissionContext.tsx`)
```typescript
interface MissionState {
  depth: number;
  phase: MissionPhase;
  battery: number;
  uptime: number;
  internalTemp: number;
  hullPressure: number;
  powerDraw: number;
  cpuLoad: number;
  commsOnline: boolean;
  logs: LogEntry[];
  cacheSize: number;
}
```
- **Provider:** `<MissionProvider>` mounts at the root in `App.tsx`.
- **Polling Loop:** `setInterval(fetchTelemetry, 1000)` hits `http://localhost:8000/api/telemetry`.
- **Severe Defect 1 — Read-Only Context:** The context provider value is `value={state}`. There is no `dispatch`, `setState`, or action callback exposed. Components cannot update mission state or send directives through the context.
- **Severe Defect 2 — Zero Consumption by Pages:** Only `MissionTerminal.tsx` consumes `useMission()`. The remaining pages (`OceanState`, `MissionControl`, `AUVTwin`, `Biogeochemistry`) ignore `MissionContext` completely and run their own isolated state and polling logic.
- **Severe Defect 3 — Log Buffer Flooding:** When the backend is offline, every 1,000ms the catch block appends `ACOUSTIC_TIMEOUT - AWAITING SYNC...` to the log buffer. Within 50 seconds, the terminal log is filled with identical warning messages.

### 4.2 Network Polling Duplication
The frontend spawns five separate, asynchronous polling loops:
1. `MissionContext.tsx:104`: Polls `http://localhost:8000/api/telemetry` every **1,000ms**.
2. `OceanState.tsx:117`: Polls `http://localhost:8000/api/telemetry` every **3,000ms**.
3. `MissionControl.tsx:135`: Polls `http://localhost:8000/api/telemetry` every **2,000ms**.
4. `Biogeochemistry.tsx:75`: Polls `http://localhost:8000/api/ocean/state` every **5,000ms**.
5. `SystemStatusRow.tsx:21`: Polls `http://localhost:8000/api/health` every **5,000ms**.

**Consequence:** When navigating through the app, the client fires up to 3–4 concurrent HTTP requests per second to `localhost:8000`. If the backend is restarting or under load, all five callers experience timeouts concurrently.

### 4.3 Interactive Handler Audit Across Pages

#### `SeafloorIntelligence.tsx`:
- **Functional Handlers:**
  - `onAnalyse`: Uploads selected file to `/api/detect` via multipart form-data.
  - `handleLoadDemoPreset(preset)`: Generates 2D canvas procedural synthetic sonar image, exports to Blob, and automatically runs detection.
  - `onDownloadJSON`: Generates `aquila_detections.json` download.
  - `onDownloadCSV`: Generates CSV download (Note: filename is `deepscan_detections.csv`).
  - Zoom controls: Integrates `react-zoom-pan-pinch` (+ / - / Reset).
- **Broken / Dead Elements:**
  - **Line 892:** `<button className="col-span-2 mt-2 py-1.5 ...">Review / Flag for AUV Revisit</button>` in the Anomaly Triage Queue has **NO `onClick` handler**. Clicking it does nothing.

#### `GovernmentIntel.tsx`:
- **Functional Handlers:**
  - Historical Trend Replay chart (Recharts) renders deterministic 14-day mission data.
- **Mock / Broken Elements:**
  - **Lines 537–547:** All 4 export buttons call `handleExport(type)` which only triggers a browser `alert()` modal:
    ```tsx
    const handleExport = (type: string) => {
      alert(`${type} exported successfully!`);
    };
    ```
    Buttons: `EXPORT PDF REPORT`, `SEND TO MoES DASHBOARD`, `DOWNLOAD GPX WAYPOINTS`, `SHARE VIA SATCOM`. None produce actual files or dispatch network payloads.

#### `MissionControl.tsx`:
- **Functional Handlers:**
  - Mode selector buttons (`LAWNMOWER`, `CONTOUR_FOLLOW`, `HOVER_STATION`): updates `activeMode` and transforms the SVG flight-path display.
  - Telecommand buttons (`CALIBRATE SSS`, `BURST SYNC`, `HOLD DEPTH`, `EMERGENCY SURFACE`): updates local `calibrating`, `syncing`, and appends formatted messages to `commandLog`.
  - Emergency Abort Modal: opens confirmation dialog and dispatches ballast drop command.
- **Architectural Note:** Command dispatch is simulated entirely on the client (`setTimeout` simulating uplink). No network call is dispatched to a backend C2 endpoint (`/api/command` or `/api/mission/directive`).

#### `AUVTwin.tsx`:
- **Functional Handlers:**
  - Architectural Tier tabs (`ALL`, `INDIGENOUS_PHYSICAL`, `DL_VIRTUAL_REPLICATED`, `MODULAR_UPGRADE`): filters subsystem nodes.
  - Subsystem Node selector buttons: updates `selectedSensor` and inspects telemetry.
  - Camera View Presets (`ISO`, `BOW`, `BELLY`, `STERN`, `TOP`, `POV`): updates Three.js camera position smoothly.
  - Shader toggles: `X-RAY`, `WIREFRAME`, `BEAMS`, and `Auto-Rotate`.

#### `ResearchCitations.tsx`:
- **Functional Handlers:**
  - Category Filter Pills (`ALL`, `CORE_IMPLEMENTED`, `PHYSICS_SENSORS`, `GOV_MISSIONS`): filters dossier items.
  - Search input: live filter on authors, title, and keywords.
  - External links: `<a href={item.doiUrl} target="_blank">` with external link icons.

#### `ModelValidation.tsx`:
- Purely read-only display. No tabs, filters, or buttons.

#### `OceanState.tsx`:
- Purely read-only display. Displays sensor cards and Recharts live series. No user controls or buttons.

---

## 5. Claims, Naming & Citation Audit

### 5.1 Stale Branding ("DeepScan" vs "AQUILA")
The codebase contains leftover branding from a prior project name `"DeepScan"`:
1. `src/pages/ResearchCitations.tsx:175`: `'ai_pipeline/train.py & DeepScan_Colab_Training.ipynb'`
2. `src/pages/ResearchCitations.tsx:211`: `'DeepScan is directly designed to provide low-cost autonomous AI perception...'`
3. `src/pages/ResearchCitations.tsx:229`: `'DeepScan incorporates the Southern Ocean teleconnection model...'`
4. `src/pages/ResearchCitations.tsx:247`: `'DeepScan’s JSON and CSV export engine adheres strictly to CCAMLR debris reporting schemas...'`
5. `src/pages/SeafloorIntelligence.tsx:285`: `a.download = 'deepscan_detections.csv';`

*Remediation:* Rename all instances of `DeepScan` to `AQUILA` / `AQUILA OS`.

### 5.2 Model Discrepancy (YOLOv8s vs YOLOv9)
- Established Project Fact (per `ORIGINAL_REQUEST.md` & `ModelValidation.tsx`):
  - Primary Model: **YOLOv8s (CNN)** with **88.0% mAP50**.
  - Baseline Comparison: RT-DETR-L (Vision Transformer) with 35.4% mAP50.
- Conflicting Claims in Codebase:
  - `src/pages/ResearchCitations.tsx:75`: Claims `"We wrapped our YOLOv9 model with a custom SAHI sliding window..."`
  - `src/pages/AUVTwin.tsx:256`: Claims `"running YOLOv9 and SAHI subsea inference..."`
  - `src/pages/AUVTwin.tsx:278`: Claims `"Runs our edge YOLOv9/RT-DETR software natively..."`

*Remediation:* Change all references from `YOLOv9` to `YOLOv8s` to maintain consistency with the validation study and backtesting framework.

### 5.3 Cost Comparison Variance
- `GovernmentIntel.tsx:573`: `"reducing unit costs from ₹30 Lakhs to ₹75,000"` (matching the primary project claim).
- `AUVTwin.tsx:970`: `"LAB PROTOTYPE: ₹6,100 · SUBSEA PROD TARGET: ₹7.8 LAKHS · GOVT IMPORT BENCHMARK: ₹35.0 LAKHS"`.
- `AUVTwin.tsx:75-299`: Individual component comparisons claim ₹80 vs ₹4.5 Lakhs (DS18B20 temp sensor) and ₹150 vs ₹18 Lakhs (MPU-6050 IMU vs foreign INS).
- *Recommendation:* Clarify the distinction between the **₹6,100 sensor electronics BOM**, the **₹75,000 total edge platform unit cost**, and the **₹30 Lakh commercial Argo float** baseline.

---

## 6. Architecture & Implementation Guidelines for Workers

When implementing fixes and interactive handlers, workers should follow these standardized guidelines:

### Pattern 1: Interactivity & Button Handler Protocol
1. **Never leave `<button>` without `onClick`:** Every interactive element must have a defined handler. If an action is asynchronous or awaiting backend wiring, display an informative toast or in-UI status badge (e.g. `setCommandStatus('DISPATCHED')`), never an empty function or dead button.
2. **Eliminate Browser `alert()`:** Replace `alert(...)` in `GovernmentIntel.tsx` with actual file download triggers (e.g. CSV/JSON/GPX blobs using the pattern from `SeafloorIntelligence.tsx:260-287`) or a styled modal/notification toast.
3. **Connect Dead Button in `SeafloorIntelligence.tsx` (Line 892):** Implement `onFlagForRevisit(det)` which adds the target to an active `revisitQueue` state and updates the button to show `"FLAGGED FOR REVISIT ✓"` with nominal emerald styling.

### Pattern 2: Component Scoping & React Compiler Hygiene
1. **Move Sub-Components Outside Parent Render:** Never define components inside render functions (e.g. `StatusIndicator` in `SystemStatusRow.tsx`). Define them at the module level or in dedicated component files.
2. **Avoid Synchronous `setState` in `useEffect`:** Derive initial state during render or update state directly within the trigger event handler.

### Pattern 3: Centralized API Client & Relative URLs
1. **Remove Hardcoded `http://localhost:8000`:**
   Configure `vite.config.ts` proxy:
   ```typescript
   export default defineConfig({
     plugins: [react()],
     server: {
       proxy: {
         '/api': 'http://localhost:8000'
       }
     }
   });
   ```
   In all components, fetch from `/api/...` (or read `import.meta.env.VITE_API_URL`).

### Pattern 4: Stylesheet Restoration
1. Import `src/index.css` in `src/main.tsx` or merge `.scanlines`, `.glitch-text`, `.crt-flicker`, and `.hex-dump` into `src/styles/globals.css`.

### Pattern 5: Catch-All 404 Route
1. In `src/App.tsx`, append:
   ```tsx
   <Route path="*" element={<Navigate to="/ocean-state" replace />} />
   ```
