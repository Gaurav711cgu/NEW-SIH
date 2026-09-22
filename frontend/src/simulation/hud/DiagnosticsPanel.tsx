
import { useSimulationStore } from '../store/simulationStore';
import { Battery, Wifi } from 'lucide-react';

export default function DiagnosticsPanel() {
  const bat = useSimulationStore((state) => state.batteryPercent);
  const thrusters = useSimulationStore((state) => state.thrusters);
  const components = useSimulationStore((state) => state.components);
  const iridiumLink = useSimulationStore((state) => state.iridiumLink);
  const endurance = useSimulationStore((state) => state.estimatedEndurance);
  const power = useSimulationStore((state) => state.powerDraw);

  const batColor = bat > 60 ? 'bg-green-500' : bat > 30 ? 'bg-yellow-500' : 'bg-red-500';
  const batTextColor = bat > 60 ? 'text-green-400' : bat > 30 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="w-[240px] bg-black/60 p-3 border border-cyan-500/20 rounded-lg backdrop-blur-sm flex flex-col gap-3 text-xs">
      
      {/* Power */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Battery size={14} className={batTextColor} />
          <span className="text-cyan-200">BAT</span>
        </div>
        <div className="flex items-center gap-2 w-32">
          <div className="flex-1 h-2 bg-gray-800 rounded overflow-hidden">
            <div className={`h-full ${batColor} transition-all duration-500`} style={{ width: `${bat}%` }} />
          </div>
          <span className={batTextColor + " font-bold"}>{bat.toFixed(0)}%</span>
        </div>
      </div>

      {/* Thrusters */}
      <div className="flex justify-between items-center">
        <span className="text-cyan-200">THRUSTERS</span>
        <div className="flex gap-1">
          {thrusters.map((t) => (
            <div 
              key={t.id} 
              className={`w-3 h-3 rounded-sm ${t.online ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}
              title={t.name}
            />
          ))}
        </div>
      </div>

      {/* Sensors / Components Health */}
      <div className="flex justify-between items-center">
        <span className="text-cyan-200">SENSORS</span>
        <div className="flex gap-1">
          {components.map((c) => {
            const color = c.status === 'NOMINAL' ? 'bg-green-500' : c.status === 'WARNING' ? 'bg-yellow-500' : 'bg-red-500 animate-pulse';
            return (
              <div key={c.id} className={`w-2 h-2 rounded-full ${color}`} title={`${c.name}: ${c.status}`} />
            );
          })}
        </div>
      </div>

      {/* Stats Line */}
      <div className="grid grid-cols-2 gap-2 mt-1 pt-2 border-t border-cyan-500/20">
        <div className="flex flex-col">
          <span className="text-cyan-600 text-[10px]">ENDURANCE</span>
          <span className="text-cyan-300 font-bold">{endurance.toFixed(1)} hrs</span>
        </div>
        <div className="flex flex-col">
          <span className="text-cyan-600 text-[10px]">PWR DRAW</span>
          <span className="text-cyan-300 font-bold">{power.toFixed(0)} W</span>
        </div>
      </div>

      {/* Comms */}
      <div className="flex justify-between items-center bg-cyan-950/50 p-1.5 rounded">
        <div className="flex items-center gap-2">
          <Wifi size={12} className={iridiumLink ? "text-green-400" : "text-red-400"} />
          <span className="text-[10px] text-cyan-200">SATCOM LINK</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-cyan-400">{iridiumLink ? 'CONNECTED' : 'OFFLINE'}</span>
          <div className={`w-2 h-2 rounded-full ${iridiumLink ? 'bg-green-500 shadow-[0_0_4px_#00ff88]' : 'bg-red-500'}`} />
        </div>
      </div>

    </div>
  );
}
