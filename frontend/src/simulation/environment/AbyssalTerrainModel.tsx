import { Suspense, useMemo, useRef, useLayoutEffect } from 'react';
import { useGLTF, useTexture } from '@react-three/drei';
import { SceneErrorBoundary } from '../common/SceneErrorBoundary';
import * as THREE from 'three';

const ROCK_MODEL_PATH = '/models/abyssal_rock.glb';
const SEAFLOOR_MODEL_PATH = '/models/seabed.glb';

useGLTF.preload(ROCK_MODEL_PATH);
useGLTF.preload(SEAFLOOR_MODEL_PATH);
useTexture.preload('/textures/rock/aerial_rocks_01_diff_2k.jpg');
useTexture.preload('/textures/rock/aerial_rocks_01_nor_gl_2k.jpg');
useTexture.preload('/textures/rock/aerial_rocks_01_rough_2k.jpg');

// Seeded PRNG for deterministic, reproducible geological distribution
function createPRNG(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

// Bilinear interpolation across the 180x180 regular seabed grid (450m x 450m, origin at Y = -150m)
function getSeabedElevation(
  x: number,
  z: number,
  posAttr: THREE.BufferAttribute | THREE.InterleavedBufferAttribute | null
): number {
  if (!posAttr) return -147.0; // Fallback to mean seabed plane
  const u = Math.max(0, Math.min(178.999, ((x + 225) / 450) * 179));
  const v = Math.max(0, Math.min(178.999, ((z + 225) / 450) * 179));
  const c0 = Math.floor(u);
  const c1 = c0 + 1;
  const r0 = Math.floor(v);
  const r1 = r0 + 1;
  const s = u - c0;
  const t = v - r0;

  const y00 = posAttr.getY(r0 * 180 + c0);
  const y10 = posAttr.getY(r0 * 180 + c1);
  const y01 = posAttr.getY(r1 * 180 + c0);
  const y11 = posAttr.getY(r1 * 180 + c1);

  const localY = (1 - s) * (1 - t) * y00 + s * (1 - t) * y10 + (1 - s) * t * y01 + s * t * y11;
  return -150 + localY;
}

interface RockInstance {
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
  scaleX: number;
  scaleY: number;
  scaleZ: number;
}

function InstancedAbyssalRocks() {
  const rockGltf = useGLTF(ROCK_MODEL_PATH);
  const seabedGltf = useGLTF(SEAFLOOR_MODEL_PATH);
  
  const [diffuse, normal, rough] = useTexture([
    '/textures/rock/aerial_rocks_01_diff_2k.jpg',
    '/textures/rock/aerial_rocks_01_nor_gl_2k.jpg',
    '/textures/rock/aerial_rocks_01_rough_2k.jpg'
  ]);

  const meshRef = useRef<THREE.InstancedMesh>(null);

  // 1. Extract position attribute from seabed for bilinear elevation snapping
  const seabedPosAttr = useMemo(() => {
    let attr: THREE.BufferAttribute | THREE.InterleavedBufferAttribute | null = null;
    seabedGltf.scene.traverse((child) => {
      if (!attr && (child as THREE.Mesh).isMesh) {
        attr = (child as THREE.Mesh).geometry.attributes.position;
      }
    });
    return attr;
  }, [seabedGltf.scene]);

  // 2. Fix multi-LOD stacking: Extract single LOD1 mesh (2,824 vertices) and configure 2K PBR material
  const rockData = useMemo(() => {
    let targetMesh: THREE.Mesh | null = null;
    rockGltf.scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        if (child.name.includes('LOD1') || child.name === 'moon_rock_01_LOD1') {
          targetMesh = child as THREE.Mesh;
        }
      }
    });

    if (!targetMesh) {
      rockGltf.scene.traverse((child) => {
        if (!targetMesh && (child as THREE.Mesh).isMesh) {
          targetMesh = child as THREE.Mesh;
        }
      });
    }

    if (!targetMesh) return null;

    const geometry = (targetMesh as THREE.Mesh).geometry;
    
    [diffuse, normal, rough].forEach(tex => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(1.5, 1.5);
    });

    const material = new THREE.MeshStandardMaterial({
      map: diffuse,
      normalMap: normal,
      roughnessMap: rough,
      color: '#9ba4b5',
      roughness: 0.95,
      metalness: 0.05,
      normalScale: new THREE.Vector2(2.5, 2.5)
    });

    return { geometry, material };
  }, [rockGltf.scene, diffuse, normal, rough]);

  // 3. Generate 112 clustered rock instances with camera-centric distribution and elevation snapping
  // Raw geometry size is 0.21m width x 0.075m height, so scales ~10-60 produce natural 2m to 13m outcrops
  const instances = useMemo<RockInstance[]>(() => {
    const prng = createPRNG(4242);
    const result: RockInstance[] = [];

    const addRock = (x: number, z: number, baseScale: number) => {
      // Clear the central flight corridor: if |x| < 4.5 and |z| < 20, push laterally outside |x| >= 4.5
      let adjustedX = x;
      if (Math.abs(adjustedX) < 4.5 && Math.abs(z) < 20) {
        adjustedX = (adjustedX >= 0 ? 1 : -1) * (4.5 + prng() * 3.0);
      }

      const scaleX = baseScale * (0.85 + prng() * 0.3);
      let scaleY = baseScale * (0.75 + prng() * 0.35);
      const scaleZ = baseScale * (0.85 + prng() * 0.3);

      const groundY = getSeabedElevation(adjustedX, z, seabedPosAttr);
      // Raw mesh origin is at base (Ymin ≈ 0). Embed base slightly into silt:
      const y = groundY - scaleY * 0.075 * 0.15;

      // Clamp rock top height near the vehicle corridor so it never exceeds -146.0m
      const unscaledHeight = 0.0725;
      const rockTop = y + scaleY * unscaledHeight;
      if (Math.abs(adjustedX) < 8.0 && Math.abs(z) < 25 && rockTop > -146.0) {
        scaleY = Math.max(2.0, (-146.0 - y) / unscaledHeight);
      }

      const rx = (prng() - 0.5) * 0.35;
      const ry = prng() * Math.PI * 2;
      const rz = (prng() - 0.5) * 0.35;

      result.push({ x: adjustedX, y, z, rx, ry, rz, scaleX, scaleY, scaleZ });
    };

    // Cluster 1: Foreground & starboard seabed ridge (under starboard headlight)
    // 30 rocks within 8m to 35m of vehicle
    for (let i = 0; i < 30; i++) {
      const x = 5 + prng() * 32;
      const z = 2 + prng() * 28;
      const isMassive = i < 4;
      const isMedium = i < 14;
      const scale = isMassive ? 38 + prng() * 24 : (isMedium ? 18 + prng() * 14 : 9 + prng() * 8);
      addRock(x, z, scale);
    }

    // Cluster 2: Portside rocky outcrop (under port headlight)
    // 28 rocks within 8m to 35m of vehicle
    for (let i = 0; i < 28; i++) {
      const x = 4 + prng() * 30;
      const z = -4 - prng() * 28;
      const isMassive = i < 4;
      const isMedium = i < 14;
      const scale = isMassive ? 36 + prng() * 22 : (isMedium ? 17 + prng() * 13 : 8 + prng() * 8);
      addRock(x, z, scale);
    }

    // Cluster 3: Immediate camera foreground & flank formations (clearing immediate flight envelope)
    // 24 rocks outside vehicle corridor
    for (let i = 0; i < 24; i++) {
      const angle = (prng() - 0.5) * Math.PI * 2;
      const dist = 7.5 + prng() * 12.5;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      const isMassive = i < 3;
      const scale = isMassive ? 24 + prng() * 12 : 10 + prng() * 8;
      addRock(x, z, scale);
    }

    // Cluster 4: Deep-sea background field extending 35m to 70m into searchlight horizon
    // 30 rocks
    for (let i = 0; i < 30; i++) {
      const angle = (prng() - 0.5) * Math.PI * 1.5;
      const dist = 32 + prng() * 38;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      const isMassive = i < 5;
      const scale = isMassive ? 42 + prng() * 22 : 16 + prng() * 16;
      addRock(x, z, scale);
    }

    return result;
  }, [seabedPosAttr]);

  // 4. Matrix population once on mount
  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || instances.length === 0) return;
    const dummy = new THREE.Object3D();

    instances.forEach((inst, i) => {
      dummy.position.set(inst.x, inst.y, inst.z);
      dummy.rotation.set(inst.rx, inst.ry, inst.rz);
      dummy.scale.set(inst.scaleX, inst.scaleY, inst.scaleZ);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
    mesh.matrixAutoUpdate = false;
    mesh.computeBoundingSphere();
  }, [instances]);

  if (!rockData) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[rockData.geometry, rockData.material, instances.length]}
      frustumCulled={false}
      castShadow
      receiveShadow
    />
  );
}

export function AbyssalTerrainModel() {
  return (
    <SceneErrorBoundary fallback={null}>
      <Suspense fallback={null}>
        <InstancedAbyssalRocks />
      </Suspense>
    </SceneErrorBoundary>
  );
}

export default AbyssalTerrainModel;
