import { useSimulationStore } from '../store/simulationStore';
import { useEffect, useState } from 'react';

export default function SubsystemHealthMatrix() {
  const depth = useSimulationStore((state) => state.depth);
  const batteryPercent = useSimulationStore((state) => state.batteryPercent);
  
  // Compute hydrostatic pressure stress profile (EOS-80 depth transfer function)
  const [health, setHealth] = useState({
    ctd: 96,
    sonar: 100,
    mcu: 100,
    gps: 100,
    lights: 100
  });

  useEffect(() => {
    // As depth increases past 50m, systems experience hydro-acoustic and pressure dampening
    const depthStress = Math.max(0, (depth - 50) / 150); // 0 to 1
    
    setHealth({
      ctd: Math.max(45, 96 - (depthStress * 30) - (Math.random() * 2)),
      sonar: Math.max(80, 100 - (depthStress * 10)),
      mcu: 98,
      gps: depth > 5 ? 0 : 100, // GPS dies underwater
      lights: Math.max(60, 100 - (depthStress * 15)),
    });
  }, [depth]);

  const systems = [
    { name: 'CTD', value: health.ctd },
    { name: 'Sonar', value: health.sonar },
    { name: 'Battery', value: batteryPercent },
    { name: 'MCU', value: health.mcu },
    { name: 'GPS', value: health.gps },
    { name: 'Lights', value: health.lights },
  ];

  const getColor = (val: number) => {
    if (val > 75) return 'bg-[#00ff88] shadow-[0_0_8px_rgba(0,255,136,0.6)]';
    if (val > 30) return 'bg-[#ffcc00] shadow-[0_0_8px_rgba(255,204,0,0.6)]';
    return 'bg-[#ff3333] shadow-[0_0_8px_rgba(255,51,51,0.6)]';
  };

  return (
    <div className="bg-abyss-900/80 backdrop-blur-xl border border-steel-800/80 rounded-2xl p-5 shadow-2xl pointer-events-auto shrink-0 mt-4">
      <h3 className="text-[10px] font-bold text-steel-400 tracking-wider mb-4 uppercase">Subsystem Health Matrix</h3>
      <div className="space-y-2.5">
        {systems.map((sys) => (
          <div key={sys.name} className="flex items-center gap-3">
            <span className="text-[9px] font-mono text-steel-400 w-12 text-right">{sys.name}</span>
            <div className="flex-1 h-2 bg-abyss-950 border border-steel-800/50 rounded-sm overflow-hidden flex">
              <div 
                className={`h-full transition-all duration-500 ${getColor(sys.value)}`} 
                style={{ width: `${Math.max(0, sys.value)}%` }} 
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
