import { useEffect, useRef } from 'react';
import { useSimulationStore } from '../store/simulationStore';

export default function OpsIntelligence() {
  const phase = useSimulationStore((s) => s.missionPhase);
  const aiLogs = useSimulationStore((s) => s.aiLogs);
  const depth = useSimulationStore((s) => s.depth);

  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [aiLogs]);

  // Derived states based on phase
  const isDeepLearningActive = depth > 10;
  const isSonarActive = phase === 'STAGE_5_SONAR' || phase === 'STAGE_6_ANOMALY';
  const anomalyDetected = phase === 'STAGE_6_ANOMALY';

  return (
    <div className="flex flex-col gap-4 mt-4 text-steel-100">
      
      {/* AI Decision Matrix Terminal */}
      <div className="bg-[#020617] border border-steel-800/80 rounded-lg p-3">
        <h3 className="text-[10px] font-bold text-steel-400 tracking-widest mb-2">DECISION MATRIX</h3>
        <div ref={terminalRef} className="h-32 overflow-y-auto font-mono text-[11px] space-y-1 pr-2 custom-scrollbar">
          {aiLogs.length === 0 && <span className="text-[#ebebf57a] italic">Awaiting AI boot sequence...</span>}
          {aiLogs.map((log, i) => (
            <div key={i} className={`${log.includes('ANOMALY') || log.includes('ALERT') ? 'text-[#ff453a]' : log.includes('✅') ? 'text-ice-400' : 'text-steel-100'}`}>
              {log}
            </div>
          ))}
        </div>
      </div>

      {/* Deep Learning Sensor Replication (PS1) */}
      <div className={`bg-[#020617] border border-steel-800/80 rounded-lg p-3 transition-opacity duration-500 ${isDeepLearningActive ? 'opacity-100' : 'opacity-40'}`}>
        <h3 className="text-[10px] font-bold text-steel-400 tracking-widest flex justify-between">
          <span>EDGE INFERENCE SENSOR MATRIX (PS1)</span>
          <span className={isDeepLearningActive ? 'text-ice-400 animate-pulse' : 'text-[#ebebf57a]'}>{isDeepLearningActive ? 'ACTIVE' : 'STANDBY'}</span>
        </h3>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="bg-[#1c1c1e] p-2 rounded">
            <span className="text-steel-400 text-[10px] block">SALINITY (Pred)</span>
            <span className="font-mono">{isDeepLearningActive ? (34.5 + Math.random() * 0.1).toFixed(2) : '--'} PSU</span>
          </div>
          <div className="bg-[#1c1c1e] p-2 rounded">
            <span className="text-steel-400 text-[10px] block">TURBIDITY (Pred)</span>
            <span className="font-mono">{isDeepLearningActive ? (1.2 + Math.random() * 0.5).toFixed(2) : '--'} NTU</span>
          </div>
          <div className="bg-[#1c1c1e] p-2 rounded">
            <span className="text-steel-400 text-[10px] block">CHLOROPHYLL (Pred)</span>
            <span className="font-mono">{isDeepLearningActive ? (0.8 + Math.random() * 0.2).toFixed(2) : '--'} µg/L</span>
          </div>
          <div className="bg-[#1c1c1e] p-2 rounded">
            <span className="text-steel-400 text-[10px] block">MODEL CONFIDENCE</span>
            <span className="font-mono">{isDeepLearningActive ? '94.2%' : '--'}</span>
          </div>
        </div>
      </div>

      {/* AI Vision Pipeline (PS2) */}
      <div className={`bg-[#020617] border border-steel-800/80 rounded-lg p-3 transition-opacity duration-500 ${isSonarActive ? 'opacity-100' : 'opacity-40'}`}>
        <h3 className="text-[10px] font-bold text-steel-400 tracking-widest flex justify-between mb-2">
          <span>YOLOv8 + CBAM VISION (PS2)</span>
          <span className={anomalyDetected ? 'text-[#ff453a] animate-pulse font-bold' : isSonarActive ? 'text-ice-400 animate-pulse' : 'text-[#ebebf57a]'}>
            {anomalyDetected ? 'TARGET LOCKED' : isSonarActive ? 'SCANNING' : 'OFFLINE'}
          </span>
        </h3>
        <div className="relative w-full h-32 bg-[#1c1c1e] rounded overflow-hidden flex items-center justify-center">
          {!isSonarActive ? (
            <span className="text-[#ebebf57a] text-xs font-mono">SONAR INACTIVE</span>
          ) : (
            <div className="w-full h-full relative">
              {/* Klein 3900 High-Frequency Acoustic Waterfall Spectrogram Return */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#1c1c1e] via-[#38383a] to-[#1c1c1e] animate-[pulse_2s_ease-in-out_infinite] opacity-50" />
              {/* Active hydro-acoustic transducer ping sweep line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-ice-500 animate-[scan_2s_linear_infinite]" />
              
              {/* Anomaly Bounding Box */}
              {anomalyDetected && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-[#ff453a] w-12 h-12 bg-[#ff453a]/20">
                  <div className="absolute -top-4 left-0 bg-[#ff453a] text-white text-[8px] font-bold px-1 whitespace-nowrap">
                    GHOST NET 92%
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
