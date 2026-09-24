# Deep Investigation & Architectural Analysis: Frontend Simulation Fixes (Milestone 9)

**Author:** `teamwork_preview_explorer` (explorer_o9_1)  
**Date:** 2026-09-23  
**Target:** AQUILA OS React / Three.js Frontend Simulation (`/Users/gauravkumarnayak/Desktop/new sih/frontend`)

---

## Executive Summary

This investigation analyzed four core simulation and UI issues within the AQUILA OS frontend:
1. **R1. UI Data Integrity (Remove "UXO/MINE"):** A forensic codebase audit identified 8 files and 20+ line locations containing hardcoded references to "UXO", "MINE", "UXO / MINE", and `"object_class": "mine"`. These cause UI data hallucinations in the Decision Matrix, Mission Director alerts, and Seafloor Intelligence dashboards.
2. **R2. Side-Scan Sonar Object Placement:** Debris and chimneys in `DebrisField.tsx` currently spawn uniformly across a wide bounding box without respecting the AUV's trajectory or the physical characteristics of Side-Scan Sonar (SSS). Specifically, objects spawn directly along the centerline ($Z = 0$), contaminating the nadir gap.
3. **R3. Interactive 3D Camera Controls:** Currently, `CameraManager.tsx` lacks `OrbitControls` and continuously overrides `camera.position` and `camera.lookAt()` every frame in `useFrame`, locking the camera and preventing user pan, rotate, or zoom around the vehicle.
4. **R4. Sonar Strike Highlighting:** In `SonarBeam.tsx`, an animated sonar ping expands radially at 50m over 1.5s, but `DebrisField.tsx` uses a static distance check completely disconnected from the expanding acoustic wave front. Objects fail to exhibit dynamic acoustic return flashes when struck.
5. **Verification & Testing:** The Python environment has `playwright` pre-installed and functional, while `npm run build` is confirmed operational (1.68s clean build). A concrete test harness and assertions were designed.

---

## 1. R1: Comprehensive UI Data Integrity Audit (Eradication of "UXO/MINE")

### 1.1 Complete File & Line Catalog

Every occurrence of "UXO", "MINE", and related terms across `frontend/src` is cataloged below with the exact replacement required:

| # | File Path | Line Number | Current Text / Code Snippet | Concrete Replacement | UI Component / Context |
|---|-----------|-------------|-----------------------------|----------------------|------------------------|
| 1 | `src/simulation/mission/MissionDirector.tsx` | 68 | `addAlert('ANOMALY DETECTED: UXO / MINE');` | `addAlert('ANOMALY DETECTED: GHOST NET');` | Mission Alert Feed & HUD |
| 2 | `src/simulation/mission/MissionDirector.tsx` | 71 | `addAILog('  "object_class": "mine"');` | `addAILog('  "object_class": "ghost_net"');` | Decision Matrix JSON Payload |
| 3 | `src/types/detection.ts` | 53 | `uxo_mine:       '#ef4444', // Red Alert` | `ghost_gear:     '#ef4444', // Red Alert` (or retain key alias) | Detection color palette |
| 4 | `src/types/detection.ts` | 66 | `uxo_mine:       'Subsea UXO / Mine',` | `uxo_mine:       'Derelict Ghost Net / Gear',` | Target class label dictionary |
| 5 | `src/components/SonarProfiler.tsx` | 51 | `id: 'mine-vs-rock',` | `id: 'ghost-net-vs-rock',` | Scenario tab identifier |
| 6 | `src/components/SonarProfiler.tsx` | 52 | `title: 'Subsea Mine / UXO vs Seabed Boulder',` | `title: 'Derelict Ghost Net vs Seabed Boulder',` | Scenario title header |
| 7 | `src/components/SonarProfiler.tsx` | 53 | `category: 'NAVAL HARBOR DEFENSE & EXPLOSIVES',` | `category: 'ACOUSTIC ENTANGLEMENT & GHOST GEAR DEFENSE',` | Category classification tag |
| 8 | `src/components/SonarProfiler.tsx` | 69 | `name: 'Cylindrical Moored Subsea Mine / UXO',` | `name: 'Derelict Entangled Ghost Net / Trawl',` | Target profile name |
| 9 | `src/components/SonarProfiler.tsx` | 70 | `image: '/testing_images/03_cylinder_mine_specular_highlight.jpg',` | `image: '/testing_images/25_entangled_synthetic_fad_trawl_mesh.jpg',` | Image asset path (avoids "mine" in DOM attribute) |
| 10 | `src/components/SonarProfiler.tsx` | 185 | `useState<string>('mine-vs-rock')` | `useState<string>('ghost-net-vs-rock')` | Default scenario state |
| 11 | `src/components/SonarProfiler.tsx` | 517 | `...confuse rocky seafloor ridges with sunken containers or mines because...` | `...confuse rocky seafloor ridges with sunken containers or ghost nets because...` | Acoustic physics summary callout |
| 12 | `src/pages/SeafloorIntelligence.tsx` | 304 | `(preset: 'GHOST_NET' \| 'UXO_MINE' \| ...)` | `(preset: 'GHOST_NET' \| 'DERELICT_TRAWL' \| ...)` | Benchmark preset type |
| 13 | `src/pages/SeafloorIntelligence.tsx` | 344 | `} else if (preset === 'UXO_MINE') {` | `} else if (preset === 'DERELICT_TRAWL') {` | Preset branching condition |
| 14 | `src/pages/SeafloorIntelligence.tsx` | 352 | `object_class: 'uxo_mine',` | `object_class: 'ghost_net',` | Preset target detection object class |
| 15 | `src/pages/SeafloorIntelligence.tsx` | 515 | `onClick={() => handleLoadDemoPreset('UXO_MINE')}` | `onClick={() => handleLoadDemoPreset('DERELICT_TRAWL')}` | Benchmark preset click handler |
| 16 | `src/pages/SeafloorIntelligence.tsx` | 517 | `title="Harbor Security & Naval Defense (Indian Navy / Coast Guard)"` | `title="Marine Protection & Ghost Gear Retrieval (MoES / Coast Guard)"` | Button tooltip |
| 17 | `src/pages/SeafloorIntelligence.tsx` | 520 | `2. SUBSEA UXO / MINE (91.4%)` | `2. DERELICT GHOST NET (91.4%)` | Benchmark preset button text |
| 18 | `src/pages/SeafloorIntelligence.tsx` | 1095 | `{/* Row 2: Subsea UXO / Mine */}` | `{/* Row 2: Derelict Ghost Net */}` | Code comment |
| 19 | `src/pages/SeafloorIntelligence.tsx` | 1099 | `Subsea UXO / Mine` | `Derelict Ghost Net / Trawl` | Table detection class cell |
| 20 | `src/pages/SeafloorIntelligence.tsx` | 1113 | `Distinguishes cylindrical munitions from natural boulders...` | `Distinguishes synthetic mesh gear from natural boulders...` | Acoustic shadow explanation |
| 21 | `src/pages/GovernmentIntel.tsx` | 48 | `name: 'WP-02 SUBSEA UXO MINE', desc: 'Target: Subsea Ordnance / Mine Site \| ...', type: 'Hazmat Threat'` | `name: 'WP-02 GHOST NET MATRIX', desc: 'Target: Submerged Ghost Net Matrix \| Conf: 91.4% \| Synthetic Polymer Mesh (Larsemann Hills)', type: 'Ecology Hazard'` | GPX export waypoints |
| 22 | `src/pages/GovernmentIntel.tsx` | 244 | `{/* Target 2: SUBSEA UXO / MINE (Red Alert) */}` | `{/* Target 2: GHOST NET MATRIX (Ecology Alert) */}` | Code comment |
| 23 | `src/pages/GovernmentIntel.tsx` | 250 | `SUBSEA UXO / MINE SITE` | `GHOST NET ANOMALY SITE` | SVG Map Radar overlay text |
| 24 | `src/pages/GovernmentIntel.tsx` | 252 | `CONF: 91.4% (METALLIC CYLINDER)` | `CONF: 91.4% (SYNTHETIC MESH)` | SVG Map Radar overlay label |
| 25 | `src/pages/GovernmentIntel.tsx` | 313 | `Priority 1 Alert (UXO / Munitions)` | `Priority 1 Alert (Ghost Net Hazard)` | Threat stratification legend |
| 26 | `src/pages/ResearchCitations.tsx` | 891 | `{/* Row 2: Subsea UXO / Mine */}` | `{/* Row 2: Derelict Ghost Net */}` | Code comment |
| 27 | `src/pages/ResearchCitations.tsx` | 895 | `Subsea UXO / Mine` | `Derelict Ghost Net` | Table target label |
| 28 | `src/pages/ResearchCitations.tsx` | 903 | `Specular Metallic Return + Cylindrical Shadow` | `High Acoustic Backscatter + Filament Shadow Matrix` | Acoustic return physics cell |
| 29 | `src/pages/ResearchCitations.tsx` | 905 | `Highlight return > +14 dB, geometric symmetry ratio L/D ≈ 3:1...` | `Highlight return > +12 dB, multi-strand acoustic shadow boundary...` | Physics metrics |
| 30 | `src/pages/ResearchCitations.tsx` | 914 | `Cylindrical casing produces high specular highlight (>+14 dB)...` | `Synthetic rope bundles produce high backscatter (>+12 dB)...` | Physics explanation |
| 31 | `src/pages/ResearchCitations.tsx` | 922 | `Geometry ratio (L/D ≈ 3:1) and sharp shadow cutoffs reject natural boulder false alarms...` | `Spectral entropy analysis rejects natural boulder false alarms...` | Triage explanation |
| 32 | `src/pages/ResearchCitations.tsx` | 927 | `IEEE Oceanic Engineering / US Naval Research Lab (NRL) MCM` | `IEEE Oceanic Engineering / NOAA Marine Debris Program (MDP)` | Citation source |
| 33 | `src/pages/ProposedSystem.tsx` | 103 | `'Mine countermeasures (MCM), deep oceanic salvage...'` | `'Marine debris recovery, benthic habitat protection, and deep oceanic salvage...'` | Sonar industry context |
| 34 | `src/pages/ProposedSystem.tsx` | 318 | `'Classifies ghost nets, subsea mines/UXO, shipwrecks...'` | `'Classifies ghost nets, derelict fishing gear, shipwrecks...'` | Edge AI pipeline specifications |
| 35 | `src/pages/AUVTwin.tsx` | 782 | `typeStr = 'UXO_PIPE'; matColor = 0x94a3b8; matMetal = 0.8; matRough = 0.4;` | `typeStr = 'GHOST_NET_BUNDLE'; matColor = 0x38bdf8; matMetal = 0.2; matRough = 0.8;` | 3D clutter geometry type |
| 36 | `src/pages/AUVTwin.tsx` | 1642 | `Natural rocks cast irregular, tapered shadows. Man-made UXOs and pipes cast sharp...` | `Natural rocks cast irregular, tapered shadows. Synthetic ghost nets and submerged gear cast intricate...` | Shadow analysis card |
| 37 | `src/pages/AUVTwin.tsx` | 1663 | `If a UXO (Unexploded Ordnance) is detected, it is immediately flagged with...` | `If a Ghost Net entanglement hazard is detected, it is immediately flagged with...` | Priority flagging card |
| 38 | `src/simulation/environment/SonarSweep.tsx` | 63 | `<div>CLASS: METALLIC_DEBRIS</div>` | `<div>CLASS: GHOST_NET</div>` | 3D Sonar Target Lock HTML tag |

---

## 2. R2: Side-Scan Sonar (SSS) Object Placement Analysis

### 2.1 Coordinate System & AUV Trajectory Analysis
From `AUVModel.tsx` and `MissionDirector.tsx`:
- **Vehicle Orientation:**
  - Forward (Head/Nose): $+X$ direction ($[1, 0, 0]$).
  - Aft (Tail/Propeller): $-X$ direction ($[-1, 0, 0]$).
  - Port (Left flank): $-Z$ direction ($[0, 0, -1]$).
  - Starboard (Right flank): $+Z$ direction ($[0, 0, 1]$).
  - Dorsal (Top/Mast): $+Y$ direction ($[0, 1, 0]$).
  - Ventral (Keel/Seafloor): $-Y$ direction ($[0, -1, 0]$).
- **Vehicle Cruising Depth & Trajectory:**
  - `auvPosition` is set to `[0, logicalY.current, 0]`.
  - Cruising depth at abyssal seafloor: $Y = -142.0\text{ m}$.
  - Seafloor terrain elevation: $Y \approx -146.5\text{ m}$ to $-150.0\text{ m}$ (calculated via `getSeabedElevation(x, z, seabedPosAttr)`).
  - Trajectory track lies along the $Z = 0$ centerline.

### 2.2 Side-Scan Sonar Physical Acoustics & Mathematical Formulation
In operational side-scan sonar:
1. SSS transducers are mounted on the port ($-Z$) and starboard ($+Z$) sides of the vehicle.
2. The acoustic beams fan laterally outwards perpendicular to the vehicle's track.
3. Directly underneath the vehicle lies the **nadir gap** (blind zone directly beneath the transducers before acoustic backscatter reaches the seabed).
4. Targets cannot be detected along the central track ($Z \approx 0$). All valid targets reside in either the **Port Swath** ($Z < -Z_{\text{inner}}$) or the **Starboard Swath** ($Z > +Z_{\text{inner}}$).

### 2.3 Proposed Mathematical Coordinate Placement
To leave the central corridor strictly clear and place objects within the active SSS detection swath:
- **Central Corridor Exclusion:** Half-width $W_{\text{corridor}} = 14.0\text{ m}$.
  - No debris, ghost nets, or chimneys may be placed where $|Z| < 14.0\text{ m}$.
- **Swath Limits:**
  - Inner Swath boundary: $Z_{\text{inner}} = 14.0\text{ m}$.
  - Outer Swath boundary: $Z_{\text{outer}} = 48.0\text{ m}$ (within the 50m sonar ping pulse limit).
- **Longitudinal Range (Along Track):**
  - $X \in [-50.0\text{ m}, +50.0\text{ m}]$.
- **Mathematical Coordinate Generator for Ghost Nets ($N = 30$):**
  For each instance $i \in [0, 29]$:
  $$\text{side}_i = (i \bmod 2 = 0) ? -1 : 1$$
  $$\Delta Z_i = 14.0 + \text{prng}() \times (46.0 - 14.0) \quad \implies \quad \Delta Z_i \in [14.0\text{ m}, 46.0\text{ m}]$$
  $$Z_i = \text{side}_i \times \Delta Z_i$$
  $$X_i = (\text{prng}() - 0.5) \times 90.0 \quad \implies \quad X_i \in [-45.0\text{ m}, +45.0\text{ m}]$$
  $$Y_{\text{seabed}} = \text{getSeabedElevation}(X_i, Z_i, \text{seabedPosAttr})$$
  $$Y_i = Y_{\text{seabed}} + 3.5 + \text{prng}() \times 2.0$$
- **Mathematical Coordinate Generator for Hydrothermal Chimneys ($M = 40$):**
  For each chimney $j \in [0, 39]$:
  $$\text{side}_j = (j \bmod 2 = 0) ? 1 : -1$$
  $$\Delta Z_j = 18.0 + \text{prng}() \times (60.0 - 18.0) \quad \implies \quad \Delta Z_j \in [18.0\text{ m}, 60.0\text{ m}]$$
  $$Z_j = \text{side}_j \times \Delta Z_j$$
  $$X_j = (\text{prng}() - 0.5) \times 120.0 \quad \implies \quad X_j \in [-60.0\text{ m}, +60.0\text{ m}]$$
  $$Y_j = \text{getSeabedElevation}(X_j, Z_j, \text{seabedPosAttr}) + 5.0$$

**Result:** The corridor $Z \in (-14.0, +14.0)$ is 100% free of obstacles. Every ghost net and chimney is positioned strictly in the port or starboard side-scan detection zone.

---

## 3. R3: Interactive 3D Camera Controls (`OrbitControls`)

### 3.1 Root Cause in Current Camera Setup
In `frontend/src/simulation/cameras/CameraManager.tsx`:
```tsx
useFrame((_, delta) => {
  const mode = useSimulationStore.getState().cameraMode;
  ...
  else if (mode === 'TPP') {
    cameraPos.current.lerp(targetPos, delta * 2);
    camera.position.copy(cameraPos.current);
    lookAtTarget.current.lerp(auvVec, delta * 3);
    camera.lookAt(lookAtTarget.current);
  }
});
```
`MissionDirector.tsx` sets `setCameraMode('TPP')` throughout all operational dive stages (lines 31, 43, 58, 80, 87). Because `CameraManager` writes `camera.position` and `camera.lookAt()` every frame, any mouse or touch interaction is immediately overwritten, preventing the user from panning, rotating, or inspecting the vehicle.

### 3.2 Anchoring `OrbitControls` to the Moving AUV
`@react-three/drei` provides `<OrbitControls makeDefault />`.
To anchor `OrbitControls` to the AUV as it descends from $Y = 0$ down to $Y = -142.0$:
1. Mount `<OrbitControls ref={controlsRef} makeDefault />` in `CameraManager.tsx`.
2. Store `prevAuvPos = useRef(new THREE.Vector3().fromArray(auvPosition))`.
3. In `useFrame`:
   ```tsx
   const currentAuvPos = new THREE.Vector3().fromArray(auvPosition);
   const deltaAuv = currentAuvPos.clone().sub(prevAuvPos.current);
   
   if (controlsRef.current) {
     // Shift both the orbit target and the camera by the AUV displacement delta
     controlsRef.current.target.add(deltaAuv);
     camera.position.add(deltaAuv);
     controlsRef.current.update();
   }
   prevAuvPos.current.copy(currentAuvPos);
   ```
4. **Behavioral Characteristics:**
   - **Descent Tracking:** As the AUV dives through the water column, both the camera and the orbit pivot glide smoothly downwards in lockstep with zero vertical lag or jerking.
   - **360-Degree Interactive Rotation:** The user can click and drag with the mouse at any angle horizontally (azimuth: $-\infty$ to $+\infty$) and vertically (polar angle: $0.1$ to $\pi - 0.1$).
   - **Zoom Controls:** Scroll wheel or pinch-to-zoom allows smooth zooming between `minDistance: 2.5m` and `maxDistance: 60m`.
   - **Non-Interference with Diagnostic Mesh Clicks:** In `AUVModel.tsx`, mesh interaction handlers already invoke `e.stopPropagation()`. When clicking a diagnostic hotspot (Battery, Optical Glass, Conning Tower, Thrusters), `e.stopPropagation()` prevents `OrbitControls` from intercepting the click, so diagnostic cards toggle cleanly without camera rotation.
   - **Mode Integration:** When `cameraMode === 'FPP'`, `OrbitControls` is disabled (`enabled={false}`), allowing first-person nose camera view. When in `TPP` or `FREE`, interactive 360° orbiting is fully enabled.

---

## 4. R4: Sonar Strike Highlighting Architecture

### 4.1 Acoustic Ping Timing & Expansion
In `SonarBeam.tsx`:
```tsx
const duration = 1.5; // Ping period (seconds)
const progress = (time % duration) / duration;
const currentScale = progress * 50; // Expands from 0m to 50m
```
The ping expands outwards laterally to port ($-Z$) and starboard ($+Z$).

### 4.2 Dynamic Strike Detection in `DebrisField.tsx`
Currently, `DebrisField.tsx` applies a static geometric test (`isLateral && inSwathRange`) and turns objects red unconditionally once the AUV reaches the seafloor.
Instead, objects should visually react dynamically as the physical acoustic wave front reaches their exact coordinates.

### 4.3 Proposed Implementation
1. **Clock Synchronization:**
   In `DebrisField.tsx`'s `useFrame(({ clock }) => ...)`:
   ```tsx
   const time = clock.getElapsedTime();
   const duration = 1.5;
   const pingRadius = ((time % duration) / duration) * 50.0;
   ```
2. **Acoustic Wavefront Intersection:**
   For each ghost net $i$:
   ```tsx
   ghostNetRef.current.getMatrixAt(i, tempMatrix);
   dummyObj.position.setFromMatrixPosition(tempMatrix);
   
   const dx = dummyObj.position.x - auvPos[0];
   const dz = dummyObj.position.z - auvPos[2];
   const dy = dummyObj.position.y - auvPos[1];
   // Slant range from AUV sonar transducer to target
   const slantRange = Math.sqrt(dx * dx + dz * dz + dy * dy);
   
   // Check if acoustic wavefront hits target (within wave packet thickness ~2.5m)
   const isAcousticStrike = Math.abs(slantRange - pingRadius) < 2.5 && Math.abs(dx) < 20;
   
   if (isAcousticStrike) {
     strikeTimestamps.current[i] = time;
     // Trigger detection telemetry if not already detected
     if (!detectedIndices.current.has(i)) {
       detectedIndices.current.add(i);
       setDetectedItems(prev => [...prev, { id: i, pos: [dummyObj.position.x, dummyObj.position.y + 4, dummyObj.position.z] }]);
       addAILog(`[AI VISION] Contact acquired! Sonar signature matching Ghost Net at Z:${dummyObj.position.z.toFixed(0)}m.`);
     }
   }
   ```
3. **Acoustic Flash Decay Animation:**
   Compute time since last strike:
   ```tsx
   const timeSinceStrike = time - (strikeTimestamps.current[i] || -999);
   if (timeSinceStrike >= 0 && timeSinceStrike < 0.7) {
     // Decaying specular flash from bright neon-cyan/amber to base color
     const strikeIntensity = 1.0 - (timeSinceStrike / 0.7);
     const flashColor = new THREE.Color().lerpColors(
       detectedIndices.current.has(i) ? alertColor : defaultColor,
       brightAcousticReturnColor, // e.g. #00ffff or #ffff55
       strikeIntensity
     );
     ghostNetRef.current.setColorAt(i, flashColor);
   } else {
     ghostNetRef.current.setColorAt(
       i,
       detectedIndices.current.has(i) ? alertColor : defaultColor
     );
   }
   ```
4. Update instance color buffer:
   ```tsx
   if (ghostNetRef.current.instanceColor) {
     ghostNetRef.current.instanceColor.needsUpdate = true;
   }
   ```

---

## 5. Verification & Test Plan

### 5.1 Verification Matrix

| Requirement | Verification Strategy | Target Criteria | Command / Tool |
|-------------|----------------------|-----------------|----------------|
| **R1. Data Integrity** | Automated Headless Browser DOM Text Scan | Zero instances of "UXO" or "MINE" across all pages in the rendered DOM | Python Playwright script: `verify_uxo_removal.py` |
| **R2. SSS Object Placement** | Code review & geometric assertion | Math verifies $|Z| \ge 14\text{m}$, nadir corridor $Z \in (-14, 14)$ empty | Unit/spec assertion & visual review |
| **R3. Camera OrbitControls** | Interactive browser automation & code review | `<OrbitControls>` present, target anchored to AUV, mouse drag rotates 360° | Playwright mouse drag test & code review |
| **R4. Sonar Strike Highlight** | Frame capture & shader/mesh inspection | Objects flash on ping wave intersection; `setColorAt` active | Visual screenshot diff & code inspection |
| **Build & Typecheck** | TypeScript compilation & Vite bundle | Exit code 0, 0 TypeScript compiler errors | `npm run build` in `frontend/` |

### 5.2 Headless Playwright Verification Script Design
The Python environment in `/Users/gauravkumarnayak/Desktop/new sih` has `playwright` installed.
A test script (`verify_uxo_removal.py`) will:
1. Launch Chromium in headless mode.
2. Visit each application route:
   - `http://127.0.0.1:5173/simulation`
   - `http://127.0.0.1:5173/ocean-state`
   - `http://127.0.0.1:5173/intel`
   - `http://127.0.0.1:5173/system-architecture`
   - `http://127.0.0.1:5173/biogeo`
   - `http://127.0.0.1:5173/seafloor`
   - `http://127.0.0.1:5173/research`
   - `http://127.0.0.1:5173/auv-twin`
3. Extract `document.body.innerText`.
4. Assert `re.search(r'\b(uxo|mine|mines)\b', text, re.IGNORECASE)` is `None`.
5. On `/simulation`:
   - Wait for boot sequence.
   - Click "INITIATE DIVE SEQUENCE".
   - Step through `STAGE_5_SONAR` and `STAGE_6_ANOMALY`.
   - Verify terminal displays `ANOMALY DETECTED: GHOST NET` and `"object_class": "ghost_net"`.
   - Simulate mouse drag (mouse down, move, mouse up) and verify camera azimuth changes.
6. Exit with 0 on success, 1 on any failure.

---

## 6. Implementation Roadmap for Worker

1. **Step 1: Replace all UXO/MINE strings across 8 files:**
   - `src/simulation/mission/MissionDirector.tsx`
   - `src/types/detection.ts`
   - `src/components/SonarProfiler.tsx`
   - `src/pages/SeafloorIntelligence.tsx`
   - `src/pages/GovernmentIntel.tsx`
   - `src/pages/ResearchCitations.tsx`
   - `src/pages/ProposedSystem.tsx`
   - `src/pages/AUVTwin.tsx`
   - `src/simulation/environment/SonarSweep.tsx`
2. **Step 2: Update `DebrisField.tsx` object placement math:**
   - Offset ghost nets to $|Z| \in [14, 46]$ and chimneys to $|Z| \in [18, 60]$.
   - Ensure central corridor $Z \in (-14, 14)$ has 0 objects.
3. **Step 3: Refactor `CameraManager.tsx` to mount anchored `OrbitControls`:**
   - Import `OrbitControls` from `@react-three/drei`.
   - Smoothly translate `target` and `camera` with `deltaAuv`.
   - Enable full 360° rotation and zoom.
4. **Step 4: Implement ping strike highlighting in `DebrisField.tsx`:**
   - Track `time` and compute `pingRadius = ((time % 1.5) / 1.5) * 50`.
   - Detect wavefront strike when $|slantRange - pingRadius| < 2.5$.
   - Flash color with 0.7s decay using `setColorAt`.
5. **Step 5: Run Playwright test script & `npm run build`:**
   - Confirm 0 occurrences of UXO/MINE.
   - Confirm TypeScript builds cleanly.
