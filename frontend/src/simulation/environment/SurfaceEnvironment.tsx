import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStore } from '../store/simulationStore';
import { Environment, Sky, Cloud, Sparkles } from '@react-three/drei';

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
      {/* AAA Lighting and Environment Map for reflections */}
      <Environment preset="city" />
      
      {/* Moody Antarctic Sky */}
      <Sky 
        distance={3000} 
        turbidity={1.5} 
        rayleigh={2} 
        mieCoefficient={0.05} 
        mieDirectionalG={0.8} 
        sunPosition={[0, 2, -10]} 
        inclination={0.49} 
        azimuth={0.25} 
      />

      {/* Atmospheric Fog over the water */}
      <Cloud position={[0, 5, -50]} speed={0.2} opacity={0.5} color="#c0d0e0" />
      <Cloud position={[50, 5, -50]} speed={0.2} opacity={0.5} color="#c0d0e0" />
      
      {/* Light snow/particles in the air */}
      <Sparkles count={500} scale={200} size={2} speed={0.4} opacity={0.5} color="#ffffff" position={[0, 20, 0]} />

      {/* Opaque, reflective ocean surface */}
      <mesh ref={waterRef} position={[0, -0.5, 0]} geometry={geometry} receiveShadow>
        <meshStandardMaterial 
          color="#002233" 
          roughness={0.1}
          metalness={0.9}
          flatShading={true}
        />
      </mesh>
    </group>
  );
}
