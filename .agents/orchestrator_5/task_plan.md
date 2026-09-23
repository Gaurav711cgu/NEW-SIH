# Task Plan — Deep-Sea 3D Simulation Enhancement

## Objectives
Enhance the React Three Fiber 3D simulation environment (`AntarcticScene.tsx` and related components) into a photorealistic, highly detailed, real-life deep-sea environment.

## Requirements
1. **R1: Hyper-Realistic Environment Elements**
   - Dynamic underwater caustics (moving light refractions on seafloor)
   - Organic seabed clutter (rocks, marine snow, hydrothermal/ice debris, benthic elements)
   - Realistic material properties for ice and rocks (normal maps, roughness, metalness, PBR shading)
2. **R2: Cinematic Post-Processing Pipeline**
   - Implement `@react-three/postprocessing`
   - Depth of Field (focus on AUV / targets)
   - Bloom (physical glow on AUV lights, LEDs, thruster emissions)
   - Ambient Occlusion (SSAO/N8AO for deep shadows in crevices of 3D models)
3. **R3: Performance & Stability**
   - Stable 3D rendering without browser crashes or WebGL context loss
   - Preserve `MissionDirector` dive sequence and telemetry UI
4. **Verification & Testing**
   - `npm run build` zero errors in `frontend`
   - Headless Playwright script (`take_screenshot.py`) capturing visual proof of Bloom, AO, caustics, and overall photorealism.

## Phased Execution Plan
- **Phase 0: Survey & Investigation (Exploration) — [COMPLETED]**
  - Dispatched 3 Explorers inspecting scene architecture, shaders/materials/models, and post-processing/tooling.
  - Merged findings into `PROJECT.md` and `findings.md`.
- **Phase 1: Environment Elements Implementation (Milestone 1) — [COMPLETED]**
  - Voronoi caustics shader (`onBeforeCompile`), 112 instanced rocks (2K PBR), 339 instanced benthic clutter elements, PBR ice (`MeshPhysicalMaterial`), calibrated lighting.
- **Phase 2: Post-Processing Pipeline Implementation (Milestone 2) — [COMPLETED]**
  - `CinematicPipeline.tsx` mounted with `<EffectComposer multisampling={8}>`, `<N8AO>`, dynamic `<DepthOfField>`, `<Bloom mipmapBlur>`, `<Vignette>`, and calibrated emissive fixtures.
- **Phase 3: Independent Review & Gate Check (Milestone 3) — [COMPLETED]**
  - Reviewer 1 (Visuals) & Reviewer 2 (Performance/Stability/HUD) independently verified and issued unanimous `APPROVE` verdicts.
- **Phase 4: Synthesis & Human Report — [IN_PROGRESS]**
