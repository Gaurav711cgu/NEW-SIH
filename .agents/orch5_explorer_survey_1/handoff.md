# Handoff Report: Phase 0 3D Simulation Architecture Survey

**Agent**: Explorer Subagent (`orch5_explorer_survey_1`)  
**Parent Agent**: Orchestrator (`8348b273-70e6-48c5-b974-3aff67d1b5d0`)  
**Timestamp**: 2026-09-22T22:28:00Z  
**Handoff Type**: Hard (Phase 0 Complete)  

---

## 1. Observation

### 1.1 Directory Structure & File Paths
- The user request referenced `/Users/gauravkumarnayak/Desktop/new sih/frontend/src/components/3d/AntarcticScene.tsx`.
- Direct execution of `find_by_name` on `/Users/gauravkumarnayak/Desktop/new sih/frontend/src/components/3d` returned:
  `Encountered error in tool execution: search directory /Users/gauravkumarnayak/Desktop/new sih/frontend/src/components/3d does not exist`.
- The actual implementation is located at:
  `/Users/gauravkumarnayak/Desktop/new sih/frontend/src/simulation/AntarcticScene.tsx`.
- The top-level simulation page mounting the scene is:
  `/Users/gauravkumarnayak/Desktop/new sih/frontend/src/pages/AntarcticSimulation.tsx` (line 4: `import AntarcticScene from '../simulation/AntarcticScene';`, line 150: `<SceneErrorBoundary><AntarcticScene /></SceneErrorBoundary>`).

### 1.2 Canvas and Render Configuration
- In `frontend/src/simulation/AntarcticScene.tsx` (lines 40–53):
  ```tsx
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
  ```
- Observations: `shadows` is active; `preserveDrawingBuffer: true` is enabled; DPR is uncapped (defaults to device ratio); post-processing `<EffectComposer>` is absent from `AntarcticScene.tsx`.

### 1.3 State Management & Mission Progression
- In `frontend/src/simulation/mission/MissionDirector.tsx`:
  - Lines 15–93: Automated mission progression: `STAGE_0_SURFACE` (5s) → `STAGE_1_ENTRY` (5s) → `STAGE_2_DESCENT` (8s) → `STAGE_3_MIDWATER` (6s) → `STAGE_4_SEAFLOOR` (7s) → `STAGE_5_SONAR` (8s) → `STAGE_6_ANOMALY` (8s) → `STAGE_7_ASCENT` (8s) → `STAGE_8_RECOVERY` (6s) → `IDLE`.
  - Lines 100–168: Every frame (`useFrame`), smooth lerping interpolates target Y:
    - IDLE/Surface: Y = 0
    - Entry: Y = -5
    - Descent/Midwater: Y = -100
    - Seafloor/Sonar/Anomaly: Y = -142
    - Ascent/Recovery: Y = 0
  - Updates telemetry: `temperature`, `salinity`, `dissolvedOxygen`, `pressure`.
  - Sets vehicle store coordinates: `setAUVPosition([0, logicalY.current, 0])` and `setAUVRotation([logicalPitch.current, sway * 2, sway])`.

### 1.4 Camera Angles & Coordination
- In `frontend/src/simulation/cameras/CameraManager.tsx`:
  - Lines 42–54: Mode `TPP`: Camera target offset is `auvVec.clone().add(new THREE.Vector3(-6, 3, 5))`. Lerps position at `delta * 2` and lookAt at `delta * 3`.
  - Mode `CINEMATIC` (lines 26–41): Orbiting radius 8m, height +2m.
  - Mode `FPP` (lines 55–68): Forward nose-mounted view with 10m target distance.

### 1.5 2D/3D Telemetry Layering
- In `frontend/src/pages/AntarcticSimulation.tsx`:
  - Line 148: Canvas wrapper `div` has `absolute inset-0 z-0`.
  - Line 155: Top navbar has `z-50 pointer-events-none` with child buttons `pointer-events-auto`.
  - Line 168: Floating left HUD stack has `z-10 w-[280px] pointer-events-none` (renders `<HUD />`, vehicle telemetry, `<PhaseBanner />`).
  - Line 197: Floating right HUD stack has `z-10 w-[300px] pointer-events-none` (renders `<SubsystemHealthMatrix />`, `<AlertFeed />`, `<OpsIntelligence />`).
  - Zustand store (`frontend/src/simulation/store/simulationStore.ts`) serves as single source of truth; 2D overlays subscribe reactively without touching the WebGL canvas.

### 1.6 Environment Models and Shaders
- `frontend/public/models/`:
  - `seabed.glb` (1.7MB): 1 mesh, material `Benthic_Silt_PBR`. Contains NO embedded textures (normal or roughness).
  - `iceberg.glb` (3.4MB): 1 mesh. Cloned in `IceShelfModel.tsx` with injected `meshPhysicalMaterial`.
  - `abyssal_rock.glb` (1.6MB): 4 meshes, material `moon_rock_01`. Embedded textures: `normalTexture`, `baseColorTexture`, and `metallicRoughnessTexture`.
- `frontend/src/simulation/environment/DebrisField.tsx` (lines 9–70):
  - 135 individual uninstanced meshes (40 scrap boxes, 15 barrel cylinders, 80 rock dodecahedrons). Standard untextured materials.
- `frontend/src/simulation/environment/Lighting.tsx` (lines 120–224):
  - Headlight searchlights scale intensity 20 to 420; survey floodlight scales 15 to 300.
  - Abyssal fill light (line 240) has low intensity 0.45; ambient floor is 0.10.
  - Deep fog is `FogExp2` with color `#020f22` and density 0.010.

### 1.7 Post-Processing Package & Test Compilation
- `frontend/package.json` contains:
  - `"@react-three/postprocessing": "^3.1.1"`
  - `"postprocessing": "^6.39.5"`
  - `"@react-three/fiber": "^9.7.0"`
  - `"three": "^0.185.1"`
- Running `node -e "const pp = require('@react-three/postprocessing'); console.log(Object.keys(pp));"` verified available components: `Bloom`, `DepthOfField`, `Autofocus`, `N8AO`, `SSAO`, `Vignette`, `ToneMapping`, `Noise`, `HueSaturation`.
- Running `npm run build` in `frontend/`:
  - Result: `✓ built in 1.48s`, **0 TypeScript or Vite build errors**.
- Running `python3 take_screenshot.py`:
  - Result: Succeeded with exit code 0. Captured 4 screenshots:
    `screenshots/01_surface_idle.png`, `02_midwater_descent.png`, `03_abyssal_seafloor.png`, `04_sonar_mapping.png`.
  - Visual inspection confirms deep phases (`02` and `03`) are excessively dark, lack bloom on headlights and beacons, lack ambient occlusion in crevices, lack dynamic caustics on the seabed, and render primitive untextured debris.

---

## 2. Logic Chain

1. **Premise**: Authoritative request `ORIGINAL_REQUEST.md` (section `## 2026-09-22T22:20:51Z`) mandates dynamic underwater caustics, organic seabed clutter, realistic PBR materials for ice/rocks, and a cinematic post-processing pipeline (`@react-three/postprocessing`) including Bloom, Depth of Field, and Ambient Occlusion, without breaking `MissionDirector` or telemetry UI.
2. **Observation 1.1 & 1.5**: The 3D scene is located in `frontend/src/simulation/AntarcticScene.tsx` and cleanly separated from the 2D DOM HUD via z-indexing (`z-0` for Canvas vs `z-10`/`z-50` for overlays) and decoupled via Zustand store (`useSimulationStore`). In-canvas `<Html>` elements render into a DOM container outside WebGL.
   - *Inference*: Post-processing passes inside Canvas will strictly process the 3D WebGL buffer and cannot corrupt, blur, or displace the 2D telemetry HUD or text.
3. **Observation 1.2, 1.6 & 1.7**: `@react-three/postprocessing` is already installed and verified to export `Bloom`, `N8AO`, and `DepthOfField`. `npm run build` passes with zero errors.
   - *Inference*: Implementing `PostProcessingPipeline.tsx` with `<EffectComposer>` using `N8AO`, `Bloom` (with `mipmapBlur`), and `DepthOfField` (tracking `auvPosition`) is directly achievable without adding third-party dependencies or breaking build integrity.
4. **Observation 1.6**: `DebrisField.tsx` currently instantiates 135 individual meshes without instancing. `seabed.glb` has geometry but lacks normal maps and caustics. Deep water lighting leaves the seafloor at Y=-145m nearly black.
   - *Inference*: To achieve photorealism, `DebrisField.tsx` must be converted to `<instancedMesh>` groups (hydrothermal chimneys, cold-water corals, glacial dropstones, ghost nets). `SeafloorModel.tsx` needs a procedural silt normal map and an animated dual-frequency caustics projection layer. `Lighting.tsx` needs its benthic fill light and ambient floor tuned to illuminate the new clutter.

---

## 3. Caveats

1. **Device Pixel Ratio (DPR)**: High-resolution displays (Retina screens with DPR >= 2) can suffer GPU fillrate drops when running full-resolution SSAO and Depth of Field. The Canvas DPR should be capped at `[1, 1.5]`, and `N8AO` should use `halfRes={true}`.
2. **Post-Processing Antialiasing**: When using `<EffectComposer>`, WebGL's standard hardware antialiasing (`antialias: true`) is replaced by the composer's render target multisampling. Using `multisampling={4}` on `<EffectComposer>` is necessary to maintain crisp geometry silhouettes.
3. **Fog vs Post-Processing Interaction**: As observed in the dormant `WaterVolume.tsx`, setting `scene.fog` inside an uncoordinated subcomponent can conflict with dynamic fog in `Lighting.tsx`. All fog updates must remain unified in `Lighting.tsx`, while post-processing resides solely in `PostProcessingPipeline.tsx`.

---

## 4. Conclusion

The React Three Fiber architecture in `frontend/src/simulation/` is highly modular, robustly structured, and ready for photorealistic enhancement. 

### Actionable Roadmap for Implementation:
1. **Milestone 1 — Hyper-Realistic Environment Elements**:
   - Create `frontend/src/simulation/environment/CausticsLayer.tsx` (procedural animated dual-frequency Voronoi caustics on seafloor and shallow water).
   - Overhaul `DebrisField.tsx` into an instanced `SeabedClutter.tsx` with 4 benthic clutter classes (benthic chimneys, deep-sea corals/crinoids, dropstones, ghost nets).
   - Upgrade PBR materials in `SeafloorModel.tsx` (procedural silt normal map, roughness map), `AbyssalTerrainModel.tsx` (unlocked normalScale `[1.8, 1.8]`), and `IceShelfModel.tsx` (ice fissure normal map, subsurface absorption `attenuationColor="#003b6f"`).
   - Tune `Lighting.tsx`: raise ambient floor to 0.20, boost benthic fill light to 1.6, and add vehicle observer keylight.
2. **Milestone 2 — Cinematic Post-Processing Pipeline**:
   - Implement `frontend/src/simulation/environment/PostProcessingPipeline.tsx` with `<EffectComposer>`:
     - `Bloom` (intensity 1.4, threshold 0.85, `mipmapBlur`).
     - `N8AO` (intensity 2.8, radius 3.5, `halfRes`, `quality="medium"`).
     - `DepthOfField` (target: AUV position, focalLength 0.06, bokehScale 2.0).
     - `Vignette` (darkness 0.85, offset 0.18).
   - Mount in `AntarcticScene.tsx` and cap Canvas `dpr={[1, 1.5]}`.
3. **Milestone 3 — Verification & Visual Proof**:
   - Run `npm run build` in `frontend/` (0 errors required).
   - Run `python3 take_screenshot.py` to capture and verify all 4 mission phase screenshots (`01_surface_idle.png` through `04_sonar_mapping.png`).

---

## 5. Verification Method

To independently verify these findings:
1. **Check Directory Structure**:
   `ls -la "frontend/src/simulation"`
2. **Validate TypeScript & Build**:
   `cd frontend && npm run build`
   Must output `✓ built in ...` with zero errors.
3. **Verify Post-Processing Exports**:
   `node -e "const pp = require('@react-three/postprocessing'); console.log(Object.keys(pp));"`
4. **Inspect GLB Model Headers**:
   `node -e "const fs = require('fs'); ['seabed.glb','iceberg.glb','abyssal_rock.glb'].forEach(f => { const buf = fs.readFileSync('frontend/public/models/'+f); console.log(f, buf.readUInt32LE(12)); });"`
5. **Run Visual Screenshot Harness**:
   `python3 take_screenshot.py`
   Inspect generated images in `screenshots/` to confirm mission progression through all 4 phases.

---
*Report generated and signed off by Explorer Subagent orch5_explorer_survey_1.*
