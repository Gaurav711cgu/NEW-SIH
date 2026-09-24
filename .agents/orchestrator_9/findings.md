# Findings — Milestone 9

## Overview
Exploration by `teamwork_preview_explorer` (explorer_o9_1) complete.
All 4 core requirements and verification requirements have been investigated and specified down to exact lines and equations.

## Key Technical Findings

### 1. R1: UI Data Integrity (UXO/MINE Elimination)
- 38 code lines across 8 files contain references to "UXO", "MINE", or `"object_class": "mine"`.
- Target files:
  1. `src/simulation/mission/MissionDirector.tsx` (lines 68, 71)
  2. `src/types/detection.ts` (lines 53, 66)
  3. `src/components/SonarProfiler.tsx` (lines 51, 52, 53, 69, 70, 185, 517)
  4. `src/pages/SeafloorIntelligence.tsx` (lines 304, 344, 352, 515, 517, 520, 1095, 1099, 1113)
  5. `src/pages/GovernmentIntel.tsx` (lines 48, 244, 250, 252, 313)
  6. `src/pages/ResearchCitations.tsx` (lines 891, 895, 903, 905, 914, 922, 927)
  7. `src/pages/ProposedSystem.tsx` (lines 103, 318)
  8. `src/pages/AUVTwin.tsx` (lines 782, 1642, 1663)
  9. `src/simulation/environment/SonarSweep.tsx` (line 63)
- Replacing these with "GHOST NET", "Derelict Ghost Net", and `"object_class": "ghost_net"` ensures 100% DOM purity.

### 2. R2: Side-Scan Sonar Object Placement Math
- AUV forward heading is $+X$, cruising at $Y = -142\text{m}$, track is along $Z = 0$.
- In operational side-scan sonar, the nadir gap directly under the keel has no lateral acoustic return.
- Current `DebrisField.tsx` spawns targets uniformly, including $Z = 0$.
- Mathematical formulation:
  - Central corridor exclusion: $|Z| \ge 14\text{m}$.
  - Ghost nets ($N = 30$): $Z_i = \text{side}_i \times (14 + \text{prng}() \times 32)$ where $\text{side}_i \in \{-1, +1\}$, giving $Z \in [-46, -14] \cup [14, 46]$.
  - Chimneys ($M = 40$): $Z_j = \text{side}_j \times (18 + \text{prng}() \times 42)$, giving $Z \in [-60, -18] \cup [18, 60]$.
  - This ensures 0 targets directly along the AUV trajectory and places targets strictly in port and starboard SSS swaths.

### 3. R3: Interactive 3D Camera Controls (OrbitControls)
- `CameraManager.tsx` currently lacks OrbitControls and forcefully overwrites `camera.position` and `camera.lookAt()` every frame in `useFrame`.
- Integration:
  - Mount Drei `<OrbitControls ref={controlsRef} makeDefault />`.
  - In `useFrame`, compute $\Delta\text{AUV} = \text{auvPos}_{\text{current}} - \text{auvPos}_{\text{previous}}$ and translate both `controlsRef.current.target` and `camera.position` by $\Delta\text{AUV}$.
  - This anchors the orbital pivot to the descending vehicle, allowing full 360° rotation and zoom.
  - Mesh clicks on diagnostic cards already call `e.stopPropagation()`, preserving popup functionality.

### 4. R4: Sonar Strike Highlighting
- `SonarBeam.tsx` expands a radial pulse over 1.5s out to 50m: `pingRadius = ((time % 1.5) / 1.5) * 50`.
- In `DebrisField.tsx`, synchronize with the same `pingRadius`. When $|\text{slantRange} - \text{pingRadius}| < 2.5\text{m}$, trigger an acoustic strike timestamp.
- Flash instance color using `InstancedMesh.setColorAt` with a 0.7s decaying specular return color.

### 5. Verification & Test Plan
- Playwright Python package is installed and operational.
- Create automated script `verify_uxo_removal.py` to scan rendered DOM across all routes.
- Execute `npm run build` in `frontend/` to verify zero TypeScript errors.
