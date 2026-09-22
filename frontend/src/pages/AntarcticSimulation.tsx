import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Anchor, Activity, Maximize2, ShieldAlert } from 'lucide-react';
import AntarcticScene from '../simulation/AntarcticScene';
import OpsIntelligence from "../simulation/hud/OpsIntelligence";
import SubsystemHealthMatrix from "../simulation/hud/SubsystemHealthMatrix";
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
    '> AUV STATUS: SURFACE DEPLOYED. READY FOR DIVE.'
  ];

  useEffect(() => {
    let currentLine = 0;
    const interval = setInterval(() => {
      if (bootSequence[currentLine]) { setLines((prev) => [...prev, bootSequence[currentLine]]); }
      currentLine++;
      if (currentLine >= bootSequence.length) {
        clearInterval(interval);
        setTimeout(onComplete, 1000);
      }
    }, 150);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="absolute inset-0 z-50 bg-[#020617] text-ice-400 font-mono text-xs sm:text-sm p-4 sm:p-8 flex flex-col items-start justify-end overflow-hidden">
      <div className="w-full max-w-3xl space-y-1">
        {lines.map((line, i) => {
          if (!line) return null;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={line.startsWith('> ═') ? 'text-steel-400' : ''}
            >
              {line}
            </motion.div>
          );
        })}
        <motion.div
          animate={{ opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="w-3 h-4 bg-ice-500 mt-2 block"
        />
      </div>
    </div>
  );
}

/* ── Phase Banner ────────────────────────────── */
function PhaseBanner() {
  const phase = useSimulationStore((s) => s.missionPhase);
  if (phase === 'IDLE') return null;

  return (
    <div className="bg-abyss-900/90 backdrop-blur-md border border-steel-800/80 shadow-xl p-4 rounded-xl flex items-center justify-between mt-auto mb-4 pointer-events-auto">
      <div>
        <div className="text-[10px] text-steel-400 font-bold tracking-widest mb-1">CURRENT PHASE</div>
        <div className="text-ice-400 font-mono text-sm font-bold animate-pulse">
          {phase.replace(/_/g, ' ')}
        </div>
      </div>
      <Activity className="w-5 h-5 text-steel-400" />
    </div>
  );
}

/* ── Alert Feed ────────────────────────────── */
function AlertFeed() {
  const alerts = useSimulationStore((s) => s.alerts);
  const recentAlerts = alerts.slice(-3);

  if (recentAlerts.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 pointer-events-auto">
      <h3 className="text-[10px] font-bold text-steel-400 uppercase tracking-wider mb-1 flex items-center gap-1">
        <ShieldAlert className="w-3 h-3" /> SYSTEM ALERTS
      </h3>
      <AnimatePresence>
        {recentAlerts.map((alert, i) => (
          <motion.div
            key={`${alert}-${alerts.length - 3 + i}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="font-mono text-[10px] text-yellow-400 bg-abyss-800/80 border border-yellow-400/30 rounded-lg px-3 py-2 shadow-lg backdrop-blur-sm"
          >
            {alert}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}


class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: 'red', padding: '20px', zIndex: 9999, position: 'relative' }}>
          <h1>Something went wrong.</h1>
          <pre>{this.state.error.toString()}</pre>
        </div>
      );
    }
    return this.props.children; 
  }
}

export default function AntarcticSimulation() {
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.log(err));
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  };
  const phase = useSimulationStore((s) => s.missionPhase);
  const [booted, setBooted] = useState(false);

  const handleBootComplete = () => {
    setBooted(true);
  };

  return (
    <div className="flex flex-col w-full h-full overflow-hidden bg-[#020617] text-steel-100 font-sans relative flex-1">
      {/* Boot Sequence */}
      <AnimatePresence>
        {!booted && <BootScreen onComplete={handleBootComplete} />}
      </AnimatePresence>

      {booted && (
        <>
          {/* 3D SCENE BACKGROUND */}
          <div className="absolute inset-0 z-0">
            <AntarcticScene />
          </div>

          {/* TOP NAVBAR OVERLAY */}
          <div className="absolute top-0 left-0 w-full h-14 bg-gradient-to-b from-[#000000]/80 to-transparent flex items-start justify-between px-6 pt-4 z-50 pointer-events-none">
            <div className="flex items-center gap-2 pointer-events-auto bg-abyss-900/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-steel-800/80">
              <Anchor className="w-4 h-4 text-steel-100" />
              <span className="font-bold tracking-widest text-[11px] text-steel-100">SOUTHERN OCEAN SIMULATION</span>
            </div>
            <div className="flex gap-2">
              <button onClick={toggleFullScreen} className="p-1.5 bg-abyss-900/60 backdrop-blur-md border border-steel-800/80 rounded-full hover:bg-abyss-800 transition-colors pointer-events-auto cursor-pointer">
                <Maximize2 className="w-4 h-4 text-steel-400" />
              </button>
            </div>
          </div>

          {/* FLOATING LEFT CARDS */}
          <div className="absolute top-16 left-6 bottom-6 w-[280px] z-10 flex flex-col gap-4 overflow-y-auto custom-scrollbar pointer-events-none">
            <div className="bg-abyss-900/80 backdrop-blur-xl border border-steel-800/80 rounded-2xl p-5 shadow-2xl pointer-events-auto shrink-0">
              <h3 className="text-[10px] font-bold text-steel-400 tracking-wider mb-4">VEHICLE TELEMETRY</h3>
              <div className="bg-[#020617] rounded-xl p-3 font-mono text-sm border border-steel-800/80">
                <HUD /> 
              </div>
            </div>

            <div className="bg-abyss-900/80 backdrop-blur-xl border border-steel-800/80 rounded-2xl p-5 shadow-2xl pointer-events-auto shrink-0">
              <h3 className="text-[10px] font-bold text-steel-400 tracking-wider mb-3">MISSION CONTROL</h3>
              {phase === 'IDLE' ? (
                <button 
                  onClick={() => useSimulationStore.getState().initiateDive()}
                  className="w-full py-3 bg-ice-500 hover:bg-ice-400 text-abyss-950 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Activity className="w-4 h-4" />
                  INITIATE DIVE SEQUENCE
                </button>
              ) : (
                <div className="p-3 bg-[#020617] border border-steel-800/80 rounded-xl text-center">
                  <span className="text-ice-400 font-mono text-xs font-bold animate-pulse">MISSION IN PROGRESS</span>
                </div>
              )}
            </div>
            
            <PhaseBanner />
          </div>

          {/* FLOATING RIGHT CARDS */}
          <div className="absolute top-16 right-6 bottom-6 w-[300px] z-10 flex flex-col gap-4 overflow-y-auto custom-scrollbar pointer-events-none">
            
            <div className="bg-abyss-900/80 backdrop-blur-xl border border-steel-800/80 rounded-2xl p-5 shadow-2xl pointer-events-auto shrink-0">
              <h3 className="text-[10px] font-bold text-steel-400 tracking-wider mb-4">SYSTEMS STATUS</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-[10px] mb-1.5 font-bold">
                    <span className="text-steel-400">BATTERY</span>
                    <span className="text-ice-400">100%</span>
                  </div>
                  <div className="h-1.5 bg-abyss-800 rounded-full overflow-hidden">
                    <div className="h-full w-full bg-ice-500 rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] mb-1.5 font-bold">
                    <span className="text-steel-400">CPU LOAD</span>
                    <span className="text-yellow-400">42%</span>
                  </div>
                  <div className="h-1.5 bg-abyss-800 rounded-full overflow-hidden">
                    <div className="h-full w-[42%] bg-yellow-400 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            <SubsystemHealthMatrix />

            <AlertFeed />
            
            {/* HUD Intelligence - Wrapped in pointer-events-auto */}
            <div className="pointer-events-auto shrink-0">
              <OpsIntelligence />
            </div>
            
          </div>
        </>
      )}
    </div>
  );
}
