# Handoff Report: Seafloor, Terrain, Depth & Physics Clipping

## 1. Observation

### File Paths, Line Numbers & Code Snippets
1. **`frontend/src/simulation/AntarcticScene.tsx`**:
   - Lines 18–36: `OceanEnvironment` renders `IceShelfModel`, `DeepEnvironment`, `AbyssalTerrainModel`, `DebrisField`, `SonarSweep`, and `SeafloorModel`.
   - Lines 51–53: Submarine mounted inside `<group><AUVModel /></group>`.
   - `Terrain.tsx` is an obsolete procedural plane file that is completely unimported.
2. **`frontend/src/simulation/environment/SeafloorModel.tsx`**:
   - Line 8: `const MODEL_PATH = '/models/seabed.glb'; useGLTF.preload(MODEL_PATH);`.
   - Line 144: `<group position={[0, -145, 0]}>` (procedural fallback plane).
   - Line 179: `<group position={[0, -145, 0]}><primitive object={scene} receiveShadow /></group>` (GLB seafloor).
   - Line 107: `float depthFactor = clamp((vSeafloorWorldPos.y + 160.0) / 20.0, 0.35, 1.0);`.
3. **`frontend/src/simulation/environment/AbyssalTerrainModel.tsx`**:
   - Line 6: `const ROCK_MODEL_PATH = '/models/abyssal_rock.glb';`.
   - Line 7: `const SEAFLOOR_MODEL_PATH = '/models/seabed.glb';`.
   - Lines 22–44:
     ```tsx
     function getSeabedElevation(x: number, z: number, posAttr: THREE.BufferAttribute | ...): number {
       if (!posAttr) return -142.0;
       const u = Math.max(0, Math.min(178.999, ((x + 225) / 450) * 179));
       const v = Math.max(0, Math.min(178.999, ((z + 225) / 450) * 179));
       // ... bilinear interpolation ...
       return -145 + localY;
     }
     ```
   - Line 127: Rock base placement: `const y = groundY - scaleY * 0.075 * 0.15;`.
   - Lines 158–168: Cluster 3 spawns 24 rocks within `dist = 5 + prng() * 15` from vehicle origin `(0, 0)`.
4. **`frontend/src/simulation/mission/MissionDirector.tsx`**:
   - Lines 126–131:
     ```tsx
     case 'STAGE_4_SEAFLOOR':
     case 'STAGE_5_SONAR':
     case 'STAGE_6_ANOMALY':
       targetY = -142;
       targetPitch = currentPhase === 'STAGE_6_ANOMALY' ? 0.1 : sway;
       break;
     ```
   - Line 143: `logicalY.current = THREE.MathUtils.lerp(logicalY.current, targetY, delta * 0.5);`.
   - Line 166: `useSimulationStore.getState().setAUVPosition([0, logicalY.current, 0]);`.
5. **`frontend/src/simulation/auv/AUVModel.tsx`**:
   - Line 29:
     ```tsx
     groupRef.current.position.set(
       auvPosition[0],
       auvPosition[1] + Math.sin(Date.now() / 1000 * 2) * 0.15,
       auvPosition[2]
     );
     ```
   - Line 56: `<group ref={groupRef} dispose={null} scale={0.6}>`.
   - Line 67: Main hull cylinder: `cylinderGeometry args={[0.7, 0.7, 4.5, 64]}` (radius = `0.7 * 0.6 = 0.42m`).
6. **`frontend/src/simulation/environment/DebrisField.tsx`**:
   - Line 32: `return -145 + ((1 - s) * (1 - t) * y00 + ...);`.
7. **`frontend/src/simulation/environment/Lighting.tsx`**:
   - Line 186: `// Downward bathymetry survey floodlight (illuminates seabed 3-10m below vehicle)`.
   - Line 204: `seafloorTarget.position.set(auvPos.x, -145, auvPos.z);`.
8. **`frontend/src/simulation/environment/SonarSweep.tsx`**:
   - Line 55: `<group position={[30, -141, 10]}>`.

### Binary Model Geometry Measurements
1. **`seabed.glb` (Position Accessor 0)**:
   - 32,400 vertices in 180 × 180 grid across 450m × 450m.
   - Local Y range: `[-11.1718m, +11.2326m]` (relief = 22.404m).
   - Local Y at origin `(0, 0)`: `+2.8274m`.
   - World Y at origin (with group Y = `-145.0m`): **`-142.173m`**.
   - World Y within 10m radius: `[-143.28m, -141.27m]`.
   - World Y at nose `(x=2, z=0)`: **`-141.968m`**.
2. **`abyssal_rock.glb` (LOD1 Mesh)**:
   - 2,824 vertices. Unscaled height = 0.0725m.
   - 9 rocks spawned within 10m of vehicle:
     - Rock #13: Top Y = **`-139.90m`**
     - Rock #8: Top Y = **`-140.29m`**
     - Rock #10: Top Y = **`-140.49m`**
     - Rock #15: Top Y = **`-140.70m`**
     - Rock #18: Top Y = **`-140.87m`**
     - Rock #11: Top Y = **`-141.21m`**
     - Rock #23: Top Y = **`-141.46m`**
3. **Captured Visual Artifacts**:
   - `screenshots/03_abyssal_seafloor.png`, `screenshots/04_sonar_mapping.png`, and `screenshots/test_seafloor.png` show the front nose and lower hull of the submarine buried inside white/cyan caustic seabed polygons and intersecting boulder meshes.

---

## 2. Logic Chain

1. **Premise 1**: In `MissionDirector.tsx` (line 129), the AUV cruises at `targetY = -142.0m`.
2. **Premise 2**: In `AUVModel.tsx` (line 29 & line 67), the AUV oscillates vertically with `±0.15m` amplitude, and has a scaled hull radius of `0.42m`.
3. **Inference 1 (Vehicle Bounds)**: The bottom of the AUV hull descends to `Y = -142.000 - 0.420 - 0.150 = -142.570m` at the trough of its wave heave cycle.
4. **Premise 3**: In `SeafloorModel.tsx` (line 179), the seabed mesh group is placed at `Y = -145.0m`.
5. **Premise 4**: In `seabed.glb`, vertex position data directly underneath the AUV `(x=0, z=0)` has a local Y offset of `+2.827m`.
6. **Inference 2 (Seabed Elevation)**: The real world Y of the seabed directly beneath the vehicle is `-145.000 + 2.827 = -142.173m`. Along the forward path to the nose (`x = +2.0m`), the seabed rises to `-141.968m`.
7. **Inference 3 (Seabed Clipping Proof)**:
   - At `(x=0, z=0)`: `y_bottom (-142.570m) < y_seabed (-142.173m)` by **0.397 meters**. The hull bottom is submerged ~40 cm into the terrain.
   - At `(x=2.0, z=0)`: `y_center (-142.000m) < y_seabed (-141.968m)` by **0.032 meters**. The solid terrain is higher than the centerline of the submarine, cutting the nose in half.
8. **Premise 5**: In `AbyssalTerrainModel.tsx`, procedural rocks with heights of 0.8m to 2.5m are snapped to the seabed elevation around the vehicle.
9. **Inference 4 (Rock Clipping Proof)**: Rock #13 (top at `-139.90m`), Rock #8 (top at `-140.29m`), Rock #10 (top at `-140.49m`), and Rock #15 (top at `-140.70m`) are **1.30m to 2.10m ABOVE the submarine centerline**, violently clipping through the vehicle hull and cockpit.
10. **Conclusion of Cause**: The clipping occurs because the previous developer placed the seabed group at `Y = -145m` assuming a flat `Y = 0` plane, unaware that `seabed.glb` has a `+2.83m` local elevation bump at the center and rocks extending up to 2.5m higher.

---

## 3. Caveats

1. **X/Z Trajectory Extension**:
   Currently, the AUV stays at `(x=0, z=0)` during all mission stages. If future updates introduce translational movement along X and Z for the lawnmower mapping pattern, the dynamic terrain elevation clamping in Pillar 2 is strictly required so the vehicle responds to variations across the entire 450m seabed.
2. **HUD Consistency**:
   The mission depth on HUD DepthGauge and AI telemetry is hardcoded to `142m` (`targetDepth: 142`, `"depth_m": 142.0`). Adjusting the seafloor base to `Y = -150.0m` preserves this depth reading without breaking any UI charts or claims.

---

## 4. Conclusion

The submarine clipping issue is fully diagnosed with exact coordinate proofs. The solution requires a coordinated update across 5 simulation files:

1. **`frontend/src/simulation/environment/SeafloorModel.tsx`**:
   - Change group Y position from `[0, -145, 0]` to `[0, -150, 0]` (lines 144, 179).
   - Update caustics depth factor in shader (line 107) from `+ 160.0` to `+ 165.0`.
2. **`frontend/src/simulation/environment/AbyssalTerrainModel.tsx`**:
   - Update `getSeabedElevation` base offset from `-145` to `-150` (line 43) and fallback to `-147.0` (line 27).
   - In Cluster 3 (lines 158–168), adjust rock spawn radius to `dist = 7.5 + prng() * 12.5` to clear the immediate flight envelope.
3. **`frontend/src/simulation/environment/DebrisField.tsx`**:
   - Update `getSeabedElevation` base offset from `-145` to `-150` (line 32) and fallback to `-147.0` (line 19).
4. **`frontend/src/simulation/environment/Lighting.tsx`**:
   - Update `seafloorTarget` position from `-145` to `-150` (line 204).
5. **`frontend/src/simulation/environment/SonarSweep.tsx`**:
   - Update target lock marker from `[30, -141, 10]` to `[30, -145.5, 10]` (line 55).
6. **`frontend/src/simulation/mission/MissionDirector.tsx`**:
   - Add terrain clearance clamp: `logicalY.current = Math.max(logicalY.current, localTerrainY + 4.2)`.

---

## 5. Verification Method

1. **Run Visual Test Harness**:
   ```bash
   python3 take_screenshot.py
   ```
2. **Inspect Captured Artifacts**:
   Open `screenshots/03_abyssal_seafloor.png` and `screenshots/04_sonar_mapping.png`. Verify:
   - The submarine hovers gracefully ~4.6m above the seabed silt.
   - The nose, optical window, and bottom hull have zero collision with rocks or ground.
   - Downward searchlights and floodlights cast crisp illuminated ellipses on the rocks below.
   - HUD displays `DEPTH: 142.0m, TGT: 142m`.
3. **TypeScript Compilation Check**:
   ```bash
   cd frontend && npm run build
   ```
   Must exit with code 0 and zero TypeScript errors.
