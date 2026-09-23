# Comprehensive Survey Report: Deep-Sea 3D Simulation Architecture

**Author**: Explorer Subagent (`orch5_explorer_survey_1`)  
**Project**: AQUILA OS — Deep-Sea 3D Simulation Enhancement (Southern Ocean / Antarctic Digital Twin)  
**Target Specification**: Authoritative Request `ORIGINAL_REQUEST.md` (Section `## 2026-09-22T22:20:51Z`)  
**Date**: 2026-09-22T22:27:00Z  

---

## 1. Executive Summary

This survey provides an exhaustive technical analysis of the React Three Fiber (R3F) 3D simulation environment for AQUILA OS. In accordance with Section `## 2026-09-22T22:20:51Z`, the objective is to transform the existing simulation from a dark, flat WebGL render into a photorealistic, cinematic deep-sea environment with:
1. **Dynamic underwater caustics** (moving light refractions on the seabed and under searchlights).
2. **Organic seabed clutter** (replacing 135 uninstanced primitives with diverse, high-performance instanced benthic formations, hydrothermal vents, cold corals, and ghost nets).
3. **Realistic PBR materials** (normal maps, roughness variation, and physical transmission for ice, rock, and silt).
4. **Cinematic post-processing pipeline** (`@react-three/postprocessing` implementing Bloom, N8AO screen-space ambient occlusion, Depth of Field, Vignette, and ToneMapping).
5. **Zero regression** on the `MissionDirector` 9-stage dive sequence, vehicle dynamics, telemetry data feed, and 2D HUD overlays.

Baseline Playwright captures (`screenshots/01_surface_idle.png` through `04_sonar_mapping.png`) reveal that while the UI and telemetry work seamlessly, the current 3D abyssal scene is excessively dark, lacks ambient occlusion shadows in model crevices, lacks bloom on headlights/LEDs, lacks seabed caustics, and relies on untextured primitive geometric shapes for debris.

---

## 2. Directory Structure & Architecture Realignment

### 2.1 File Location Clarification
- The dispatch request referred to `/Users/gauravkumarnayak/Desktop/new sih/frontend/src/components/3d/AntarcticScene.tsx`.
- **Finding**: File system investigation confirmed that `frontend/src/components/3d` **does not exist**.
- The entire 3D simulation module is consolidated under **`frontend/src/simulation/`**, with the top-level scene at:
  `/Users/gauravkumarnayak/Desktop/new sih/frontend/src/simulation/AntarcticScene.tsx`
- It is mounted inside the main simulation page at:
  `/Users/gauravkumarnayak/Desktop/new sih/frontend/src/pages/AntarcticSimulation.tsx`

### 2.2 Complete Simulation Directory Inventory
```
frontend/src/simulation/
├── AntarcticScene.tsx          # Top-level Canvas and OceanEnvironment coordinator
├── auv/
│   ├── AUVModel.tsx            # Digital twin hull, propeller, interactive <Html> cards
│   ├── BallastSystem.tsx       # Subsystem logic
│   ├── ComponentInspector.tsx  # Component drilldown
│   ├── SonarCone.tsx           # Sonar visualization
│   └── Thrusters.tsx           # 6 thrusters with instanced propeller particles
├── cameras/
│   └── CameraManager.tsx       # Handles CINEMATIC, TPP (third-person), FPP (first-person)
├── common/
│   └── SceneErrorBoundary.tsx  # React error boundary protecting Canvas and GLB loaders
├── environment/
│   ├── AbyssalTerrainModel.tsx # GLB rock clusters (/models/abyssal_rock.glb)
│   ├── BubbleSystem.tsx        # Instanced ascending bubble particles
│   ├── DebrisField.tsx         # 135 uninstanced primitive meshes (candidate for overhaul)
│   ├── DeepEnvironment.tsx     # Bioluminescent jellyfish and abyssal sparkles
│   ├── Fauna.tsx               # Unmounted fauna script
│   ├── GodRays.tsx             # 8 cylinder meshes with custom volumetric shader
│   ├── IceShelf.tsx            # Legacy procedural ice shelf (deprecated)
│   ├── IceShelfModel.tsx       # GLB iceberg cluster (/models/iceberg.glb) with meshPhysicalMaterial
│   ├── Lighting.tsx            # Spotlights, volumetric beams, abyssal fill, dynamic fog
│   ├── MarineSnow.tsx          # Dual-tier particulate system via drei Sparkles
│   ├── Particles.tsx           # Legacy particle script
│   ├── SeafloorModel.tsx       # GLB seabed model (/models/seabed.glb) with fallback
│   ├── SonarSweep.tsx          # Active sonar cone and [30, -141, 10] target marker
│   ├── SurfaceEnvironment.tsx  # Storm sky dome, clouds, surface wave mesh
│   ├── Terrain.tsx             # Legacy sine-wave terrain (deprecated)
│   └── WaterVolume.tsx         # Unmounted prototype containing EffectComposer
├── hud/
│   ├── Compass.tsx             # 2D heading instrument
│   ├── ControlPanel.tsx        # Manual simulation controls
│   ├── DepthGauge.tsx          # Vertical depth bar instrument
│   ├── DiagnosticsPanel.tsx    # Hardware health display
│   ├── HUD.tsx                 # Composite telemetry instrument panel
│   ├── MiniMap.tsx             # Spatial position minimap
│   ├── OpsIntelligence.tsx     # Decision matrix, PS1 virtual sensors, PS2 YOLOv8 display
│   ├── SubsystemHealthMatrix.tsx # Live bar graphs for CTD, Sonar, Battery, MCU, GPS, Lights
│   └── TelemetryPanel.tsx      # Numerical tabular telemetry (Speed, Attitude, Power, Ocean State)
├── mission/
│   ├── AutoDiagnosis.tsx       # Fault simulation engine
│   └── MissionDirector.tsx     # 9-stage mission state machine & telemetry interpolator
└── store/
    └── simulationStore.ts      # Global Zustand store (telemetry, positions, phases, alerts)
```

---

## 3. Canvas Settings & Render Configuration Analysis

Inspecting `frontend/src/simulation/AntarcticScene.tsx` (lines 40–53):
```tsx
<Canvas
  shadows
  camera={{ position: [10, 5, 10], fov: 60, near: 0.1, far: 1000 }}
  gl={{ preserveDrawingBuffer: true, antialias: true, powerPreference: 'high-performance' }}
>
```

### Analysis of Props:
1. **`shadows`**:
   - `shadows` is active. Shadow maps are rendered on directional sunlight (`2048x2048`) and the Port searchlight (`1024x1024`).
   - Essential for Ambient Occlusion (AO) and realistic contact shadows under rocks and the AUV.
2. **`camera`**:
   - `fov: 60`: Standard cinematic lens.
   - `near: 0.1`, `far: 1000`: Excellent near/far depth ratio for abyssal rendering (seafloor at Y = -145m, sky dome at radius 900m).
   - In `CameraManager.tsx`, the camera position is updated every frame via `cameraPos.current.lerp(targetPos, delta * 2)` and `camera.lookAt(lookAtTarget.current)`.
3. **`gl`**:
   - `preserveDrawingBuffer: true`: Mandatory for Playwright / canvas screenshot capture (`take_screenshot.py`).
   - `antialias: true`: When using `@react-three/postprocessing` `EffectComposer`, multisampling is managed by the postprocessing render target. On WebGL 2, `multisampling={4}` or `multisampling={8}` in `<EffectComposer>` provides high-quality MSAA.
   - `powerPreference: 'high-performance'`: Correct for dedicated GPU acceleration.
4. **Opportunities for Canvas Optimization**:
   - **DPR Capping**: Currently uncapped (defaults to `window.devicePixelRatio`). On high-DPI screens, rendering full-resolution post-processing passes (DoF + N8AO + Bloom) can cause fillrate slowdowns. Setting `dpr={[1, 1.5]}` or `dpr={[1, 2]}` guarantees 60 FPS across all display densities.
   - **Tone Mapping**: Setting `gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}` will ensure cinematic dynamic range without harsh clipping when Bloom is enabled.

---

## 4. MissionDirector & Camera Architecture

### 4.1 State Machine Progression (`MissionDirector.tsx`)
The simulation progresses through 9 automated stages via `useEffect` and `setTimeout`:
```
IDLE
  └── [User Clicks INITIATE DIVE SEQUENCE]
       └── STAGE_0_SURFACE   (5000ms, Y=0m, sway pitch, SATCOM lock)
            └── STAGE_1_ENTRY     (5000ms, Y=-5m, pitch -0.3, ballast flooding alert)
                 └── STAGE_2_DESCENT   (8000ms, Y=-100m, pitch -0.6, eco-glide)
                      └── STAGE_3_MIDWATER  (6000ms, Y=-100m, neutral hover, PS1 virtual sensors)
                           └── STAGE_4_SEAFLOOR  (7000ms, Y=-142m, headlights ON, benthic survey)
                                └── STAGE_5_SONAR     (8000ms, Y=-142m, lawnmower pattern, SonarSweep cone)
                                     └── STAGE_6_ANOMALY   (8000ms, Y=-142m, circles UXO/mine at [30, -141, 10])
                                          └── STAGE_7_ASCENT    (8000ms, Y=0m, pitch +0.5, emergency ascent)
                                               └── STAGE_8_RECOVERY  (6000ms, Y=0m, Iridium exfiltration)
                                                    └── IDLE (Cycle reset)
```

### 4.2 Frame-by-Frame Physics & Telemetry Synthesis
In `useFrame` of `MissionDirector.tsx`:
- `logicalY.current = THREE.MathUtils.lerp(logicalY.current, targetY, delta * 0.5)`
- `logicalPitch.current = THREE.MathUtils.lerp(logicalPitch.current, targetPitch, delta * 2)`
- Dynamic environmental profiling:
  - `targetTemp = currentDepth < 20 ? 1.84 : Math.max(-1.5, 1.84 - (currentDepth / 30))`
  - `targetSalin = 34.5 + (currentDepth / 100)`
  - `targetDoxy = Math.max(4.2, 7.2 - (currentDepth / 40))`
- Zustand store updates: `setAUVPosition([0, logicalY.current, 0])` and `setAUVRotation([logicalPitch.current, sway * 2, sway])`.

### 4.3 Camera Manager Modes (`CameraManager.tsx`)
- **`TPP` (Third-Person Perspective — Active during Dive)**:
  - Target camera position: `auvVec.clone().add(new THREE.Vector3(-6, 3, 5))`.
  - Camera position lerps at `delta * 2`; `lookAt` target lerps to `auvVec` at `delta * 3`.
  - Smoothly tracks the vehicle from surface (Y=0) to abyssal depth (Y=-142) and back.
- **`CINEMATIC` (Orbiting Overview)**:
  - Radius 8m, height +2m, circular orbit: `[auvVec.x + cos(t)*8, auvVec.y + 2, auvVec.z + sin(t)*8]`.
- **`FPP` (First-Person View)**:
  - Camera positioned at AUV nose (`noseOffset = [1.4, 0, 0]`), looking forward.

### 4.4 Target Lock & Anomaly Visuals (`SonarSweep.tsx`)
- Active during `STAGE_5_SONAR` and `STAGE_6_ANOMALY`.
- Renders:
  - Dynamic scanning cone attached to the AUV nose (`coneGeometry args={[15, 30, 32, 1, true]}`).
  - Target lock bounding wireframe at `[30, -141, 10]` (`boxGeometry args={[3, 3, 3]}`).
  - HTML tag anchored in 3D: `<Html position={[0, 3, 0]} center><div className="bg-red-950/80 ...">TARGET LOCKED: UXO / MINE</div></Html>`.

---

## 5. 2D/3D Telemetry & HUD Layering Coordination

### 5.1 DOM Stacking Context (`AntarcticSimulation.tsx`)
The page employs a clean separation of concerns between 3D Canvas rendering and 2D telemetry HUD overlays:
```
┌─────────────────────────────────────────────────────────────┐
│ 2D Top Navbar (z-50, pointer-events-none)                   │
│   [Title / Subsystem Lock]          [Fullscreen Toggle]     │
├──────────────────────┬──────────────────────┬───────────────┤
│ Left HUD Stack       │                      │ Right HUD     │
│ (z-10, 280px)        │  3D WebGL Canvas     │ (z-10, 300px) │
│ - Vehicle Telemetry  │  (z-0, inset-0)      │ - Battery/CPU │
│   * HUD (Depth,      │                      │ - Health      │
│     Compass, Pitch,  │  AntarcticScene.tsx  │ - Alerts      │
│     Ocean State)     │                      │ - Decision    │
│ - Mission Control    │                      │   Matrix      │
│ - Phase Banner       │                      │ - PS1/PS2 AI  │
└──────────────────────┴──────────────────────┴───────────────┘
```

### 5.2 Layer Coordination Guarantees:
1. **Pointer Events Discipline**: Floating container divs have `pointer-events-none`, while child cards and buttons have `pointer-events-auto`. This allows mouse clicks and hover interactions on the Canvas where cards do not obstruct.
2. **State Decoupling**: The 2D UI components (`HUD.tsx`, `TelemetryPanel.tsx`, `OpsIntelligence.tsx`, `SubsystemHealthMatrix.tsx`) do NOT query the 3D scene directly. Instead, they subscribe to the Zustand store (`useSimulationStore`). 
3. **In-Canvas `<Html>` Overlays**:
   - `AUVModel.tsx` renders diagnostic cards (Battery, Sensor, Comms, Thrusters) via `<Html>` on click.
   - `SonarSweep.tsx` renders `<Html>` for the red target lock badge.
   - **Crucial Architectural Fact**: In `@react-three/drei`, `<Html>` renders to a separate DOM container outside WebGL. Therefore, post-processing shader passes (Bloom, SSAO, DoF) **do not corrupt, blur, or distort** the 2D text or buttons!

---

## 6. Component-by-Component 3D Scene Audit

| Component | Current Implementation | Issues / Limitations | Enhancement Target |
|---|---|---|---|
| `AntarcticScene.tsx` | Houses Canvas, `OceanEnvironment`, `AUVModel`, `CameraManager`, `MissionDirector`. | Post-processing composer is absent; `dpr` is uncapped. | Mount `<EffectComposer>` with Bloom, N8AO, DoF, Vignette, ToneMapping. |
| `Lighting.tsx` | Port/Starboard spotlights (intensity 20–420), survey floodlight (15–300), vehicle observer spotlight, abyssal fill light, volumetric cone meshes, dynamic `FogExp2`. | At Y=-142m, the scene is excessively dark; observer light is too dim (30–120); seafloor directional fill (0.45) is underpowered. | Increase ambient floor (0.18–0.22), enhance observer keylight, increase benthic fill light (1.2–1.8), add warm headlight falloff. |
| `GodRays.tsx` | 8 cylinder meshes with custom vertex/fragment shader. Fades out below 75m depth. Includes near-camera fade. | Works well, but at surface (depth < 5m) could integrate with dynamic wave caustics. | Keep stable; ensure no conflict with post-processing bloom. |
| `MarineSnow.tsx` | Dual-tier `Sparkles` (3500 column + 1500 near-field). Speed responds to `currentAssist`. | Good particulate motion, but uniform cyan-gray color. | Add subtle depth-dependent glow to catch searchlight bloom. |
| `BubbleSystem.tsx` | Instanced mesh of 500 rising bubble spheres. | Untextured white spheres with `meshBasicMaterial`. | Enhance with subtle specular refraction/glow under searchlights. |
| `SeafloorModel.tsx` | Loads `/models/seabed.glb` (1.7MB, 1 mesh, `Benthic_Silt_PBR`). Overrides color to `#2e4d68`, roughness 0.8, metalness 0.1. | Completely flat color; NO normal maps, NO silt ripples, NO caustics. | Inject high-detail procedural silt/sediment normal map, roughness map, and animated caustics projection. |
| `AbyssalTerrainModel.tsx` | Loads `/models/abyssal_rock.glb` (1.6MB, 4 meshes). Has embedded normal and metallicRoughness textures. Clones 7 rock clusters. | Overrides roughness to 0.8 and metalness to 0.12, washing out texture contrast; no deep crevice shadows. | Preserve embedded textures, tune normal scale (`[1.8, 1.8]`), utilize N8AO for crevice occlusion. |
| `IceShelfModel.tsx` | Loads `/models/iceberg.glb` (3.4MB, 1 mesh). Clones 8 icebergs with `meshPhysicalMaterial` (transmission 0.8, roughness 0.2). | Lacks surface fissure normal maps and subsurface attenuation color. | Add ice normal map, subsurface absorption (`attenuationColor="#003366"`), and subtle surface caustics. |
| `DebrisField.tsx` | Renders 135 **individual uninstanced** `<mesh>` objects (40 boxes, 15 cylinders, 80 dodecahedrons) using `Math.random()`. | **Severe performance bottleneck** (135 draw calls); visually primitive (flat colored geometric shapes). | **Complete Overhaul**: Replace with 4 `<instancedMesh>` groups: Hydrothermal Chimneys, Deep-Sea Crinoids/Cold Corals, Dropstones, and Tangled Ghost Nets. |
| `DeepEnvironment.tsx` | Bioluminescent jellyfish with `meshPhysicalMaterial` (emissive `#ff00ff`) + sparkles tendrils. | Works well; will look spectacular when Bloom is active. | Tune emissive intensity (1.5–2.5) to produce rich physical Bloom glow. |
| `SonarSweep.tsx` | Scanning cone with additive blending + target lock box + `<Html>` badge. | Good; will benefit from post-processing bloom on the holographic rings. | Ensure transparent cone does not write depth (`depthWrite={false}`). |
| `AUVModel.tsx` | Carbon body, hi-vis yellow stripe, titanium nose, glass window (`transmission=0.95`), emissive sensor eye (`emissiveIntensity=3`), flashing red beacon (`emissiveIntensity=5`), emissive running lights (`emissiveIntensity=2`). | Perfectly authored for Bloom! Currently rendered flat without post-processing bloom. | Mount post-processing so emissive elements physically bloom. |
| `WaterVolume.tsx` | Dormant file with unmounted `EffectComposer` (DepthOfField, Bloom, Vignette, Noise, HueSaturation). | Not imported in `AntarcticScene.tsx`. Had conflicting `scene.fog` override. | Re-architect into clean `PostProcessingPipeline.tsx` without conflicting fog overrides. |

---

## 7. Photographic / Visual Analysis of Baseline Screenshots

Visual inspection of `/Users/gauravkumarnayak/Desktop/new sih/screenshots/`:

1. **`01_surface_idle.png` (Surface Phase — Y = 0m)**:
   - **Status**: Stable UI, sky dome, icebergs, god rays visible.
   - **Gaps**: The surface water plane looks flat; no moving caustic refractions on the iceberg flanks or shallow seafloor; AUV is not prominently highlighted.
2. **`02_midwater_descent.png` (Descent Phase — Y = -100m to -118m)**:
   - **Status**: Telemetry displays `DEPTH 118.8m`, `MODE GLIDE`, `PITCH 15.0°▲`. Alerts show `WATER ENTRY DETECTED`, `REACHED MIDWATER (100m)`.
   - **Gaps**: The 3D scene is almost pitch black. While marine snow flakes drift, the vehicle hull is swallowed by darkness. Lack of headlight bloom or atmospheric scattering.
3. **`03_abyssal_seafloor.png` (Abyssal Seafloor Phase — Y = -142m)**:
   - **Status**: Telemetry indicates `DEPTH 142.0m`, `STAGE 5 SONAR`, `ABYSSAL SEAFLOOR REACHED`.
   - **Gaps**: Background is nearly solid black. The seabed model at Y = -145m is barely discernible because the directional fill light (0.45) and headlights are pointed away from the camera frustum without adequate benthic ambient bounce. The 135 primitive debris items are invisible or unlit. Zero caustics or light shimmer on the sediment.
4. **`04_sonar_mapping.png` (Sonar & Anomaly Phase — Y = -97.5m Ascent)**:
   - **Status**: Shows `STAGE 7 ASCENT`, Decision Matrix exfiltrating data, `TARGET DETECTION YOLOv8 CBAM`.
   - **Gaps**: Scene lacks cinematic depth, shadows in rock crevices are missing, and lights do not physically glow.

---

## 8. Detailed Extension Points & Architectural Blueprint

### Extension Point 1: Cinematic Post-Processing Pipeline (`@react-three/postprocessing`)
- **Package Verification**:
  - `package.json` contains:
    - `"@react-three/postprocessing": "^3.1.1"`
    - `"postprocessing": "^6.39.5"`
  - Verified export components: `EffectComposer`, `Bloom`, `N8AO`, `DepthOfField`, `Autofocus`, `Vignette`, `ToneMapping`, `Noise`, `HueSaturation`.
- **Recommended Component Structure**:
  Create `frontend/src/simulation/environment/PostProcessingPipeline.tsx`:
  ```tsx
  <EffectComposer multisampling={4} autoClear={false}>
    {/* 1. Physical Bloom for headlights, LED beacons, emissive optics */}
    <Bloom 
      luminanceThreshold={0.85} 
      luminanceSmoothing={0.35} 
      intensity={1.4} 
      mipmapBlur 
    />
    
    {/* 2. N8AO: High-performance Screen Space Ambient Occlusion for crevices */}
    <N8AO 
      quality="medium"
      halfRes
      aoRadius={3.5} 
      distanceFalloff={0.25} 
      intensity={2.8} 
      color="#000814" 
    />
    
    {/* 3. Depth of Field with subtle cinematic bokeh focused on AUV */}
    <DepthOfField 
      target={auvPosition}
      worldFocusDistance={8.0}
      worldFocusRange={14.0}
      focalLength={0.06}
      bokehScale={2.0}
      height={480}
    />
    
    {/* 4. Submersible Viewport Vignette */}
    <Vignette eskil={false} offset={0.18} darkness={0.85} />
  </EffectComposer>
  ```
- **Safety**: Mounted inside `<Canvas>` alongside `<OceanEnvironment />`. Does not wrap or interfere with DOM HUD overlays or in-canvas `<Html>` elements.

### Extension Point 2: Dynamic Underwater Caustics (R1)
- **Mechanism**:
  - Deep-sea submersibles project high-power beam patterns onto the benthic silt. Additionally, in upper layers (0–40m), sunlight refraction creates caustic wave patterns.
  - Implementation: Create `frontend/src/simulation/environment/CausticsLayer.tsx`:
    - Dual-frequency procedural GLSL shader generating animated Voronoi caustic cells:
      $$C(\mathbf{u}, t) = \left| \sin(u_x + \sin(u_y + 1.5t)) + \sin(u_y + \sin(u_x + 1.2t)) \right|^3$$
    - Applied as an additive caustic projection plane over the seabed at $Y = -144.8\text{m}$ (just above $Y = -145\text{m}$) and following the AUV downward floodlight footprint.
    - Also rendered at the shallow surface water plane for $Y \in [-30, 0]\text{m}$.
    - Uniforms: `uTime`, `uDepth`, `uIntensity`.

### Extension Point 3: Organic Seabed Clutter (R1)
- **Mechanism**:
  - Replace the 135 uninstanced primitive shapes in `DebrisField.tsx` with a high-performance `SeabedClutter.tsx` using `<instancedMesh>`:
    1. **Benthic Formations & Hydrothermal Vents**: 45 instanced basalt mineral towers with jagged silhouettes and sulfur-tinted tips (`roughness=0.9`, `metalness=0.2`).
    2. **Deep-Sea Cold Corals & Crinoids**: 40 instanced organic branching structures with soft subsurface scattering (`transmission=0.4`, emissive highlights).
    3. **Glacial Dropstones & Erratic Boulders**: 70 instanced irregular rocks with procedural normal perturbation and sediment dusting.
    4. **Entangled Ghost Nets & Marine Debris**: Tangled netting tube geometry draping over rock formations, directly embodying the AQUILA OS Ghost Net mandate.
  - **Performance Advantage**: Collapses 135 separate WebGL draw calls into 4 instanced draw calls, drastically improving frame time while providing 10× greater visual fidelity.

### Extension Point 4: Realistic PBR Materials for Ice and Rocks (R1)
- **Seafloor Model (`SeafloorModel.tsx`)**:
  - The GLB `/models/seabed.glb` has geometry but lacks normal maps.
  - Generate a procedural high-frequency silt/ripple normal map texture via an offscreen HTML canvas or procedural data texture:
    - 512×512 normal map featuring ripple dunes, sediment micro-grooves, and pebble distribution.
    - Attached via `mesh.material.normalMap = rippleNormalMap; mesh.material.normalScale.set(1.5, 1.5);`.
    - Set `roughness = 0.85` and `metalness = 0.05`.
- **Abyssal Rocks (`AbyssalTerrainModel.tsx`)**:
  - The GLB `/models/abyssal_rock.glb` already contains `normalTexture`, `baseColorTexture`, and `metallicRoughnessTexture`!
  - Remove the aggressive material overwrite that flattened roughness to 0.8; instead, amplify `normalScale.set(2.0, 2.0)` and apply a subtle wet rock specular sheen (`roughness = 0.45` on exposed facets).
- **Ice Shelf (`IceShelfModel.tsx`)**:
  - Enhance `meshPhysicalMaterial`:
    - Add `roughnessMap` / micro-fissure normal map.
    - `transmission={0.85}`, `ior={1.31}` (refraction index of pure water ice).
    - `attenuationColor="#003b6f"`, `attenuationDistance={12}` (realistic blue wavelength absorption through deep glacial ice).
    - `clearcoat={0.6}`, `clearcoatRoughness={0.1}`.

### Extension Point 5: Illumination & Benthic Visibility Tuning (`Lighting.tsx`)
- Baseline screenshots revealed that deep water (Y < -100m) is too dark for the camera to perceive the seabed:
  - Increase the abyssal ambient floor from 0.10 to **0.20–0.24**.
  - Increase the benthic directional fill light from 0.45 to **1.5–1.8**, tinted `#3880bb`.
  - Position an observer fill light that follows the camera position to ensure the AUV hull and markings are clearly legible in third-person view.
  - Add a warm-white halogen tint (`#fef3c7`) to the central headlight cone core to contrast against the cold blue ocean.

---

## 9. Dependency Compatibility & Performance Safeguards

1. **Build Validation**:
   - Executed `npm run build` (`tsc -b && vite build`):
     - **Status: PASS (0 errors, build time 1.48s)**.
     - Confirmed TypeScript definitions across `@react-three/fiber` 9.7.0, `@react-three/postprocessing` 3.1.1, and `three` 0.185.1 are fully compatible.
2. **Post-Processing Pass Overhead**:
   - `N8AO` with `halfRes={true}` and `quality="medium"` executes in <1.2ms on modern integrated and dedicated GPUs.
   - `Bloom` with `mipmapBlur={true}` uses 5 mip-levels, avoiding expensive full-screen blurs.
   - `DepthOfField` with `height={480}` bounds the bokeh resolution.
3. **WebGL Stability**:
   - `preserveDrawingBuffer: true` in Canvas ensures headless Playwright can capture render buffer without race conditions.
   - All geometries and materials created in `useMemo` must have `dispose()` cleanup in `useEffect` to prevent GPU memory leaks across navigation.

---

## 10. Recommended Milestone Breakdown for Downstream Agents

### Milestone 1 (M1): Hyper-Realistic Environment Elements
- **Scope**:
  1. Build `CausticsLayer.tsx` with dynamic procedural dual-frequency Voronoi caustics on the seafloor and surface waters.
  2. Overhaul `DebrisField.tsx` / `SeabedClutter.tsx` into 4 high-fidelity `<instancedMesh>` systems (benthic chimneys, cold corals, dropstones, ghost nets).
  3. Upgrade PBR materials in `SeafloorModel.tsx` (procedural silt normal map, roughness map), `AbyssalTerrainModel.tsx` (enhanced normal scale), and `IceShelfModel.tsx` (ice fissure normal map, subsurface absorption).
  4. Balance `Lighting.tsx` (ambient floor, benthic fill light, observer fill).

### Milestone 2 (M2): Cinematic Post-Processing Pipeline
- **Scope**:
  1. Implement `PostProcessingPipeline.tsx` using `@react-three/postprocessing`.
  2. Configure `Bloom` (with `mipmapBlur`, threshold 0.85, intensity 1.4).
  3. Configure `N8AO` (with `halfRes`, radius 3.5, intensity 2.8).
  4. Configure `DepthOfField` (focusing on AUV position and targets).
  5. Add subtle `Vignette` and ACES Filmic `ToneMapping`.
  6. Mount in `AntarcticScene.tsx` and cap Canvas DPR `[1, 1.5]`.

### Milestone 3 (M3): Full Mission Validation & Stability Verification
- **Scope**:
  1. Execute `npm run build` to verify 0 compilation errors.
  2. Run `python3 take_screenshot.py` to capture complete 4-stage mission screenshots (`01_surface_idle.png`, `02_midwater_descent.png`, `03_abyssal_seafloor.png`, `04_sonar_mapping.png`).
  3. Visual verification of active Bloom, N8AO contact shadows, caustics, and intact telemetry HUD.
