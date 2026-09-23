import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStore } from '../store/simulationStore';
import { Html } from '@react-three/drei';

export default function SonarSweep() {
  const missionPhase = useSimulationStore(s => s.missionPhase);
  const auvPosition = useSimulationStore(s => s.auvPosition);
  const auvRotation = useSimulationStore(s => s.auvRotation);
  
  const coneRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (coneRef.current) {
      // Attach to AUV
      coneRef.current.position.set(auvPosition[0], auvPosition[1], auvPosition[2]);
      coneRef.current.rotation.set(auvRotation[0], auvRotation[1], auvRotation[2]);
      
      // Sweep effect
      const scale = 1 + Math.sin(clock.elapsedTime * 4) * 0.1;
      coneRef.current.scale.set(scale, scale, scale);
    }
  });

  // Only render during sonar phase
  if (missionPhase !== 'STAGE_5_SONAR') return null;

  return (
    <group>
      {/* The Scanning Cone attached to the AUV */}
      <group ref={coneRef}>
        <mesh position={[10, -5, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[15, 30, 32, 1, true]} />
          <meshBasicMaterial 
            color="#00e5ff" 
            transparent 
            opacity={0.15} 
            blending={THREE.AdditiveBlending} 
            side={THREE.DoubleSide} 
            depthWrite={false}
          />
        </mesh>
        
        {/* Scanning grid circles inside the cone */}
        {[0.3, 0.6, 0.9].map((s, i) => (
          <mesh key={i} position={[30 * s, -5 * s, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <torusGeometry args={[15 * s, 0.1, 16, 64]} />
            <meshBasicMaterial color="#00e5ff" transparent opacity={0.4} blending={THREE.AdditiveBlending} />
          </mesh>
        ))}
      </group>

      {/* Target Lock Marker (RT-DETR Acoustic Sonar Target Fix) */}
      <group position={[30, -145.5, 10]}>
        <mesh>
          <boxGeometry args={[3, 3, 3]} />
          <meshBasicMaterial color="#ff0000" wireframe transparent opacity={0.5} />
        </mesh>
        <Html position={[0, 3, 0]} center>
          <div className="bg-red-950/80 border border-red-500 p-2 rounded text-red-400 font-mono text-[10px] whitespace-nowrap">
            <div className="font-bold text-red-300">TARGET LOCKED</div>
            <div>CLASS: METALLIC_DEBRIS</div>
            <div>CONF: 94.2%</div>
          </div>
        </Html>
      </group>
    </group>
  );
}
