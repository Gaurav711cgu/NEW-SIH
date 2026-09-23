# Dispatch: Explorer 1 (Survey - Codebase & Scene Analysis)

## Objective
Investigate `frontend/src/components/AntarcticScene.tsx` and all related 3D graphics components in `frontend/src/components/` and `frontend/src/` to map the current scene graph, procedural geometry, lighting, god rays, marine snow, and shader implementations. Identify exactly why visual glitches occur (solid white polygon light rays, clipping grids, mathematical sine wave planes) and list all affected files.

## References
- Authoritative Request: `/Users/gauravkumarnayak/Desktop/new sih/.agents/ORIGINAL_REQUEST.md`
- Frontend root: `/Users/gauravkumarnayak/Desktop/new sih/frontend`
- Orchestrator plan: `/Users/gauravkumarnayak/Desktop/new sih/.agents/orchestrator_4/plan.md`

## Instructions
1. Explore `AntarcticScene.tsx` and all child components imported into it (e.g., seafloor, ice shelf, lighting, god rays, particles/snow, post-processing).
2. Trace the exact geometry and shader code causing the visual glitch where light rays render as "massive solid white polygons that blind the camera" and procedural sine-wave seafloor.
3. Check `package.json` for installed Three.js / R3F / Drei / postprocessing dependencies and versions.

## 2026-09-22T21:26:00Z
Investigate `frontend/src/components/AntarcticScene.tsx` and all related 3D graphics components in `frontend/src/components/` and `frontend/src/` to map the current scene graph, procedural geometry, lighting, god rays, marine snow, and shader implementations. Identify exactly why visual glitches occur (solid white polygon light rays, clipping grids, mathematical sine wave planes) and list all affected files. Also examine `package.json` for installed Three.js, R3F, Drei, and postprocessing versions.

Write your comprehensive findings and recommendations to `/Users/gauravkumarnayak/Desktop/new sih/.agents/explorer_survey_1/handoff.md`.
Send a completion message back to the orchestrator when finished.

## 2026-09-22T23:23:12Z
Task:
Perform a deep technical survey and code-level inspection of `frontend/src/pages/OceanState.tsx` and any related telemetry/sensor components in `frontend/src/`.

Specifically investigate:
1. Every metric, chart, telemetry card, and sensor name currently rendered in `OceanState.tsx`.
2. All occurrences of banned terms ("Virtual", "Mock", "Simulation", "Fake") in code, UI text, variable names, or rendered labels.
3. Identify all text blocks and paragraphs that exceed 3 lines or are dense and hard to scan.
4. Assess current scientific parameters: identify any unrealistic values (e.g. warm water temps, wrong salinity units) and propose authentic Antarctic / Southern Ocean parameters (e.g., negative water temperatures -1.8°C to +1.2°C, 33.8-34.7 PSU salinity, dissolved oxygen 300-350 µmol/kg, chlorophyll-a 0.2-2.5 mg/m³, carbon sequestration flux mg C/m²/day, Weddell Sea/Prydz Bay hydrodynamics).
5. Specify authentic oceanographic hardware sensors to replace any virtual/mock labels (e.g. Sea-Bird SBE 911plus CTD Profiler, Teledyne RDI Workhorse Sentinel ADCP, Seapoint Chlorophyll Fluorometer, WetLabs ECO Triplet, RT-DETR Multi-Beam Sonar Array).
6. Detail exact scannable UI components to implement (sparklines, metric grids, status badges, glowing border styles in Tailwind, lucide-react icons).

Write a comprehensive report to `/Users/gauravkumarnayak/Desktop/new sih/.agents/explorer_survey_1/handoff.md`.
Communicate your completion back to parent using send_message.
