import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStore } from '../store/simulationStore';

export default function SonarBeam() {
  const beamRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    const auvPosition = useSimulationStore.getState().auvPosition;
    const auvRotation = useSimulationStore.getState().auvRotation;
    
    if (beamRef.current) {
      // Position the beam slightly ahead of the AUV
      beamRef.current.position.set(auvPosition[0] + 2, auvPosition[1], auvPosition[2]);
      
      // Sweep animation: oscillate the beam like a scanning sonar
      const time = Date.now() / 1000;
      beamRef.current.rotation.set(
        auvRotation[0], 
        auvRotation[1] + Math.PI / 2, 
        auvRotation[2] - Math.PI / 8 + Math.sin(time * 2) * 0.2 // Sweep up and down slightly
      );
    }
  });

  return (
    <mesh ref={beamRef}>
      {/* A wide conical beam for Side-Scan Sonar */}
      <coneGeometry args={[18, 45, 32, 1, true, 0, Math.PI]} />
      <meshStandardMaterial 
        color="#00e5ff" 
        transparent={true} 
        opacity={0.15} 
        emissive="#00e5ff"
        emissiveIntensity={0.5}
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
