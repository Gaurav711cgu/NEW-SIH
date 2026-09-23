import { useMemo, useRef, useLayoutEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useSimulationStore } from '../store/simulationStore';

const SEAFLOOR_MODEL_PATH = '/models/seabed.glb';
useGLTF.preload(SEAFLOOR_MODEL_PATH);

function createPRNG(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function getSeabedElevation(
  x: number, 
  z: number, 
  posAttr: THREE.BufferAttribute | THREE.InterleavedBufferAttribute | null
): number {
  if (!posAttr) return -147.0;
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
  return -150 + ((1 - s) * (1 - t) * y00 + s * (1 - t) * y10 + (1 - s) * t * y01 + s * t * y11);
}

interface ClutterTransform { x: number; y: number; z: number; rx: number; ry: number; rz: number; scaleX: number; scaleY: number; scaleZ: number; }

export default function DebrisField() {
  const seabedGltf = useGLTF(SEAFLOOR_MODEL_PATH);
  
  const ghostNetRef = useRef<THREE.InstancedMesh>(null);
  const chimneyRef = useRef<THREE.InstancedMesh>(null);

  const seabedPosAttr = useMemo(() => {
    let attr: THREE.BufferAttribute | THREE.InterleavedBufferAttribute | null = null;
    seabedGltf.scene.traverse((child) => {
      if (!attr && (child as THREE.Mesh).isMesh) attr = (child as THREE.Mesh).geometry.attributes.position;
    });
    return attr;
  }, [seabedGltf.scene]);

  // Make distinct, large geometries for the debris so they are highly visible
  const clutterResources = useMemo(() => {
    // 1. Hydrothermal Chimney (Tall rock structures)
    const chimneyGeom = new THREE.CylinderGeometry(1.5, 3.5, 12, 7);
    const chimneyMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.9, metalness: 0.1 });

    // 2. Ghost Nets (Cylindrical suspended debris, like in the screenshot)
    const ghostNetGeom = new THREE.CylinderGeometry(1.2, 1.4, 6, 12, 1, true);
    const ghostNetMat = new THREE.MeshStandardMaterial({ color: '#00e5ff', emissive: '#000000', side: THREE.DoubleSide, transparent: true, opacity: 0.8 });

    return { chimneyGeom, chimneyMat, ghostNetGeom, ghostNetMat };
  }, []);

  const clutterData = useMemo(() => {
    const prng = createPRNG(42);
    const chimneys: ClutterTransform[] = [];
    const ghostNets: ClutterTransform[] = [];

    for (let i = 0; i < 40; i++) {
      const x = (prng() - 0.5) * 400;
      const z = (prng() - 0.5) * 400;
      const y = getSeabedElevation(x, z, seabedPosAttr);
      chimneys.push({ x, y: y + 5, z, rx: 0, ry: prng() * Math.PI, rz: 0, scaleX: 1, scaleY: 1 + prng(), scaleZ: 1 });
    }

    // Cluster ghost nets around specific zones
    for (let i = 0; i < 30; i++) {
      const x = (prng() - 0.5) * 200;
      const z = (prng() - 0.5) * 200;
      const y = getSeabedElevation(x, z, seabedPosAttr);
      ghostNets.push({ x, y: y + 4 + prng() * 3, z, rx: prng() * 0.4, ry: prng() * Math.PI, rz: prng() * 0.4, scaleX: 1, scaleY: 1, scaleZ: 1 });
    }

    return { chimneys, ghostNets };
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
        mesh.setColorAt(i, new THREE.Color(0x00e5ff)); // Base cyan color
      });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.computeBoundingSphere();
    };

    apply(chimneyRef.current, clutterData.chimneys);
    apply(ghostNetRef.current, clutterData.ghostNets);
  }, [clutterData]);

  // --- SONAR INTERSECTION LOGIC ---
  const defaultColor = new THREE.Color(0x00e5ff); // Cyan
  const highlightColor = new THREE.Color(0xff0000); // Red
  const tempMatrix = new THREE.Matrix4();
  const dummyObj = new THREE.Object3D();

  useFrame(() => {
    const auvPos = useSimulationStore.getState().auvPosition;
    
    // Check ghost nets
    if (ghostNetRef.current) {
      let detectedAnomalies = 0;
      for (let i = 0; i < clutterData.ghostNets.length; i++) {
        ghostNetRef.current.getMatrixAt(i, tempMatrix);
        dummyObj.position.setFromMatrixPosition(tempMatrix);
        
        // Sonar beam logic: Forward cone from AUV
        // A simple distance and angle check. For now, distance < 40m and in front of AUV
        const distance = dummyObj.position.distanceTo(new THREE.Vector3(auvPos[0], auvPos[1], auvPos[2]));
        
        // Let's assume AUV is pointing mostly along X-axis (forward)
        // Just use distance for now to simulate the acoustic sweep radius
        if (distance < 35 && dummyObj.position.x > auvPos[0] - 10) {
          ghostNetRef.current.setColorAt(i, highlightColor);
          detectedAnomalies++;
        } else {
          ghostNetRef.current.setColorAt(i, defaultColor);
        }
      }
      if (ghostNetRef.current.instanceColor) {
        ghostNetRef.current.instanceColor.needsUpdate = true;
      }
      
      // Update global store if we found something so UI can react (YOLO detection)
      if (detectedAnomalies > 0) {
         // Optionally update store state here
      }
    }
  });

  return (
    <group>
      <instancedMesh
        ref={chimneyRef}
        args={[clutterResources.chimneyGeom, clutterResources.chimneyMat, clutterData.chimneys.length]}
        castShadow
        receiveShadow
      />
      <instancedMesh
        ref={ghostNetRef}
        args={[clutterResources.ghostNetGeom, clutterResources.ghostNetMat, clutterData.ghostNets.length]}
        castShadow
        receiveShadow
      />
    </group>
  );
}
