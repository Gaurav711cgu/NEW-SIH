import { useMemo, useRef, useLayoutEffect, Suspense } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { SceneErrorBoundary } from '../common/SceneErrorBoundary';

const SEAFLOOR_MODEL_PATH = '/models/seabed.glb';
useGLTF.preload(SEAFLOOR_MODEL_PATH);

// Seeded PRNG for deterministic clutter placement
function createPRNG(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

// Bilinear elevation query on the 180x180 seabed grid
function getSeabedElevation(
  x: number,
  z: number,
  posAttr: THREE.BufferAttribute | THREE.InterleavedBufferAttribute | null
): number {
  if (!posAttr) return -142.0;
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
  return -145 + localY;
}

interface ClutterTransform {
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

function InstancedSeabedClutter() {
  const seabedGltf = useGLTF(SEAFLOOR_MODEL_PATH);

  const gravelRef = useRef<THREE.InstancedMesh>(null);
  const crinoidRef = useRef<THREE.InstancedMesh>(null);
  const chimneyRef = useRef<THREE.InstancedMesh>(null);
  const ghostNetRef = useRef<THREE.InstancedMesh>(null);

  // Extract position attribute from seabed model
  const seabedPosAttr = useMemo(() => {
    let attr: THREE.BufferAttribute | THREE.InterleavedBufferAttribute | null = null;
    seabedGltf.scene.traverse((child) => {
      if (!attr && (child as THREE.Mesh).isMesh) {
        attr = (child as THREE.Mesh).geometry.attributes.position;
      }
    });
    return attr;
  }, [seabedGltf.scene]);

  // Geometries and materials for the 4 benthic clutter classes
  const clutterResources = useMemo(() => {
    // 1. Gravel / Dropstones
    const gravelGeom = new THREE.DodecahedronGeometry(0.45, 1);
    const gravelMat = new THREE.MeshStandardMaterial({
      color: '#334155',
      roughness: 0.92,
      metalness: 0.05,
    });

    // 2. Abyssal Crinoids / Sponges (base shifted to origin)
    const crinoidGeom = new THREE.CylinderGeometry(0.05, 0.16, 2.0, 6);
    crinoidGeom.translate(0, 1.0, 0);
    const crinoidMat = new THREE.MeshStandardMaterial({
      color: '#f8fafc',
      emissive: '#0284c7',
      emissiveIntensity: 0.35,
      roughness: 0.65,
    });

    // 3. Hydrothermal Vent Chimneys (base shifted to origin)
    const chimneyGeom = new THREE.CylinderGeometry(0.4, 1.3, 5.0, 7);
    chimneyGeom.translate(0, 2.5, 0);
    const chimneyMat = new THREE.MeshStandardMaterial({
      color: '#18181b',
      emissive: '#f97316',
      emissiveIntensity: 0.45,
      roughness: 0.88,
      metalness: 0.25,
    });

    // 4. Ghost Net Fragments (marine synthetic debris)
    const ghostNetGeom = new THREE.PlaneGeometry(3.2, 4.2, 4, 4);
    const ghostNetMat = new THREE.MeshStandardMaterial({
      color: '#0d9488',
      roughness: 0.75,
      metalness: 0.05,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });

    return {
      gravelGeom,
      gravelMat,
      crinoidGeom,
      crinoidMat,
      chimneyGeom,
      chimneyMat,
      ghostNetGeom,
      ghostNetMat,
    };
  }, []);

  // Compute deterministic placement data for all 4 clutter groups
  const clutterData = useMemo(() => {
    const prng = createPRNG(90210);

    // 1. Gravel (220 items)
    const gravel: ClutterTransform[] = [];
    for (let i = 0; i < 220; i++) {
      const radius = 3 + prng() * 55;
      const angle = prng() * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const baseScale = 0.8 + prng() * 2.2;
      const scaleX = baseScale * (0.8 + prng() * 0.4);
      const scaleY = baseScale * (0.6 + prng() * 0.3);
      const scaleZ = baseScale * (0.8 + prng() * 0.4);
      const groundY = getSeabedElevation(x, z, seabedPosAttr);
      const y = groundY + scaleY * 0.25;

      gravel.push({
        x,
        y,
        z,
        rx: prng() * Math.PI,
        ry: prng() * Math.PI * 2,
        rz: prng() * Math.PI,
        scaleX,
        scaleY,
        scaleZ,
      });
    }

    // 2. Crinoids / Sponges (75 items in colonies)
    const crinoids: ClutterTransform[] = [];
    for (let i = 0; i < 75; i++) {
      const clusterIdx = i % 5;
      const clusterAngle = clusterIdx * (Math.PI * 2 / 5);
      const cx = Math.cos(clusterAngle) * (10 + (i % 3) * 7);
      const cz = Math.sin(clusterAngle) * (10 + (i % 3) * 7);

      const x = cx + (prng() - 0.5) * 8;
      const z = cz + (prng() - 0.5) * 8;
      const groundY = getSeabedElevation(x, z, seabedPosAttr);
      const scale = 0.9 + prng() * 1.5;

      crinoids.push({
        x,
        y: groundY,
        z,
        rx: (prng() - 0.5) * 0.25,
        ry: prng() * Math.PI * 2,
        rz: (prng() - 0.5) * 0.25,
        scaleX: scale,
        scaleY: scale,
        scaleZ: scale,
      });
    }

    // 3. Chimneys (26 items in 2 geothermal vent fields)
    const chimneys: ClutterTransform[] = [];
    for (let i = 0; i < 26; i++) {
      const isFieldA = i < 15;
      const center = isFieldA ? { x: 20, z: 14 } : { x: -22, z: -18 };
      const x = center.x + (prng() - 0.5) * 16;
      const z = center.z + (prng() - 0.5) * 16;
      const groundY = getSeabedElevation(x, z, seabedPosAttr);
      const heightScale = 0.8 + prng() * 1.1;
      const widthScale = 0.85 + prng() * 0.6;

      chimneys.push({
        x,
        y: groundY,
        z,
        rx: (prng() - 0.5) * 0.15,
        ry: prng() * Math.PI * 2,
        rz: (prng() - 0.5) * 0.15,
        scaleX: widthScale,
        scaleY: heightScale,
        scaleZ: widthScale,
      });
    }

    // 4. Ghost Nets (18 fragments)
    const ghostNets: ClutterTransform[] = [];
    for (let i = 0; i < 18; i++) {
      const radius = 6 + prng() * 40;
      const angle = prng() * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const groundY = getSeabedElevation(x, z, seabedPosAttr);
      const scale = 0.9 + prng() * 1.4;

      ghostNets.push({
        x,
        y: groundY + 0.15,
        z,
        rx: -Math.PI / 2 + (prng() - 0.5) * 0.4,
        ry: (prng() - 0.5) * 0.4,
        rz: prng() * Math.PI * 2,
        scaleX: scale,
        scaleY: scale,
        scaleZ: scale,
      });
    }

    return { gravel, crinoids, chimneys, ghostNets };
  }, [seabedPosAttr]);

  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    const apply = (mesh: THREE.InstancedMesh | null, data: ClutterTransform[]) => {
      if (!mesh || data.length === 0) return;
      data.forEach((inst, i) => {
        dummy.position.set(inst.x, inst.y, inst.z);
        dummy.rotation.set(inst.rx, inst.ry, inst.rz);
        dummy.scale.set(inst.scaleX, inst.scaleY, inst.scaleZ);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
      mesh.matrixAutoUpdate = false;
      mesh.computeBoundingSphere();
    };

    apply(gravelRef.current, clutterData.gravel);
    apply(crinoidRef.current, clutterData.crinoids);
    apply(chimneyRef.current, clutterData.chimneys);
    apply(ghostNetRef.current, clutterData.ghostNets);
  }, [clutterData]);

  return (
    <group>
      {/* 1. Benthic Gravel / Dropstones */}
      <instancedMesh
        ref={gravelRef}
        args={[clutterResources.gravelGeom, clutterResources.gravelMat, clutterData.gravel.length]}
        frustumCulled={false}
        castShadow
        receiveShadow
      />

      {/* 2. Deep-Sea Crinoids / Sponges */}
      <instancedMesh
        ref={crinoidRef}
        args={[clutterResources.crinoidGeom, clutterResources.crinoidMat, clutterData.crinoids.length]}
        frustumCulled={false}
        castShadow
        receiveShadow
      />

      {/* 3. Hydrothermal Vent Chimneys */}
      <instancedMesh
        ref={chimneyRef}
        args={[clutterResources.chimneyGeom, clutterResources.chimneyMat, clutterData.chimneys.length]}
        frustumCulled={false}
        castShadow
        receiveShadow
      />

      {/* 4. Ghost Net Fragments */}
      <instancedMesh
        ref={ghostNetRef}
        args={[clutterResources.ghostNetGeom, clutterResources.ghostNetMat, clutterData.ghostNets.length]}
        frustumCulled={false}
        castShadow
        receiveShadow
      />
    </group>
  );
}

export default function DebrisField() {
  return (
    <SceneErrorBoundary fallback={null}>
      <Suspense fallback={null}>
        <InstancedSeabedClutter />
      </Suspense>
    </SceneErrorBoundary>
  );
}
