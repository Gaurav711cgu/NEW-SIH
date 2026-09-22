import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Grid, Sparkles, SoftShadows } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulationStore } from './store/simulationStore';
import AUVModel from './auv/AUVModel';
import BubbleSystem from "./environment/BubbleSystem";
import IceShelf from "./environment/IceShelf";
import SurfaceEnvironment from "./environment/SurfaceEnvironment";
import DebrisField from "./environment/DebrisField";
import SonarSweep from "./environment/SonarSweep";
import CameraManager from './cameras/CameraManager';
import MissionDirector from './mission/MissionDirector';
import { useRef } from 'react';

// Highly realistic marine snow (particulates)
function MarineSnow() {
  const currentAssist = useSimulationStore(s => s.currentAssist);
  
  // When currentAssist is high, speed up the particles drastically to simulate riding the flow
  const particleSpeed = 0.2 + (currentAssist * 2.0);
  const particleOpacity = 0.15 + (currentAssist * 0.1);
  
  return (
    <Sparkles 
      count={4000} 
      scale={[200, 200, 200]} 
      size={1.5} 
      speed={particleSpeed} 
      opacity={particleOpacity} 
      color="#aaddff" 
      noise={[20, 5, 20]}
    />
  );
}

// Light shafts penetrating the water from the surface
function GodRays() {
  const depth = useSimulationStore((s) => s.depth);
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y = -depth * 0.2; // Move rays slightly as we go down
      meshRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.1) * 0.1;
    }
  });

  const opacity = Math.max(0, 0.15 - (depth / 100)); // Fades out completely by 15m depth

  if (opacity <= 0) return null;

  return (
    <group ref={meshRef} position={[0, 20, 0]}>
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} rotation={[0, (i * Math.PI) / 4, 0]}>
          <cylinderGeometry args={[2, 40, 150, 16, 1, true]} />
          <meshBasicMaterial 
            color="#55ccff" 
            transparent 
            opacity={opacity * (0.5 + Math.random() * 0.5)} 
            blending={THREE.AdditiveBlending} 
            depthWrite={false} 
            side={THREE.DoubleSide} 
          />
        </mesh>
      ))}
    </group>
  );
}

function OceanEnvironment() {
  const depth = useSimulationStore((s) => s.depth);

  // Deep ocean color gradient
  const surfaceColor = new THREE.Color('#1a2530');
  const deepColor = new THREE.Color('#00050a');
  const fogColor = surfaceColor.clone().lerp(deepColor, Math.min(depth / 80, 1));
  const fogDensity = THREE.MathUtils.lerp(0.002, 0.04, Math.min(depth / 150, 1));
  const ambientIntensity = Math.max(0.01, 0.8 - (depth / 40));
  const sunIntensity = Math.max(0, 2.0 - (depth / 20));

  const scene = useThree((state) => state.scene);
  
  useFrame(() => {
    // Dynamically update background and fog
    scene.background = fogColor;
    if (scene.fog instanceof THREE.FogExp2) {
      scene.fog.color = fogColor;
      scene.fog.density = fogDensity;
    } else {
      scene.fog = new THREE.FogExp2(fogColor, fogDensity);
    }
  });

  return (
    <>
      <ambientLight intensity={ambientIntensity} color="#90d0ff" />
      <directionalLight 
        position={[20, 50, -20]} 
        intensity={sunIntensity} 
        color="#ffffff" 
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      <MarineSnow />
      <GodRays />

      <SurfaceEnvironment />

      <IceShelf />
      <DebrisField />
      <SonarSweep />
      
      {/* Realistic Seafloor */}
      <group position={[0, -142, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[1000, 1000, 128, 128]} />
          <meshStandardMaterial 
            color="#051014" 
            roughness={0.95} 
            metalness={0.1}
            wireframe={false}
          />
        </mesh>
        
        {/* Tactical Grid overlaid on seafloor */}
        <Grid 
          position={[0, 0.1, 0]} 
          args={[1000, 1000]} 
          cellSize={10} 
          cellThickness={1.5} 
          cellColor="#004466" 
          sectionSize={50} 
          sectionThickness={2} 
          sectionColor="#0088aa" 
          fadeDistance={300}
        />
      </group>
    </>
  );
}

export default function AntarcticScene() {
  return (
    <div className="w-full h-full bg-[#000000]">
      <Canvas shadows camera={{ position: [10, 5, 10], fov: 60, near: 0.1, far: 1000 }}>
        <SoftShadows size={20} samples={16} focus={0.5} />
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
