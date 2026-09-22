import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStore } from '../store/simulationStore';

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
}

export default function Thrusters() {
  const thrusters = useSimulationStore((s) => s.thrusters);
  const setSelectedComponent = useSimulationStore(s => s.setSelectedComponent);
  const maxParticlesPerThruster = 20;
  const totalMaxParticles = thrusters.length * maxParticlesPerThruster;
  
  const propellersRef = useRef<THREE.Group[]>([]);
  const particlesRef = useRef<THREE.InstancedMesh>(null);
  
  const particles = useRef<Particle[]>([]);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, delta) => {
    // Update propellers
    thrusters.forEach((t, i) => {
      const prop = propellersRef.current[i];
      if (prop && t.online) {
        prop.rotation.z += (t.rpm / 3800) * 0.5;
        
        // Add particles if spinning
        if (Math.abs(t.rpm) > 100 && particles.current.length < totalMaxParticles) {
          if (Math.random() > 0.5) { // Spawn rate limit
            const dir = new THREE.Vector3(...[1, 0, 0]).normalize();
            const sign = t.rpm > 0 ? -1 : 1; // Exhaus[1, 0, 0]
            const pos = new THREE.Vector3(...[0, 0, 0]).addScaledVector(dir, sign * 0.05);
            
            particles.current.push({
              position: pos,
              velocity: dir.multiplyScalar(sign * 0.5).add(new THREE.Vector3((Math.random()-0.5)*0.1, (Math.random()-0.5)*0.1, (Math.random()-0.5)*0.1)),
              life: 1.0
            });
          }
        }
      }
    });

    // Update particles
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
      
      for (let j = i; j < totalMaxParticles; j++) {
        dummy.position.set(999, 999, 999);
        dummy.updateMatrix();
        particlesRef.current.setMatrixAt(j, dummy.matrix);
      }
      particlesRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {thrusters.map((t, i) => {
        // Calculate orientation to face the direction vector
        const dir = new THREE.Vector3(...[1, 0, 0]).normalize();
        const defaultDir = new THREE.Vector3(0, 0, 1);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(defaultDir, dir);
        const euler = new THREE.Euler().setFromQuaternion(quaternion);

        return (
          <group key={t.id} position={[0, 0, 0]} rotation={euler}>
            {/* Housing */}
            <mesh 
              name="thrusters_unit"
              rotation={[Math.PI / 2, 0, 0]}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedComponent('thrusters_unit');
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                document.body.style.cursor = 'auto';
              }}
            >
              <cylinderGeometry args={[0.04, 0.04, 0.08, 16]} />
              <meshStandardMaterial color={t.online ? "#333333" : "#552222"} roughness={0.7} metalness={0.5} />
            </mesh>
            
            {/* Propeller */}
            <group ref={(el) => { if (el) propellersRef.current[i] = el; }}>
              {[0, 1, 2].map((blade) => (
                <mesh key={blade} rotation={[0, 0, (blade * Math.PI * 2) / 3]}>
                  <boxGeometry args={[0.01, 0.06, 0.01]} />
                  <meshStandardMaterial color="#111111" />
                </mesh>
              ))}
            </group>
          </group>
        );
      })}

      <instancedMesh ref={particlesRef} args={[undefined, undefined, totalMaxParticles]}>
        <sphereGeometry args={[0.005, 8, 8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.4} />
      </instancedMesh>
    </group>
  );
}
