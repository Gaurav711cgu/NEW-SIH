import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStore } from '../store/simulationStore';

export default function BubbleSystem() {
  const phase = useSimulationStore((s) => s.missionPhase);
  
  const count = 500;
  const mesh = useRef<THREE.InstancedMesh>(null);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      const xFactor = -5 + Math.random() * 10;
      const yFactor = -5 + Math.random() * 10;
      const zFactor = -5 + Math.random() * 10;
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
    }
    return temp;
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(() => {
    if (!mesh.current) return;
    
    // Only animate vigorously if descending or moving fast
    const auvPos = useSimulationStore.getState().auvPosition;
    
    particles.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
      t = particle.t += speed / 2;
      const s = Math.cos(t);
      
      // Bubbles spawn near AUV and rise up
      let x = auvPos[0] + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10;
      let y = auvPos[1] + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10;
      let z = auvPos[2] + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10;
      
      // Bubbles rise
      y += (t * 5) % 20;

      dummy.position.set(x, y, z);
      dummy.scale.set(s, s, s);
      dummy.rotation.set(s * 5, s * 5, s * 5);
      dummy.updateMatrix();
      
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  if (phase === 'IDLE' || phase === 'STAGE_0_SURFACE') return null;

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.4} />
    </instancedMesh>
  );
}
