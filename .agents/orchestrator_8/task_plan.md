# Task Plan: 3D AUV Model & Environment Scene Refactoring

## 1. Goal & Scope
Refactor the React Three Fiber 3D model (`AUVModel.tsx`) and the environment scene in `frontend` to:
1. Install `@react-three/postprocessing` and implement global `Selection` and `Outline` pass. On hover over specific AUV meshes (`Main Hull`, `Optical Glass`, `Conning Tower`, `Propulsion Shroud`), highlight them with glowing outline and switch cursor to pointer.
2. Ensure diagnostic `<Html>` cards only appear when user explicitly clicks on the corresponding 3D component. Clicking again or clicking another component toggles popup visibility. Initial state has zero popups open.
3. Fix spatial positioning, depth calculation, or terrain height so submarine glides above the seafloor without clipping through rocks/ground.
4. Identify magenta/pink untextured domes (likely jellyfish or environment geometry) rendering in the scene and apply proper, realistic materials.
5. Verify `npm run build` in `frontend/` executes with zero TypeScript errors.

## 2. Phases & Milestones
- [x] **Phase 1: Survey & Technical Exploration**
  - [x] E1: Explore AUVModel.tsx, component meshes, hover/click interactions, and `<Html>` cards.
  - [x] E2: Explore AntarcticScene.tsx, seafloor geometry, submarine flight path/positioning, clipping cause.
  - [x] E3: Explore environment models, identify pink/magenta spheres/domes and missing textures/materials.
  - [x] Synthesis: Formulate unified implementation specification.
- [x] **Phase 2: Implementation**
  - [x] W1: Verify `@react-three/postprocessing` in `frontend/`.
  - [x] W2: Implement `Selection` in `AntarcticScene.tsx` and `Outline` in `CinematicPipeline.tsx`, wrap 4 AUV meshes in `<Select>` in `AUVModel.tsx`, enable cursor pointer on hover.
  - [x] W3: Implement click-to-toggle popup cards with zero open on load, close on missed click.
  - [x] W4: Adjust terrain elevation and AUV flight clearance (`-150.0m` base Y, rock corridor clearance, altitude floor).
  - [x] W5: Replace untextured pink/magenta domes in `DeepEnvironment.tsx` with realistic bioluminescent jellyfish PBR materials.
  - [x] W6: Verify `npm run build` in `frontend/`.
- [x] **Phase 3: Independent Review & Verification**
  - [x] R1: Objectively review and verify Outline effect, cursor pointer, and click-to-toggle popups (Verdict: APPROVE).
  - [x] R2: Objectively review clipping fix, materials replacement, and TypeScript compile output (Verdict: APPROVE).
- [x] **Phase 4: Gate Evaluation & Handover**
  - [x] Evaluate all verification criteria in `GATE_STATUS.md` (Gate Result: PASS).
  - [x] Send detailed completion report to parent Sentinel for final audit sign-off.
