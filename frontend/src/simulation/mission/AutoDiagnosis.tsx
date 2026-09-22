import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSimulationStore } from '../store/simulationStore';

export function AutoDiagnosis() {
  const frameCount = useRef(0);
  
  // Get required actions and state from the store
  const {
    batteryPercent,
    setBattery,
    addAlert,
    missionPhase,
  } = useSimulationStore();

  useFrame((_state, delta) => {
    // Only run if mission is active
    if (missionPhase === 'IDLE' || missionPhase === 'STAGE_0_SURFACE') return;

    // 1. Degrade battery over time (0.1% per second of simulation time)
    if (batteryPercent > 0) {
      setBattery(Math.max(0, batteryPercent - (0.1 * delta)));
    }

    frameCount.current++;
    
    // Run diagnostics at 1Hz (assuming ~60fps, so every 60 frames)
    if (frameCount.current % 60 === 0) {
      runDiagnostics();
    }
  });

  const runDiagnostics = () => {
    const store = useSimulationStore.getState();
    const battery = store.batteryPercent;
    
    // 1. Check Battery
    const batteryComponent = store.components.find(c => c.id === 'battery');
    if (batteryComponent && batteryComponent.status !== 'CRITICAL') {
      if (battery < 15) {
        triggerEmergency('Battery level critical (< 15%). Commencing emergency triage.');
      } else if (battery < 30 && batteryComponent.status !== 'WARNING') {
        store.triggerFailure('battery');
        addAlert('⚠️ WARNING: Battery level below 30%');
      }
    }

    // 2. Check Communications
    const commsComponent = store.components.find(c => c.id === 'iridium');
    const timeSinceTransmit = Date.now() - store.lastTransmit;
    if (commsComponent && commsComponent.status !== 'CRITICAL' && timeSinceTransmit > 60000) {
       store.triggerFailure('iridium');
       addAlert('⚠️ WARNING: Iridium communication timeout (> 60s)');
    }

    // 3. Random Sensor Drift
    if (Math.random() < 0.05) { // 5% chance every second
      const ctd = store.components.find(c => c.id === 'ctd');
      if (ctd && ctd.health > 50) {
        store.triggerFailure('ctd');
        addAlert('⚠️ WARNING: Sensor drift detected on CTD');
      }
    }

    // 4. Thruster anomalies
    if (Math.random() < 0.02) { // 2% chance every second
      const t1 = store.components.find(c => c.id === 'thrusters_unit');
      if (t1 && t1.health > 40) {
        store.triggerFailure('thrusters_unit');
        addAlert('⚠️ WARNING: Thruster RPM deviation detected');
      }
    }
  };

  const triggerEmergency = (reason: string) => {
    const store = useSimulationStore.getState();
    if (store.missionPhase === 'EMERGENCY') return; // Already in emergency

    store.addAlert(`🚨 EMERGENCY TRIAGE INITIATED: ${reason}`);
    
    // 1. Shut down non-essential systems (Mocked by adding alert and modifying state if we had it)
    store.addAlert('⚡ Powering down non-essential systems (Camera LEDs, Sonar)');
    store.setSonarActive(false);

    // 2. Reduce thruster power to 50%
    store.thrusters.forEach(t => {
      if (t.rpm > t.maxRpm * 0.5) {
        store.setThrusterRPM(t.id, t.maxRpm * 0.5);
      }
    });
    store.addAlert('⚙️ Thruster power limited to 50% for endurance');

    // 3. Calculate max endurance
    const hoursLeft = (store.batteryPercent / 100) * 8.0 * 2; // Doubled endurance at half power
    store.addAlert(`🔋 Estimated endurance at reduced power: ${hoursLeft.toFixed(1)} hours`);

    // 4. Compose distress message
    store.addAlert(`📡 Transmitting distress signal with position: ${store.gpsLat.toFixed(4)}, ${store.gpsLng.toFixed(4)}`);

    // 5 & 6. Emergency Ascent and phase update
    store.emergencyAscent();
  };

  return null; // Logic-only component
}
