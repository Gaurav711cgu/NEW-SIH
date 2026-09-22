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
      propRef.current.rotation.x -= 0.25;
    }
  });

  return (
    <group ref={groupRef} dispose={null} scale={0.6}>
      
      {/* ── HIGH-FIDELITY HYDRODYNAMIC HULL ── */}
      {/* Main Body - Carbon Fiber / Matte Slate */}
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.7, 0.7, 4.5, 64]} />
        <meshPhysicalMaterial 
          color="#111827" 
          metalness={0.6}
          roughness={0.4}
          clearcoat={0.3}
        />
      </mesh>

      {/* Hi-Vis Yellow Tactical Striping */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.705, 0.705, 2.0, 64]} />
        <meshPhysicalMaterial 
          color="#facc15" 
          metalness={0.3}
          roughness={0.2}
          clearcoat={0.9}
        />
      </mesh>

      {/* Titanium Nose Parabola */}
      <mesh position={[2.25, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <sphereGeometry args={[0.7, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial 
          color="#94a3b8" 
          metalness={0.8} 
          roughness={0.2} 
          clearcoat={0.8} 
        />
      </mesh>

      {/* Optical Glass Payload Window (Nose) */}
      <mesh position={[2.8, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <sphereGeometry args={[0.4, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial 
          color="#00e5ff" 
          metalness={0.1} 
          roughness={0.05} 
          transmission={0.95} 
          thickness={0.5} 
          transparent 
          opacity={0.8} 
        />
      </mesh>

      {/* Internal Sensor Eye (Inside the Glass) */}
      <mesh position={[2.7, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#00e5ff" emissive="#0088aa" emissiveIntensity={2} />
      </mesh>

      {/* Tapered Carbon Tailcone */}
      <mesh position={[-3.15, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.7, 1.8, 64]} />
        <meshPhysicalMaterial color="#111827" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* ── CONNING TOWER / SAIL ── */}
      <group position={[0.5, 0.9, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.5, 0.5, 0.3]} />
          <meshPhysicalMaterial color="#facc15" metalness={0.3} roughness={0.2} clearcoat={0.9} />
        </mesh>
        
        {/* Antenna Mast */}
        <mesh position={[0.4, 0.6, 0]}>
          <cylinderGeometry args={[0.03, 0.05, 0.8, 16]} />
          <meshStandardMaterial color="#334155" metalness={0.9} />
        </mesh>
        
        {/* Iridium SATCOM Puck */}
        <mesh position={[-0.3, 0.3, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        
        {/* Flashing Beacon */}
        <mesh position={[0.4, 1.05, 0]}>
          <sphereGeometry args={[0.06]} />
          <meshStandardMaterial color="#ef4444" emissive="#ff0000" emissiveIntensity={5} />
        </mesh>
      </group>

      {/* ── X-RUDDER FINS ── */}
      {[Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4].map((angle, i) => (
        <group key={`fin-${i}`} position={[-2.8, 0, 0]} rotation={[angle, 0, 0]}>
          <mesh position={[0, 0.6, 0]} castShadow>
            <boxGeometry args={[0.6, 0.8, 0.04]} />
            <meshStandardMaterial color="#facc15" metalness={0.4} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* ── PROPULSION SYSTEM ── */}
      <group position={[-4.1, 0, 0]}>
        {/* Shroud / Duct */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <tubeGeometry args={[new THREE.LineCurve3(new THREE.Vector3(0, -0.35, 0), new THREE.Vector3(0, 0.35, 0)), 64, 0.02, 16, true]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
        </mesh>
        
        <group ref={propRef}>
          {/* Hub */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.15, 0.12, 0.3, 32]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* 7-Blade Scimitar Propeller */}
          {[...Array(7)].map((_, i) => (
            <group key={`blade-${i}`} rotation={[Math.PI/2, (i * Math.PI * 2) / 7, 0]}>
              <mesh position={[0, 0.22, 0]} rotation={[0, 0.2, 0.3]}>
                <boxGeometry args={[0.02, 0.4, 0.1]} />
                <meshStandardMaterial color="#facc15" metalness={0.6} roughness={0.4} />
              </mesh>
            </group>
          ))}
        </group>
      </group>

      {/* ── TACTICAL LIGHTING ── */}
      <spotLight position={[2.5, 0.5, 0.6]} angle={0.4} penumbra={0.2} intensity={8} distance={150} color="#e0f2fe" target-position={[15, -2, 2]} />
      <spotLight position={[2.5, 0.5, -0.6]} angle={0.4} penumbra={0.2} intensity={8} distance={150} color="#e0f2fe" target-position={[15, -2, -2]} />
      
      {/* Downward Seafloor Scanners */}
      <spotLight position={[1, -0.7, 0]} angle={0.8} penumbra={0.5} intensity={5} distance={50} color="#aaddff" target-position={[1, -10, 0]} />

      {/* Particle Thrusters overlay */}
      <Thrusters />
    </group>
  );
}
