import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSimulationStore } from '../store/simulationStore';
import * as THREE from 'three';
import Thrusters from './Thrusters';

export default function AUVModel() {
  const groupRef = useRef<THREE.Group>(null);
  const propRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const auvPosition = useSimulationStore.getState().auvPosition;
    const auvRotation = useSimulationStore.getState().auvRotation;
    

    if (groupRef.current) {
      groupRef.current.position.set(auvPosition[0], auvPosition[1] + Math.sin(Date.now() / 1000 * 2) * 0.1, auvPosition[2]);
      groupRef.current.rotation.set(auvRotation[0], auvRotation[1], auvRotation[2]);
    }
    // Spin propeller based on depth change (just for effect)
    if (propRef.current) {
      propRef.current.rotation.z += 0.2;
    }
  });

  return (
    <group ref={groupRef} dispose={null}>
      {/* Main Hull (Torpedo) */}
      <mesh rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[0.3, 0.3, 2.4, 32]} />
        <meshStandardMaterial color="#ff9f0a" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Nose Cone (Glass Dome for camera) */}
      <mesh position={[1.2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <sphereGeometry args={[0.3, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial color="#ffffff" transmission={0.9} opacity={1} metalness={0} roughness={0} ior={1.5} thickness={0.5} />
      </mesh>

      {/* Tail Cone */}
      <mesh position={[-1.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.3, 0.6, 32]} />
        <meshStandardMaterial color="#ff9f0a" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Propeller Duct */}
      <mesh position={[-1.6, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.2, 0.3, 32]} />
        <meshStandardMaterial color="#1c1c1e" roughness={0.8} metalness={0.5} />
      </mesh>

      {/* Propeller Blades */}
      <mesh ref={propRef} position={[-1.6, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.05, 0.35, 0.35]} />
        <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Dorsal Fin / Antenna Base */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[0.6, 0.2, 0.05]} />
        <meshStandardMaterial color="#1c1c1e" roughness={0.8} metalness={0.5} />
      </mesh>

      {/* Antenna Mast */}
      <mesh position={[-0.2, 0.6, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.5]} />
        <meshStandardMaterial color="#cccccc" metalness={0.9} />
      </mesh>

      {/* Flashing Beacon */}
      <mesh position={[-0.2, 0.85, 0]}>
        <sphereGeometry args={[0.04]} />
        <meshBasicMaterial color="#ff453a" />
      </mesh>

      {/* Headlights (Only active in dark) - simplified for now without conditional rendering causing re-mounts */}
      <spotLight position={[1.1, 0.2, 0.2]} angle={0.5} penumbra={0.5} intensity={5} distance={100} color="#ffffff" target-position={[10, 0, 0]} />
      <spotLight position={[1.1, 0.2, -0.2]} angle={0.5} penumbra={0.5} intensity={5} distance={100} color="#ffffff" target-position={[10, 0, 0]} />

      {/* Thrusters overlay (if any) */}
      <Thrusters />
    </group>
  );
}
