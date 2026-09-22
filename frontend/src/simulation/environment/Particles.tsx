import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Particles() {
  const planktonCount = 3000;
  const sedimentCount = 1000;
  const bubbleCount = 500;

  const planktonRef = useRef<THREE.Points>(null);
  const sedimentRef = useRef<THREE.Points>(null);
  const bubbleRef = useRef<THREE.Points>(null);

  const planktonGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(planktonCount * 3);
    for (let i = 0; i < planktonCount * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 100;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return geo;
  }, [planktonCount]);

  const sedimentGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(sedimentCount * 3);
    for (let i = 0; i < sedimentCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 150;
      pos[i * 3 + 1] = -130 - Math.random() * 20; // Restricted near the seabed
      pos[i * 3 + 2] = (Math.random() - 0.5) * 150;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return geo;
  }, [sedimentCount]);

  const bubbleGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(bubbleCount * 3);
    for (let i = 0; i < bubbleCount * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 100;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return geo;
  }, [bubbleCount]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (planktonRef.current) {
      const positions = planktonRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < planktonCount; i++) {
        positions[i * 3] += Math.sin(time * 0.5 + i) * 0.01;
        positions[i * 3 + 1] += Math.cos(time * 0.3 + i) * 0.01;
        positions[i * 3 + 2] += Math.sin(time * 0.4 + i) * 0.01;
      }
      planktonRef.current.geometry.attributes.position.needsUpdate = true;
    }

    if (sedimentRef.current) {
      const positions = sedimentRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < sedimentCount; i++) {
        positions[i * 3] += 0.02; // Mostly horizontal drift
        if (positions[i * 3] > 75) positions[i * 3] = -75;
      }
      sedimentRef.current.geometry.attributes.position.needsUpdate = true;
    }

    if (bubbleRef.current) {
      const positions = bubbleRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < bubbleCount; i++) {
        positions[i * 3 + 1] += 0.1 + Math.random() * 0.05; // Rise upwards
        positions[i * 3] += Math.sin(time * 2 + i) * 0.02; // Slight wobble
        
        if (positions[i * 3 + 1] > 5) {
          positions[i * 3 + 1] = -150; // Reset bubbles back to bottom when reaching surface
        }
      }
      bubbleRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      <points ref={planktonRef} geometry={planktonGeo}>
        <pointsMaterial color="#aaddff" size={0.03} transparent opacity={0.3} sizeAttenuation />
      </points>
      <points ref={sedimentRef} geometry={sedimentGeo}>
        <pointsMaterial color="#8b7355" size={0.05} transparent opacity={0.5} sizeAttenuation />
      </points>
      <points ref={bubbleRef} geometry={bubbleGeo}>
        <pointsMaterial color="#ffffff" size={0.04} transparent opacity={0.2} sizeAttenuation />
      </points>
    </group>
  );
}
