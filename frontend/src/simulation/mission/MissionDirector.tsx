import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSimulationStore } from "../store/simulationStore";
import type { MissionPhase } from '../store/simulationStore';
import * as THREE from 'three';

export default function MissionDirector() {
  const phase = useSimulationStore((s) => s.missionPhase);
  const setMissionPhase = useSimulationStore((s) => s.setMissionPhase);
  const addAlert = useSimulationStore((s) => s.addAlert);
  const addAILog = useSimulationStore((s) => s.addAILog);
  const setCameraMode = useSimulationStore((s) => s.setCameraMode);

  // ── Mission State Machine Auto-Progression ──
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const transitionTo = (nextPhase: MissionPhase, delayMs: number) => {
      timeout = setTimeout(() => {
        setMissionPhase(nextPhase);
      }, delayMs);
    };

    switch (phase) {
      case 'STAGE_0_SURFACE':
        addAILog('[SYS] Calibrating IMU... Nominal.');
        addAILog('[SYS] Commencing dive sequence.');
        setCameraMode('TPP');
        transitionTo('STAGE_1_ENTRY', 4000);
        break;
      case 'STAGE_1_ENTRY':
        addAlert('WATER ENTRY DETECTED');
        addAILog('[PHYS] Ballast flooding... -5m descent rate.');
        transitionTo('STAGE_2_DESCENT', 5000);
        break;
      case 'STAGE_2_DESCENT':
        addAILog('[AI] Adjusting pitch for thermal layer transition.');
        addAILog('[PHYS] Ambient light levels dropping.');
        setCameraMode('TPP'); // Switch to FPP for descent!
        transitionTo('STAGE_3_MIDWATER', 8000);
        break;
      case 'STAGE_3_MIDWATER':
        addAlert('REACHED CRUISING DEPTH (100m)');
        addAILog('[DL] Virtual Sensor Matrix online. Predicting salinity/turbidity.');
        transitionTo('STAGE_4_SEAFLOOR', 6000);
        break;
      case 'STAGE_4_SEAFLOOR':
        addAILog('[SYS] Seafloor proximity alert: 42m.');
        addAILog('[AI] Activating Sonar sweep logic.');
        setCameraMode('TPP'); // Switch back to TPP to see seafloor approach
        transitionTo('STAGE_5_SONAR', 7000);
        break;
      case 'STAGE_5_SONAR':
        addAlert('📡 SONAR SCAN IN PROGRESS');
        addAILog('[AI] Running YOLOv8 on acoustic returns...');
        transitionTo('STAGE_6_ANOMALY', 8000);
        break;
      case 'STAGE_6_ANOMALY':
        addAlert('ANOMALY DETECTED: GHOST NET');
        addAILog('[AI] Confidence: 89%. Extracting coordinates.');
        addAILog('[SYS] Geotag locked: -65.201, 48.712.');
        transitionTo('STAGE_7_ASCENT', 6000);
        break;
      case 'STAGE_7_ASCENT':
        addAILog('[PHYS] Purging ballast. Reversing thrusters.');
        addAlert('ASCENT INITIATED');
        setCameraMode('TPP');
        transitionTo('STAGE_8_RECOVERY', 8000);
        break;
      case 'STAGE_8_RECOVERY':
        addAlert('SURFACE RECOVERY NOMINAL');
        addAILog('[SYS] Establishing Iridium SATCOM uplink.');
        addAILog('[SYS] Transmitting payload to MoES-DASH.');
        setCameraMode('TPP');
        transitionTo('IDLE', 5000);
        break;
    }

    return () => clearTimeout(timeout);
  }, [phase, setMissionPhase, addAlert, addAILog, setCameraMode]);

  // Keep track of smooth logical values to prevent state oscillation
  const logicalY = useRef(0);
  const logicalPitch = useRef(0);

  // ── Physics & Animation ──
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const currentPhase = useSimulationStore.getState().missionPhase;
    const sway = Math.cos(time * 0.5) * 0.02;

    let targetY = logicalY.current;
    let targetPitch = 0;
    
    switch (currentPhase) {
      case 'IDLE':
      case 'STAGE_0_SURFACE':
        targetY = 0;
        targetPitch = sway;
        break;
      case 'STAGE_1_ENTRY':
        targetY = -5;
        targetPitch = -0.3;
        break;
      case 'STAGE_2_DESCENT':
        targetY = -100;
        targetPitch = -0.6;
        break;
      case 'STAGE_3_MIDWATER':
        targetY = -100;
        targetPitch = sway;
        break;
      case 'STAGE_4_SEAFLOOR':
      case 'STAGE_5_SONAR':
      case 'STAGE_6_ANOMALY':
        targetY = -142;
        targetPitch = currentPhase === 'STAGE_6_ANOMALY' ? 0.1 : sway;
        break;
      case 'STAGE_7_ASCENT':
        targetY = 0;
        targetPitch = 0.5;
        break;
      case 'STAGE_8_RECOVERY':
        targetY = 0;
        targetPitch = sway;
        break;
    }

    // Smoothly interpolate position and rotation
    logicalY.current = THREE.MathUtils.lerp(logicalY.current, targetY, delta * 0.5);
    logicalPitch.current = THREE.MathUtils.lerp(logicalPitch.current, targetPitch, delta * 2);
    
    // Add visual bobbing ONLY for rendering via auvPosition, but we shouldn't feed it back into lerp
    // Wait, setting state every frame is still heavy. Let's just set the logical base in the store, 
    // and let AUVModel add the bobbing locally.
    
    useSimulationStore.getState().setAUVPosition([0, logicalY.current, 0]);
    useSimulationStore.getState().setAUVRotation([logicalPitch.current, sway * 2, sway]);
  });

  return null;
}
