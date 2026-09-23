# Survey Report: Post-Processing, Dependencies & Verification Harness
**Project**: AQUILA OS — Deep-Sea 3D Simulation Enhancement  
**Agent**: Explorer Survey 3 (`orch5_explorer_survey_3`)  
**Timestamp**: 2026-09-22T22:30:00Z  
**Authoritative Reference**: `/Users/gauravkumarnayak/Desktop/new sih/.agents/ORIGINAL_REQUEST.md` (Section `## 2026-09-22T22:20:51Z`)

---

## 1. Executive Summary

This survey provides a comprehensive technical audit of the post-processing capabilities, package dependencies, WebGL canvas requirements, and automated visual verification harness for the AQUILA OS 3D Antarctic simulation (`AntarcticScene.tsx`).

### Core Findings:
1. **Zero New Package Installations Required**:
   Both `@react-three/postprocessing` (`v3.1.1`) and `postprocessing` (`v6.39.5`)—along with `n8ao` (`v2.0.1`)—are **already installed** in `frontend/package.json` and present in `frontend/node_modules/`. All peer dependency constraints with React 19 (`v19.2.8`), R3F (`v9.7.0`), Three.js (`v0.185.1`), and `@react-three/drei` (`v10.7.8`) are fully satisfied. The production build (`npm run build`) compiles with zero TypeScript errors in 2.02 seconds.
2. **Current Scene Lacks Active Post-Processing**:
   In `frontend/src/simulation/AntarcticScene.tsx`, no `<EffectComposer>` is currently mounted. An orphaned file `WaterVolume.tsx` exists with a legacy, unmounted post-processing configuration lacking camera tracking and ambient occlusion. Visual inspection of existing screenshots confirms the simulation currently renders flat, unbloomed lighting with no depth of field and no crevice contact shadows.
3. **Optimized Cinematic Pipeline Identified**:
   - **Depth of Field (DoF)**: Native `<DepthOfField>` supports direct dynamic `target` binding to the AUV's world position (`[x, y, z]`), automatically computing camera focus distance on every frame without raycasting overhead.
   - **Bloom**: Dual-filter `<Bloom mipmapBlur>` with high luminance threshold (`0.85`–`0.95`) isolates emissive LEDs (`emissiveIntensity >= 2`), beacons (`emissiveIntensity = 5`), and spotlights (`intensity = 8`) without bleeding onto the carbon hull or seabed.
   - **Ambient Occlusion**: `N8AO` (bundled inside `@react-three/postprocessing`) is decisively recommended over standard `SSAO`. It avoids the heavy G-buffer `NormalPass`, eliminates stochastic grain through temporal/spatial denoising, and delivers smooth crevice shadows on seafloor rocks and AUV hull seams.
   - **WebGL Canvas Setup**: `<Canvas>` should configure `antialias: false` (delegating antialiasing to `<EffectComposer multisampling={8}>`) while retaining `preserveDrawingBuffer: true` for Playwright screenshot capture and `powerPreference: 'high-performance'`.
4. **Verification Harness Enhancement Required**:
   The current test script `/Users/gauravkumarnayak/Desktop/new sih/take_screenshot.py` launches Playwright Chromium with WebGL flags and captures 4 timed mission phases, but it does not exercise camera modes (`TPP`, `FPP`, `FREE`), does not capture close-ups for DoF/Bloom verification, and does not listen for WebGL/browser console warnings. Enhancing this harness is straightforward and will provide definitive visual proof for the judges.

---

## 2. Dependency Audit & Compatibility Matrix

### 2.1 Installed Versions in `frontend/package.json` & `node_modules`

| Package | Specified Version | Installed Version (`node_modules`) | Status |
| :--- | :--- | :--- | :--- |
| `three` | `^0.185.1` | `0.185.1` | Verified |
| `@types/three` | `^0.185.4` | `0.185.4` | Verified |
| `@react-three/fiber` | `^9.7.0` | `9.7.0` | Verified |
| `@react-three/drei` | `^10.7.8` | `10.7.8` | Verified |
| `react` | `^19.2.8` | `19.2.8` | Verified |
| `react-dom` | `^19.2.8` | `19.2.8` | Verified |
| `@react-three/postprocessing` | `^3.1.1` | `3.1.1` | Verified |
| `postprocessing` | `^6.39.5` | `6.39.5` | Verified |
| `n8ao` | `^2.0.0` (via postproc) | `2.0.1` | Verified |
| `typescript` | `~6.0.2` | `6.0.2` | Verified |
| `vite` | `^8.2.2` | `8.2.2` | Verified |

### 2.2 Peer Dependency Verification (`@react-three/postprocessing/package.json`)
The installed `@react-three/postprocessing` version `3.1.1` defines the following `peerDependencies`:
```json
"peerDependencies": {
  "@react-three/fiber": ">=9.7.0",
  "postprocessing": "^6.36.0",
  "react": "^19.0.0",
  "three": ">= 0.156.0"
}
```
**Evaluation**:
- `@react-three/fiber@9.7.0` satisfies `>=9.7.0`.
- `postprocessing@6.39.5` satisfies `^6.36.0`.
- `react@19.2.8` satisfies `^19.0.0`.
- `three@0.185.1` satisfies `>= 0.156.0`.

### 2.3 Build Verification
Running `npm run build` (`tsc -b && vite build`) in `frontend/`:
- **Result**: Command exited with code 0.
- **Compilation Time**: 2.02 seconds.
- **Output Bundle**: `dist/assets/index-BrBud_9w.js` (2,143.42 kB / 596.71 kB gzip) and `dist/assets/index-CF2kODLQ.css` (69.76 kB).
- **TypeScript Typecheck**: Passed with zero diagnostics/errors.

---

## 3. Current Simulation & Visual Analysis

### 3.1 Architecture of `AntarcticScene.tsx`
`frontend/src/simulation/AntarcticScene.tsx` lines 37–55:
```tsx
export default function AntarcticScene() {
  return (
    <div className="w-full h-full bg-[#000000]">
      <Canvas
        shadows
        camera={{ position: [10, 5, 10], fov: 60, near: 0.1, far: 1000 }}
        gl={{ preserveDrawingBuffer: true, antialias: true, powerPreference: 'high-performance' }}
      >
        <OceanEnvironment />
        <BubbleSystem />
        <MissionDirector />
        <CameraManager />
        <group>
          <AUVModel />
        </group>
      </Canvas>
    </div>
  );
}
```

### 3.2 Discovery: Orphaned `WaterVolume.tsx`
In `frontend/src/simulation/environment/WaterVolume.tsx`, an initial post-processing test component was found:
```tsx
export default function WaterVolume() {
  // ...
  return (
    <EffectComposer enableNormalPass={false}>
      <DepthOfField focusDistance={0.05} focalLength={0.1} bokehScale={3} height={480} />
      <Bloom luminanceThreshold={0.8} luminanceSmoothing={0.5} intensity={1.2} />
      <Vignette eskil={false} offset={0.1} darkness={1.2} />
      <HueSaturation hue={0.08} saturation={0.1} />
      <Noise opacity={0.035} />
    </EffectComposer>
  );
}
```
**Key Observations**:
1. `WaterVolume` is **nowhere imported or rendered** in `AntarcticScene.tsx` or any other file in `frontend/src`.
2. The `focusDistance` is hardcoded to `0.05`, meaning it cannot adapt to camera movement or AUV translation.
3. No Ambient Occlusion (`N8AO` or `SSAO`) is included.
4. It demonstrated that `@react-three/postprocessing` imports work cleanly in the project, but the component was abandoned and needs to be replaced with a modern, integrated `CinematicPipeline` component.

### 3.3 Visual Inspection of Existing Screenshots (`screenshots/`)
1. **`01_surface_idle.png`**:
   The floating iceberg features flat, low-contrast polygons without crevice ambient occlusion. The water surface and sky background lack depth blur.
2. **`03_abyssal_seafloor.png` & `04_sonar_mapping.png`**:
   - The AUV's LED beacon (red mast top) and side running lights render as flat matte circles/bars without any optical bloom or halo.
   - The headlights emit a simple volumetric cone, but there is no bloom at the lamp emitter.
   - The AUV hull seams, rudder hinge joints, and thruster shrouds lack contact shadows (AO).
   - All background elements (abyssal rocks, particles) remain 100% pin-sharp regardless of distance from the camera focus plane.
   - Seafloor looks uniform without dynamic caustics or micro-relief shadows.

---

## 4. R2: Cinematic Post-Processing Pipeline Architecture

To achieve the photorealistic standard demanded by section `## 2026-09-22T22:20:51Z`, the render pipeline must implement Depth of Field, Bloom, and Ambient Occlusion.

### 4.1 Depth of Field (DoF)
#### Mechanism in `postprocessing`:
`@react-three/postprocessing` exports `<DepthOfField />` wrapping `DepthOfFieldEffect`.
Internally (`postprocessing/build/index.js:5672-5700`):
```javascript
calculateFocusDistance(target) {
  return this.camera.getWorldPosition(v).distanceTo(target);
}
update(renderer, inputBuffer, deltaTime) {
  if (this.target !== null) {
    const distance = this.calculateFocusDistance(this.target);
    this.cocMaterial.focusDistance = distance;
  }
  // renders CoC and bokeh blur passes...
}
```
#### Implementation Strategy:
- When `<DepthOfField target={auvVector3} ... />` is mounted, `DepthOfFieldEffect` automatically calculates the Euclidean distance from the active camera to the AUV's center on every frame.
- **Recommended Parameters**:
  * `target`: Current AUV position (`[auvPos[0], auvPos[1], auvPos[2]]` from `useSimulationStore`).
  * `focusRange`: `12.0` (world units)—allows the entire 4.5m AUV hull to remain razor-sharp while progressively blurring the background seabed and foreground particles.
  * `bokehScale`: `4.0` to `5.0`—creates smooth cinematic circular bokeh disks for out-of-focus marine snow and distant seabed lights.
  * `focalLength`: `0.06` (60mm lens equivalent).

### 4.2 High-Dynamic-Range Bloom
#### Mechanism:
The AUV model (`AUVModel.tsx`) and headlights (`Lighting.tsx`) already feature high-intensity light sources:
- Dual high-intensity forward spotlights: `intensity={8}`, `distance={150}`
- Internal sensor eye: `emissive="#0088aa"`, `emissiveIntensity={3}`
- Flashing emergency beacon: `emissive="#ff0000"`, `emissiveIntensity={5}`
- Lateral LED strips: `emissive="#00e5ff"`, `emissiveIntensity={2}`
- Thruster exhaust particles: `InstancedMesh` with high brightness

#### Recommended Bloom Parameters:
- `mipmapBlur`: `true` (MANDATORY). Dual-filter mipmap blur produces smooth, non-blocky, energy-conserving optical halos across multiple octaves.
- `luminanceThreshold`: `0.85` to `0.92`. Standard diffuse and physical materials on the carbon hull and rocks have luminance $\le 0.8$, so this threshold guarantees that only true emissive surfaces and spotlight glints bloom.
- `luminanceSmoothing`: `0.3`—softens the threshold boundary to prevent flashing/flickering.
- `intensity`: `1.4` to `1.8`—provides a distinct physical glow in deep water without blinding the camera.

### 4.3 Ambient Occlusion: SSAO vs. N8AO Detailed Evaluation

| Feature | Standard SSAO (`postprocessing`) | N8AO (`n8ao` via `@react-three/postprocessing`) |
| :--- | :--- | :--- |
| **Normal Buffer Requirement** | **Requires** `<EffectComposer enableNormalPass={true}>` | **Does NOT require** NormalPass (computes from depth or internal pass) |
| **Performance Overhead** | High (extra full-screen G-buffer pass + 32 samples) | Very Low (optimized screen-space spatial denoiser) |
| **Noise & Artifacts** | High stochastic grain unless sample count is $\ge 48$ | Temporal stability with bilateral smoothing; zero noise grain |
| **Crevice Depth Control** | Sensitive to depth bias; often halos around fine geometry | Fine-grained artist control (`aoRadius`, `distanceFalloff`, `intensity`) |
| **Deep-Sea Color Tinting** | Multiplies grayscale shadow | Supports `color="#020813"` to tint crevice shadows to ocean abyss |
| **Project Code Availability** | Bundled in `@react-three/postprocessing` | Bundled in `@react-three/postprocessing` (`v2.0.1`) |

#### Recommendation:
**Use N8AO**. N8AO eliminates the expensive `NormalPass` overhead, runs at 60 FPS even on lower-tier GPUs, and generates deep contact shadows under the AUV fins, thruster duct, and rock crevices.
- **Recommended N8AO Parameters**:
  * `aoRadius`: `2.5` to `3.5` (world units)
  * `distanceFalloff`: `0.2` (smooth edge transition)
  * `intensity`: `2.2` to `2.6` (deep, pronounced crevice occlusion)
  * `quality`: `"medium"` or `"high"`
  * `color`: `"#010814"` (deep navy shadow tint)

### 4.4 WebGL Canvas Parameters & Compositor Options

To ensure visual accuracy and stability:
1. **Canvas Props (`AntarcticScene.tsx`)**:
   ```tsx
   <Canvas
     shadows
     camera={{ position: [10, 5, 10], fov: 60, near: 0.1, far: 1000 }}
     gl={{
       antialias: false,               // Turn OFF hardware MSAA on default framebuffer; EffectComposer handles it
       preserveDrawingBuffer: true,     // MANDATORY: Prevents buffer clearing so Playwright captures non-blank frames
       powerPreference: 'high-performance',
       stencil: false,                 // Disables unused stencil buffer to maximize GPU fillrate
       depth: true
     }}
   >
   ```
2. **Compositor Props (`EffectComposer`)**:
   ```tsx
   <EffectComposer
     multisampling={8}                 // WebGL2 multisampled renderbuffer for clean edge AA
     autoClear={true}
     frameBufferType={THREE.HalfFloatType} // High Dynamic Range (HDR) colors > 1.0 for Bloom
   >
   ```
3. **Tone Mapping Interaction**:
   `@react-three/postprocessing` automatically acquires a guard setting `gl.toneMapping = THREE.NoToneMapping` during compositor pass execution so that colors $> 1.0$ can trigger Bloom. Tone mapping can be finalized with `<ToneMapping mode={ToneMappingMode.ACES_FILMIC} />` or Three.js post-pass to achieve rich, cinematic contrast.

---

## 5. R3 & Verification Harness Audit

### 5.1 Inspection of `/Users/gauravkumarnayak/Desktop/new sih/take_screenshot.py`

#### Current Workflow:
1. `ensure_server()` checks if port 5173 responds via `urllib.request`. If not, it executes `npx vite --host 127.0.0.1 --port 5173` from `frontend/`.
2. Uses Playwright Chromium in headless mode:
   ```python
   browser = p.chromium.launch(
       headless=True,
       args=["--enable-webgl", "--ignore-gpu-blocklist"]
   )
   ```
3. Navigates to `http://127.0.0.1:5173/simulation`.
4. Waits for `button:has-text("INITIATE DIVE SEQUENCE")`.
5. Takes `01_surface_idle.png`, clicks the dive button, waits 12s, takes `02_midwater_descent.png`, waits 16s, takes `03_abyssal_seafloor.png`, waits 8s, takes `04_sonar_mapping.png`.

#### Critical Deficiencies & Required Enhancements:
1. **Camera Mode Diversity**:
   `take_screenshot.py` captures only from the default camera position. In `ControlPanel.tsx`, camera modes `TPP`, `FPP`, and `CINEMATIC` are available. A TPP close-up is essential to capture high-resolution Bloom on the AUV lights and Depth of Field bokeh. An FPP shot is essential to capture seafloor caustics and rock detail.
2. **Post-Processing Specific Validation**:
   The harness should capture dedicated test perspectives:
   - `05_tpp_close_bloom_dof.png`: Close-up of AUV showing glowing beacon, headlights, and out-of-focus seabed.
   - `06_fpp_seafloor_caustics.png`: Nose camera perspective looking downward onto illuminated seabed.
   - `07_abyssal_crevice_ao.png`: Seafloor rock formation demonstrating N8AO contact shadows.
3. **Browser Console & Error Interception**:
   `take_screenshot.py` currently discards console logs. Adding `page.on("console", ...)` and `page.on("pageerror", ...)` ensures immediate detection of:
   - WebGL context loss or shader compile warnings.
   - Missing normal pass errors.
   - GLB model loading or texture 404s.

---

## 6. Actionable Implementation Blueprint for Implementation Phase

Based on these findings, the recommended sequence for the implementation team is:

1. **Create `frontend/src/simulation/environment/CinematicPipeline.tsx`**:
   - Assemble `<EffectComposer multisampling={8}>` containing:
     * `<N8AO aoRadius={3.0} distanceFalloff={0.2} intensity={2.4} quality="high" color="#010814" />`
     * `<DepthOfField target={auvVec} focusRange={12.0} bokehScale={4.5} focalLength={0.06} />`
     * `<Bloom mipmapBlur luminanceThreshold={0.85} luminanceSmoothing={0.3} intensity={1.5} />`
     * `<Vignette eskil={false} offset={0.15} darkness={1.15} />`
2. **Update `AntarcticScene.tsx`**:
   - Adjust `gl={{ preserveDrawingBuffer: true, antialias: false, powerPreference: 'high-performance' }}` on `<Canvas>`.
   - Mount `<CinematicPipeline />` inside `<Canvas>`.
3. **Enhance `take_screenshot.py`**:
   - Add camera-mode switching via Playwright button clicks or direct store dispatch.
   - Capture dedicated close-up and forward-facing validation screenshots.
   - Add console error assertion to verify clean WebGL rendering.
4. **Run Verification**:
   - Execute `npm run build` in `frontend/`.
   - Execute `python3 take_screenshot.py` and inspect output artifacts.

---
*Report prepared by Explorer Subagent Survey 3.*
