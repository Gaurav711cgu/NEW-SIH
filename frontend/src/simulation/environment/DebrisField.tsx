import { useMemo, useRef, useLayoutEffect, useState } from 'react';
import { useGLTF, Html } from '@react-three/drei';
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

    // 1. Hydrothermal Chimneys: 40 instances
    // Enforce port/starboard lateral placement strictly outside the nadir gap
    // Z in [-60, -18] and [18, 60], X in [-60, 60]
    for (let i = 0; i < 40; i++) {
      const side = (i % 2 === 0) ? 1 : -1;
      const deltaZ = 18.0 + prng() * (60.0 - 18.0); // 18m to 60m
      const z = side * deltaZ;
      const x = (prng() - 0.5) * 120.0; // -60m to +60m
      const y = getSeabedElevation(x, z, seabedPosAttr);
      chimneys.push({ 
        x, 
        y: y + 5.0, 
        z, 
        rx: 0, 
        ry: prng() * Math.PI, 
        rz: 0, 
        scaleX: 1, 
        scaleY: 1 + prng(), 
        scaleZ: 1 
      });
    }

    // 2. Ghost Nets: 30 instances
    // Enforce port/starboard lateral placement strictly outside the nadir gap
    // Z in [-46, -14] and [14, 46], X in [-45, 45]
    for (let i = 0; i < 30; i++) {
      const side = (i % 2 === 0) ? -1 : 1;
      const deltaZ = 14.0 + prng() * (46.0 - 14.0); // 14m to 46m
      const z = side * deltaZ;
      const x = (prng() - 0.5) * 90.0; // -45m to +45m
      const y = getSeabedElevation(x, z, seabedPosAttr);
      ghostNets.push({ 
        x, 
        y: y + 3.5 + prng() * 2.0, 
        z, 
        rx: prng() * 0.4, 
        ry: prng() * Math.PI, 
        rz: prng() * 0.4, 
        scaleX: 1, 
        scaleY: 1, 
        scaleZ: 1 
      });
    }

    return { chimneys, ghostNets };
  }, [seabedPosAttr]);

  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    const apply = (mesh: THREE.InstancedMesh | null, data: ClutterTransform[], initColor: THREE.Color) => {
      if (!mesh || data.length === 0) return;
      data.forEach((inst, i) => {
        dummy.position.set(inst.x, inst.y, inst.z);
        dummy.rotation.set(inst.rx, inst.ry, inst.rz);
        dummy.scale.set(inst.scaleX, inst.scaleY, inst.scaleZ);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        mesh.setColorAt(i, initColor);
      });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.computeBoundingSphere();
    };

    apply(chimneyRef.current, clutterData.chimneys, new THREE.Color(0x334155));
    apply(ghostNetRef.current, clutterData.ghostNets, new THREE.Color(0x00e5ff));
  }, [clutterData]);

  // --- SONAR WAVEFRONT INTERSECTION & SPECULAR STRIKE HIGHLIGHTING ---
  const defaultColor = useMemo(() => new THREE.Color(0x00e5ff), []); // Base cyan
  const alertColor = useMemo(() => new THREE.Color(0xff3366), []); // Red alert for acquired contacts
  const specularReturnColor = useMemo(() => new THREE.Color(0xffff55), []); // Bright acoustic specular highlight (amber/yellow-cyan)
  const tempColor = useMemo(() => new THREE.Color(), []);
  const tempMatrix = useMemo(() => new THREE.Matrix4(), []);
  const dummyObj = useMemo(() => new THREE.Object3D(), []);
  const detectedIndices = useRef<Set<number>>(new Set());
  const strikeTimestamps = useRef<Record<number, number>>({});
  const [detectedItems, setDetectedItems] = useState<{id: number, pos: [number, number, number]}[]>([]);

  useFrame(({ clock }) => {
    const auvPos = useSimulationStore.getState().auvPosition;
    const addAILog = useSimulationStore.getState().addAILog;
    const missionPhase = useSimulationStore.getState().missionPhase;
    const depth = useSimulationStore.getState().depth;

    const time = clock.getElapsedTime();
    // Expanding ping pulse synchronized with SonarBeam.tsx (0 to 50m over 1.5s)
    const duration = 1.5;
    const pingRadius = ((time % duration) / duration) * 50.0;
    const isSonarActive = missionPhase === 'STAGE_5_SONAR' || missionPhase === 'STAGE_6_ANOMALY' || depth > 80;

    if (ghostNetRef.current) {
      for (let i = 0; i < clutterData.ghostNets.length; i++) {
        ghostNetRef.current.getMatrixAt(i, tempMatrix);
        dummyObj.position.setFromMatrixPosition(tempMatrix);

        const dx = dummyObj.position.x - auvPos[0];
        const dy = dummyObj.position.y - auvPos[1];
        const dz = dummyObj.position.z - auvPos[2];
        const slantRange = Math.sqrt(dx * dx + dy * dy + dz * dz);

        // Acoustic wavefront strike detection when sonar is active
        if (isSonarActive) {
          // Acoustic strike within wavefront packet thickness (2.5m) and along-track beam aperture (|dx| < 25m)
          const isAcousticStrike = Math.abs(slantRange - pingRadius) < 2.5 && Math.abs(dx) < 25.0;

          if (isAcousticStrike) {
            strikeTimestamps.current[i] = time;
            if (!detectedIndices.current.has(i)) {
              detectedIndices.current.add(i);
              setDetectedItems(prev => [
                ...prev, 
                { id: i, pos: [dummyObj.position.x, dummyObj.position.y + 4, dummyObj.position.z] }
              ]);
              addAILog(`[AI VISION] Contact acquired! Sonar signature matching Ghost Net at Z:${dummyObj.position.z.toFixed(0)}m.`);
              addAILog(`[DB] Identifying object class via YOLOv8 and saving telemetry to platform.db...`);
            }
          }
        }

        // Render specular acoustic strike decay animation (~0.7s flash)
        const lastStrike = strikeTimestamps.current[i];
        const timeSinceStrike = lastStrike !== undefined ? time - lastStrike : 999;

        if (timeSinceStrike >= 0 && timeSinceStrike < 0.7) {
          const strikeIntensity = 1.0 - (timeSinceStrike / 0.7);
          const baseColor = detectedIndices.current.has(i) ? alertColor : defaultColor;
          tempColor.copy(baseColor).lerp(specularReturnColor, strikeIntensity);
          ghostNetRef.current.setColorAt(i, tempColor);
        } else {
          ghostNetRef.current.setColorAt(i, detectedIndices.current.has(i) ? alertColor : defaultColor);
        }
      }

      if (ghostNetRef.current.instanceColor) {
        ghostNetRef.current.instanceColor.needsUpdate = true;
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

      {/* Render 3D HUD Popups for detected anomalies */}
      {detectedItems.map((item) => (
        <Html key={`detection-${item.id}`} position={item.pos} center distanceFactor={25} zIndexRange={[100, 0]}>
          <div className="bg-[#020617]/90 border border-steel-800 rounded p-2 text-xs font-mono pointer-events-none w-56 shadow-lg shadow-black/80 backdrop-blur-md">
            <div className="text-[10px] font-bold text-steel-400 border-b border-steel-800 pb-1 mb-1 tracking-wider">
              EDGE_AI_INFERENCE_STDOUT
            </div>
            <div className="text-ice-400 text-[10px]">&gt; [AI] Confidence Score: 92%</div>
            <div className="text-[#ff453a] text-[10px]">&gt; [DB] CRITICAL: Saved to local SQLite</div>
            <div className="text-steel-400 text-[10px]">&gt; Sonar shadow extracted at Z={(item.pos[2]).toFixed(1)}m</div>
            <div className="text-steel-500 text-[10px]">&gt; [AI] Applying CLAHE enhancement...</div>
          </div>
        </Html>
      ))}
    </group>
  );
}
