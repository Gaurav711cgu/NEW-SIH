import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

const vertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  uniform float uTime;
  
  float random (in vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }
  
  float noise (in vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }
  
  void main() {
    // Combine noises to create icy cracks and thickness variations
    float n1 = noise(vPosition.xy * 0.1 + uTime * 0.05);
    float n2 = noise(vPosition.xy * 0.5 - uTime * 0.02);
    float pattern = n1 * 0.7 + n2 * 0.3;
    
    vec3 iceColor = vec3(0.6, 0.85, 0.9);
    vec3 deepColor = vec3(0.1, 0.4, 0.6);
    
    vec3 finalColor = mix(deepColor, iceColor, pattern);
    
    // Opacity varies slightly for translucent effect
    float alpha = mix(0.7, 0.95, pattern);
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

export default function IceShelf() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 }
  }), []);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  const numIcicles = 15;
  const icicleMeshRef = useRef<THREE.InstancedMesh>(null);
  
  useMemo(() => {
    if (!icicleMeshRef.current) return;
    const dummy = new THREE.Object3D();
    
    for (let i = 0; i < numIcicles; i++) {
      const x = (Math.random() - 0.5) * 200;
      const z = (Math.random() - 0.5) * 200;
      const y = - (Math.random() * 2 + 1); // Hanging downwards slightly
      
      dummy.position.set(x, y, z);
      dummy.rotation.set(Math.PI, 0, 0); // Point down
      
      const sx = 0.5 + Math.random();
      const sy = 2 + Math.random() * 4; // Long random lengths
      const sz = 0.5 + Math.random();
      
      dummy.scale.set(sx, sy, sz);
      dummy.updateMatrix();
      icicleMeshRef.current.setMatrixAt(i, dummy.matrix);
    }
    icicleMeshRef.current.instanceMatrix.needsUpdate = true;
  }, [numIcicles]);

  return (
    <group position={[0, 5, 0]}>
      {/* The main ice shelf plane */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[300, 300, 64, 64]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent={true}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Hanging Icicle Formations */}
      <instancedMesh ref={icicleMeshRef} args={[undefined, undefined, numIcicles]}>
        <coneGeometry args={[1, 1, 8]} />
        <meshStandardMaterial color="#99d6ff" transparent opacity={0.6} roughness={0.1} />
      </instancedMesh>
    </group>
  );
}
