# Findings Log — Deep-Sea 3D Simulation Enhancement

## Initial Assessment
- Goal: Transform React Three Fiber simulation (`AntarcticScene.tsx`) to photorealistic quality.
- Key targets: Dynamic caustics, organic seabed clutter, realistic ice/rock PBR materials, cinematic post-processing (DoF, Bloom, AO via `@react-three/postprocessing`), and zero-regression on MissionDirector and telemetry UI.
- Verification requirements: `npm run build` succeeds; visual screenshots via Playwright script confirm visual fidelity.

## Phase 0: Survey Findings (Merged Explorer Reports)
1. **Scene Architecture & Layout**:
   - Simulation root is located at `frontend/src/simulation/AntarcticScene.tsx` (mounted via `frontend/src/pages/AntarcticSimulation.tsx`).
   - 2D Telemetry HUD and 3D Canvas are separated via DOM z-indexing (`z-0` vs `z-10`/`z-50`) and Zustand store `useSimulationStore`. Post-processing inside Canvas will not blur or disrupt HUD text or interactive buttons.
2. **Environment & Assets Analysis**:
   - `seabed.glb` (1.7MB): 32,400 vertices in a 180x180 grid across 450m x 450m. Applied dynamic procedural Voronoi caustics GLSL via `onBeforeCompile` and silt PBR properties.
   - `abyssal_rock.glb` (1.6MB): Fixed multi-LOD clone stacking bug by isolating `moon_rock_01_LOD1` (2,824 vertices) and discarding duplicate LODs. Instanced 112 rocks with 2K normal/roughness textures, clustered within 10-35m of vehicle path at Y=-142m with bilinear seabed height snapping.
   - `DebrisField.tsx`: Replaced 135 uninstanced draw calls with 4 `<instancedMesh>` groups (339 items: gravel, crinoids, hydrothermal chimneys, ghost nets).
   - `iceberg.glb`: Upgraded to `MeshPhysicalMaterial` with realistic IOR (1.31), volumetric attenuation (`#006899`), clearcoat (0.85), and emissive core glow (`#003855`).
   - `Lighting.tsx`: Calibrated benthic fill light to 1.6 and ambient floor to 0.20 for deep abyssal visibility.
3. **Post-Processing Pipeline**:
   - `@react-three/postprocessing@3.1.1` and `n8ao@2.0.1` integrated into `CinematicPipeline.tsx`.
   - `N8AO`: Ambient crevice contact shadows (`aoRadius={3.5}`, `intensity={2.8}`, `halfRes={true}`, `color="#010814"`).
   - `DepthOfField`: Dynamic target tracking on AUV position (`target={auvVec}`) with photographic bokeh blur on distant structures.
   - `Bloom`: High-luminance `mipmapBlur` optical halo on headlights, beacons, and status LEDs.
   - `Vignette`: Submersible viewport framing.
   - Canvas: `dpr={[1, 1.5]}`, `antialias: false` (delegated to EffectComposer multisampling 8x), `preserveDrawingBuffer: true`.

## Milestones Verification Results
- **Milestone 1 (Worker 1)**: Completed with `npm run build` in 1.50s (0 errors).
- **Milestone 2 (Worker 2)**: Completed with `npm run build` in 1.29s (0 errors).
- **Milestone 3 & Gate (Reviewer 1 & Reviewer 2)**:
  - Reviewer 1: `APPROVE` on visual fidelity, GLSL caustics, instancing, PBR materials, and post-processing passes.
  - Reviewer 2: `APPROVE` on performance, draw call reduction (247 -> 5), garbage collection safety, MissionDirector dive cycle, and 2D HUD telemetry isolation.
  - Gate Result: `PASS`.

## Visual Verification Artifacts
- `screenshots/01_surface_idle.png`: Emissive headlight bloom, flashing red mast beacon, submersible viewport vignette, crisp telemetry HUD.
- `screenshots/02_midwater_descent.png`: Midwater descent with dynamic Voronoi caustics visible on seabed below, sharp vehicle focus with Depth of Field blur.
- `screenshots/03_abyssal_seafloor.png`: Abyssal seafloor with illuminated 2K rock boulders, hydrothermal chimneys, crinoid colonies, gravel, and animated caustics.
- `screenshots/04_sonar_mapping.png`: Close-up benthic survey with geological clusters, deep N8AO crevice shadows, bokeh blur on background spires, glowing beacons, and decision matrix telemetry.
