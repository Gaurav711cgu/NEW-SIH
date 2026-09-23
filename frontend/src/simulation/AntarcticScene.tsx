import { Canvas } from '@react-three/fiber';
import { Selection } from '@react-three/postprocessing';
import AUVModel from './auv/AUVModel';
import BubbleSystem from "./environment/BubbleSystem";
import IceShelfModel from "./environment/IceShelfModel";
import SurfaceEnvironment from "./environment/SurfaceEnvironment";
import DeepEnvironment from "./environment/DeepEnvironment";
import AbyssalTerrainModel from "./environment/AbyssalTerrainModel";
import DebrisField from "./environment/DebrisField";
import SonarSweep from "./environment/SonarSweep";
import SonarBeam from "./auv/SonarBeam";
import SeafloorModel from "./environment/SeafloorModel";
import Lighting from "./environment/Lighting";
import GodRays from "./environment/GodRays";
import MarineSnow from "./environment/MarineSnow";
import CinematicPipeline from "./environment/CinematicPipeline";
import CameraManager from './cameras/CameraManager';
import MissionDirector from './mission/MissionDirector';

function OceanEnvironment() {
  return (
    <>
      <Lighting />
      <MarineSnow />
      <GodRays />

      <SurfaceEnvironment />

      <IceShelfModel />
      <DeepEnvironment />
      <AbyssalTerrainModel />
      <DebrisField />
      <SonarSweep />
      
      <SeafloorModel />
    </>
  );
}

export default function AntarcticScene() {
  return (
    <div className="w-full h-full bg-[#000000]">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [10, 5, 10], fov: 60, near: 0.1, far: 1000 }}
        gl={{ preserveDrawingBuffer: true, antialias: false, powerPreference: 'high-performance' }}
      >
        <Selection>
          <OceanEnvironment />
          <BubbleSystem />
          <MissionDirector />
          <CameraManager />
          <group>
            <AUVModel />
            <SonarBeam />
          </group>
          <CinematicPipeline />
        </Selection>
      </Canvas>
    </div>
  );
}
