import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStore } from '../store/simulationStore';

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
}

export default function BallastSystem() {
  const ballastLevel = useSimulationStore((s) => s.ballastLevel);
  const setSelectedComponent = useSimulationStore(s => s.setSelectedComponent);
  
  const waterRefLeft = useRef<THREE.Mesh>(null);
  const waterRefRight = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.InstancedMesh>(null);
  
  // Max height of the tank
  const tankHeight = 0.4;
  const currentLevelRef = useRef(ballastLevel);

  const maxParticles = 50;
  const particles = useRef<Particle[]>([]);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, delta) => {
    // Lerp water level
    currentLevelRef.current = THREE.MathUtils.lerp(currentLevelRef.current, ballastLevel, delta * 2);
    
    const scaleY = Math.max(0.01, currentLevelRef.current);
    const posY = -tankHeight / 2 + (tankHeight * scaleY) / 2;
    
    if (waterRefLeft.current) {
      waterRefLeft.current.scale.y = scaleY;
      waterRefLeft.current.position.y = posY;
    }
    if (waterRefRight.current) {
      waterRefRight.current.scale.y = scaleY;
      waterRefRight.current.position.y = posY;
    }

    // Bubbles logic if ballast is changing
    const isChanging = Math.abs(currentLevelRef.current - ballastLevel) > 0.01;
    
    if (isChanging && particles.current.length < maxParticles) {
      // Add bubble
      const isLeft = Math.random() > 0.5;
      const x = isLeft ? -0.2 : 0.2;
      particles.current.push({
        position: new THREE.Vector3(x + (Math.random() - 0.5) * 0.05, posY, 0 + (Math.random() - 0.5) * 0.05),
        velocity: new THREE.Vector3((Math.random() - 0.5) * 0.1, Math.random() * 0.5 + 0.2, (Math.random() - 0.5) * 0.1),
        life: 1.0
      });
    }

    if (particlesRef.current) {
      let i = 0;
      while (i < particles.current.length) {
        const p = particles.current[i];
        p.life -= delta;
        
        if (p.life <= 0) {
          particles.current.splice(i, 1);
        } else {
          p.position.addScaledVector(p.velocity, delta);
          const scale = p.life;
          dummy.position.copy(p.position);
          dummy.scale.set(scale, scale, scale);
          dummy.updateMatrix();
          particlesRef.current.setMatrixAt(i, dummy.matrix);
          i++;
        }
      }
      
      // Clear remaining matrices
      for (let j = i; j < maxParticles; j++) {
        dummy.position.set(999, 999, 999);
        dummy.updateMatrix();
        particlesRef.current.setMatrixAt(j, dummy.matrix);
      }
      
      particlesRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    document.body.style.cursor = 'pointer';
  };
  const handlePointerOut = (e: any) => {
    e.stopPropagation();
    document.body.style.cursor = 'auto';
  };
  const handleClick = (e: any) => {
    e.stopPropagation();
    setSelectedComponent('ballast');
  };

  return (
    <group>
      {/* Left Tank */}
      <group position={[-0.2, 0, 0]}>
        <mesh name="ballast" onClick={handleClick} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
          <cylinderGeometry args={[0.04, 0.04, tankHeight, 16]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.2} roughness={0.1} metalness={0.8} />
        </mesh>
        <mesh ref={waterRefLeft} position={[0, -tankHeight/2, 0]}>
          <cylinderGeometry args={[0.038, 0.038, tankHeight, 16]} />
          <meshStandardMaterial color="#0055ff" transparent opacity={0.7} />
        </mesh>
      </group>

      {/* Right Tank */}
      <group position={[0.2, 0, 0]}>
        <mesh name="ballast" onClick={handleClick} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
          <cylinderGeometry args={[0.04, 0.04, tankHeight, 16]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.2} roughness={0.1} metalness={0.8} />
        </mesh>
        <mesh ref={waterRefRight} position={[0, -tankHeight/2, 0]}>
          <cylinderGeometry args={[0.038, 0.038, tankHeight, 16]} />
          <meshStandardMaterial color="#0055ff" transparent opacity={0.7} />
        </mesh>
      </group>

      {/* Bubbles */}
      <instancedMesh ref={particlesRef} args={[undefined, undefined, maxParticles]}>
        <sphereGeometry args={[0.01, 8, 8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
      </instancedMesh>
    </group>
  );
}
