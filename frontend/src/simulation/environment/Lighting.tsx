import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { SpotLight, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulationStore } from '../store/simulationStore';

export default function Lighting() {
  const headlightRef = useRef<THREE.SpotLight>(null);
  const auvPosition = useSimulationStore(state => state.auvPosition);
  const auvRotation = useSimulationStore((state) => state.auvRotation);

  const euler = new THREE.Euler();
  const forward = new THREE.Vector3();

  useFrame(() => {
    if (headlightRef.current) {
      // Attach the light to the AUV position
      headlightRef.current.position.set(
        auvPosition[0],
        auvPosition[1],
        auvPosition[2]
      );
      
      // Point the light forward based on AUV rotation
      euler.set(auvRotation[0], auvRotation[1], auvRotation[2], 'YXZ');
      forward.set(0, 0, -1).applyEuler(euler);
      headlightRef.current.target.position.set(
        auvPosition[0] + forward.x,
        auvPosition[1] + forward.y,
        auvPosition[2] + forward.z
      );
      headlightRef.current.target.updateMatrixWorld();
    }
  });

  return (
    <group>
      {/* Dim ambient light for the deep ocean */}
      <ambientLight intensity={0.02} color="#0a2a4a" />
      
      {/* Directional light simulating filtered sunlight through ice */}
      <directionalLight position={[10, 100, 10]} intensity={0.8} color="#4a9ead" castShadow />
      
      {/* Volumetric AUV Headlights */}
      <SpotLight
        ref={headlightRef}
        color="#cceeff"
        intensity={20}
        distance={40}
        angle={0.6}
        penumbra={0.5}
        attenuation={4}
        anglePower={5}
        volumetric
        castShadow
      />
      
      {/* Environment for realistic metallic reflections */}
      <Environment preset="night" environmentIntensity={0.2} />
    </group>
  );
}
