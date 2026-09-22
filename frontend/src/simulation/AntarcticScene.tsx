import { Canvas } from '@react-three/fiber';
import { Grid } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulationStore } from './store/simulationStore';
import AUVModel from './auv/AUVModel';
import BubbleSystem from "./environment/BubbleSystem";
import CameraManager from './cameras/CameraManager';
import MissionDirector from './mission/MissionDirector';

function OceanEnvironment() {
  const depth = useSimulationStore((s) => s.depth);

  // Calculate fog density based on depth. Deeper = darker and thicker fog.
  // At surface (0m): very light blue fog.
  // At 142m: pitch black, dense fog.
  const fogColor = new THREE.Color('#0a4060').lerp(new THREE.Color('#000000'), Math.min(depth / 100, 1));
  const fogDensity = THREE.MathUtils.lerp(0.01, 0.08, Math.min(depth / 100, 1));

  return (
    <>
      <fogExp2 attach="fog" args={[0, 0]} color={fogColor} density={fogDensity} />
      <ambientLight intensity={Math.max(0.05, 1 - depth / 50)} color="#ffffff" />
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={Math.max(0, 1.5 - depth / 40)} 
        color="#aaddff" 
      />

      {/* Surface Water */}
      {depth < 10 && (
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1000, 1000]} />
          <meshStandardMaterial 
            color="#0a4060" 
            transparent 
            opacity={0.6} 
            roughness={0.1} 
            metalness={0.8}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Seafloor */}
      <mesh position={[0, -150, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial color="#050d14" roughness={0.9} />
        {/* We can project a caustics texture here later */}
      </mesh>
      <Grid 
        position={[0, -149.9, 0]} 
        args={[1000, 1000]} 
        cellSize={10} 
        cellThickness={1} 
        cellColor="#112233" 
        sectionSize={50} 
        sectionThickness={2} 
        sectionColor="#224466" 
        fadeDistance={200}
      />
    </>
  );
}

export default function AntarcticScene() {
  return (
    <div className="w-full h-full bg-[#000000]">
      <Canvas shadows>
        <OceanEnvironment />
        <BubbleSystem />
        <MissionDirector />
        <CameraManager />

        <group>
          <AUVModel />
        </group>
      </Canvas>
    </div>
  );
}
