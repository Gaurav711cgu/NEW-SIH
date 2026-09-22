import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSimulationStore } from '../store/simulationStore';
import * as THREE from 'three';
import Thrusters from './Thrusters';

export default function AUVModel() {
  const auvPosition = useSimulationStore((s) => s.auvPosition);
  const auvRotation = useSimulationStore((s) => s.auvRotation);
  const depth = useSimulationStore((s) => s.depth);

  const groupRef = useRef<THREE.Group>(null);
  const propRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.set(...auvPosition);
      groupRef.current.rotation.set(...auvRotation);
    }
    // Spin propeller based on depth change (just for effect)
    if (propRef.current) {
      propRef.current.rotation.z += 0.2;
    }
  });

  // Materials
  const hullMat = new THREE.MeshStandardMaterial({
    color: '#ff9f0a', // High-vis orange/yellow typical of AUVs
    roughness: 0.3,
    metalness: 0.2,
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: '#1c1c1e',
    roughness: 0.8,
    metalness: 0.5,
  });
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: '#ffffff',
    transmission: 0.9,
    opacity: 1,
    metalness: 0,
    roughness: 0,
    ior: 1.5,
    thickness: 0.5,
  });

  return (
    <group ref={groupRef} dispose={null}>
      {/* Main Hull (Torpedo) */}
      <mesh rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[0.3, 0.3, 2.4, 32]} />
        <primitive object={hullMat} attach="material" />
      </mesh>

      {/* Nose Cone (Glass Dome for camera) */}
      <mesh position={[1.2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <sphereGeometry args={[0.3, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <primitive object={glassMat} attach="material" />
      </mesh>

      {/* Tail Cone */}
      <mesh position={[-1.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.3, 0.6, 32]} />
        <primitive object={hullMat} attach="material" />
      </mesh>

      {/* Propeller Duct */}
      <mesh position={[-1.6, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.2, 0.3, 32]} />
        <primitive object={darkMat} attach="material" />
      </mesh>

      {/* Propeller Blades */}
      <mesh ref={propRef} position={[-1.6, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.05, 0.35, 0.35]} />
        <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Dorsal Fin / Antenna Base */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[0.6, 0.2, 0.05]} />
        <primitive object={darkMat} attach="material" />
      </mesh>

      {/* Antenna Mast */}
      <mesh position={[-0.2, 0.6, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.5]} />
        <meshStandardMaterial color="#cccccc" metalness={0.9} />
      </mesh>

      {/* Flashing Beacon */}
      <mesh position={[-0.2, 0.85, 0]}>
        <sphereGeometry args={[0.04]} />
        <meshBasicMaterial color={depth < 5 ? '#ff453a' : '#38383a'} />
      </mesh>

      {/* Headlights (Only active in dark) */}
      {depth > 50 && (
        <>
          <spotLight position={[1.1, 0.2, 0.2]} angle={0.5} penumbra={0.5} intensity={5} distance={100} color="#ffffff" target-position={[10, 0, 0]} />
          <spotLight position={[1.1, 0.2, -0.2]} angle={0.5} penumbra={0.5} intensity={5} distance={100} color="#ffffff" target-position={[10, 0, 0]} />
        </>
      )}

      {/* Thrusters overlay (if any) */}
      <Thrusters />
      {/* Sonar sweep / sensor cones */}
    </group>
  );
}
