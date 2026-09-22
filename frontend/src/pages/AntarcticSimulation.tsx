import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Anchor, Activity } from 'lucide-react';
import AntarcticScene from '../simulation/AntarcticScene';
import ComponentInspector from "../simulation/auv/ComponentInspector";
import OpsIntelligence from "../simulation/hud/OpsIntelligence";
import HUD from '../simulation/hud/HUD';
import { useSimulationStore } from '../simulation/store/simulationStore';

/* ── Boot Sequence Screen ────────────────────────────── */
function BootScreen({ onComplete }: { onComplete: () => void }) {
  const [lines, setLines] = useState<string[]>([]);
  const bootSequence = [
    '> TEOS-10 POLAR OPS CONSOLE v2.6.1',
    '> Initializing quantum-hardened runtime...',
    '> Loading Antarctic bathymetry grid (0.25° × 0.25°)...',
    '> Mounting AUV digital twin subsystem...',
    '> CTD Sensor Pod — DS18B20 + MS5837-30BA ···· [LINKED]',
    '> IMU — MPU-9250 9-DOF ···· [CALIBRATED]',
    '> Sonar Array — Ping 115kHz ···· [STANDBY]',
    '> Iridium 9603N SBD ···· [GLOBAL LOCK]',
    '> Battery Pack — 18650 4S6P ···· [100% | 266 Wh]',
    '> Thruster Assembly (×6) ···· [ALL NOMINAL]',
    '> Edge AI — TFLite + TinyML ···· [READY]',
    '> Self-Diagnosis Engine ···· [ACTIVE]',
    '> Digital Twin Predictive Maintenance ···· [ARMED]',
    '> ═══════════════════════════════════════',
    '> SIMULATION ENVIRONMENT: SOUTHERN OCEAN',
    '> COORDINATES: 65.2°S, 48.7°E',
    '> WATER TEMP: -1.8°C to +2.0°C',
    '> CURRENT: ACC 0.3 m/s EAST',
    '> VISIBILITY: 25m',
    '> ═══════════════════════════════════════',
    '> ALL SYSTEMS NOMINAL — READY FOR DEPLOYMENT',
  ];

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < bootSequence.length) {
        setLines((prev) => [...prev, bootSequence[i]]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 800);
      }
    }, 120);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ background: '#020a18' }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="w-full max-w-2xl px-8">
        <div className="flex items-center gap-3 mb-6">
          <Anchor className="w-8 h-8 text-white" />
          <h1 className="text-2xl font-mono font-bold text-white tracking-wider">
            ANTARCTIC AUV SIMULATION
          </h1>
        </div>
        <div className="bg-black/60 border border-white/20 rounded-lg p-6 font-mono text-sm max-h-[70vh] overflow-hidden">
          {lines.map((line, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              className={
                !line ? 'hidden' :
                line.includes('[LINKED]') || line.includes('[CALIBRATED]') || line.includes('[READY]') ||
                line.includes('[ACTIVE]') || line.includes('[ARMED]') || line.includes('[NOMINAL]') ||
                line.includes('[STANDBY]') || line.includes('[GLOBAL LOCK]') || line.includes('[ALL NOMINAL]')
                  ? 'text-[#34c759] mb-1'
                  : line.includes('═══')
                  ? 'text-cyan-600 mb-1'
                  : line.includes('READY FOR DEPLOYMENT')
                  ? 'text-white font-bold mb-1'
                  : line.includes('100%')
                  ? 'text-[#34c759] mb-1'
                  : 'text-[#ebebf599] mb-1'
              }
            >
              {line}
            </motion.div>
          ))}
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 0.6 }}
            className="text-white"
          >
            █
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Mission Phase Banner ────────────────────────────── */
function PhaseBanner() {
  const phase = useSimulationStore((s) => s.missionPhase);

  if (phase === 'IDLE' || phase === 'STAGE_8_RECOVERY') return null;

  const getPhaseProgress = () => {
    switch(phase) {
      case 'STAGE_0_SURFACE': return 10;
      case 'STAGE_1_ENTRY': return 20;
      case 'STAGE_2_DESCENT': return 40;
      case 'STAGE_3_MIDWATER': return 50;
      case 'STAGE_4_SEAFLOOR': return 70;
      case 'STAGE_5_SONAR': return 80;
      case 'STAGE_6_ANOMALY': return 90;
      case 'STAGE_7_ASCENT': return 100;
      default: return 0;
    }
  };

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full mt-4"
    >
      <div className="bg-[#1c1c1e] border border-[#38383a] rounded-xl px-6 py-4 text-center">
        <div className="flex items-center gap-3 mb-2 justify-center">
          <Activity className="w-5 h-5 text-[#34c759] animate-pulse" />
          <span className="font-mono text-white text-xs font-bold tracking-widest">
            {phase.replace('STAGE_', '').replace(/_/g, ' ')}
          </span>
        </div>
        <div className="w-full h-1 bg-[#000000] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-white to-[#34c759] rounded-full"
            animate={{ width: `${getPhaseProgress()}%` }}
            transition={{ duration: 1 }}
          />
        </div>
      </div>
    </motion.div>
  );
}

/* ── Alert Feed ──────────────────────────────────────── */
function AlertFeed() {
  const alerts = useSimulationStore((s) => s.alerts);
  const recentAlerts = alerts.slice(-5);

  if (recentAlerts.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 mt-4">
      <h3 className="text-[10px] font-bold text-[#ebebf599] uppercase tracking-wider mb-1">SYSTEM ALERTS</h3>
      <AnimatePresence>
        {recentAlerts.map((alert, i) => (
          <motion.div
            key={`${alert}-${alerts.length - 5 + i}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="font-mono text-[10px] text-[#ff9f0a] bg-yellow-950/30 border border-yellow-700/50 rounded px-3 py-2"
          >
            {alert}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default function AntarcticSimulation() {
  const phase = useSimulationStore((s) => s.missionPhase);
  const [booted, setBooted] = useState(false);

  const handleBootComplete = () => {
    setBooted(true);
    setTimeout(() => {
      useSimulationStore.getState().initiateDive();
    }, 2000);
  };

  return (
    <div className="flex flex-col w-full h-full overflow-hidden flex-1 bg-[#000000] text-[#ffffff] font-sans">
      {/* Boot Sequence */}
      <AnimatePresence>
        {!booted && <BootScreen onComplete={handleBootComplete} />}
      </AnimatePresence>

      {booted && (
        <>
          {/* TOP NAVBAR */}
          <div className="h-16 bg-black/70 backdrop-blur-[20px] saturate-[1.8] border-b border-white/10 flex items-center justify-between px-4 shrink-0 z-50">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Anchor className="w-5 h-5 text-white" />
                <span className="font-bold text-[#ffffff] tracking-wide text-sm">TEOS-10 GCS</span>
              </div>
              <div className="h-4 w-px bg-slate-700" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#34c759] animate-pulse" />
                <span className="text-xs font-mono text-[#34c759]">SATCOM LINKED</span>
              </div>
            </div>
            
            <div className="flex-1 flex justify-center">
              {/* Status Warning Bar (Like VARUNA's Red/Blue bar) */}
              <div className="bg-[#2c2c2e] text-[#ffffff] text-[10px] font-mono px-6 py-1 rounded-full border border-[#48484a] flex items-center gap-2">
                <span className="text-white">MODE: AUTONOMOUS</span>
                <span className="text-[#ebebf599]">|</span>
                <span>DIGITAL TWIN: ACTIVE</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="px-6 py-2 bg-white hover:bg-[#ebebeb] text-black text-[15px] font-semibold rounded-lg transition-colors">
                3D VIEW
              </button>
              <button className="px-6 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-xl border border-white/25 text-white text-[15px] font-semibold rounded-lg transition-colors">
                MAP VIEW
              </button>
              <button className="px-6 py-2 bg-transparent hover:bg-white/10 border border-white/30 text-[#ff453a] text-[15px] font-semibold rounded-lg transition-colors">
                E-STOP
              </button>
            </div>
          </div>

          {/* MAIN WORKSPACE */}
          <div className="flex flex-1 overflow-hidden">
            
            {/* LEFT PANEL */}
            <div className="w-[320px] bg-[#1c1c1e] border-r border-[#38383a] flex flex-col shrink-0 z-40 overflow-y-auto">
              <div className="p-4 border-b border-[#38383a]">
                <h3 className="text-xs font-bold text-[#ebebf599] tracking-wider mb-3">VEHICLE TELEMETRY</h3>
                <div className="bg-[#000000] rounded p-3 font-mono text-sm border border-[#38383a]">
                  <HUD /> 
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-xs font-bold text-[#ebebf599] tracking-wider mb-3">MISSION CONTROL</h3>
                {phase === 'IDLE' ? (
                  <button 
                    onClick={() => useSimulationStore.getState().initiateDive()}
                    className="w-full py-4 bg-white hover:bg-[#ebebeb] text-black text-[15px] font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Activity className="w-5 h-5" />
                    INITIATE DIVE SEQUENCE
                  </button>
                ) : (
                  <div className="p-4 bg-[#1c1c1e] border border-[#38383a] rounded-lg text-center">
                    <span className="text-[#34c759] font-mono font-bold animate-pulse">MISSION IN PROGRESS</span>
                    <div className="text-xs text-[#ebebf599] mt-2 font-mono">PHASE: {phase}</div>
                  </div>
                )}
              </div>
                <PhaseBanner />
            </div>

            {/* CENTER PANEL (3D SCENE) */}
            <div className="flex-1 relative bg-[#000000]">
              <AntarcticScene />
              
              {/* Floating Overlays inside 3D View */}
            </div>

            {/* RIGHT PANEL */}
            <div className="w-[320px] bg-[#1c1c1e] border-l border-[#38383a] flex flex-col shrink-0 z-40 overflow-y-auto">
              <div className="p-4 border-b border-[#38383a]">
                <h3 className="text-xs font-bold text-[#ebebf599] tracking-wider mb-3">SYSTEMS</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#ebebf599]">BATTERY</span>
                      <span className="text-[#34c759]">100%</span>
                    </div>
                    <div className="h-1.5 bg-[#2c2c2e] rounded-full overflow-hidden">
                      <div className="h-full w-full bg-[#34c759] rounded-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#ebebf599]">CPU LOAD</span>
                      <span className="text-[#ff9f0a]">42%</span>
                    </div>
                    <div className="h-1.5 bg-[#2c2c2e] rounded-full overflow-hidden">
                      <div className="h-full w-[42%] bg-[#ff9f0a] rounded-full" />
                    </div>
                  </div>
                </div>
                
                <AlertFeed />
                
                <ComponentInspector />
                <OpsIntelligence />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
