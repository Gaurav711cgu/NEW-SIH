import { useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { EffectComposer, DepthOfField, Vignette, Noise, HueSaturation, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useSimulationStore } from '../store/simulationStore';

export default function WaterVolume() {
  const { scene } = useThree();
  const depth = useSimulationStore(state => state.depth);

  useEffect(() => {
    // Setup underwater fog (deeper, more cinematic teal/blue)
    scene.fog = new THREE.FogExp2('#041624', 0.018);
    scene.background = new THREE.Color('#041624');
    
    return () => {
      scene.fog = null;
      scene.background = null;
    };
  }, [scene]);

  useFrame(() => {
    if (scene.fog && scene.fog instanceof THREE.FogExp2) {
      const baseDensity = 0.015;
      const addedDensity = (depth / 150) * 0.025; 
      scene.fog.density = THREE.MathUtils.lerp(scene.fog.density, baseDensity + addedDensity, 0.05);
    }
  });

  return (
    <EffectComposer enableNormalPass={false}>
      <DepthOfField focusDistance={0.05} focalLength={0.1} bokehScale={3} height={480} />
      <Bloom luminanceThreshold={0.8} luminanceSmoothing={0.5} intensity={1.2} />
      <Vignette eskil={false} offset={0.1} darkness={1.2} />
      <HueSaturation hue={0.08} saturation={0.1} />
      <Noise opacity={0.035} />
    </EffectComposer>
  );
}
