import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStore } from '../store/simulationStore';
import { Cloud, Sparkles } from '@react-three/drei';

export default function SurfaceEnvironment() {
  const depth = useSimulationStore((s) => s.depth);
  const waterRef = useRef<THREE.Mesh>(null);

  // Wavy ocean geometry
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(1000, 1000, 64, 64);
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, []);

  useFrame(({ clock }) => {
    if (depth > 20 || !waterRef.current) return;
    const time = clock.getElapsedTime();
    const pos = waterRef.current.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      // Gentle ocean swells
      const wave = Math.sin(x * 0.05 + time) * 0.5 + Math.cos(z * 0.05 + time) * 0.5;
      pos.setY(i, wave);
    }
    waterRef.current.geometry.attributes.position.needsUpdate = true;
    waterRef.current.geometry.computeVertexNormals();
  });

  if (depth > 50) return null;

  return (
    <group>
      {/* Tactical Stormy Sky Dome */}
      <mesh position={[0, -10, 0]}>
        <sphereGeometry args={[900, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshBasicMaterial color="#0a1118" side={THREE.BackSide} />
      </mesh>

      {/* Atmospheric Fog over the water */}
      <Cloud position={[0, 5, -50]} speed={0.2} opacity={0.5} color="#c0d0e0" />
      <Cloud position={[50, 5, -50]} speed={0.2} opacity={0.5} color="#c0d0e0" />
      
      {/* Light snow/particles in the air */}
      <Sparkles count={500} scale={200} size={2} speed={0.4} opacity={0.5} color="#ffffff" position={[0, 20, 0]} />

      {/* Semi-transparent ocean surface */}
      <mesh ref={waterRef} position={[0, 0, 0]} geometry={geometry} receiveShadow>
        <meshPhysicalMaterial 
          color="#001a22" 
          roughness={0.1}
          metalness={0.5}
          transmission={0.8}
          opacity={0.8}
          transparent={true}
          flatShading={true}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
