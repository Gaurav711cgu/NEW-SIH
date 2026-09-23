# Project: AntarcticScene 3D Simulation Overhaul

## Architecture
- **Framework**: React 19 + Vite + TypeScript
- **3D Graphics Engine**: `@react-three/fiber` (R3F) v9.7 + `@react-three/drei` v10.7 + Three.js v0.185
- **Simulation Controllers**: Headless `MissionDirector` (dive state machine FSM) + `CameraManager` (cinematic/TPP/FPP camera rig)
- **State Management**: `zustand` (`useSimulationStore`) holding depth, AUV position/rotation, CTD telemetry
- **Asset Pipeline**: Static GLB assets served from `frontend/public/models/` via Vite, loaded via Drei `useGLTF` with module-level preloading, wrapped in React `<Suspense>` and typed `<SceneErrorBoundary>`.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | 3D Model Asset Pipeline | Generation and placement of `seabed.glb`, `iceberg.glb`, and `abyssal_rock.glb` in `frontend/public/models/` | M1 | Survey E2 |
| 2 | Robust Model Loading Infrastructure | `SceneErrorBoundary.tsx`, Suspense wrappers, fallback procedural geometry, and `useGLTF.preload` | M1 | Survey E2 |
| 3 | Seafloor GLB Integration | Replace mathematical sine-wave plane with `SeafloorModel.tsx` loading `seabed.glb` at Y = -145m | M1 | Survey E1, E2 |
| 4 | Ice Shelf GLB Integration | Replace low-poly dodecahedrons with `IceShelfModel.tsx` loading `iceberg.glb` with realistic submerged keels | M1 | Survey E1, E2 |
| 5 | Abyssal Rocks GLB Integration | Replace primitive cylinder rock arches with `AbyssalTerrainModel.tsx` loading `abyssal_rock.glb` boulders | M1 | Survey E1, E2 |
| 6 | TypeScript Compiler Fixes | Fix 8 TS errors in `AntarcticSimulation.tsx` (untyped `ErrorBoundary`) and 1 in `AntarcticScene.tsx` (unused `Grid`) | M1 | Survey E1, E3 |
| 7 | God Rays Glitch Elimination | Overhaul `GodRays` to prevent camera frustum clipping into solid white polygons; soft view-angle & distance falloff | M2 | Survey E1 |
| 8 | Dynamic Marine Snow System | Extend or anchor `MarineSnow` to cover depth 0m to -150m so particles remain visible at abyssal depths | M2 | Survey E1 |
| 9 | Headlights & Deep-Sea Lighting | Mount AUV high-intensity headlights and tune abyssal ambient/fog lighting so 3D seafloor is dramatically illuminated | M2 | Survey E3 |
| 10| MissionDirector & Telemetry Continuity | Ensure smooth depth lerping, dive progression, and dynamic CTD telemetry display across all 9 phases | M3 | Survey E3 |
| 11| Automated Screenshot Verification Harness | Python Playwright script (`take_screenshot.py`) capturing multi-depth visual evidence | M3 | Survey E3 |
| 12| Visual & Build Acceptance Sign-off | `npm run build` exits 0; screenshot visual review confirming zero glitches, GLB seafloor, and moody lighting | M3 | Survey E1, E2, E3 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: 3D Asset Acquisition & GLB Model Integration | Sourcing/generating GLBs, `SceneErrorBoundary`, `SeafloorModel`, `IceShelfModel`, `AbyssalTerrainModel`, TS compiler fixes | none | DONE |
| 2 | M2: Cinematic Lighting, Volumetrics & Marine Snow Overhaul | Fix God Rays solid polygon glitch, mount AUV headlights, tune deep-sea ambient/fog, continuous marine snow | M1 | DONE |
| 3 | M3: Mission Integration, Build & Screenshot Verification | Full build validation, `take_screenshot.py` visual capture across phases, telemetry verification, final sign-off | M1, M2 | IN_PROGRESS |

## Interface Contracts
### Asset Serving & Loading Contract
- All 3D assets MUST reside in `frontend/public/models/<asset_name>.glb`.
- Assets must be loaded via `useGLTF('/models/<asset_name>.glb')` and preloaded via `useGLTF.preload('/models/<asset_name>.glb')`.
- All model components MUST be wrapped in `<SceneErrorBoundary>` and `<Suspense fallback={...}>`.
- Multiple instances MUST use `@react-three/drei`'s `<Clone object={scene} />` to avoid Three.js parent hierarchy mutation.

### Coordinates & Spatial Alignment Contract
- Surface waterline: `Y = 0`.
- Icebergs: Origin at `Y = 0`, keel submerged to `Y = -12` to `-30`.
- Seafloor: Positioned at `[0, -145, 0]` with AUV survey flight corridor at `Y = -142` (3m clearance).
- Abyssal boulders: Placed on seafloor from `Y = -145` to `Y = -135`.
- Telemetry & Physics: `MissionDirector` writes AUV coordinates to `useSimulationStore`. Coordinate conventions `[x, y, z]` must remain invariant.

## Code Layout
- `frontend/public/models/`: Binary `.glb` 3D model files (`seabed.glb`, `iceberg.glb`, `abyssal_rock.glb`).
- `frontend/src/simulation/common/SceneErrorBoundary.tsx`: Typed React 19 error boundary for 3D subtrees.
- `frontend/src/simulation/environment/SeafloorModel.tsx`: GLB seafloor component.
- `frontend/src/simulation/environment/IceShelfModel.tsx`: Cloned GLB iceberg cluster component.
- `frontend/src/simulation/environment/AbyssalTerrainModel.tsx`: Cloned GLB rock outcroppings component.
- `frontend/src/simulation/environment/GodRays.tsx`: Shaded volumetric light shafts with view-angle & distance falloff.
- `frontend/src/simulation/environment/MarineSnow.tsx`: Depth-following marine snow particle system.
- `frontend/src/simulation/environment/Lighting.tsx`: AUV dual volumetric headlights and deep-sea fill lights.
- `frontend/src/simulation/AntarcticScene.tsx`: Top-level Canvas scene graph assembling all environment and vehicle elements.
- `frontend/src/pages/AntarcticSimulation.tsx`: Page wrapper with telemetry HUD, Mission Control, and boot sequence.
- `take_screenshot.py`: Root Python Playwright visual capture harness.
