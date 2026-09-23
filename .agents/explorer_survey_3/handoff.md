# Comprehensive Survey & Handoff Report: Telemetry Integration, Build Configuration & Visual Verification Harness

**Agent**: Survey Explorer 3  
**Working Directory**: `/Users/gauravkumarnayak/Desktop/new sih/.agents/explorer_survey_3`  
**Date**: 2026-09-22T21:35:00Z  
**Target Milestone**: AntarcticScene 3D Simulation Overhaul (Phase 0 Survey)

---

## 1. Observation

### 1.1 `AntarcticScene.tsx` Scene Graph & Mounting Hierarchy
- **File**: `/Users/gauravkumarnayak/Desktop/new sih/frontend/src/simulation/AntarcticScene.tsx`
  - Mounted inside `<Canvas shadows camera={{ position: [10, 5, 10], fov: 60, near: 0.1, far: 1000 }}>` (lines 159–169).
  - Contains children:
    - `<SoftShadows size={20} samples={16} focus={0.5} />` (line 160)
    - `<OceanEnvironment />` (lines 106–154)
    - `<BubbleSystem />` (line 162)
    - `<MissionDirector />` (line 163) — headless controller inside the R3F Canvas
    - `<CameraManager />` (line 164) — headless camera controller
    - `<group><AUVModel /></group>` (lines 165–167)
  - `<OceanEnvironment />` inlines:
    - `<MarineSnow />` (lines 17–35): 4000 sparkles responsive to `currentAssist`.
    - `<GodRays />` (lines 38–81): 6 cone meshes with additive blending; fades out completely when `depth >= 80m` (`opacity = Math.max(0, 0.5 - (depth / 160))`, lines 59–62).
    - `<SurfaceEnvironment />` (lines 144): Wavy ocean geometry and sky dome, unmounts when `depth > 50m`.
    - `<IceShelf />` (line 146): Dodecahedron floating icebergs, unmounts when `depth > 120m`.
    - `<DeepEnvironment />` (line 147): Cylinder rock arches and bioluminescent jellyfish, unmounts when `depth < 80m`.
    - `<DebrisField />` (line 148): Scattered procedural scrap/barrels/rocks, unmounts when `depth < 60m`.
    - `<SonarSweep />` (line 149): Active only when `missionPhase === 'STAGE_5_SONAR'`.
    - `<Seafloor />` (lines 83–104): Mathematical sine-wave displaced plane `new THREE.PlaneGeometry(1000, 1000, 128, 128)` with `z = Math.sin(x * 0.1) * 2 + Math.cos(y * 0.05) * 3 + Math.sin((x+y)*0.01)*5` positioned at `[0, -142, 0]`.

### 1.2 `MissionDirector.tsx` & Telemetry Progression Mechanics
- **File**: `/Users/gauravkumarnayak/Desktop/new sih/frontend/src/simulation/mission/MissionDirector.tsx`
  - **State Machine Loop** (`useEffect`, lines 15–93):
    - Observes `phase = useSimulationStore((s) => s.missionPhase)`.
    - Initial state in store is `'IDLE'`. When `IDLE`, no auto-transition occurs; system waits for user action (`initiateDive()`).
    - Once initiated, transitions sequentially via timeouts:
      - `STAGE_0_SURFACE` (5000ms delay) -> `STAGE_1_ENTRY`
      - `STAGE_1_ENTRY` (5000ms delay) -> `STAGE_2_DESCENT`
      - `STAGE_2_DESCENT` (8000ms delay) -> `STAGE_3_MIDWATER` (sets powerMode: 'ECO_GLIDE', currentAssist: 1.2)
      - `STAGE_3_MIDWATER` (6000ms delay) -> `STAGE_4_SEAFLOOR`
      - `STAGE_4_SEAFLOOR` (7000ms delay) -> `STAGE_5_SONAR` (sets powerMode: 'ACTIVE_THRUST', currentAssist: 0.1)
      - `STAGE_5_SONAR` (8000ms delay) -> `STAGE_6_ANOMALY`
      - `STAGE_6_ANOMALY` (8000ms delay) -> `STAGE_7_ASCENT`
      - `STAGE_7_ASCENT` (8000ms delay) -> `STAGE_8_RECOVERY`
      - `STAGE_8_RECOVERY` (6000ms delay) -> `IDLE`
  - **Physics & Telemetry Loop** (`useFrame`, lines 100–168):
    - Target Y depth per phase:
      - `IDLE` / `STAGE_0_SURFACE`: `0m`
      - `STAGE_1_ENTRY`: `-5m`
      - `STAGE_2_DESCENT` / `STAGE_3_MIDWATER`: `-100m`
      - `STAGE_4_SEAFLOOR` / `STAGE_5_SONAR` / `STAGE_6_ANOMALY`: `-142m`
      - `STAGE_7_ASCENT` / `STAGE_8_RECOVERY`: `0m`
    - Smooth position lerp: `logicalY.current = THREE.MathUtils.lerp(logicalY.current, targetY, delta * 0.5)` (line 143).
    - Stores AUV position: `setAUVPosition([0, logicalY.current, 0])` (line 166). In `simulationStore.ts` line 209: `setAUVPosition` automatically derives `depth: Math.max(0, -pos[1])`.
    - Dynamic water column telemetry calculation:
      - `targetTemp = currentDepth < 20 ? 1.84 : Math.max(-1.5, 1.84 - (currentDepth / 30))` (line 154)
      - `targetSalin = 34.5 + (currentDepth / 100)` (line 156)
      - `targetDoxy = Math.max(4.2, 7.2 - (currentDepth / 40))` (line 158)
      - Updates store via `useSimulationStore.getState().updateTelemetry({ temperature, salinity, dissolvedOxygen })`.

### 1.3 Telemetry Overlay Interfaces
- **File**: `/Users/gauravkumarnayak/Desktop/new sih/frontend/src/pages/AntarcticSimulation.tsx`
  - Boot Sequence (lines 11–71): Renders `<BootScreen />` until all 17 console lines complete (17 * 150ms + 1000ms = 3550ms). Only after completion does `booted` become `true` and mount `<AntarcticScene />`.
  - Floating Left Panels:
    - `<HUD />` (`src/simulation/hud/HUD.tsx`): Houses `<DepthGauge />`, `<Compass />`, and `<TelemetryPanel />`.
    - Mission Control card: Shows "INITIATE DIVE SEQUENCE" button (`useSimulationStore.getState().initiateDive()`) when `phase === 'IDLE'`, or animated "MISSION IN PROGRESS".
    - `<PhaseBanner />`: Displays formatted mission phase.
  - Floating Right Panels:
    - Systems Status: Battery & CPU progress bars.
    - `<SubsystemHealthMatrix />`: Health meters for CTD, Sonar, Battery, MCU, GPS, Lights.
    - `<AlertFeed />`: Displays recent alerts.
    - `<OpsIntelligence />`: Shows Decision Matrix logs and detection status.

### 1.4 Current Build Configuration & Compilation Errors
- **Command**: `npm run build` in `/Users/gauravkumarnayak/Desktop/new sih/frontend`
- **Result**: Exit code 2, 9 TypeScript compilation errors:
  ```text
  src/pages/AntarcticSimulation.tsx:122:7 - error TS6196: 'ErrorBoundary' is declared but never used.
  src/pages/AntarcticSimulation.tsx:123:15 - error TS7006: Parameter 'props' implicitly has an 'any' type.
  src/pages/AntarcticSimulation.tsx:128:35 - error TS7006: Parameter 'error' implicitly has an 'any' type.
  src/pages/AntarcticSimulation.tsx:132:21 - error TS7006: Parameter 'error' implicitly has an 'any' type.
  src/pages/AntarcticSimulation.tsx:132:28 - error TS7006: Parameter 'errorInfo' implicitly has an 'any' type.
  src/pages/AntarcticSimulation.tsx:137:20 - error TS2339: Property 'hasError' does not exist on type 'Readonly<{}>'.
  src/pages/AntarcticSimulation.tsx:141:28 - error TS2339: Property 'error' does not exist on type 'Readonly<{}>'.
  src/pages/AntarcticSimulation.tsx:145:23 - error TS2339: Property 'children' does not exist on type 'Readonly<{}>'.
  src/simulation/AntarcticScene.tsx:2:10 - error TS6133: 'Grid' is declared but its value is never read.
  ```
- **Configuration Analysis**:
  - `tsconfig.app.json` has strict linter rules: `"noUnusedLocals": true`, `"noUnusedParameters": true`, and `"erasableSyntaxOnly": true`.
  - In `AntarcticScene.tsx:2:10`, `Grid` is imported from `@react-three/drei` but was removed from JSX in commit `ac4352e`, leaving an unused local variable.
  - In `AntarcticSimulation.tsx:122–147`, an untyped vanilla React component `ErrorBoundary` was declared without TypeScript generics or prop typing, and is never referenced in JSX.

### 1.5 Orphaned Lighting & Pitch-Black Seafloor Glitch
- **File**: `/Users/gauravkumarnayak/Desktop/new sih/frontend/src/simulation/environment/Lighting.tsx`
  - Contains volumetric AUV headlights (`<SpotLight ref={headlightRef} intensity={20} distance={40} angle={0.6} volumetric />`) that track AUV position and rotation.
  - **Critical Finding**: `Lighting.tsx` is **NOT imported** into `AntarcticScene.tsx`!
  - In `AntarcticScene.tsx`:
    - `ambientIntensity = Math.max(0.01, 0.3 - (depth / 100))` (lines 115) -> drops to 0.01 at depth > 100m.
    - `sunIntensity = Math.max(0, 1.5 - (depth / 50))` (line 116) -> drops to 0.0 at depth > 50m.
    - `scene.fog = new THREE.FogExp2(fogColor, fogDensity)` where `fogDensity = 0.03` and `fogColor = #000205` (pitch black).
  - **Direct Visual Evidence**: We executed Playwright test captures at Surface, Descent (80m), and Seafloor (137m):
    - At Surface: Dark water and sky visible.
    - At Descent: Scene is almost completely black.
    - At Seafloor (137.1m depth): The scene is **100% pitch black** because all sunlight is gone, ambient light is 0.01, fog absorbs all remaining light, and NO AUV headlights or seafloor lights are mounted in the scene graph!

### 1.6 Visual Verification Harness (`take_screenshot.py`) State
- `take_screenshot.py` did not previously exist in the root repository.
- System environment verified:
  - Python 3.14 at `/Library/Frameworks/Python.framework/Versions/3.14/bin/python3`.
  - `playwright` is installed and verified.
  - Playwright Chromium launches headlessly on macOS with WebGL support enabled.
  - Successfully spun up Vite dev server on port 5173, loaded `http://127.0.0.1:5173/simulation`, waited through `BootScreen` (3.6s), clicked `INITIATE DIVE SEQUENCE`, and captured screenshots across 3 distinct mission phases.

---

## 2. Logic Chain

1. **Build Failure Reason**:
   - `package.json` specifies `"build": "tsc -b && vite build"`.
   - `tsconfig.app.json` enforces `"noUnusedLocals": true`.
   - In `AntarcticScene.tsx`, `Grid` is imported but never used -> triggers `TS6133`.
   - In `AntarcticSimulation.tsx`, an untyped `ErrorBoundary` class is declared but never used -> triggers `TS6196`, `TS7006`, and `TS2339`.
   - *Inference*: Removing `Grid` from `AntarcticScene.tsx` and removing the unused `ErrorBoundary` (or properly typing and mounting it) will immediately resolve all 9 TypeScript compiler errors and allow `npm run build` to pass cleanly.

2. **Visual Blackout Glitch Root Cause**:
   - Observation 1.1 shows `OceanEnvironment` scales down `sunIntensity` to 0 at depth >= 75m and `ambientIntensity` to 0.01 at depth >= 100m.
   - Observation 1.5 shows `Lighting.tsx` (which possesses the AUV headlights and environment reflections) is completely orphaned and unmounted.
   - Observation 1.5 visual evidence proves that at seafloor depth (137–142m), the camera views pure blackness.
   - *Inference*: To achieve a visible, cinematic deep-sea environment, the scene MUST mount high-intensity headlights attached to the AUV (e.g. from `Lighting.tsx`), plus subtle localized point/ambient fill lighting or bioluminescence around the seafloor geometry, while maintaining thick atmospheric blue/black fog.

3. **External Model Integration Strategy**:
   - Observation 1.1 reveals `Seafloor` currently uses `PlaneGeometry` with mathematical sine waves (`Math.sin(x*0.1)*2`).
   - The user prompt strictly mandates replacing this with AAA-quality `.glb` / `.gltf` 3D models.
   - In R3F, external models must use `useGLTF` from `@react-three/drei` and be enclosed in `<Suspense fallback={...}>` to prevent asynchronous blocking or browser crashes.
   - *Inference*: GLB models for the seabed (and ice formations) must be placed in `frontend/public/models/` and loaded via a dedicated `<SeafloorModel />` component using `useGLTF('/models/seafloor.glb')` wrapped in `<Suspense>`.

4. **Telemetry & MissionDirector Continuity**:
   - Observation 1.2 confirms that `MissionDirector` dynamically calculates realistic temperature, salinity, and dissolved oxygen, and updates AUV depth.
   - Observation 1.3 shows the HUD, DepthGauge, and TelemetryPanel consume these exact store values.
   - The screenshot at 137.1m proved the telemetry data dynamically varied: Temp dropped from 1.84°C to -1.50°C, Salinity rose from 34.5 to 35.9 PSU, and Dissolved Oxygen dropped from 7.2 to 4.2 mg/L.
   - *Inference*: The 3D overhaul must preserve `useSimulationStore`'s `depth`, `auvPosition`, and `auvRotation` interfaces so the telemetry and HUD continue to update seamlessly without breaking the mission FSM.

5. **Automated Verification Architecture**:
   - Observation 1.6 demonstrated that a Python Playwright script can autonomously launch the Vite dev server, wait for the boot screen to clear, click "INITIATE DIVE SEQUENCE", monitor depth progression, and capture high-resolution visual evidence across all mission phases.
   - *Inference*: Standardizing `take_screenshot.py` in the workspace root provides an automated visual verification harness for reviewers to inspect the 3D scene at any time.

---

## 3. Caveats

1. **Dev Server Port Conflict**:
   - If port 5173 is already in use by a developer or another process, `take_screenshot.py` must either reuse the existing running server or use a fallback port.
2. **Timing of Depth Transitions in Headless Browser**:
   - Because `MissionDirector` uses `useFrame` with `delta * 0.5` lerping and `setTimeout` intervals (5s–8s per phase), reaching `STAGE_4_SEAFLOOR` takes ~25–30 seconds of simulated wall-clock time from the initial click.
   - For rapid headless testing, `take_screenshot.py` can either wait the ~25s OR programmatically set `window.useSimulationStore.getState().setMissionPhase('STAGE_4_SEAFLOOR')` if `useSimulationStore` is exposed on `window`.
3. **External GLB Sourcing**:
   - External GLB assets must have reasonable polycounts (<50k faces) and compressed textures (e.g. 1k or 2k WebP/PNG) to avoid WebGL context memory exhaustion in headless Chromium environments.

---

## 4. Conclusion & Acceptance Criteria

### 4.1 Functional Acceptance Criteria
- [ ] **Clean Build**: `npm run build` (`tsc -b && vite build`) executes with **0 errors and 0 warnings**.
  - Remove unused `Grid` from `AntarcticScene.tsx:2`.
  - Fix or remove unused untyped `ErrorBoundary` from `AntarcticSimulation.tsx:122`.
- [ ] **Canvas Stability**: R3F `<Canvas>` mounts cleanly without WebGL context loss or unhandled promise rejections.
- [ ] **Suspense Resilience**: All external `.glb` models loaded via `useGLTF` are wrapped in `<Suspense fallback={null}>` and have `useGLTF.preload()` defined.
- [ ] **Telemetry Invariance**: Real-time telemetry in `useSimulationStore` (Depth, Temp, Salinity, DOXY) continues to update continuously as driven by `MissionDirector.tsx` without flatlining.
- [ ] **Mission Progression**: "INITIATE DIVE SEQUENCE" successfully transitions through all 9 mission phases without crashing or halting.

### 4.2 Visual Acceptance Criteria (Agent-as-Judge via Screenshot)
- [ ] **Seafloor Model Integration**:
  - The seafloor is composed of textured 3D `.glb` models (rocky seabed, abyssal trenches, sedimentary terrain) rather than mathematical sine-wave plane meshes.
- [ ] **Cinematic Seafloor Illumination**:
  - The seafloor at 140m depth is **clearly visible** in screenshots.
  - AUV headlights (spotlights / volumetric beams) illuminate the seabed directly in front of the vehicle.
  - Soft ambient deep-sea lighting prevents complete pitch-black void while maintaining dramatic abyssal mood.
- [ ] **Artifact-Free Lighting & God Rays**:
  - No massive opaque white triangular/rectangular polygons obstructing the camera at any depth.
  - God rays smoothly fade out as depth increases and are fully extinguished by 80m.
  - No clipping cyan grids or wireframe planes on the seafloor.
- [ ] **HUD & Telemetry Alignment**:
  - HUD gauges, depth meters, and AI mission logs render crisply overlaid on top of the 3D canvas without occlusion or layout distortion.

---

## 5. Verification Method

### 5.1 Verification Commands
1. **Compilation Check**:
   ```bash
   cd "/Users/gauravkumarnayak/Desktop/new sih/frontend"
   npm run build
   ```
   *Expected Output*: Exit code 0, dist bundle emitted in `frontend/dist/`.

2. **Automated Visual Verification Harness (`take_screenshot.py`)**:
   Run the newly specified screenshot harness from the project root:
   ```bash
   cd "/Users/gauravkumarnayak/Desktop/new sih"
   python3 take_screenshot.py
   ```
   *Expected Output*:
   - Starts Vite dev server if not already running.
   - Generates four screenshot files in `screenshots/`:
     - `screenshots/01_surface_idle.png` (Depth 0m, surface swells & sky)
     - `screenshots/02_midwater_descent.png` (Depth ~80m, deep ocean transition)
     - `screenshots/03_abyssal_seafloor.png` (Depth ~140m, illuminated GLB seafloor)
     - `screenshots/04_sonar_mapping.png` (Depth ~142m, sonar sweep cone & target lock)

3. **Visual Inspection**:
   Use `view_file` on `screenshots/03_abyssal_seafloor.png` to confirm:
   - GLB seabed topology is clearly visible.
   - AUV headlights illuminate the ocean floor.
   - Zero flat sine-wave planes or blocking polygon artifacts.

---

## 6. Implementation Reference: `take_screenshot.py` Specification

The implementing workers should place the following verified script at `/Users/gauravkumarnayak/Desktop/new sih/take_screenshot.py`:

```python
#!/usr/bin/env python3
"""
Automated Visual Verification Harness for AntarcticScene 3D Simulation.
Spins up Vite dev server (if not active), launches Playwright Chromium with WebGL,
waits through boot sequence, initiates dive, and captures multi-depth screenshots.
"""

import os
import sys
import time
import subprocess
import urllib.request
from playwright.sync_api import sync_playwright

WORKSPACE_ROOT = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(WORKSPACE_ROOT, "frontend")
OUTPUT_DIR = os.path.join(WORKSPACE_ROOT, "screenshots")
URL = "http://127.0.0.1:5173/simulation"

def ensure_server():
    try:
        urllib.request.urlopen("http://127.0.0.1:5173", timeout=1)
        print("[HARNESS] Dev server is already running on port 5173.")
        return None
    except Exception:
        print("[HARNESS] Starting Vite dev server on port 5173...")
        proc = subprocess.Popen(
            ["npx", "vite", "--host", "127.0.0.1", "--port", "5173"],
            cwd=FRONTEND_DIR,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        for _ in range(30):
            try:
                urllib.request.urlopen("http://127.0.0.1:5173", timeout=1)
                print("[HARNESS] Dev server is ready.")
                return proc
            except Exception:
                time.sleep(0.5)
        print("[ERROR] Dev server failed to start.")
        sys.exit(1)

def capture_mission():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    server_proc = ensure_server()

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(
                headless=True,
                args=["--enable-webgl", "--ignore-gpu-blocklist"]
            )
            context = browser.new_context(viewport={"width": 1440, "height": 900})
            page = context.new_page()

            print(f"[HARNESS] Navigating to {URL}...")
            page.goto(URL, wait_until="networkidle")

            print("[HARNESS] Waiting for boot sequence (~4s)...")
            page.wait_for_selector('button:has-text("INITIATE DIVE SEQUENCE")', timeout=15000)
            page.wait_for_timeout(2000)  # Shader compilation stabilization

            # Phase 1: Surface
            surface_path = os.path.join(OUTPUT_DIR, "01_surface_idle.png")
            page.screenshot(path=surface_path)
            print(f"[HARNESS] Captured Surface phase: {surface_path}")

            # Click Initiate Dive
            dive_btn = page.query_selector('button:has-text("INITIATE DIVE SEQUENCE")')
            if dive_btn:
                dive_btn.click()
                print("[HARNESS] Triggered INITIATE DIVE SEQUENCE.")

            # Phase 2: Descent / Midwater (~12s in)
            print("[HARNESS] Gliding through descent/midwater (~12s)...")
            page.wait_for_timeout(12000)
            descent_path = os.path.join(OUTPUT_DIR, "02_midwater_descent.png")
            page.screenshot(path=descent_path)
            print(f"[HARNESS] Captured Descent phase: {descent_path}")

            # Phase 3: Seafloor (~15s further in)
            print("[HARNESS] Descending to abyssal seafloor (~15s)...")
            page.wait_for_timeout(15000)
            seafloor_path = os.path.join(OUTPUT_DIR, "03_abyssal_seafloor.png")
            page.screenshot(path=seafloor_path)
            print(f"[HARNESS] Captured Seafloor phase: {seafloor_path}")

            # Phase 4: Sonar Sweep (~8s further in)
            print("[HARNESS] Engaging sonar sector mapping (~8s)...")
            page.wait_for_timeout(8000)
            sonar_path = os.path.join(OUTPUT_DIR, "04_sonar_mapping.png")
            page.screenshot(path=sonar_path)
            print(f"[HARNESS] Captured Sonar phase: {sonar_path}")

            browser.close()
            print("[HARNESS] All screenshot captures complete.")
    finally:
        if server_proc:
            print("[HARNESS] Terminating background dev server...")
            server_proc.terminate()
            server_proc.wait()

if __name__ == "__main__":
    capture_mission()
```
