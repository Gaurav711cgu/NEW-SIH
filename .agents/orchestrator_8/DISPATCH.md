# DISPATCH: 3D AUV Model & Environment Scene Refactoring

## Mission
Refactor the React Three Fiber 3D model (`AUVModel.tsx`) and the environment scene in `frontend` to fix missing textures, correct physics clipping, and implement premium interactive outlines and click-to-toggle diagnostic popups.

## Authority & Inputs
- **Authoritative Request**: `/Users/gauravkumarnayak/Desktop/new sih/.agents/ORIGINAL_REQUEST.md`
- **Project Directory**: `/Users/gauravkumarnayak/Desktop/new sih`
- **Frontend Directory**: `/Users/gauravkumarnayak/Desktop/new sih/frontend`
- **Orchestrator Workspace**: `/Users/gauravkumarnayak/Desktop/new sih/.agents/orchestrator_8`

## Strict Requirements

### R1. Premium Interactive Outlines
- Install `@react-three/postprocessing` in `frontend/`.
- Implement a global `Selection` and `Outline` pass wrapping or within the Canvas scene.
- When the user hovers over specific AUV meshes (`Main Hull`, `Optical Glass`, `Conning Tower`, `Propulsion Shroud`), they must visually highlight with a distinct glowing outline using `<Select enabled={...}>` (or appropriate Selection/Select mechanism).
- Mouse cursor must dynamically change to a pointer on hover (`cursor: pointer`).

### R2. Click-to-Toggle Popups
- The diagnostic `<Html>` cards must only appear when a user explicitly clicks on the corresponding 3D component.
- Clicking the component again, or clicking another component, should toggle the popup visibility.
- Initial state must have zero popups open.

### R3. Physics & Clipping Fix
- The 3D AUV currently clips underneath the seafloor terrain geometry.
- Fix the spatial positioning, depth calculation, or terrain height so that the submarine glides above the seafloor without clipping through the rocks/ground.

### R4. Missing Materials (Pink Balls)
- Identify magenta/pink untextured domes (likely jellyfish or similar environment geometry) rendering in the scene, which indicates a missing texture or broken material.
- Identify the source of these pink meshes in the environment files and apply proper, realistic materials.

### R5. Acceptance Criteria & Quality Gates
- [ ] `npm install @react-three/postprocessing` is successfully executed in `frontend`.
- [ ] The `Outline` effect is explicitly implemented on hover for the 4 interactive components.
- [ ] Hovering over the components changes the mouse cursor to a pointer.
- [ ] No popups are visible when the component initially loads.
- [ ] The AUV stays strictly above the terrain and does not clip through the ground.
- [ ] The pink/magenta spheres are replaced with their intended materials (no missing textures in the scene).
- [ ] `npm run build` executes with zero TypeScript errors.

## Coordination & File-Based Planning
- Maintain `task_plan.md`, `findings.md`, and `progress.md` in `.agents/orchestrator_8/`.
- Update `progress.md` frequently with clear checkboxes and timestamps.
- When all criteria are met, report completion back with full verification evidence so the Sentinel can trigger the Victory Audit.
