# DISPATCH: Explorer 2 (Seafloor, Terrain, Depth & Physics Clipping)

## Objective
Analyze `frontend/src/components/3d/AntarcticScene.tsx`, terrain components (e.g. `Seafloor.tsx`, terrain GLB models), submarine positioning and dive path, and identify the exact root cause and solution for the submarine clipping through the seafloor.

## Inputs
- Authoritative Request: `/Users/gauravkumarnayak/Desktop/new sih/.agents/ORIGINAL_REQUEST.md`
- Orchestrator Plan: `/Users/gauravkumarnayak/Desktop/new sih/.agents/orchestrator_8/task_plan.md`
- Frontend Directory: `/Users/gauravkumarnayak/Desktop/new sih/frontend`
- Your Working Directory: `/Users/gauravkumarnayak/Desktop/new sih/.agents/explorer_o8_2`

## Specific Questions to Answer
1. How is the seafloor/terrain implemented in `AntarcticScene.tsx` and child components? What is its Y position, height variation, bounding box, or procedural function?
2. How is the AUV positioned and animated? In `AntarcticScene.tsx`, `AUVModel.tsx`, or `MissionDirector.tsx`? What controls its Y position or depth?
3. Where and when does the AUV clip through the seafloor or seabed rocks? At what Y levels or timestamps?
4. What is the clean, robust fix to ensure the submarine stays strictly above the seafloor at all times without clipping into rocks or ground? (e.g. terrain Y-offset, submarine min-altitude clamp, or flight path curve adjustment)

Write findings to `analysis.md` and final handoff to `handoff.md` in your working directory.
