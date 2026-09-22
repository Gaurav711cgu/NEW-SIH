import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStore } from '../store/simulationStore';

export default function SonarCone() {
  const sonarActive = useSimulationStore((s) => s.sonarActive);
  const sonarRange = useSimulationStore((s) => s.sonarRange);
  const setSonarSweep = useSimulationStore((s) => s.setSonarSweep);
  
  const coneRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  const radius = sonarRange * 0.3;

  useFrame((_, delta) => {
    if (!sonarActive) return;
    
    // Sweep animation
    if (coneRef.current) {
      coneRef.current.rotation.y += 0.02;
      setSonarSweep(coneRef.current.rotation.y);
    }
    
    // Ping animation (every 2 seconds)
    timeRef.current += delta;
    if (ringRef.current) {
      const pingCycle = timeRef.current % 2; // 0 to 2
      const progress = pingCycle / 2;
      
      const scale = 1 + progress * (sonarRange * 2);
      ringRef.current.scale.set(scale, scale, scale);
      
      const material = ringRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = Math.max(0, 0.5 - progress * 0.5);
    }
  });

  if (!sonarActive) return null;

  return (
    <group position={[0, -0.15, 0]}>
      {/* Sonar Cone */}
      <mesh ref={coneRef} position={[0, -sonarRange / 2, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[radius, sonarRange, 32, 1, true]} />
        <meshBasicMaterial 
          color="#00e5ff" 
          transparent 
          opacity={0.15} 
          side={THREE.DoubleSide} 
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Ping Ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <torusGeometry args={[0.5, 0.02, 16, 64]} />
        <meshBasicMaterial 
          color="#00e5ff" 
          transparent 
          opacity={0.5} 
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
