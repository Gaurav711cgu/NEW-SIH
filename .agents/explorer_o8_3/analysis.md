# Technical Analysis: Missing Materials & Magenta Domes/Spheres

**Investigator**: `explorer_o8_3`  
**Date**: 2026-09-23  
**Target Codebase**: `frontend/src/simulation/`  
**Parent Agent**: `f8afec88-c3e7-4f34-b6b2-2af8bac7903e` (`orchestrator_8`)  

---

## Executive Summary

Visual inspection and codebase auditing revealed that the "untextured magenta/pink balls/domes" rendering in the 3D scene originate directly from `frontend/src/simulation/environment/DeepEnvironment.tsx`. 

Specifically:
1. **Component**: `BioluminescentJelly` rendered inside `<DeepEnvironment />` (mounted in `AntarcticScene.tsx` at line 28).
2. **Trigger**: Activates when the AUV dive depth reaches $80\text{ m}$ (`depth >= 80`, during `STAGE_2_DESCENT` through `STAGE_6_ANOMALY`).
3. **Exact Cause**: Hardcoded `#ff00ff` (100% pure Magenta `rgb(255, 0, 255)`) applied to a low-segment dome (`<sphereGeometry args={[1, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />`) with high emissive intensity (`emissiveIntensity={0.8}`). Under the `Bloom` post-processing pass in `CinematicPipeline.tsx`, this emissive magenta blows out into intensely glowing, neon-pink spheres. Additionally, 500 ambient `#ff00ff` sparkles drift throughout the water column.
4. **Intended Entity**: Deep-Sea Antarctic Bioluminescent Scyphozoa / Jellyfish (*Diplulmaris antarctica* / *Periphylla periphylla* / abyssal medusa) with swimming pulsation and trailing tentacles.
5. **Solution**: Replace the crude `#ff00ff` material with a multi-layered, physically based gelatinous mesoglea material using Three.js `meshPhysicalMaterial` (high transmission, oceanic blue attenuation, subtle IOR, clearcoat sheen), an internal bioluminescent organ core, organic trailing tentacles, and deep-sea oceanic cyan/azure bioluminescence (`#00f0ff` / `#38bdf8` / `#0284c7`), eliminating all magenta artifacts.

---

## Detailed Investigation: The 4 DISPATCH Questions

### Question 1: Where in the scene do magenta/pink untextured domes appear?

#### Primary Active Location
- **File**: `frontend/src/simulation/environment/DeepEnvironment.tsx`
- **Mount Point**: `frontend/src/simulation/AntarcticScene.tsx`
  - Line 6: `import DeepEnvironment from "./environment/DeepEnvironment";`
  - Line 28: `<DeepEnvironment />` mounted inside `<OceanEnvironment />`
- **Component**: `BioluminescentJelly` (lines 8–42) rendered in swarms within `DeepEnvironment` (lines 44–76).
- **Exact Line Numbers**:
  - `DeepEnvironment.tsx:28–37`:
    ```tsx
    28: <sphereGeometry args={[1, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
    29: <meshPhysicalMaterial 
    30:   color="#ff00ff" 
    31:   emissive="#ff00ff" 
    32:   emissiveIntensity={0.8} 
    33:   transparent 
    34:   opacity={0.6}
    35:   transmission={0.9}
    36: />
    ```
  - `DeepEnvironment.tsx:57`:
    ```tsx
    57: <Sparkles count={500} scale={[200, 100, 200]} position={[0, -100, 0]} size={1.5} color="#ff00ff" opacity={visibility * 0.2} speed={0.1} />
    ```

#### Activation Lifecycle & Trigger Conditions
- In `DeepEnvironment.tsx`:
  - Line 48: `if (depth < 80) return null;`
  - Line 51: `const visibility = Math.min(1, (depth - 80) / 40);`
- In `MissionDirector.tsx`:
  - `STAGE_0_SURFACE` / `STAGE_1_ENTRY`: Depth 0m to 5m $\rightarrow$ `DeepEnvironment` is unmounted (`return null`).
  - `STAGE_2_DESCENT`: Target depth drops to $-100\text{ m}$. Once depth passes $80\text{ m}$, `DeepEnvironment` mounts and smoothly fades in.
  - `STAGE_3_MIDWATER` (depth 100m) through `STAGE_6_ANOMALY` (depth 142m): `DeepEnvironment` is 100% visible (`visibility = 1.0`).

#### Exact Scene Coordinates
The 8 pink domes are positioned in two distinct midwater clusters around the AUV descent corridor:
1. **Cluster 1 (5 domes)**: Root group at `[20, -90, -30]` (lines 60–66):
   - Offsets: `[(rand - 0.5) * 15, (rand - 0.5) * 15, (rand - 0.5) * 15]`
   - Absolute range: $X \in [12.5, 27.5]$, $Y \in [-97.5, -82.5]$, $Z \in [-37.5, -22.5]$
2. **Cluster 2 (3 domes)**: Root group at `[-25, -110, 10]` (lines 67–73):
   - Offsets: `[(rand - 0.5) * 10, (rand - 0.5) * 10, (rand - 0.5) * 10]`
   - Absolute range: $X \in [-30, -20]$, $Y \in [-115, -105]$, $Z \in [5, 15]$
3. **Ambient Magenta Volume**: Line 57 renders 500 magenta particle points distributed across a box of width $200\text{ m} \times 100\text{ m} \times 200\text{ m}$ centered at `[0, -100, 0]`.

#### Legacy / Unused Files Audited
- `frontend/src/simulation/environment/Fauna.tsx`:
  - Contains an earlier procedural `Jellyfish` (line 53) using `<sphereGeometry args={[0.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />` and `<meshStandardMaterial color="#aaccff" transparent opacity={0.4} emissive="#224488" emissiveIntensity={0.1} />`.
  - Also contains a `KrillSwarm` (line 5) with coral-orange `<meshStandardMaterial color="#ff7f50" />`.
  - **Audit Status**: `Fauna.tsx` is completely orphaned (not imported anywhere in `AntarcticScene.tsx` or the project).
- `frontend/src/simulation/environment/DebrisField.tsx`, `AbyssalTerrainModel.tsx`, `SeafloorModel.tsx`:
  - Audited all GLTF models (`/models/seabed.glb`, `/models/abyssal_rock.glb`, `/models/iceberg.glb`). All GLTF models have custom PBR or caustics shaders applied and do NOT contain missing textures or magenta fallbacks.
  - The dropstones/gravel in `DebrisField.tsx` are slate grey (`#334155`), crinoids are icy blue-white (`#f8fafc`, emissive `#0284c7`), and chimneys are dark basalt (`#18181b`, emissive `#f97316`).

---

### Question 2: Why are they pink/magenta?

#### Root Causes
1. **Explicit Hardcoded `#ff00ff` Placeholder Color**:
   In `DeepEnvironment.tsx`, lines 30–31:
   ```tsx
   color="#ff00ff"
   emissive="#ff00ff"
   ```
   `#ff00ff` is 100% pure Magenta (`rgb(255, 0, 255)`). In computer graphics (OpenGL, Three.js, Blender, Unreal Engine), `#ff00ff` is the universal "debug / missing texture / unassigned shader" fallback color. Developers frequently use it during prototyping to easily spot procedural objects, but when left in production code, it renders as a stark, untextured magenta artifact.

2. **Severe Emissive Bloom Blown-Out Halo**:
   Line 32 sets `emissiveIntensity={0.8}` with color `#ff00ff`.
   In `frontend/src/simulation/environment/CinematicPipeline.tsx`, lines 63–68 configure the post-processing Bloom effect:
   ```tsx
   <Bloom
     mipmapBlur
     luminanceThreshold={0.90}
     luminanceSmoothing={0.25}
     intensity={1.4}
   />
   ```
   Because the emissive color is maxed out at `#ff00ff` with 0.8 intensity, it easily breaches the Bloom threshold, producing a massive glowing hot-pink halo that bleeds into the dark ocean background.

3. **Crude Low-Poly Geometry without Normal Maps or Texture Detail**:
   The geometry is `<sphereGeometry args={[1, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />`. With only 16 segments and no normal maps, bump maps, roughness maps, or anatomical features (margin lobes, tentacles, organs), it has faceted polygonal silhouettes, making it look distinctly like an untextured debug placeholder sphere.

4. **Magenta Sparkle Particle Field**:
   Line 57 adds 500 sparkles with `color="#ff00ff"`, creating a haze of floating neon pink dots around the domes.

---

### Question 3: What is the intended geometry/entity?

#### Intended Entity: Deep-Sea Antarctic Bioluminescent Scyphozoa (Jellyfish)
Evidence from the codebase:
1. **Semantic Naming**:
   - Component name: `function BioluminescentJelly()` (line 8)
   - Comment line 26: `{/* Jelly Cap */}`
   - Comment line 38: `{/* Glowing tendrils */}`
   - Comment line 59: `{/* Bioluminescent Jellyfish Swarm */}`
2. **Kinematics & Biological Swimming Simulation**:
   Lines 12–22 implement authentic jellyfish swimming mechanics:
   ```tsx
   const time = clock.getElapsedTime();
   meshRef.current.position.y += Math.sin(time + offset) * 0.02; // Vertical hydrostatic bobbing
   meshRef.current.position.x += Math.sin(time * 0.5 + offset) * 0.01; // Water current drift
   
   // Bell pulsation cycle (contraction & expansion stroke)
   const pulse = 1 + Math.sin(time * 2 + offset) * 0.1;
   meshRef.current.scale.set(pulse, 1, pulse);
   ```
3. **Biological Analogs in the Southern Ocean / Antarctic Abyss**:
   - ***Diplulmaris antarctica***: Abundant in the Southern Ocean beneath pack ice; known for its translucent, glass-like umbrella with delicate glowing orange-tinted gastric pouches and long trailing tentacles.
   - ***Periphylla periphylla*** (Helmet Jellyfish): Deep-sea coronate scyphozoan prevalent in polar fjords and Southern Ocean bathyal depths (100–1500m); features a deep domed bell, internal dark reddish/garnet stomach that prevents luciferin light from escaping, and bioluminescent peripheral flashes.
   - ***Crossota norvegica***: Deep-sea trachymedusa with a stunning translucent bell displaying internal bioluminescent azure/cyan radial canals and trailing glowing tendrils.

---

### Question 4: What realistic material properties should be applied?

To make these creatures look authentic, breathtaking, and scientifically plausible in an Antarctic deep-sea tactical digital twin, the material and geometry should be upgraded as follows:

#### 1. Translucent Mesoglea Bell (Exumbrella & Subumbrella)
In real medusae, the bell is 95%–98% water (gelatinous mesoglea). It transmits surrounding water light, exhibits subtle internal refraction, and reflects surface highlights with a wet clearcoat:
- **Material Type**: Three.js `meshPhysicalMaterial`
- **Base Color (`color`)**: `#e0f8ff` (subtle icy translucent cyan-white, NOT magenta)
- **Transmission (`transmission`)**: `0.92` – `0.95` (allows headlights, god rays, and background water to transmit through the body)
- **Index of Refraction (`ior`)**: `1.34` – `1.35` (matches cold saline seawater IOR of ~1.34)
- **Roughness (`roughness`)**: `0.08` – `0.12` (wet, slick, glossy organic tissue)
- **Metalness (`metalness`)**: `0.0`
- **Thickness (`thickness`)**: `1.5` – `2.0` (gives the glass-like bell optical volumetric depth)
- **Attenuation Color (`attenuationColor`)**: `#0284c7` or `#0369a1` (light passing through the thicker parts of the bell is absorbed into a deep oceanic azure)
- **Attenuation Distance (`attenuationDistance`)**: `1.2` (creates a smooth gradient from translucent edges to deep oceanic blue in thick apex)
- **Clearcoat (`clearcoat`)**: `1.0`, `clearcoatRoughness: 0.04` (pristine wet surface reflections)
- **Side (`side`)**: `THREE.DoubleSide` (renders both exumbrella exterior and subumbrella interior cavity)
- **Geometry**: `<sphereGeometry args={[1, 32, 24, 0, Math.PI * 2, 0, Math.PI / 1.8]} />` (increased segments from 16 to 32/24 for smooth curved silhouette, opening slightly past $\pi/2$ for a natural bell rim).

#### 2. Inner Gastric Core / Manubrium (Internal Bioluminescent Organ)
Real deep-sea jellyfish are visually striking because their inner digestive system / gonads glow or show through the translucent bell:
- **Inner Core Geometry**: `<sphereGeometry args={[0.32, 24, 16]} />` or inverted conical bell located at `[0, -0.2, 0]`.
- **Material**: `meshStandardMaterial` with:
  - Color: `#06b6d4` (cyan) or `#0369a1` (deep sapphire)
  - Emissive: `#00f0ff` (electric bioluminescent cyan, wavelength ~480nm)
  - Emissive Intensity: `1.8` – `2.4` (pulses rhythmically with the contraction stroke)
  - This creates the stunning optical effect of an organic bioluminescent generator shining *from within* the translucent glass bell!

#### 3. Trailing Marginal Tentacles & Oral Arms
Instead of only 15 disconnected sparkles, add actual physical trailing organic tentacles:
- 6 to 8 slender tapered cylinders or spline filaments hanging from the bell margin (`[cos(i)*0.8, -0.5, sin(i)*0.8]`).
- Animated with gentle harmonic swaying:
  ```tsx
  mesh.rotation.z = Math.sin(time * 1.5 + i) * 0.15;
  ```
- Material: `meshPhysicalMaterial` with:
  - `color="#38bdf8"`
  - `emissive="#00f0ff"`
  - `emissiveIntensity={0.6}`
  - `transparent`, `opacity={0.7}`
  - `transmission={0.8}`

#### 4. Natural Southern Ocean Bioluminescence Spectrum
Deep-sea organisms in the aphotic zone emit almost exclusively in the **blue-green spectrum ($470\text{–}490\text{ nm}$)** because seawater absorbs red, orange, and magenta light within a few meters, while blue-green light propagates farthest.
- Replace all `#ff00ff` occurrences:
  - Domes: `#00f0ff` (electric cyan) and `#38bdf8` (sky/azure)
  - Ambient Sparkles (line 57): `#00f5d4` (marine emerald/bioluminescent green) or `#38bdf8` (marine cyan) with `opacity={visibility * 0.25}`.

---

## Concrete Proposed Implementation

Here is the complete, drop-in replacement code for `frontend/src/simulation/environment/DeepEnvironment.tsx`:

```tsx
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStore } from '../store/simulationStore';
import { Sparkles } from '@react-three/drei';

interface BioluminescentJellyProps {
  position?: [number, number, number];
  scale?: number;
}

function BioluminescentJelly({ position = [0, 0, 0], scale = 1 }: BioluminescentJellyProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bellMatRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const coreMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const tentacleRefs = useRef<(THREE.Mesh | null)[]>([]);
  
  const offset = useMemo(() => Math.random() * 100, []);
  const tentacleCount = 6;
  const tentacleAngles = useMemo(() => {
    return Array.from({ length: tentacleCount }, (_, i) => (i * Math.PI * 2) / tentacleCount);
  }, [tentacleCount]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const time = clock.getElapsedTime() + offset;

    // Organic hydrostatic drift & gentle bobbing
    groupRef.current.position.y += Math.sin(time * 0.8) * 0.015;
    groupRef.current.position.x += Math.cos(time * 0.4) * 0.008;

    // Rhythmic swimming bell contraction stroke (pulse)
    const stroke = Math.sin(time * 2.2);
    const bellPulseY = 1 + (stroke > 0 ? stroke * 0.22 : stroke * 0.08);
    const bellPulseXZ = 1 - (stroke > 0 ? stroke * 0.12 : stroke * 0.04);
    groupRef.current.scale.set(
      scale * bellPulseXZ,
      scale * bellPulseY,
      scale * bellPulseXZ
    );

    // Dynamic bioluminescent flash during swimming propulsion stroke
    const flashIntensity = 0.3 + Math.max(0, stroke) * 0.7;
    if (coreMatRef.current) {
      coreMatRef.current.emissiveIntensity = 1.2 + flashIntensity * 1.5;
    }
    if (bellMatRef.current) {
      bellMatRef.current.emissiveIntensity = 0.15 + flashIntensity * 0.35;
    }

    // Trailing tentacle swaying with hydrodynamics lag
    tentacleRefs.current.forEach((mesh, idx) => {
      if (mesh) {
        const lagTime = time * 2.0 - idx * 0.4;
        mesh.rotation.x = Math.sin(lagTime) * 0.25;
        mesh.rotation.z = Math.cos(lagTime * 0.8) * 0.20;
      }
    });
  });

  return (
    <group ref={groupRef} position={position}>
      {/* ── 1. TRANSLUCENT EXUMBRELLA (JELLY BELL) ── */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1.0, 32, 24, 0, Math.PI * 2, 0, Math.PI / 1.75]} />
        <meshPhysicalMaterial
          ref={bellMatRef}
          color="#dbeafe"
          emissive="#00f0ff"
          emissiveIntensity={0.25}
          transmission={0.94}
          thickness={1.8}
          ior={1.35}
          roughness={0.08}
          metalness={0.0}
          clearcoat={1.0}
          clearcoatRoughness={0.04}
          attenuationColor="#0284c7"
          attenuationDistance={1.4}
          transparent
          opacity={0.92}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* ── 2. INTERNAL BIOLUMINESCENT GASTRIC CORE (MANUBRIUM) ── */}
      <mesh position={[0, -0.22, 0]}>
        <sphereGeometry args={[0.32, 24, 16]} />
        <meshStandardMaterial
          ref={coreMatRef}
          color="#0284c7"
          emissive="#00f0ff"
          emissiveIntensity={1.8}
          roughness={0.2}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* ── 3. MARGINAL TENTACLES (TRAILING FILAMENTS) ── */}
      {tentacleAngles.map((angle, idx) => {
        const rad = 0.78;
        const tx = Math.cos(angle) * rad;
        const tz = Math.sin(angle) * rad;
        return (
          <group key={idx} position={[tx, -0.45, tz]}>
            <mesh ref={(el) => (tentacleRefs.current[idx] = el)} position={[0, -1.2, 0]}>
              <cylinderGeometry args={[0.015, 0.005, 2.4, 8]} />
              <meshStandardMaterial
                color="#7dd3fc"
                emissive="#38bdf8"
                emissiveIntensity={0.7}
                transparent
                opacity={0.75}
                roughness={0.3}
              />
            </mesh>
          </group>
        );
      })}

      {/* ── 4. BIOLUMINESCENT LUCIFERIN EXUDATE SPARKLES ── */}
      <Sparkles
        position={[0, -1.8, 0]}
        count={20}
        scale={[1.2, 3.5, 1.2]}
        size={1.8}
        color="#00f0ff"
        speed={0.4}
        opacity={0.6}
      />
    </group>
  );
}

export default function DeepEnvironment() {
  const depth = useSimulationStore((s) => s.depth);

  // Deep-sea elements active exclusively in the bathypelagic / abyssal zone (> 80m)
  if (depth < 80) return null;

  // Smooth fade-in across 80m to 120m depth
  const visibility = Math.min(1, (depth - 80) / 40);

  return (
    <group>
      {/* Ambient Planktonic Bioluminescence (Authentic Oceanic Cyan & Emerald) */}
      <Sparkles
        count={500}
        scale={[200, 100, 200]}
        position={[0, -100, 0]}
        size={1.4}
        color="#00ffff"
        opacity={visibility * 0.32}
        speed={0.12}
      />
      <Sparkles
        count={450}
        scale={[200, 100, 200]}
        position={[0, -100, 0]}
        size={1.6}
        color="#00f5d4"
        opacity={visibility * 0.24}
        speed={0.08}
      />

      {/* ── Midwater Bioluminescent Jellyfish Swarms ── */}
      {/* Cluster Alpha (Port/Forward flank at Y = -90m) */}
      <group position={[20, -90, -30]}>
        {[
          { pos: [-4.2, 1.5, 3.1], scale: 1.1 },
          { pos: [3.8, -2.2, -1.4], scale: 0.85 },
          { pos: [-1.5, -4.0, 5.2], scale: 1.25 },
          { pos: [5.1, 3.8, 2.0], scale: 0.95 },
          { pos: [-6.0, -1.8, -4.5], scale: 1.05 },
        ].map((item, i) => (
          <BioluminescentJelly key={`jelly-a-${i}`} position={item.pos as [number, number, number]} scale={item.scale} />
        ))}
      </group>

      {/* Cluster Beta (Starboard/Deep horizon at Y = -110m) */}
      <group position={[-25, -110, 10]}>
        {[
          { pos: [2.5, -1.0, -2.8], scale: 1.2 },
          { pos: [-3.2, 2.4, 1.9], scale: 0.9 },
          { pos: [1.8, -3.5, 4.1], scale: 1.15 },
        ].map((item, i) => (
          <BioluminescentJelly key={`jelly-b-${i}`} position={item.pos as [number, number, number]} scale={item.scale} />
        ))}
      </group>
    </group>
  );
}
```

---

## Additional Build / TypeScript Findings

During the exploration, running `npm run build` in `frontend/` revealed unrelated compilation issues that the implementer must be aware of when applying Phase 2 changes:
1. `AUVModel.tsx`: `pointerEvents="none"` was placed on `<mesh>` and `<group>` elements (lines 84, 90, 123, 129, 180, 236, 240, 249, 253), which is not a recognized Three.js / R3F prop and causes 9 TypeScript errors (`TS2322`).
2. `DebrisField.tsx`: `useState` is imported but unused (line 1), and `let attr = null` lacks type annotations (lines 44, 46).

---

## Conclusion

The pink/magenta untextured domes are fully cataloged, isolated to `frontend/src/simulation/environment/DeepEnvironment.tsx`, and the exact material and architectural remedy is completely specified.
