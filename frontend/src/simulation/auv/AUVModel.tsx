import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSimulationStore } from '../store/simulationStore';
import * as THREE from 'three';
import Thrusters from './Thrusters';
import { Html, useCursor } from '@react-three/drei';
import { Select } from '@react-three/postprocessing';
import { Activity, Battery, Radio, Zap } from 'lucide-react';

export default function AUVModel() {
  const groupRef = useRef<THREE.Group>(null);
  const propRef = useRef<THREE.Group>(null);
  
  const [activeComponent, setActiveComponent] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  // Canvas-scoped cursor management
  useCursor(Boolean(hovered), 'pointer', 'auto');

  useFrame(() => {
    const auvPosition = useSimulationStore.getState().auvPosition;
    const auvRotation = useSimulationStore.getState().auvRotation;
    
    if (groupRef.current) {
      // Apply hydrodynamic wave swell heave/pitch oscillation
      groupRef.current.position.set(auvPosition[0], auvPosition[1] + Math.sin(Date.now() / 1000 * 2) * 0.15, auvPosition[2]);
      groupRef.current.rotation.set(auvRotation[0], auvRotation[1], auvRotation[2]);
    }
    // Spin propeller
    if (propRef.current) {
      propRef.current.rotation.x -= 0.25;
    }
  });

  const toggleComponent = (id: string, e?: any) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setActiveComponent((prev) => (prev === id ? null : id));
  };

  const Card = ({
    title,
    icon: Icon,
    stats,
    onClose,
  }: {
    title: string;
    icon: any;
    stats: { label: string; val: string }[];
    onClose?: () => void;
  }) => (
    <div className="bg-[#0c0c0c]/90 backdrop-blur-md border-2 border-ice-500 rounded-xl p-4 shadow-[0_0_20px_rgba(0,229,255,0.4)] w-56 pointer-events-auto transform -translate-y-1/2">
      <div className="flex items-center justify-between gap-3 mb-3 border-b border-ice-500/30 pb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-ice-400" />
          <span className="text-[11px] font-mono font-bold text-ice-100 tracking-wider">{title}</span>
        </div>
        {onClose && (
          <button
            onPointerDown={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-steel-400 hover:text-ice-300 font-mono text-sm leading-none p-1 transition-colors cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        )}
      </div>
      <div className="space-y-1.5">
        {stats.map((s, i) => (
          <div key={i} className="flex justify-between text-[10px] font-mono">
            <span className="text-steel-400">{s.label}</span>
            <span className="text-ice-400 font-bold">{s.val}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <group 
      ref={groupRef} 
      dispose={null} 
      scale={0.6}
      onPointerMissed={() => setActiveComponent(null)}
    >
      
      {/* ── HIGH-FIDELITY HYDRODYNAMIC HULL (BATTERY) ── */}
      <Select enabled={hovered === 'BATTERY'}>
        <mesh 
          rotation={[0, 0, Math.PI / 2]} 
          castShadow 
          receiveShadow
          onPointerDown={(e) => toggleComponent('BATTERY', e)}
          onPointerOver={(e) => { e.stopPropagation(); setHovered('BATTERY'); }}
          onPointerOut={(e) => { e.stopPropagation(); setHovered(null); }}
        >
          <cylinderGeometry args={[0.7, 0.7, 4.5, 64]} />
          <meshPhysicalMaterial 
            color="#111827" 
            metalness={0.6} 
            roughness={0.4} 
            clearcoat={0.3} 
            emissive={hovered === 'BATTERY' || activeComponent === 'BATTERY' ? '#00e5ff' : '#000000'}
            emissiveIntensity={0.2}
          />
        </mesh>
      </Select>
      {activeComponent === 'BATTERY' && (
        <Html position={[0, -1.2, 0]} center zIndexRange={[100, 0]}>
          <Card 
            title="MAIN BATTERY POD" 
            icon={Battery} 
            stats={[{label: 'CAPACITY', val: '72.4 kWh'}, {label: 'CELL TEMP', val: '4.2°C'}, {label: 'DRAW', val: '1.2 kW'}]} 
            onClose={() => setActiveComponent(null)}
          />
        </Html>
      )}

      {/* Hi-Vis Yellow Tactical Striping */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow raycast={() => null}>
        <cylinderGeometry args={[0.705, 0.705, 2.0, 64]} />
        <meshPhysicalMaterial color="#facc15" metalness={0.3} roughness={0.2} clearcoat={0.9} />
      </mesh>

      {/* Titanium Nose Parabola */}
      <mesh position={[2.25, 0, 0]} rotation={[0, 0, -Math.PI / 2]} raycast={() => null}>
        <sphereGeometry args={[0.7, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial color="#94a3b8" metalness={0.8} roughness={0.2} clearcoat={0.8} />
      </mesh>

      {/* Optical Glass Payload Window (Nose) (SENSOR) */}
      <Select enabled={hovered === 'SENSOR'}>
        <mesh 
          position={[2.8, 0, 0]} 
          rotation={[0, 0, -Math.PI / 2]}
          onPointerDown={(e) => toggleComponent('SENSOR', e)}
          onPointerOver={(e) => { e.stopPropagation(); setHovered('SENSOR'); }}
          onPointerOut={(e) => { e.stopPropagation(); setHovered(null); }}
        >
          <sphereGeometry args={[0.4, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshPhysicalMaterial 
            color="#00e5ff" 
            metalness={0.1} 
            roughness={0.05} 
            transmission={0.95} 
            thickness={0.5} 
            transparent 
            opacity={0.8} 
            emissive={hovered === 'SENSOR' || activeComponent === 'SENSOR' ? '#00e5ff' : '#000000'}
            emissiveIntensity={hovered === 'SENSOR' ? 1.5 : 0}
          />
        </mesh>
      </Select>
      {activeComponent === 'SENSOR' && (
        <Html position={[1.5, 0, 0]} center zIndexRange={[100, 0]}>
          <Card 
            title="AI OPTICAL MATRIX" 
            icon={Activity} 
            stats={[{label: 'MODEL', val: 'YOLOv8-MARINE'}, {label: 'INFERENCE', val: '42ms'}, {label: 'LENS HT', val: 'ACTIVATED'}]} 
            onClose={() => setActiveComponent(null)}
          />
        </Html>
      )}

      {/* Internal Sensor Eye (Inside the Glass) */}
      <mesh position={[2.7, 0, 0]} rotation={[0, 0, -Math.PI / 2]} raycast={() => null}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#00e5ff" emissive="#0088aa" emissiveIntensity={3} />
      </mesh>

      {/* Tapered Carbon Tailcone */}
      <mesh position={[-3.15, 0, 0]} rotation={[0, 0, Math.PI / 2]} raycast={() => null}>
        <cylinderGeometry args={[0.2, 0.7, 1.8, 64]} />
        <meshPhysicalMaterial color="#111827" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* ── CONNING TOWER / SAIL (COMMS) ── */}
      <Select enabled={hovered === 'COMMS'}>
        <group 
          position={[0.5, 0.9, 0]}
          onPointerDown={(e) => toggleComponent('COMMS', e)}
          onPointerOver={(e) => { e.stopPropagation(); setHovered('COMMS'); }}
          onPointerOut={(e) => { e.stopPropagation(); setHovered(null); }}
        >
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.5, 0.5, 0.3]} />
            <meshPhysicalMaterial 
              color="#facc15" 
              metalness={0.3} 
              roughness={0.2} 
              clearcoat={0.9} 
              emissive={hovered === 'COMMS' || activeComponent === 'COMMS' ? '#00e5ff' : '#000000'}
              emissiveIntensity={0.3}
            />
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
      </Select>
      {activeComponent === 'COMMS' && (
        <Html position={[0.5, 2.4, 0]} center zIndexRange={[100, 0]}>
          <Card 
            title="UHF / SATCOM ARRAY" 
            icon={Radio} 
            stats={[{label: 'UHF LINK', val: 'NO SIGNAL'}, {label: 'IRIDIUM SBD', val: 'STANDBY'}, {label: 'ACOUSTIC', val: 'TX/RX OK'}]} 
            onClose={() => setActiveComponent(null)}
          />
        </Html>
      )}

      {/* ── X-RUDDER FINS ── */}
      {[Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4].map((angle, i) => (
        <group key={`fin-${i}`} position={[-2.8, 0, 0]} rotation={[angle, 0, 0]} raycast={() => null}>
          <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.6, 0.8, 0.04]} />
            <meshStandardMaterial color="#facc15" metalness={0.4} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* ── PROPULSION SYSTEM (THRUSTER) ── */}
      <Select enabled={hovered === 'THRUSTER'}>
        <group 
          position={[-4.1, 0, 0]}
          onPointerDown={(e) => toggleComponent('THRUSTER', e)}
          onPointerOver={(e) => { e.stopPropagation(); setHovered('THRUSTER'); }}
          onPointerOut={(e) => { e.stopPropagation(); setHovered(null); }}
        >
          {/* Shroud / Duct */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <tubeGeometry args={[new THREE.LineCurve3(new THREE.Vector3(0, -0.35, 0), new THREE.Vector3(0, 0.35, 0)), 64, 0.02, 16, true]} />
            <meshStandardMaterial 
              color="#1e293b" 
              metalness={0.8} 
              roughness={0.2} 
              emissive={hovered === 'THRUSTER' || activeComponent === 'THRUSTER' ? '#00e5ff' : '#000000'}
              emissiveIntensity={0.5}
            />
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
      </Select>
      {activeComponent === 'THRUSTER' && (
        <Html position={[-5.1, 1, 0]} center zIndexRange={[100, 0]}>
          <Card 
            title="MAIN PROPULSION" 
            icon={Zap} 
            stats={[{label: 'RPM', val: '450'}, {label: 'TORQUE', val: '12 Nm'}, {label: 'MODE', val: 'ECO-CRUISE'}]} 
            onClose={() => setActiveComponent(null)}
          />
        </Html>
      )}

      {/* ── TACTICAL LIGHTING & EMISSIVE FIXTURES ── */}
      <spotLight position={[2.5, 0.5, 0.6]} angle={0.4} penumbra={0.2} intensity={8} distance={150} color="#e0f2fe" target-position={[15, -2, 2]} />
      <spotLight position={[2.5, 0.5, -0.6]} angle={0.4} penumbra={0.2} intensity={8} distance={150} color="#e0f2fe" target-position={[15, -2, -2]} />
      
      {/* Physical Headlight Lamp Lenses (Glows under Bloom) */}
      <mesh position={[2.45, 0.45, 0.55]} raycast={() => null}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#e0f2fe" emissiveIntensity={6} />
      </mesh>
      <mesh position={[2.45, 0.45, -0.55]} raycast={() => null}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#e0f2fe" emissiveIntensity={6} />
      </mesh>

      {/* Downward Seafloor Scanners */}
      <spotLight position={[1, -0.7, 0]} angle={0.8} penumbra={0.5} intensity={5} distance={50} color="#aaddff" target-position={[1, -10, 0]} />

      {/* Emissive running lights on the side */}
      <mesh position={[0, 0, 0.72]} raycast={() => null}>
        <boxGeometry args={[1, 0.05, 0.05]} />
        <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={3} />
      </mesh>
      <mesh position={[0, 0, -0.72]} raycast={() => null}>
        <boxGeometry args={[1, 0.05, 0.05]} />
        <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={3} />
      </mesh>

      {/* Particle Thrusters overlay */}
      <Thrusters />
    </group>
  );
}
