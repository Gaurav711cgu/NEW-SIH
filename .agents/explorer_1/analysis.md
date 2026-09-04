# Comprehensive Survey & Deep Audit of Interactive Elements — AQUILA OS Frontend

**Date**: 2026-09-03  
**Auditor**: Explorer 1 (Frontend Audit Team)  
**Target Codebase**: `/Users/gauravkumarnayak/Desktop/new sih/frontend`  
**Scope**: All components and pages under `src/pages/`, `src/components/`, `src/charts/`, and `src/App.tsx`.

---

## 1. Executive Summary

A comprehensive survey of all UI components and interactive elements across the React frontend was conducted. 

### Key Findings Breakdown:
- **Total Interactive Elements Surveyed**: 42 interactive controls (buttons, links, file dropzones, canvas click handlers, mode switchers, modal triggers, export actions).
- **Dead / Missing Handlers**: **1 critical dead button** with zero `onClick` handler (`SeafloorIntelligence.tsx:892` — "Review / Flag for AUV Revisit").
- **Mock Placeholder Handlers (`alert()`)**: **4 export buttons** in `GovernmentIntel.tsx:537-548` (`handleExport` simply executes `alert(...)` instead of exporting PDF, MoES API sync, GPX XML download, or Satcom simulation).
- **Orphaned UI State / Pseudo-Interactive Controls**: **6 depth slice buttons** in `Biogeochemistry.tsx:233-246` update a local state (`selectedDepth`), but this state is never consumed anywhere else in the component or chart.
- **Routing & Navigation Resiliency**: `App.tsx` lacks a wildcard route (`*`), causing any unmatched path (or legacy path like `/biogeochemistry`) to render a blank page. `AppShell.tsx` contains an unrouted, obsolete shell with mismatched path definitions.
- **Fully Functional Controls**: 31 interactive controls across `AUVTwin.tsx`, `MissionControl.tsx`, `SeafloorIntelligence.tsx`, `SonarProfiler.tsx`, and `ResearchCitations.tsx` are fully wired up with proper state and event handling.
- **Passive Dashboards Lacking Standard Controls**: `OceanState.tsx` and `ModelValidation.tsx` contain zero interactive elements (no export, time-range filter, or validation rerun triggers).

---

## 2. Complete Inventory of All Interactive Elements

| # | File Path | Line Range | Element & Current Handler | Type | Status | Exact Issue | Expected Functional Specification |
|---|---|---|---|---|---|---|---|
| 1 | `src/pages/SeafloorIntelligence.tsx` | 892–894 | `<button className="... text-health-critical ...">Review / Flag for AUV Revisit</button>` (NO `onClick`) | Button | **DEAD** | **Missing `onClick` handler**. The button is rendered in the Human Verification Required queue for ambiguous detections (<70% confidence), but clicking it does nothing. | Clicking must flag the contact, update its status from unreviewed to `FLAGGED_FOR_REVISIT`, add a waypoint entry to the mission revisit queue, and show a confirmation notification/toast. |
| 2 | `src/pages/GovernmentIntel.tsx` | 537–539 | `<button onClick={() => handleExport('PDF Report')}>EXPORT PDF REPORT</button>` | Export Button | **MOCK PLACEHOLDER** | `handleExport` executes `alert('PDF Report exported successfully!')`. No PDF is generated or downloaded. | Must invoke `window.print()` or synthesize an executive PDF/HTML report containing the threat summary, detected contacts, bathymetric coordinates, and strategic recommendations. |
| 3 | `src/pages/GovernmentIntel.tsx` | 540–542 | `<button onClick={() => handleExport('MoES Dashboard Data')}>SEND TO MoES DASHBOARD</button>` | Action Button | **MOCK PLACEHOLDER** | `handleExport` executes `alert('MoES Dashboard Data exported successfully!')`. No network dispatch or state change occurs. | Must execute or simulate an API push to MoES Central Registry (e.g. POST `/api/intel/sync` or simulated dispatch modal showing JSON payload, encrypted hash, and sync confirmation). |
| 4 | `src/pages/GovernmentIntel.tsx` | 543–545 | `<button onClick={() => handleExport('GPX Waypoints')}>DOWNLOAD GPX WAYPOINTS</button>` | Export Button | **MOCK PLACEHOLDER** | `handleExport` executes `alert('GPX Waypoints exported successfully!')`. No file is created. | Must construct a standard GPX XML document containing coordinates for WP-01 through WP-05, create a `Blob(['...'], { type: 'application/gpx+xml' })`, and trigger an automated download named `moes_mission_waypoints.gpx`. |
| 5 | `src/pages/GovernmentIntel.tsx` | 546–548 | `<button onClick={() => handleExport('Satcom Transmission')}>SHARE VIA SATCOM</button>` | Action Button | **MOCK PLACEHOLDER** | `handleExport` executes `alert('Satcom Transmission exported successfully!')`. | Must trigger a satellite burst transmission sequence with visual feedback (encoding packets, Iridium modem handshake, transmission confirmation). |
| 6 | `src/pages/Biogeochemistry.tsx` | 233–246 | `[25, 50, 100, 200, 500, 1000].map(d => <button onClick={() => setSelectedDepth(d)}>{d}m</button>)` | Tab / Filter | **ORPHANED STATE** | `setSelectedDepth(d)` updates `selectedDepth` which only toggles the active button style. It is NOT connected to the chart, data series, or metric cards. | Clicking a depth must: (1) render an active `<ReferenceLine x={selectedDepth} stroke="#10b981" />` on the water column AreaChart, and (2) display an inspection readout banner showing the exact interpolated parameters (O₂, Chl-a, pH, Nitrate) at that depth. |
| 7 | `src/App.tsx` | 28–40 | `<Routes> ... </Routes>` | Routing | **MISSING FALLBACK** | No catch-all wildcard route (`<Route path="*" element={<Navigate to="/ocean-state" replace />} />`). | Any invalid or typed URL results in a blank page without error handling or redirection. Fallback route must redirect to `/ocean-state`. |
| 8 | `src/components/layout/AppShell.tsx` | 7–12 | `navItems = [{ path: '/', ... }, { path: '/biogeochemistry', ... }, ...]` | Routing / Nav | **DEAD PATHS / ORPHAN** | `AppShell.tsx` is completely unused. Line 9 routes to `/biogeochemistry`, but `App.tsx` route is `/biogeo`. | If resurrected or used, this is a broken 404 link. Component should be cleanly synchronized or pruned. |
| 9 | `src/pages/SeafloorIntelligence.tsx` | 465–470 | `<button onClick={onDownloadJSON}>JSON</button>` | Export Button | **FUNCTIONAL** | Creates Blob from `detections` state and downloads `aquila_detections.json`. | Works as intended. |
| 10 | `src/pages/SeafloorIntelligence.tsx` | 471–476 | `<button onClick={onDownloadCSV}>CSV</button>` | Export Button | **FUNCTIONAL** | Converts `detections` array into CSV string and downloads `deepscan_detections.csv`. | Works as intended. |
| 11 | `src/pages/SeafloorIntelligence.tsx` | 491–498 | `<button onClick={() => handleLoadDemoPreset('GHOST_NET')}>1. GHOST NET (94.2%)</button>` | Preset Button | **FUNCTIONAL** | Generates synthetic waterfall canvas, sets detections, and triggers simulated processing state. | Works as intended. |
| 12 | `src/pages/SeafloorIntelligence.tsx` | 499–506 | `<button onClick={() => handleLoadDemoPreset('UXO_MINE')}>2. SUBSEA UXO / MINE (91.4%)</button>` | Preset Button | **FUNCTIONAL** | Generates synthetic waterfall canvas with cylindrical mine return. | Works as intended. |
| 13 | `src/pages/SeafloorIntelligence.tsx` | 507–514 | `<button onClick={() => handleLoadDemoPreset('LOST_CONTAINER')}>3. CARGO CONTAINER (74.2%)</button>` | Preset Button | **FUNCTIONAL** | Generates synthetic waterfall canvas with rectangular container return. Note: Label says 74.2% but preset sets 88.6%. | Align label and preset value to 88.6% (or 74.2% consistently). |
| 14 | `src/pages/SeafloorIntelligence.tsx` | 515–522 | `<button onClick={() => handleLoadDemoPreset('PIPELINE_CABLE')}>4. SUBSEA CABLE (93.2%)</button>` | Preset Button | **FUNCTIONAL** | Generates synthetic waterfall canvas with continuous linear track. | Works as intended. |
| 15 | `src/pages/SeafloorIntelligence.tsx` | 523–530 | `<button onClick={() => handleLoadDemoPreset('AMBIGUOUS')}>5. AMBIGUOUS (58.4% → TRIAGE)</button>` | Preset Button | **FUNCTIONAL** | Generates synthetic waterfall canvas with flat anomaly and shadow penalty. Populates the low-confidence triage queue. | Works as intended. |
| 16 | `src/pages/SeafloorIntelligence.tsx` | 545–570 | `<div onClick={() => inputRef.current?.click()} onDrop={onDrop} ...>` & `<input ref={inputRef} type="file" ... />` | File Dropzone | **FUNCTIONAL** | Triggers browser file dialog or receives dropped image, previews it, and resets detection state. | Works as intended. |
| 17 | `src/pages/SeafloorIntelligence.tsx` | 588–596 | `<button onClick={() => { setPreviewUrl(null); setFile(null); ... }}>Change Image</button>` | Action Button | **FUNCTIONAL** | Clears active image, detections, and resets stage to `'idle'`. | Works as intended. |
| 18 | `src/pages/SeafloorIntelligence.tsx` | 598–619 | `<button onClick={isProcessing ? onCancel : onAnalyse}>RUN AQUILA AI DETECTION</button>` | Action Button | **FUNCTIONAL** | Triggers multi-stage AI pipeline (CLAHE preprocessing, API post `/api/detect`, acoustic shadow calibration) or aborts via `AbortController`. | Works as intended. |
| 19 | `src/pages/SeafloorIntelligence.tsx` | 669–674 | `<button onClick={() => zoomIn(0.2)}>+</button>` | Zoom Control | **FUNCTIONAL** | Zooms into the sonar canvas via `react-zoom-pan-pinch`. | Works as intended. |
| 20 | `src/pages/SeafloorIntelligence.tsx` | 676–681 | `<button onClick={() => zoomOut(0.2)}>-</button>` | Zoom Control | **FUNCTIONAL** | Zooms out of the sonar canvas via `react-zoom-pan-pinch`. | Works as intended. |
| 21 | `src/pages/SeafloorIntelligence.tsx` | 683–689 | `<button onClick={() => resetTransform()}>RESET</button>` | Zoom Control | **FUNCTIONAL** | Resets canvas zoom and panning transform to 1.0x. | Works as intended. |
| 22 | `src/pages/SeafloorIntelligence.tsx` | 728–753 | `<button onClick={isProcessing ? onCancel : onAnalyse}>RUN AQUILA AI DETECTION PIPELINE</button>` | Action Button | **FUNCTIONAL** | Secondary full-width trigger for pipeline analysis. | Works as intended. |
| 23 | `src/components/SonarProfiler.tsx` | 234–251 | `COMPARISON_SCENARIOS.map(sc => <button onClick={() => setSelectedScenarioId(sc.id)}>{sc.title}</button>)` | Tab / Switcher | **FUNCTIONAL** | 4 scenario switcher buttons (`mine-vs-rock`, `container-vs-outcrop`, `ghostnet-vs-sand`, `pipe-vs-trench`). Updates waveform, images, and acoustic gradient cards. | Works as intended. |
| 24 | `src/pages/MissionControl.tsx` | 300–310 | `<button onClick={() => handleSelectMode('LAWNMOWER')}>LAWNMOWER</button>` | Mode Button | **FUNCTIONAL** | Switches survey profile to Lawnmower, updates telemetry metrics, waypoints, and renders parallel swath SVG map. | Works as intended. |
| 25 | `src/pages/MissionControl.tsx` | 312–322 | `<button onClick={() => handleSelectMode('CONTOUR_FOLLOW')}>CONTOUR</button>` | Mode Button | **FUNCTIONAL** | Switches survey profile to Contour Follow, updates altitude/speed, and renders 2.5D seabed terrain SVG. | Works as intended. |
| 26 | `src/pages/MissionControl.tsx` | 324–334 | `<button onClick={() => handleSelectMode('HOVER_STATION')}>STATION HOVER</button>` | Mode Button | **FUNCTIONAL** | Switches survey profile to Station Hover, renders 360° orbital inspection SVG map and multi-angle nodes. | Works as intended. |
| 27 | `src/pages/MissionControl.tsx` | 654–664 | `<button onClick={() => handleSendCommand('CALIBRATE', 'EXEC_SWATH_CALIBRATION')}>CALIBRATE SSS</button>` | Action Button | **FUNCTIONAL** | Dispatches calibration telecommand, sets `calibrating` state, logs acknowledgement, and auto-clears. | Works as intended. |
| 28 | `src/pages/MissionControl.tsx` | 666–675 | `<button onClick={() => handleSendCommand('BURST', 'TRIGGER_BURST_SATCOM')}>BURST SYNC</button>` | Action Button | **FUNCTIONAL** | Dispatches satellite buffer flush telecommand, sets `syncing` state, and logs uplink status. | Works as intended. |
| 29 | `src/pages/MissionControl.tsx` | 677–686 | `<button onClick={() => handleSendCommand('HOLD', 'HOLD_DEPTH_STATION')}>HOLD DEPTH</button>` | Action Button | **FUNCTIONAL** | Dispatches depth hold telecommand, sets `syncing` state, and logs station holding. | Works as intended. |
| 30 | `src/pages/MissionControl.tsx` | 688–698 | `<button onClick={() => setEmergencyModal(true)}>EMERGENCY SURFACE</button>` | Modal Trigger | **FUNCTIONAL** | Opens emergency confirmation dialog. | Works as intended. |
| 31 | `src/pages/MissionControl.tsx` | 743–748 | `<button onClick={() => setEmergencyModal(false)}>CANCEL</button>` | Modal Button | **FUNCTIONAL** | Dismisses emergency modal without dispatching telecommand. | Works as intended. |
| 32 | `src/pages/MissionControl.tsx` | 749–758 | `<button onClick={() => { setEmergencyModal(false); handleSendCommand('EMERGENCY_SURFACE', 'CRITICAL_BALLAST_DROP_INITIATED'); }}>DISPATCH BALLAST DROP</button>` | Modal Button | **FUNCTIONAL** | Closes modal and executes emergency surface telecommand sequence. | Works as intended. |
| 33 | `src/pages/AUVTwin.tsx` | 753–765 | `container.addEventListener('click', onClick)` (Raycaster 3D Hotspot Click) | 3D Node Click | **FUNCTIONAL** | Uses Raycaster to detect clicks on 3D hotspot spheres; finds matching sensor spec and calls `setSelectedSensor(matched)`. | Works as intended. |
| 34 | `src/pages/AUVTwin.tsx` | 999–1045 | 4 Tier buttons (`ALL`, `INDIGENOUS_PHYSICAL`, `DL_VIRTUAL_REPLICATED`, `MODULAR_UPGRADE`) with `onClick={() => setSelectedTier(...)}` | Tab / Filter | **FUNCTIONAL** | Filters sensor list and highlights active tier. | Works as intended. |
| 35 | `src/pages/AUVTwin.tsx` | 1164–1174 | 6 Preset buttons (`ISO`, `BOW`, `BELLY`, `STERN`, `TOP`, `POV`) with `onClick={() => handleSetPreset(p)}` | View Preset | **FUNCTIONAL** | Repositions Three.js camera, resets pivot, and activates POV HUD + streaming seabed in POV mode. | Works as intended. |
| 36 | `src/pages/AUVTwin.tsx` | 1178–1187 | `<button onClick={() => setXrayMode(!xrayMode)}>X-RAY</button>` | Toggle Button | **FUNCTIONAL** | Toggles hull transparency and internal electronics visibility. | Works as intended. |
| 37 | `src/pages/AUVTwin.tsx` | 1189–1198 | `<button onClick={() => setWireframeMode(!wireframeMode)}>WIREFRAME</button>` | Toggle Button | **FUNCTIONAL** | Toggles wireframe rendering on AUV hull material. | Works as intended. |
| 38 | `src/pages/AUVTwin.tsx` | 1200–1209 | `<button onClick={() => setBeamVisible(!beamVisible)}>BEAMS</button>` | Toggle Button | **FUNCTIONAL** | Toggles visibility of side-scan sonar fan beam cones. | Works as intended. |
| 39 | `src/pages/AUVTwin.tsx` | 1211–1219 | `<button onClick={() => { autoRotateRef.current = !autoRotate; setAutoRotate(!autoRotate); }}>Auto-Rotate</button>` | Toggle Button | **FUNCTIONAL** | Toggles 360-degree orbital rotation of AUV group. | Works as intended. |
| 40 | `src/pages/AUVTwin.tsx` | 1362–1375 | `filteredSensors.map(s => <button onClick={() => setSelectedSensor(s)}>{s.id}</button>)` | Node Carousel | **FUNCTIONAL** | Selects active subsystem node, updates technical panel, cost comparison card, and sparkline. | Works as intended. |
| 41 | `src/pages/ResearchCitations.tsx` | 323–369 | 4 Category buttons (`ALL`, `CORE_IMPLEMENTED`, `PHYSICS_SENSORS`, `GOV_MISSIONS`) with `onClick={() => setSelectedCategory(...)}` | Category Filter | **FUNCTIONAL** | Filters displayed research cards by category. | Works as intended. |
| 42 | `src/pages/ResearchCitations.tsx` | 430–438 & 579–588 | `<a href={item.doiUrl} target="_blank" rel="noopener noreferrer">OFFICIAL DOI / PORTAL</a>` (11 external links) | External Link | **FUNCTIONAL** | Links open verified peer-reviewed publications and government portals in new tab. | Works as intended. |

---

## 3. Deep Analysis of Deficiencies & Proposed Fixes

### 3.1 Dead Button: `SeafloorIntelligence.tsx:892`
- **Location**: `src/pages/SeafloorIntelligence.tsx`, Line 892.
- **Code**:
  ```tsx
  <button className="col-span-2 mt-2 py-1.5 border border-health-critical/50 text-health-critical hover:bg-health-critical/20 rounded transition-colors text-center w-full uppercase tracking-wider font-bold">
    Review / Flag for AUV Revisit
  </button>
  ```
- **Nature of Bug**: Missing `onClick` handler completely.
- **Context**: Rendered for every detection whose calibrated confidence is below 70% (e.g. the "AMBIGUOUS" anomaly preset). In a naval/MoES inspection workflow, low-confidence contacts require human-in-the-loop review.
- **Proposed Solution**:
  1. Add a state `flaggedRevisits: Set<number>` or `reviewedIds: Record<string, boolean>`.
  2. Add handler `onFlagForRevisit(det: Detection, index: number)` that toggles the status, displays a badge `FLAGGED FOR PASS 2 REVISIT (WP QUEUED)`, and pushes a telemetry log entry into `MissionContext` or a toast notification.

### 3.2 Mock Export Placeholders: `GovernmentIntel.tsx:537-548`
- **Location**: `src/pages/GovernmentIntel.tsx`, Lines 25–27, 537–548.
- **Code**:
  ```tsx
  const handleExport = (type: string) => {
    alert(`${type} exported successfully!`);
  };
  ```
- **Nature of Bug**: Four prominent export buttons ("EXPORT PDF REPORT", "SEND TO MoES DASHBOARD", "DOWNLOAD GPX WAYPOINTS", "SHARE VIA SATCOM") rely on `alert()`.
- **Proposed Solution**:
  1. **EXPORT PDF REPORT**: Trigger formatted `window.print()` or synthesize a clean printable report stylesheet.
  2. **DOWNLOAD GPX WAYPOINTS**: Implement a client-side GPX XML generator:
     ```ts
     const handleDownloadGPX = () => {
       const gpx = `<?xml version="1.0" encoding="UTF-8"?>
     <gpx version="1.1" creator="AQUILA OS">
       <wpt lat="-54.2300" lon="72.0100"><name>WP-01 GHOST NET</name><desc>Conf 94.2%</desc></wpt>
       <wpt lat="-54.1800" lon="71.9200"><name>WP-02 UXO MINE</name><desc>Conf 91.4%</desc></wpt>
       <wpt lat="-54.3100" lon="72.2400"><name>WP-03 SHIPWRECK</name><desc>Conf 92.8%</desc></wpt>
       <wpt lat="-54.2700" lon="72.1500"><name>WP-04 SUBSEA CABLE</name><desc>Conf 93.2%</desc></wpt>
       <wpt lat="-54.1400" lon="72.0800"><name>WP-05 DRUM FIELD</name><desc>Conf 86.5%</desc></wpt>
     </gpx>`;
       const blob = new Blob([gpx], { type: 'application/gpx+xml' });
       const a = document.createElement('a');
       a.href = URL.createObjectURL(blob);
       a.download = 'aquila_mission_waypoints.gpx';
       a.click();
     };
     ```
  3. **SEND TO MoES DASHBOARD**: Replace `alert` with a non-blocking toast/modal showing the API payload `{ mission: 'SIH-2026-SO-001', registry: 'MoES_CENTRAL', status: 'SYNCED', timestamp: ... }`.
  4. **SHARE VIA SATCOM**: Replace `alert` with a simulated transmission status state displaying "Transmitting 4.2 MB compressed packet via Iridium L-band... Transmission Complete (ACK_0x22)".

### 3.3 Orphaned UI State: `Biogeochemistry.tsx:233-246`
- **Location**: `src/pages/Biogeochemistry.tsx`, Lines 50, 233–246.
- **Code**:
  ```tsx
  const [selectedDepth, setSelectedDepth] = useState<number>(100);
  ...
  {[25, 50, 100, 200, 500, 1000].map(d => (
    <button onClick={() => setSelectedDepth(d)} className={...}>
      {d}m
    </button>
  ))}
  ```
- **Nature of Bug**: Clicking depth buttons changes which button is green, but does nothing to the chart or data.
- **Proposed Solution**:
  1. Add `<ReferenceLine x={selectedDepth} stroke="#10b981" strokeDasharray="3 3" label={{ value: `${selectedDepth}m SLICE`, fill: '#10b981', fontSize: 10, position: 'top' }} />` to the `AreaChart`.
  2. Add a dynamic "Selected Slice Inspection Readout" panel immediately below or beside the buttons showing:
     - `BGC_DEPTH_SERIES.find(p => p.depth === selectedDepth)` data (Dissolved O₂, Chl-a, pH, Nitrate values at that depth).

### 3.4 Missing 404 Route: `App.tsx`
- **Location**: `src/pages/App.tsx`, Lines 28–40.
- **Nature of Bug**: No fallback route for unexpected paths.
- **Proposed Solution**:
  Add `<Route path="*" element={<Navigate to="/ocean-state" replace />} />` inside `<Routes>`.

---

## 4. Synthesis and Action Plan for Frontend Rewrite

1. **Fix `SeafloorIntelligence.tsx`**:
   - Add `onFlagForRevisit` handler with visual state change (`Reviewed` badge / green border) on line 892.
2. **Fix `GovernmentIntel.tsx`**:
   - Replace `alert()` in `handleExport` with real GPX download, `window.print()` for PDF, and feedback state for MoES and SATCOM actions.
3. **Fix `Biogeochemistry.tsx`**:
   - Wire `selectedDepth` to a `<ReferenceLine>` on the chart and display depth-slice metric metrics.
4. **Fix `App.tsx`**:
   - Add wildcard route fallback.
5. **Compile & Test**:
   - Run `npm run build` to confirm zero TypeScript compilation errors.
