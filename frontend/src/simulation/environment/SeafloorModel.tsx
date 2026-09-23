import { useMemo } from 'react';
import * as THREE from 'three';

export function SeafloorModel() {
  const geo = useMemo(() => new THREE.PlaneGeometry(1000, 1000), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: '#001a33', 
    roughness: 0.9, 
    metalness: 0.1 
  }), []);

  return (
    <group position={[0, -150, 0]}>
      {/* Sleek, flat digital floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} geometry={geo} material={mat} receiveShadow />
      
      {/* High-tech neon grid matching the digital twin aesthetic */}
      <gridHelper 
        position={[0, 0.1, 0]} 
        args={[1000, 100, '#00f0ff', '#004a80']} 
      />
    </group>
  );
}

export default SeafloorModel;
