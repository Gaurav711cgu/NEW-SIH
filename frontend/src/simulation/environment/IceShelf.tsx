import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStore } from '../store/simulationStore';

export default function IceShelf() {
  const depth = useSimulationStore(s => s.depth);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(clock.elapsedTime * 0.5) * 0.2;
    }
  });

  // If we are super deep, don't even render the ice (save performance)
  if (depth > 100) return null;

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Massive procedurally scattered ice chunks */}
      {[...Array(15)].map((_, i) => {
        const x = (Math.random() - 0.5) * 300;
        const z = (Math.random() - 0.5) * 300;
        const scale = 5 + Math.random() * 20;
        const rot = Math.random() * Math.PI;

        return (
          <mesh key={i} position={[x, 0, z]} rotation={[0, rot, 0]} castShadow receiveShadow>
            <dodecahedronGeometry args={[scale, 1]} />
            <meshPhysicalMaterial 
              color="#e0f2fe" 
              transmission={0.9} 
              opacity={0.9} 
              transparent 
              roughness={0.1} 
              thickness={2} 
              ior={1.31} 
            />
          </mesh>
        );
      })}
    </group>
  );
}
