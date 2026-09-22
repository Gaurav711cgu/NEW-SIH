import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStore } from '../store/simulationStore';
import { Html } from '@react-three/drei';

function InteractiveIceberg({ ice }: { ice: any }) {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  // Gentle individual bobbing
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y = ice.y + Math.sin(clock.elapsedTime * 0.5 + ice.x) * 0.5;
    }
  });

  return (
    <mesh 
      ref={meshRef}
      position={[ice.x, ice.y, ice.z]} 
      rotation={[0, ice.rotY, 0]} 
      castShadow 
      receiveShadow
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
      onClick={(e) => { e.stopPropagation(); setClicked(!clicked); }}
    >
      <dodecahedronGeometry args={[1, 0]} />
      <meshPhysicalMaterial 
        color={hovered ? "#ffffff" : "#e0f2fe"} 
        emissive="#002244"
        emissiveIntensity={hovered ? 0.5 : 0.2}
        transmission={0.8} 
        opacity={0.95} 
        transparent 
        roughness={0.2} 
        metalness={0.1}
        thickness={10} 
        ior={1.31} 
      />
      
      {/* Tactical Data Overlay when clicked */}
      {clicked && (
        <Html position={[0, ice.scale[1] * 0.8, 0]} center zIndexRange={[100, 0]}>
          <div className="bg-cyan-950/80 border border-cyan-400 p-2 rounded text-[10px] font-mono whitespace-nowrap pointer-events-none text-cyan-100 backdrop-blur-md shadow-[0_0_15px_rgba(0,229,255,0.2)]">
            <div className="font-bold text-cyan-300 mb-1 border-b border-cyan-500/50 pb-1 flex items-center justify-between gap-4">
              <span>ICE MASS FRAGMENT</span>
              <span className="text-[8px] px-1 bg-cyan-900 rounded">SCAN OK</span>
            </div>
            <div className="flex justify-between gap-4 mt-1">
              <span className="text-steel-400">EST. VOLUME</span>
              <span>{(ice.originalScale[0] * ice.originalScale[1] * ice.originalScale[2]).toFixed(0)} m³</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-steel-400">DRAFT DEPTH</span>
              <span>{(ice.originalScale[1] * 0.9).toFixed(1)} m</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-steel-400">STRUCTURAL RISK</span>
              <span className="text-emerald-400">LOW</span>
            </div>
          </div>
        </Html>
      )}
    </mesh>
  );
}

export default function IceShelf() {
  const depth = useSimulationStore(s => s.depth);
  const groupRef = useRef<THREE.Group>(null);

  const icebergs = useMemo(() => {
    return [...Array(25)].map((_) => {
      const x = (Math.random() - 0.5) * 400;
      const z = (Math.random() - 0.5) * 400;
      
      const scaleX = 10 + Math.random() * 30;
      const scaleY = 15 + Math.random() * 40;
      const scaleZ = 10 + Math.random() * 30;
      
      const rotY = Math.random() * Math.PI * 2;
      const yOffset = -scaleY * 0.4; 

      return { x, y: yOffset, z, scale: [scaleX, scaleY, scaleZ] as [number, number, number], rotY };
    });
  }, []);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Very slow global drift
      groupRef.current.position.x = Math.sin(clock.elapsedTime * 0.05) * 10;
      groupRef.current.position.z = Math.cos(clock.elapsedTime * 0.05) * 10;
    }
  });

  if (depth > 120) return null;

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {icebergs.map((ice, i) => (
        <group key={i} scale={ice.scale}>
          <InteractiveIceberg ice={{...ice, scale: [1,1,1], originalScale: ice.scale}} />
        </group>
      ))}
    </group>
  );
}
