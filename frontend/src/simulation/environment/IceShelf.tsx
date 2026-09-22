import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStore } from '../store/simulationStore';

export default function IceShelf() {
  const depth = useSimulationStore(s => s.depth);
  const groupRef = useRef<THREE.Group>(null);

  // Generate realistic jagged iceberg shapes once
  const icebergs = useMemo(() => {
    return [...Array(25)].map((_) => {
      // Keep them somewhat near the spawn origin so the AUV sees them
      const x = (Math.random() - 0.5) * 400;
      const z = (Math.random() - 0.5) * 400;
      
      // Icebergs are massive, jagged, and asymmetric
      const scaleX = 10 + Math.random() * 30;
      const scaleY = 15 + Math.random() * 40;
      const scaleZ = 10 + Math.random() * 30;
      
      const rotY = Math.random() * Math.PI * 2;
      
      // Depth parameter controls how much of the iceberg is underwater (typically 90%)
      const yOffset = -scaleY * 0.4; 

      return { x, y: yOffset, z, scale: [scaleX, scaleY, scaleZ] as [number, number, number], rotY };
    });
  }, []);

  // Make them bob slightly in the waves
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(clock.elapsedTime * 0.5) * 1.5;
    }
  });

  // If we are super deep, don't render surface ice
  if (depth > 120) return null;

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {icebergs.map((ice, i) => (
        <mesh key={i} position={[ice.x, ice.y, ice.z]} rotation={[0, ice.rotY, 0]} castShadow receiveShadow>
          {/* Detail 0 makes the dodecahedron incredibly jagged and sharp, like real broken ice */}
          <dodecahedronGeometry args={[1, 0]} />
          <meshPhysicalMaterial 
            color="#e0f2fe" 
            emissive="#002244"
            emissiveIntensity={0.2}
            transmission={0.8} 
            opacity={0.95} 
            transparent 
            roughness={0.2} 
            metalness={0.1}
            thickness={10} 
            ior={1.31} 
          />
        </mesh>
      ))}
    </group>
  );
}
