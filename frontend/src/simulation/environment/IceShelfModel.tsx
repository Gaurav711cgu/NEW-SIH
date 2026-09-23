import { Suspense, useMemo, useRef } from 'react';
import { useGLTF, Clone } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStore } from '../store/simulationStore';
import { SceneErrorBoundary } from '../common/SceneErrorBoundary';

const MODEL_PATH = '/models/iceberg.glb';
useGLTF.preload(MODEL_PATH);

function GLBIceShelf() {
  const { scene } = useGLTF(MODEL_PATH);
  const groupRef = useRef<THREE.Group>(null);
  const depth = useSimulationStore((s) => s.depth);

  // Deterministic iceberg cluster along perimeter
  const icebergPlacements = useMemo(() => {
    return [
      { pos: [-60, 0, -50], rot: [0, 0.4, 0], scale: [3.5, 3.0, 3.5] },
      { pos: [70, 0, -80], rot: [0, 1.8, 0], scale: [4.0, 3.5, 4.0] },
      { pos: [-80, 0, 60], rot: [0, 3.1, 0], scale: [3.0, 2.8, 3.0] },
      { pos: [90, 0, 50], rot: [0, 4.5, 0], scale: [4.5, 3.8, 4.5] },
      { pos: [-120, 0, -100], rot: [0, 0.9, 0], scale: [6.0, 5.0, 6.0] },
      { pos: [130, 0, -120], rot: [0, 2.3, 0], scale: [5.5, 4.8, 5.5] },
      { pos: [-40, 0, 110], rot: [0, 1.2, 0], scale: [4.2, 3.6, 4.2] },
      { pos: [110, 0, 100], rot: [0, 5.1, 0], scale: [3.8, 3.2, 3.8] },
    ] as { pos: [number, number, number]; rot: [number, number, number]; scale: [number, number, number] }[];
  }, []);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.x = Math.sin(clock.elapsedTime * 0.03) * 2;
      groupRef.current.position.z = Math.cos(clock.elapsedTime * 0.03) * 2;
    }
  });

  if (depth > 120) return null;

  return (
    <group ref={groupRef}>
      {icebergPlacements.map((item, idx) => (
        <group key={idx} position={item.pos} rotation={item.rot} scale={item.scale}>
          <Clone
            object={scene}
            castShadow
            receiveShadow
            inject={
              <meshPhysicalMaterial
                color="#e0f2fe"
                emissive="#0284c7"
                emissiveIntensity={0.4}
                roughness={0.3}
                metalness={0.1}
                clearcoat={1.0}
                clearcoatRoughness={0.2}
                transparent={true}
                opacity={0.85}
                side={THREE.DoubleSide}
              />
            }
          />
        </group>
      ))}
    </group>
  );
}

export function IceShelfModel() {
  return (
    <SceneErrorBoundary fallback={null}>
      <Suspense fallback={null}>
        <GLBIceShelf />
      </Suspense>
    </SceneErrorBoundary>
  );
}

export default IceShelfModel;
