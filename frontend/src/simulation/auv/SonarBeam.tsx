import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStore } from '../store/simulationStore';

export default function SonarBeam() {
  const portRef = useRef<THREE.Group>(null);
  const stbdRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    const auvPosition = useSimulationStore.getState().auvPosition;
    const auvRotation = useSimulationStore.getState().auvRotation;
    const time = clock.getElapsedTime();
    
    // Slight scanning oscillation for visual effect
    const scanOscillation = Math.sin(time * 6) * 0.05;
    
    if (portRef.current) {
      portRef.current.position.set(auvPosition[0], auvPosition[1], auvPosition[2]);
      portRef.current.rotation.set(
        auvRotation[0], 
        auvRotation[1] + Math.PI / 2, // Face left (-Z)
        auvRotation[2] - Math.PI / 4 + scanOscillation
      );
    }
    
    if (stbdRef.current) {
      stbdRef.current.position.set(auvPosition[0], auvPosition[1], auvPosition[2]);
      stbdRef.current.rotation.set(
        auvRotation[0], 
        auvRotation[1] - Math.PI / 2, // Face right (+Z)
        auvRotation[2] - Math.PI / 4 - scanOscillation
      );
    }
  });

  return (
    <group>
      {/* Port (Left) Side-Scan Sonar Fan */}
      <group ref={portRef}>
        <mesh position={[0, -25, 0]} scale={[1, 0.05, 1]}>
          <coneGeometry args={[30, 50, 32, 1, true, 0, Math.PI]} />
          <meshBasicMaterial 
            color="#00ffcc" 
            transparent={true} 
            opacity={0.15} 
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            wireframe={true}
          />
        </mesh>
      </group>
      
      {/* Starboard (Right) Side-Scan Sonar Fan */}
      <group ref={stbdRef}>
        <mesh position={[0, -25, 0]} scale={[1, 0.05, 1]}>
          <coneGeometry args={[30, 50, 32, 1, true, 0, Math.PI]} />
          <meshBasicMaterial 
            color="#00ffcc" 
            transparent={true} 
            opacity={0.15} 
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            wireframe={true}
          />
        </mesh>
      </group>
    </group>
  );
}
