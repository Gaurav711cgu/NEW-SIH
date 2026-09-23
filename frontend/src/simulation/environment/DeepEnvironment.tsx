import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStore } from '../store/simulationStore';
import { Sparkles } from '@react-three/drei';


function BioluminescentJelly() {
  const meshRef = useRef<THREE.Group>(null);
  const offset = useMemo(() => Math.random() * 100, []);
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const time = clock.getElapsedTime();
      meshRef.current.position.y += Math.sin(time + offset) * 0.02;
      meshRef.current.position.x += Math.sin(time * 0.5 + offset) * 0.01;
      
      // Pulse the scale
      const pulse = 1 + Math.sin(time * 2 + offset) * 0.1;
      meshRef.current.scale.set(pulse, 1, pulse);
    }
  });

  return (
    <group ref={meshRef}>
      {/* Jelly Cap */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial 
          color="#ff00ff" 
          emissive="#ff00ff" 
          emissiveIntensity={0.8} 
          transparent 
          opacity={0.6}
          transmission={0.9}
        />
      </mesh>
      {/* Glowing tendrils */}
      <Sparkles position={[0, -2, 0]} count={15} scale={[1.5, 4, 1.5]} size={2} color="#00ffff" speed={0.5} />
    </group>
  );
}

export default function DeepEnvironment() {
  const depth = useSimulationStore((s) => s.depth);

  // Only render deep sea elements if we are actually deep
  if (depth < 80) return null;

  // Fade in based on depth
  const visibility = Math.min(1, (depth - 80) / 40);

  return (
    <group>
      {/* Ambient Bioluminescence */}
      <Sparkles count={500} scale={[200, 100, 200]} position={[0, -100, 0]} size={1.5} color="#00ffff" opacity={visibility * 0.3} speed={0.1} />
      <Sparkles count={500} scale={[200, 100, 200]} position={[0, -100, 0]} size={1.5} color="#ff00ff" opacity={visibility * 0.2} speed={0.1} />

      {/* Bioluminescent Jellyfish Swarm */}
      <group position={[20, -90, -30]}>
        {[...Array(5)].map((_, i) => (
          <group key={i} position={[(Math.random()-0.5)*15, (Math.random()-0.5)*15, (Math.random()-0.5)*15]}>
            <BioluminescentJelly />
          </group>
        ))}
      </group>
      <group position={[-25, -110, 10]}>
        {[...Array(3)].map((_, i) => (
          <group key={i} position={[(Math.random()-0.5)*10, (Math.random()-0.5)*10, (Math.random()-0.5)*10]}>
            <BioluminescentJelly />
          </group>
        ))}
      </group>
    </group>
  );
}
