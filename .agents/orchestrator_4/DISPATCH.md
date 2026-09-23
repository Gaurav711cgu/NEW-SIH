## 2026-09-22T21:25:05Z

Mission:
Fix the React Three Fiber 3D simulation environment (`AntarcticScene.tsx` and related components) so that it loads beautifully without visual glitches. Completely overhaul the environment by importing external AAA-quality 3D models (.glb/.gltf) for the seafloor and surroundings instead of relying on procedural geometry.

Requirements:
### R1. External Asset Integration
Replace the existing procedural geometry (Seafloor, IceShelf, etc.) with high-quality external `.glb` or `.gltf` models. The assets must seamlessly fit the deep-sea Antarctic environment (e.g., rocky seabed, underwater ice structures).

### R2. Cinematic Lighting & Atmosphere
Overhaul the lighting, fog, and volumetric effects (God Rays, Marine Snow). The aesthetic must be a moody, immersive deep-sea environment. The light rays must not glitch into massive solid white polygons that blind the camera.

### R3. Performance and Integration
The external models must be properly loaded (e.g., using `useGLTF` or `Suspense`) so they do not crash the browser. The scene must continue to work perfectly with the existing `MissionDirector` dive sequence and telemetry UI.

Verification Resources:
The current project is located in `/Users/gauravkumarnayak/Desktop/new sih/frontend`. You may use Python Playwright scripts (like `take_screenshot.py` in the root) to spin up the local dev server and capture visual evidence of your changes.

Acceptance Criteria:
- Build & Execution:
  * The `frontend` project compiles successfully with `npm run build` with zero TypeScript or syntax errors.
  * The React Three Fiber `Canvas` mounts and runs without crashing or throwing WebGL context errors.
- Visual Polish (Agent-as-Judge via Screenshot):
  * The environment features distinct 3D models (GLB/GLTF) for the seafloor rather than mathematical sine-wave planes.
  * The lighting is dark and atmospheric, with proper fog depth.
  * There are no massive, flat, blocky polygons (glitched God Rays or clipping Grids) obstructing the camera view.

Please maintain your `BRIEFING.md`, `plan.md`, and `progress.md` inside your working directory (`/Users/gauravkumarnayak/Desktop/new sih/.agents/orchestrator_4`). Decompose into subtasks, dispatch to specialists, monitor progress, verify builds and screenshots, and report back when finished.
