# DISPATCH: Worker 1 (3D AUV, Postprocessing, Popups, Clipping, Materials)

## Mission
Implement all required changes across the 3D simulation in `frontend/` to satisfy R1, R2, R3, R4, and R5.

## Mandatory Rules & Guidelines
- Apply the `/recursive-context-pruning-token-budgeting` skill (Atomic Output, zero conversational filler, no bridge phrases, abstractive compression) to conserve tokens.
- **MANDATORY INTEGRITY WARNING**:
> DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Owned Files
- `frontend/src/simulation/auv/AUVModel.tsx`
- `frontend/src/simulation/scene/AntarcticScene.tsx`
- `frontend/src/simulation/scene/CinematicPipeline.tsx`
- `frontend/src/simulation/environment/SeafloorModel.tsx`
- `frontend/src/simulation/environment/AbyssalTerrainModel.tsx`
- `frontend/src/simulation/core/MissionDirector.tsx`
- `frontend/src/simulation/environment/DeepEnvironment.tsx`

## Technical Blueprint (Derived from Explorers 1, 2, and 3)

### 1. R1: Selection & Outline Pass + Cursor Pointer
- In `frontend/src/simulation/scene/AntarcticScene.tsx`:
  - Import `{ Selection }` from `'@react-three/postprocessing'`.
  - Wrap the inner 3D scene elements inside `<Selection>` (inside `<Canvas>`) so that child `<Select>` calls in `AUVModel` and `<Outline>` in `CinematicPipeline` share the same Selection context.
- In `frontend/src/simulation/scene/CinematicPipeline.tsx`:
  - Import `{ Outline }` from `'@react-three/postprocessing'`.
  - Ensure `<EffectComposer autoClear={false}>` has `autoClear={false}`.
  - Add `<Outline blur edgeStrength={3.5} pulseSpeed={0.0} visibleEdgeColor={0x00f0ff} hiddenEdgeColor={0x005577} width={1024} />`.
- In `frontend/src/simulation/auv/AUVModel.tsx`:
  - Import `{ Select }` from `'@react-three/postprocessing'`.
  - Import `{ useCursor }` from `'@react-three/drei'`.
  - Call `useCursor(Boolean(hoveredComponent), 'pointer', 'auto')`.
  - Wrap the 4 key meshes in `<Select enabled={hoveredComponent === '<ID>'}>`:
    - `Main Hull` (ID: `'BATTERY'` or `'hull'`)
    - `Optical Glass` (ID: `'SENSOR'` or `'sensor'`)
    - `Conning Tower` (ID: `'COMMS'` or `'comms'`)
    - `Propulsion Shroud` (ID: `'THRUSTER'` or `'thruster'`)
  - Set `onPointerOver` and `onPointerOut` on each to update `hoveredComponent`.
  - Fix any invalid Three.js props (e.g. `pointerEvents="none"` on `<mesh>` or `<group>` which causes TS2322 errors; replace with `raycast={() => null}` if raycasting should be disabled).

### 2. R2: Click-to-Toggle Popups
- In `AUVModel.tsx`:
  - Initial state `activeComponent: string | null` is `null` (zero popups visible initially).
  - Component click handler: `setActiveComponent(prev => prev === id ? null : id)` (toggles the clicked component, closes if clicked again, switches if another is clicked).
  - Canvas / group click-away: `onPointerMissed={() => setActiveComponent(null)}`.
  - Render diagnostic `<Html>` cards only when `activeComponent === id`.
  - Ensure cards have pointer events enabled and include an interactive close button `✕` that sets `setActiveComponent(null)`.

### 3. R3: Physics & Clipping Fix
- In `frontend/src/simulation/environment/SeafloorModel.tsx`:
  - Shift seafloor base Y from `-145` to `position={[0, -150, 0]}`.
- In `frontend/src/simulation/environment/AbyssalTerrainModel.tsx`:
  - Shift terrain base Y to match `-150.0m`.
  - Clear the central AUV flight path corridor: for procedural rocks near `|x| < 4` and `|z| < 20`, displace them laterally or clamp their height so they never exceed `-146.0m`.
- In `frontend/src/simulation/core/MissionDirector.tsx`:
  - Add an altitude floor clamp so the submarine cruising depth never drops below `-142.0m` (maintaining at least ~5m clearance above the -147m seabed surface).

### 4. R4: Missing Materials & Pink Domes
- In `frontend/src/simulation/environment/DeepEnvironment.tsx`:
  - Replace the untextured `#ff00ff` magenta domes and pink sparkles with realistic deep-sea Antarctic bioluminescent jellyfish (*Diplulmaris antarctica*):
    - Bell: `meshPhysicalMaterial` (`color="#dbeafe"`, `transmission=0.94`, `ior=1.35`, `roughness=0.08`, `clearcoat=1.0`, `attenuationColor="#0284c7"`, `attenuationDistance=1.4`).
    - Core: `meshStandardMaterial` (`color="#00f0ff"`, `emissive="#00f0ff"`, `emissiveIntensity=1.8`).
    - Trailing tentacles with gentle kinematics.
    - Floating particles / sparkles: color changed from `#ff00ff` to `#00f5d4` (cyan/emerald).
    - Drop-in component code from `/Users/gauravkumarnayak/Desktop/new sih/.agents/explorer_o8_3/handoff.md`.

### 5. R5: Verification & Clean Build
- Run `npm run build` in `frontend/`.
- Ensure zero TypeScript errors and successful production bundle generation.

Write your report to `changes.md` and `handoff.md` in `/Users/gauravkumarnayak/Desktop/new sih/.agents/worker_o8_1/`.

## 2026-09-23T06:41:31Z
You are worker_o8_1. Read your mission and instructions in /Users/gauravkumarnayak/Desktop/new sih/.agents/worker_o8_1/DISPATCH.md.
Also read /Users/gauravkumarnayak/Desktop/new sih/.agents/ORIGINAL_REQUEST.md.
Review explorer handoffs at:
- /Users/gauravkumarnayak/Desktop/new sih/.agents/explorer_o8_1/handoff.md
- /Users/gauravkumarnayak/Desktop/new sih/.agents/explorer_o8_2/handoff.md
- /Users/gauravkumarnayak/Desktop/new sih/.agents/explorer_o8_3/handoff.md

Apply the recursive-context-pruning-token-budgeting skill: produce atomic, high-density outputs with zero conversational filler.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Implement all 5 blueprint sections across your owned files.
Run `npm run build` in `frontend/` and ensure 0 TypeScript errors.
Document changes in changes.md and write a complete handoff.md in /Users/gauravkumarnayak/Desktop/new sih/.agents/worker_o8_1/.
Update progress.md as your liveness heartbeat.
When finished, send a message to parent (ID: f8afec88-c3e7-4f34-b6b2-2af8bac7903e) with your results and build evidence.
