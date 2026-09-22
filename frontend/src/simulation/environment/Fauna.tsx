import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function KrillSwarm() {
  const numKrill = 200;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Randomize initial positions and speeds around the swarm center
  const offsets = useMemo(() => {
    return Array.from({ length: numKrill }, () => ({
      x: (Math.random() - 0.5) * 5,
      y: (Math.random() - 0.5) * 5,
      z: (Math.random() - 0.5) * 5,
      speed: Math.random() * 0.5 + 0.5,
    }));
  }, [numKrill]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const time = clock.getElapsedTime();
    
    // The entire swarm moves in a sine wave path
    const cx = Math.sin(time * 0.2) * 20;
    const cy = -70 + Math.sin(time * 0.1) * 10;
    const cz = Math.cos(time * 0.2) * 20;

    for (let i = 0; i < numKrill; i++) {
      const off = offsets[i];
      const px = cx + off.x + Math.sin(time * off.speed + i) * 1;
      const py = cy + off.y + Math.cos(time * off.speed + i) * 1;
      const pz = cz + off.z + Math.sin(time * off.speed + i * 2) * 1;
      
      dummy.position.set(px, py, pz);
      // Roughly look in direction of movement
      dummy.rotation.set(0, time * 0.5 + i, 0);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, numKrill]}>
      <boxGeometry args={[0.05, 0.02, 0.02]} />
      <meshStandardMaterial color="#ff7f50" transparent opacity={0.6} />
    </instancedMesh>
  );
}

function Jellyfish({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime() * 2 + position[0]; // Offset timing by position
    
    // Slow bobbing
    groupRef.current.position.y = position[1] + Math.sin(t * 0.5) * 2;
    
    // Pulse animation (shrink/expand)
    const scale = 1 + Math.sin(t) * 0.15;
    groupRef.current.scale.set(scale, scale * 0.8 + Math.cos(t) * 0.2, scale);
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Dome */}
      <mesh>
        <sphereGeometry args={[0.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial 
          color="#aaccff" 
          transparent opacity={0.4} 
          emissive="#224488" 
          emissiveIntensity={0.1} 
        />
      </mesh>
      {/* Tentacles */}
      {Array.from({ length: 4 }).map((_, i) => (
        <mesh key={i} position={[Math.cos(i * Math.PI / 2) * 0.3, -0.5, Math.sin(i * Math.PI / 2) * 0.3]}>
          <cylinderGeometry args={[0.02, 0.01, 1.5, 8]} />
          <meshStandardMaterial color="#aaccff" transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function KelpStrand({ position }: { position: [number, number, number] }) {
  const numSegments = 6;
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    refs.current.forEach((mesh, i) => {
      if (mesh) {
        // Sway animation with sine waves
        mesh.rotation.z = Math.sin(t + position[0] + i * 0.2) * 0.1;
        mesh.rotation.x = Math.sin(t * 0.8 + position[2] + i * 0.3) * 0.1;
      }
    });
  });

  return (
    <group position={position}>
      {Array.from({ length: numSegments }).map((_, i) => (
        <mesh
          key={i}
          ref={el => refs.current[i] = el}
          position={[0, i * 1, 0]} // Stacked on top of each other
        >
          <boxGeometry args={[0.2, 1.2, 0.05]} />
          <meshStandardMaterial color="#3a4f2b" transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

export default function Fauna() {
  const kelpPositions = useMemo(() => {
    return Array.from({ length: 15 }, () => [
      (Math.random() - 0.5) * 100,
      -150 + Math.random() * 2,
      (Math.random() - 0.5) * 100
    ] as [number, number, number]);
  }, []);

  return (
    <group>
      <KrillSwarm />
      
      <Jellyfish position={[10, -30, 20]} />
      <Jellyfish position={[-20, -50, -10]} />
      <Jellyfish position={[5, -80, -30]} />
      <Jellyfish position={[-15, -110, 15]} />
      
      {kelpPositions.map((pos, i) => (
        <KelpStrand key={i} position={pos} />
      ))}
    </group>
  );
}
