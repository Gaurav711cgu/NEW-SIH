import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStore } from '../store/simulationStore';

export default function SurfaceEnvironment() {
  const depth = useSimulationStore((s) => s.depth);
  const meshRef = useRef<THREE.Mesh>(null);
  const skyRef = useRef<THREE.Mesh>(null);

  // Generate a noisy geometry for the ocean waves
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(2000, 2000, 128, 128);
    geo.rotateX(-Math.PI / 2);
    // Add some initial variance to the vertices
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      // Very slight random offset to prevent perfect grid
      pos.setY(i, (Math.random() - 0.5) * 0.5);
    }
    return geo;
  }, []);

  useFrame(({ clock }) => {
    // Only animate if near the surface (optimization)
    if (depth > 20) return;
    
    const time = clock.getElapsedTime();
    if (meshRef.current) {
      const pos = meshRef.current.geometry.attributes.position;
      // Animate the vertices to look like rolling ocean waves
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        
        // Complex wave function using multiple sine waves
        const wave1 = Math.sin(x * 0.05 + time) * 1.5;
        const wave2 = Math.cos(z * 0.03 - time * 0.8) * 1.0;
        const wave3 = Math.sin((x + z) * 0.02 + time * 1.2) * 0.5;
        
        pos.setY(i, wave1 + wave2 + wave3);
      }
      meshRef.current.geometry.attributes.position.needsUpdate = true;
      meshRef.current.geometry.computeVertexNormals();
    }
  });

  if (depth > 50) return null; // Unmount entirely when deep

  return (
    <group>
      {/* 1. Animated Ocean Surface */}
      <mesh ref={meshRef} position={[0, 0, 0]} geometry={geometry} receiveShadow castShadow>
        <meshPhysicalMaterial 
          color="#001a33" 
          emissive="#000a14"
          roughness={0.1}
          metalness={0.8}
          transmission={0.9} 
          thickness={5}
          ior={1.33}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* 2. Stormy Antarctic Sky Dome (Only visible from above/near surface) */}
      <mesh ref={skyRef} position={[0, -10, 0]}>
        <sphereGeometry args={[900, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshBasicMaterial color="#1a2530" side={THREE.BackSide} fog={false} />
      </mesh>
    </group>
  );
}
