import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStore } from '../store/simulationStore';

export default function SonarBeam() {
  const portRef = useRef<THREE.Mesh>(null);
  const stbdRef = useRef<THREE.Mesh>(null);
  
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

  const sonarMaterial = (
    <meshStandardMaterial 
      color="#00ffcc" 
      transparent={true} 
      opacity={0.15} 
      emissive="#00ffcc"
      emissiveIntensity={0.8}
      side={THREE.DoubleSide}
      depthWrite={false}
      blending={THREE.AdditiveBlending}
    />
  );

  return (
    <group>
      {/* Port (Left) Side-Scan Sonar Fan */}
      <mesh ref={portRef} scale={[1, 0.05, 1]}>
        <coneGeometry args={[25, 50, 32, 1, true, 0, Math.PI]} />
        {sonarMaterial}
      </mesh>
      
      {/* Starboard (Right) Side-Scan Sonar Fan */}
      <mesh ref={stbdRef} scale={[1, 0.05, 1]}>
        <coneGeometry args={[25, 50, 32, 1, true, 0, Math.PI]} />
        {sonarMaterial}
      </mesh>
    </group>
  );
}
