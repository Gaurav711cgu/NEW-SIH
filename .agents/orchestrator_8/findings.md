# Findings & Technical Investigation

## Architecture & Codebase Pointers
- Target Frontend: `/Users/gauravkumarnayak/Desktop/new sih/frontend`
- Key Components to investigate:
  - `frontend/src/components/3d/AUVModel.tsx`
  - `frontend/src/components/3d/AntarcticScene.tsx`
  - `frontend/src/components/3d/Seafloor.tsx` or related terrain modules
  - `frontend/src/components/3d/Jellyfish.tsx` or other environment fauna/props
  - `frontend/package.json` (for dependencies and scripts)

## Investigation Catalog

### 1. AUV Meshes & Interaction (`AUVModel.tsx`, `AntarcticScene.tsx`, `CinematicPipeline.tsx`)
- Meshes identified:
  - `Main Hull`: `cylinderGeometry [0.7, 0.7, 4.5, 64]`, component ID `'BATTERY'`
  - `Optical Glass`: `sphereGeometry [0.4, 32, 16, ...]`, component ID `'SENSOR'`
  - `Conning Tower`: `boxGeometry [1.5, 0.5, 0.3]`, component ID `'COMMS'`
  - `Propulsion Shroud`: `tubeGeometry LineCurve3`, component ID `'THRUSTER'`
- Interaction & Selection Architecture:
  - `<Selection>` must be inside `<Canvas>` in `AntarcticScene.tsx` wrapping scene content.
  - `<Outline>` in `CinematicPipeline.tsx` inside `<EffectComposer autoClear={false}>` with glowing cyan edge (`visibleEdgeColor={0x00f0ff}`).
  - Wrap the 4 meshes in `<Select enabled={hoveredComponent === '<ID>'}>`.
  - Cursor: `useCursor(Boolean(hoveredComponent), 'pointer', 'auto')` from `@react-three/drei`.
- Click-to-Toggle Popups:
  - State: `activeComponent: string | null` (initially `null` -> zero popups on load).
  - Toggle: `setActiveComponent(prev => prev === id ? null : id)`.
  - Missed click handler: `onPointerMissed={() => setActiveComponent(null)}`.
  - Fix TypeScript errors: Remove invalid `pointerEvents="none"` on Three elements, use `raycast={() => null}` where needed.

### 2. Terrain & Clipping Dynamics (`SeafloorModel.tsx`, `AbyssalTerrainModel.tsx`, `MissionDirector.tsx`)
- Seafloor terrain `seabed.glb` currently at `Y = -145.0m`, with local peaks reaching `Y = -142.17m` to `-141.27m`.
- AUV cruising depth `targetY = -142.0m`, reaching `-142.57m` with hull radius & heave -> clips 40cm into silt.
- Procedural rocks in `AbyssalTerrainModel.tsx` reach `-139.90m` to `-141.46m`, impaling AUV centerline by up to 2.10m.
- Solution:
  1. Reposition seafloor base Y to `-150.0m` in `SeafloorModel.tsx` and `AbyssalTerrainModel.tsx` (gives 5.17m altitude and 4.60m hull clearance).
  2. Implement flight corridor clearance in `AbyssalTerrainModel.tsx` (displace rocks from central lane `|X| < 4 && |Z| < 20`).
  3. Clamp cruise depth in `MissionDirector.tsx` to maintain minimum 4.0m altitude floor.

### 3. Missing Materials & Pink Domes (`DeepEnvironment.tsx`)
- Hardcoded `#ff00ff` pure magenta dome geometry (`sphereGeometry args={[1, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]}`) and ambient sparkles (`#ff00ff`) in `DeepEnvironment.tsx` lines 27-37, 57. Blown out by Bloom postprocessing.
- Solution: Drop-in realistic Antarctic deep-sea bioluminescent jellyfish (*Diplulmaris antarctica*) with `meshPhysicalMaterial` transmission 0.94, clearcoat 1.0, cyan bioluminescent core (`#00f0ff`), tentacles, and sparkles shifted to oceanic cyan/emerald (`#00f5d4`). Complete drop-in code in `/Users/gauravkumarnayak/Desktop/new sih/.agents/explorer_o8_3/handoff.md`.
