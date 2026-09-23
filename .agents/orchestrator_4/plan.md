# Orchestration Plan: AntarcticScene 3D Simulation Overhaul

## Mission Objective
Fix the React Three Fiber 3D simulation environment (`AntarcticScene.tsx` and related components) so that it loads without visual glitches, replaces procedural geometry with external AAA-quality 3D models (.glb/.gltf) for seafloor and surroundings, fixes glitched volumetric/god-rays lighting into moody cinematic deep-sea atmosphere, and verifies via build and Playwright screenshots.

## Phase 0: Survey (3 Explorers in parallel)
1. **Explorer 1 (Codebase & Scene Structure)**:
   - Investigate `frontend/src/components/AntarcticScene.tsx` and all child/sibling components (Seafloor, IceShelf, GodRays, MarineSnow, Lighting, PostProcessing).
   - Identify the exact cause of visual glitches (e.g. solid white polygon light rays, clipping grids, mathematical sine wave planes).
   - Check dependencies (`@react-three/fiber`, `@react-three/drei`, `three`, etc.).
2. **Explorer 2 (Asset Sourcing & Model Strategy)**:
   - Identify existing 3D models in `frontend/public/` or elsewhere in the project.
   - Investigate how high-quality external `.glb`/`.gltf` seabed and underwater ice models can be acquired, generated, or integrated (e.g., public domain models, procedural converter, three-stdlib/drei asset pipelines, or verified CC0 assets).
   - Check file size, format, texture format, and compatibility.
3. **Explorer 3 (Performance, Telemetry & Screenshot Harness)**:
   - Examine `MissionDirector.tsx`, dive sequences, telemetry overlay integration.
   - Inspect `take_screenshot.py` and package scripts (`npm run build`, `npm run dev`).
   - Define exact verification protocol using Playwright.

## Phase 1: Milestone Decomposition & Interface Contracts
- Consolidate explorer findings into `PROJECT.md`.
- Formulate Milestones (M1: Asset Integration, M2: Lighting/Volumetrics Overhaul, M3: Integration & Screenshot Verification).

## Phase 2: Iteration Loop per Milestone
- For each milestone:
  1. Worker executes implementation, runs `npm run build` and tests.
  2. Reviewer(s) independently verify code quality, performance, and conformance.
  3. Visual verification via Playwright screenshot captures.
  4. Gate evaluation in `GATE_STATUS.md`.

## Phase 3: Final Verification & Human Reporting
- Verify all acceptance criteria.
- Produce comprehensive final summary.
