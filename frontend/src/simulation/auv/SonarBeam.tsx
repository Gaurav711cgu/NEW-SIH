import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStore } from '../store/simulationStore';

export default function SonarBeam() {
  const portRef = useRef<THREE.Group>(null);
  const stbdRef = useRef<THREE.Group>(null);
  const portMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const stbdMatRef = useRef<THREE.MeshBasicMaterial>(null);
  
  const phase = useSimulationStore((s) => s.missionPhase);
  const depth = useSimulationStore((s) => s.depth);
  const isSonarActive = phase === 'STAGE_5_SONAR' || phase === 'STAGE_6_ANOMALY' || depth > 80;

  useFrame(({ clock }) => {
    if (!isSonarActive) return;

    const auvPosition = useSimulationStore.getState().auvPosition;
    const auvRotation = useSimulationStore.getState().auvRotation;
    const time = clock.getElapsedTime();
    
    // Animate pulse expanding from 0 to 50 over 1.5 seconds
    const duration = 1.5;
    const progress = (time % duration) / duration;
    const currentScale = progress * 50;
    // Fade out as it expands
    const currentOpacity = (1 - progress) * 0.4;
    
    if (portRef.current && portMatRef.current) {
      portRef.current.position.set(auvPosition[0], auvPosition[1], auvPosition[2]);
      portRef.current.rotation.set(
        auvRotation[0], 
        auvRotation[1] + Math.PI / 2, // Face left (-Z)
        auvRotation[2]
      );
      portRef.current.scale.set(currentScale, currentScale, currentScale);
      portMatRef.current.opacity = currentOpacity;
    }
    
    if (stbdRef.current && stbdMatRef.current) {
      stbdRef.current.position.set(auvPosition[0], auvPosition[1], auvPosition[2]);
      stbdRef.current.rotation.set(
        auvRotation[0], 
        auvRotation[1] - Math.PI / 2, // Face right (+Z)
        auvRotation[2]
      );
      stbdRef.current.scale.set(currentScale, currentScale, currentScale);
      stbdMatRef.current.opacity = currentOpacity;
    }
  });

  if (!isSonarActive) return null;

  return (
    <group>
      {/* Port (Left) Traveling Sonar Pulse */}
      <group ref={portRef}>
        <mesh>
          <ringGeometry args={[0.95, 1.0, 32, 1, 0, Math.PI]} />
          <meshBasicMaterial 
            ref={portMatRef}
            color="#00ffcc" 
            transparent={true} 
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>
      
      {/* Starboard (Right) Traveling Sonar Pulse */}
      <group ref={stbdRef}>
        <mesh>
          <ringGeometry args={[0.95, 1.0, 32, 1, 0, Math.PI]} />
          <meshBasicMaterial 
            ref={stbdMatRef}
            color="#00ffcc" 
            transparent={true} 
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>
    </group>
  );
}
