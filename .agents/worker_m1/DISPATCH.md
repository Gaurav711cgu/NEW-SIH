## 2026-09-22T21:33:40Z

# Dispatch: Worker 1 (Milestone 1 - 3D Asset Acquisition & GLB Integration)

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Objective
Implement Milestone 1: 3D Asset Acquisition & GLB Integration.
Replace all procedural geometry (sine-wave plane for Seafloor, dodecahedrons for IceShelf, stacked cylinder arches for DeepEnvironment) with external AAA-quality `.glb` models loaded via `@react-three/drei`'s `useGLTF` under `<Suspense>` and `<SceneErrorBoundary>`. Fix all pre-existing TypeScript compiler errors so that `npm run build` passes with zero errors.

## Key References
- Authoritative Request: `/Users/gauravkumarnayak/Desktop/new sih/.agents/ORIGINAL_REQUEST.md`
- Project Architecture & Feature Inventory: `/Users/gauravkumarnayak/Desktop/new sih/.agents/orchestrator_4/PROJECT.md`
- Dead Ends to Avoid: `/Users/gauravkumarnayak/Desktop/new sih/.agents/orchestrator_4/DEAD_ENDS.md`
- Explorer 1 Handoff (Scene graph, bug analysis): `/Users/gauravkumarnayak/Desktop/new sih/.agents/explorer_survey_1/handoff.md`
- Explorer 2 Handoff (GLB sourcing script, component code blueprints): `/Users/gauravkumarnayak/Desktop/new sih/.agents/explorer_survey_2/handoff.md`
- Explorer 3 Handoff (Telemetry & build status): `/Users/gauravkumarnayak/Desktop/new sih/.agents/explorer_survey_3/handoff.md`

## Concrete Deliverables
1. **Asset Pipeline**:
   - Create `scripts/prepare_3d_models.py` (see Explorer 2 handoff §4.2) and execute it to place `seabed.glb` (2.5MB), `iceberg.glb` (3.5MB), and `abyssal_rock.glb` (1.7MB) in `frontend/public/models/`.
   - Validate that each `.glb` is a valid binary model.
2. **Component Architecture**:
   - Create `frontend/src/simulation/common/SceneErrorBoundary.tsx` (fully typed React 19 error boundary).
   - Create `frontend/src/simulation/environment/SeafloorModel.tsx` (loads `/models/seabed.glb`, preloads, handles Suspense and fallback).
   - Create `frontend/src/simulation/environment/IceShelfModel.tsx` (loads `/models/iceberg.glb`, clusters along perimeter using Drei `<Clone>`, realistic ice material).
   - Create `frontend/src/simulation/environment/AbyssalTerrainModel.tsx` (loads `/models/abyssal_rock.glb` using Drei `<Clone>` at Y = -145m).
3. **Scene Integration**:
   - In `frontend/src/simulation/AntarcticScene.tsx`:
     - Mount `<SeafloorModel />`, `<IceShelfModel />`, and `<AbyssalTerrainModel />`.
     - Remove the old procedural `Seafloor` sine-wave plane.
     - Remove the unused `Grid` import.
4. **Build Clean-up**:
   - In `frontend/src/pages/AntarcticSimulation.tsx`: Remove or properly type the unused `ErrorBoundary` class to fix the 8 TypeScript errors.
   - Run `npm run build` in `frontend/` and confirm that `tsc -b && vite build` succeeds with 0 errors.
5. **Handoff**:
   - Write comprehensive report to `/Users/gauravkumarnayak/Desktop/new sih/.agents/worker_m1/handoff.md` including build command output and file changes.
