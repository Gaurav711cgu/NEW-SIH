import { useState } from 'react';
import { useSimulationStore } from '../store/simulationStore';
import type { CameraMode } from '../store/simulationStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Play, AlertTriangle, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';

export default function ControlPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [showFailures, setShowFailures] = useState(false);

  const missionPhase = useSimulationStore((state) => state.missionPhase);
  const cameraMode = useSimulationStore((state) => state.cameraMode);
  const initiateDive = useSimulationStore((state) => state.initiateDive);
  const setCameraMode = useSimulationStore((state) => state.setCameraMode);
  const triggerFailure = useSimulationStore((state) => state.triggerFailure);
  const emergencyAscent = useSimulationStore((state) => state.emergencyAscent);
  const reset = useSimulationStore((state) => state.reset);

  const isDiving = missionPhase !== 'IDLE' && missionPhase !== 'STAGE_0_SURFACE';

  const modes: CameraMode[] = ['FPP', 'TPP', 'FREE', 'CINEMATIC'];

  return (
    <div className="bg-black/80 border border-cyan-500/40 rounded-lg backdrop-blur-md w-[240px] overflow-hidden flex flex-col pointer-events-auto">
      
      {/* Header Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full p-3 bg-cyan-950/40 hover:bg-cyan-900/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Settings size={16} className="text-cyan-400" />
          <span className="text-sm font-bold text-cyan-200">MISSION CONTROL</span>
        </div>
        {isOpen ? <ChevronDown size={16} className="text-cyan-400" /> : <ChevronUp size={16} className="text-cyan-400" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="flex flex-col p-3 gap-4"
          >
            {/* Initiate Dive */}
            <button
              onClick={initiateDive}
              disabled={isDiving}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded font-bold transition-all ${
                isDiving 
                  ? 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed' 
                  : 'bg-cyan-600/20 border border-cyan-400 text-cyan-300 hover:bg-cyan-500/30 hover:shadow-[0_0_15px_#00e5ff40]'
              }`}
            >
              <Play size={16} />
              {isDiving ? 'DIVE IN PROGRESS' : 'INITIATE DIVE'}
            </button>

            {/* Camera Modes */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-cyan-600 font-bold">CAMERA MODE</span>
              <div className="grid grid-cols-2 gap-2">
                {modes.map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setCameraMode(mode)}
                    className={`py-1 text-xs rounded border transition-colors ${
                      cameraMode === mode 
                        ? 'bg-cyan-500/30 border-cyan-400 text-cyan-100' 
                        : 'bg-black border-gray-700 text-gray-400 hover:border-cyan-500/50'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Failures Dropdown */}
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => setShowFailures(!showFailures)}
                className="flex items-center justify-between py-2 px-3 border border-yellow-500/30 bg-yellow-950/20 text-yellow-500 rounded text-xs hover:bg-yellow-900/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} />
                  <span>SYSTEM DIAGNOSTIC FAULTS</span>
                </div>
                {showFailures ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              </button>

              <AnimatePresence>
                {showFailures && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col gap-1 border border-yellow-500/20 p-2 rounded bg-black/50"
                  >
                    <button onClick={() => triggerFailure('battery')} className="text-left text-[11px] text-yellow-200 hover:bg-yellow-500/20 px-2 py-1 rounded">Fail: Battery Cell</button>
                    <button onClick={() => triggerFailure('thrusters_unit')} className="text-left text-[11px] text-yellow-200 hover:bg-yellow-500/20 px-2 py-1 rounded">Fail: Thruster Unit</button>
                    <button onClick={() => triggerFailure('imu')} className="text-left text-[11px] text-yellow-200 hover:bg-yellow-500/20 px-2 py-1 rounded">Fail: IMU Drift</button>
                    <button onClick={emergencyAscent} className="text-left text-[11px] text-red-400 hover:bg-red-500/20 px-2 py-1 rounded font-bold mt-1 border border-red-500/30 bg-red-950/30">ABORT: Emergency Ascent</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Reset */}
            <button
              onClick={reset}
              className="flex items-center justify-center gap-2 py-2 px-3 mt-2 border border-red-500/40 text-red-400 hover:bg-red-500/20 rounded text-xs transition-colors"
            >
              <RefreshCw size={14} />
              RECALIBRATE SENSORS
            </button>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
