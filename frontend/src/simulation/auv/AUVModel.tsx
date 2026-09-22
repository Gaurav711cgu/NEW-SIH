import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSimulationStore } from '../store/simulationStore';
import * as THREE from 'three';
import Thrusters from './Thrusters';

export default function AUVModel() {
  const groupRef = useRef<THREE.Group>(null);
  const propRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const auvPosition = useSimulationStore.getState().auvPosition;
    const auvRotation = useSimulationStore.getState().auvRotation;
    
    if (groupRef.current) {
      // Smooth vertical bobbing to simulate ocean waves
      groupRef.current.position.set(auvPosition[0], auvPosition[1] + Math.sin(Date.now() / 1000 * 2) * 0.15, auvPosition[2]);
      groupRef.current.rotation.set(auvRotation[0], auvRotation[1], auvRotation[2]);
    }
    // Spin propeller
    if (propRef.current) {
      propRef.current.rotation.x -= 0.15;
    }
  });

  return (
    <group ref={groupRef} dispose={null} scale={0.5}>
      {/* ── Primary High-Visibility Expedition Yellow Hull ── */}
      {/* Main Torpedo Cylinder */}
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.7, 0.7, 4.2, 32]} />
        <meshPhysicalMaterial 
          color="#facc15" 
          emissive="#452a00"
          emissiveIntensity={0.15}
          metalness={0.25}
          roughness={0.2}
          clearcoat={0.9}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* Nose Parabolic Dome */}
      <mesh position={[2.1, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <sphereGeometry args={[0.7, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial color="#facc15" metalness={0.25} roughness={0.2} clearcoat={0.9} clearcoatRoughness={0.1} />
      </mesh>

      {/* Nose Ring Trim (Carbon) */}
      <mesh position={[2.08, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.71, 0.04, 16, 32]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Camera Window Optical Dome */}
      <mesh position={[2.65, 0.1, 0]}>
        <sphereGeometry args={[0.35, 24, 12]} />
        <meshPhysicalMaterial 
          color="#00e5ff" 
          metalness={0.1} 
          roughness={0.05} 
          transmission={0.9} 
          thickness={0.5} 
          transparent 
          opacity={0.85} 
        />
      </mesh>

      {/* Conical Tailcone (Carbon Slate) */}
      <mesh position={[-2.8, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.7, 1.4, 32]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Conning Sail (Dorsal Mast - Yellow) */}
      <mesh position={[0.4, 0.85, 0]}>
        <boxGeometry args={[1.2, 0.6, 0.35]} />
        <meshPhysicalMaterial color="#facc15" metalness={0.25} roughness={0.2} clearcoat={0.9} clearcoatRoughness={0.1} />
      </mesh>

      {/* Sail Cap Trim (Carbon) */}
      <mesh position={[0.4, 1.15, 0]}>
        <boxGeometry args={[1.24, 0.08, 0.37]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Top USBL Antenna Mast */}
      <mesh position={[0.6, 1.42, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.5, 12]} />
        <meshStandardMaterial color="#a855f7" metalness={0.9} roughness={0.1} emissive="#3b0764" emissiveIntensity={0.4} />
      </mesh>
      
      {/* Flashing Beacon */}
      <mesh position={[0.6, 1.7, 0]}>
        <sphereGeometry args={[0.08]} />
        <meshBasicMaterial color="#ff453a" />
      </mesh>

      {/* 4 X-Rudder Stabilizing Fins (Carbon Slate) */}
      {[Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4].map((angle, i) => (
        <group key={`fin-${i}`} position={[-2.5, 0, 0]} rotation={[angle, 0, 0]}>
          <mesh position={[0, 0.65, 0]}>
            <boxGeometry args={[0.45, 0.9, 0.06]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* Propeller Assembly */}
      <group ref={propRef} position={[-3.55, 0, 0]}>
        {/* Hub */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.18, 0.18, 0.3, 16]} />
          <meshStandardMaterial color="#ef4444" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Blades */}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <group key={`blade-${i}`} rotation={[Math.PI/2, (i * Math.PI * 2) / 7, 0]}>
            <mesh position={[0, 0.25, 0]} rotation={[0, 0, 0.2]}>
              <boxGeometry args={[0.03, 0.45, 0.12]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.4} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Headlights (Only active in dark) */}
      <spotLight position={[2.6, 0.3, 0.4]} angle={0.5} penumbra={0.5} intensity={5} distance={100} color="#ffffff" target-position={[10, 0, 0]} />
      <spotLight position={[2.6, 0.3, -0.4]} angle={0.5} penumbra={0.5} intensity={5} distance={100} color="#ffffff" target-position={[10, 0, 0]} />

      {/* Thrusters overlay (if any) */}
      <Thrusters />
    </group>
  );
}
