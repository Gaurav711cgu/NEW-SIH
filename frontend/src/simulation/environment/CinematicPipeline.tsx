import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  EffectComposer,
  N8AO,
  DepthOfField,
  Bloom,
  Vignette,
  Outline,
} from '@react-three/postprocessing';
import * as THREE from 'three';
import { DepthOfFieldEffect } from 'postprocessing';
import { useSimulationStore } from '../store/simulationStore';

/**
 * CinematicPipeline
 * 
 * High-fidelity post-processing pipeline for Antarctic deep-sea tactical digital twin:
 * - EffectComposer with 8x multisampling for crisp geometry antialiasing
 * - N8AO: Rapid screen-space ambient occlusion generating deep crevice contact shadows
 * - DepthOfField: Dynamic focal tracking on the AUV position with cinematic bokeh falloff
 * - Bloom: Physically based glowing headlights, tactical LEDs, beacons, and thrusters
 * - Outline: Interactive tactical highlight pass for selected/hovered AUV subsystems
 * - Vignette: Submersible optical viewport framing
 */
export default function CinematicPipeline() {
  const dofRef = useRef<DepthOfFieldEffect>(null);

  // Deep oceanic crevice shadow color (n8ao expects a THREE.Color instance)
  const aoColor = useMemo(() => new THREE.Color('#010814'), []);

  // Persistent vector for dynamic AUV focus tracking
  const auvVec = useMemo(() => new THREE.Vector3(0, 0, 0), []);

  useFrame(() => {
    const auvPosition = useSimulationStore.getState().auvPosition;
    auvVec.set(auvPosition[0], auvPosition[1], auvPosition[2]);

    if (dofRef.current && dofRef.current.target) {
      dofRef.current.target.set(auvPosition[0], auvPosition[1], auvPosition[2]);
    }
  });

  return (
    <EffectComposer multisampling={8} enableNormalPass={false} autoClear={false}>
      {/* ── INTERACTIVE SELECTION OUTLINE ── */}
      <Outline
        blur
        edgeStrength={3.5}
        pulseSpeed={0.0}
        visibleEdgeColor={0x00f0ff}
        hiddenEdgeColor={0x005577}
        width={1024}
      />

      {/* ── AMBIENT OCCLUSION (N8AO) ── */}
      <N8AO
        aoRadius={3.5}
        {...({ radius: 3.5 } as any)}
        intensity={2.8}
        halfRes={true}
        color={aoColor}
      />

      {/* ── DEPTH OF FIELD (DYNAMIC CAMERA FOCUS) ── */}
      <DepthOfField
        ref={dofRef}
        target={auvVec}
        focusRange={14.0}
        bokehScale={4.0}
        focalLength={0.06}
      />

      {/* ── CINEMATIC BLOOM ── */}
      <Bloom
        mipmapBlur
        luminanceThreshold={0.90}
        luminanceSmoothing={0.25}
        intensity={1.4}
      />

      {/* ── SUBMERSIBLE VIEWPORT VIGNETTE ── */}
      <Vignette
        darkness={0.8}
        offset={0.2}
      />
    </EffectComposer>
  );
}
