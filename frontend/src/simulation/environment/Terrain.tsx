import { useMemo, useRef } from 'react';
import * as THREE from 'three';

// Simple 2D value noise inline implementation
const random = (x: number, y: number) => {
  return (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453123) % 1;
};

const noise = (x: number, y: number) => {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;

  const a = random(ix, iy);
  const b = random(ix + 1, iy);
  const c = random(ix, iy + 1);
  const d = random(ix + 1, iy + 1);

  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);

  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
};

const fbm = (x: number, y: number, octaves = 4) => {
  let v = 0;
  let a = 0.5;
  const shift = 100.0;
  for (let i = 0; i < octaves; i++) {
    v += a * noise(x, y);
    x = x * 2.0 + shift;
    y = y * 2.0 + shift;
    a *= 0.5;
  }
  return v;
};

export default function Terrain() {
  const size = 300;
  const segments = 256;
  const depth = -150;
  
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    const pos = geo.attributes.position;
    
    // Deform vertices using our inline noise function
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i); // Note: plane lies on XY initially before rotation
      
      // mostly flat with gentle ridges
      const z = fbm(x * 0.05, y * 0.05) * 10 + fbm(x * 0.2, y * 0.2) * 2;
      pos.setZ(i, z);
    }
    geo.computeVertexNormals();
    return geo;
  }, [size, segments]);

  const numRocks = 80;
  const rockMeshRef = useRef<THREE.InstancedMesh>(null);
  
  useMemo(() => {
    if (!rockMeshRef.current) return;
    const dummy = new THREE.Object3D();
    
    for (let i = 0; i < numRocks; i++) {
      const x = (Math.random() - 0.5) * size;
      const z = (Math.random() - 0.5) * size;
      
      // Match terrain height at this point roughly
      const y = fbm(x * 0.05, z * 0.05) * 10 + fbm(x * 0.2, z * 0.2) * 2 - 0.5;
      
      dummy.position.set(x, y, z);
      dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      
      const s = 0.5 + Math.random() * 2;
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      rockMeshRef.current.setMatrixAt(i, dummy.matrix);
    }
    rockMeshRef.current.instanceMatrix.needsUpdate = true;
  }, [numRocks, size]);

  return (
    <group position={[0, depth, 0]}>
      {/* Seabed Terrain */}
      <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#1a1a2e" roughness={0.9} metalness={0.1} />
      </mesh>
      
      {/* Scattered Rocks */}
      <instancedMesh ref={rockMeshRef} args={[undefined, undefined, numRocks]}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#2a2a3e" roughness={0.8} />
      </instancedMesh>
    </group>
  );
}
