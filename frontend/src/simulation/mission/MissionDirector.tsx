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
        addAILog('[SATCOM ACTIVE] GPS Lock is acquired. Lat: -65.20, Lon: 48.71.');
        addAILog('[COMMS] Downloading final mission parameters.');
        addAILog('[ENVIRONMENTAL SCAN] Surface weather state: Sea State 4, Winds 25kts.');
        addAILog('[PRE-DIVE] Checking ballast tanks & battery health.');
        addAILog('[SYS] Command received. Initiating descent.');
        setCameraMode('TPP');
        transitionTo('STAGE_1_ENTRY', 5000);
        break;
      case 'STAGE_1_ENTRY':
        addAlert('WATER ENTRY DETECTED');
        addAILog('[PHYS] Ballast flooding... SATCOM antenna retracting.');
        transitionTo('STAGE_2_DESCENT', 5000);
        break;
      case 'STAGE_2_DESCENT':
        addAILog('[SATCOM LOST] Switching to Inertial Navigation (INS) and DVL.');
        addAILog('[ACOUSTIC COMM] Heartbeat established with surface buoy.');
        useSimulationStore.getState().updateTelemetry({ powerMode: 'ECO_GLIDE', currentAssist: 1.2 });
        setCameraMode('TPP'); 
        transitionTo('STAGE_3_MIDWATER', 8000);
        break;
      case 'STAGE_3_MIDWATER':
        addAlert('REACHED MIDWATER (100m)');
        addAILog('[PS1 EDGE INFERENCE SENSORS ENGAGED] Deep Learning predicting Salinity/Turbidity.');
        addAILog('[OBSTACLE AVOIDANCE] Forward-looking sonar pinging for ice keels.');
        addAILog('[PHYS] Trimming buoyancy for neutral hover.');
        transitionTo('STAGE_4_SEAFLOOR', 6000);
        break;
      case 'STAGE_4_SEAFLOOR':
        addAlert('ABYSSAL SEAFLOOR REACHED');
        addAILog('[SYS] Dual high-intensity headlights ON.');
        addAILog('[PS2 AI VISION ENGAGED] Activating Sonar Sweep and Camera Array.');
        useSimulationStore.getState().updateTelemetry({ powerMode: 'ACTIVE_THRUST', currentAssist: 0.1 });
        setCameraMode('TPP'); 
        transitionTo('STAGE_5_SONAR', 7000);
        break;
      case 'STAGE_5_SONAR':
        addAlert('📡 MAPPING SECTOR');
        addAILog('[MAPPING] Flying precision lawnmower pattern.');
        addAILog('[TARGET DETECTION] YOLOv8 + CBAM pipeline processing acoustic shadows...');
        transitionTo('STAGE_6_ANOMALY', 8000);
        break;
      case 'STAGE_6_ANOMALY':
        addAlert('ANOMALY DETECTED: UXO / MINE');
        addAILog('[DECISION MATRIX] Target identified. Breaking search pattern to circle target.');
        addAILog('[PS2 PIPELINE OUTPUT]');
        addAILog('  "object_class": "mine"');
        addAILog('  "confidence_cal": 0.88');
        addAILog('  "lat": -54.199991, "lon": 60.800015');
        addAILog('  "depth_m": 142.0, "heading_deg": 90.0');
        transitionTo('STAGE_7_ASCENT', 8000);
        break;
      case 'STAGE_7_ASCENT':
        addAILog('[PHYS] Dropping drop-weights. Initiating emergency ascent.');
        addAlert('ASCENT INITIATED');
        setCameraMode('TPP');
        transitionTo('STAGE_8_RECOVERY', 8000);
        break;
      case 'STAGE_8_RECOVERY':
        addAlert('SURFACE RECOVERY NOMINAL');
        addAILog('[SYS] Establishing Iridium SATCOM uplink.');
        addAILog('[SYS] Exfiltrating PS2 JSON payload to MoES-DASH.');
        setCameraMode('TPP');
        transitionTo('IDLE', 6000);
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
    // Altitude floor clamp: ensure vehicle cruising depth never drops below -142.0m (maintaining >4.5m clearance above seabed)
    logicalY.current = Math.max(-142.0, logicalY.current);
    logicalPitch.current = THREE.MathUtils.lerp(logicalPitch.current, targetPitch, delta * 2);
    
    // Add visual bobbing ONLY for rendering via auvPosition, but we shouldn't feed it back into lerp
    // Wait, setting state every frame is still heavy. Let's just set the logical base in the store, 
    // and let AUVModel add the bobbing locally.
    
    const currentDepth = Math.max(0, -logicalY.current);
    
    // Dynamic Environmental Profiling based on depth
    // Temperature drops through the thermocline
    const targetTemp = currentDepth < 20 ? 1.84 : Math.max(-1.5, 1.84 - (currentDepth / 30));
    // Salinity increases slightly with depth
    const targetSalin = 34.5 + (currentDepth / 100);
    // Dissolved oxygen drops
    const targetDoxy = Math.max(4.2, 7.2 - (currentDepth / 40));

    useSimulationStore.getState().updateTelemetry({
      temperature: targetTemp,
      salinity: targetSalin,
      dissolvedOxygen: targetDoxy,
    });
    
    useSimulationStore.getState().setAUVPosition([0, logicalY.current, 0]);
    useSimulationStore.getState().setAUVRotation([logicalPitch.current, sway * 2, sway]);
  });

  return null;
}
