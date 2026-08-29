import { useMission } from './MissionContext';

export function SystemStatusRow() {
  const { commsOnline, depth, uptime, phase } = useMission();

  const formatUptime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="mt-auto p-4 border-t border-steel-800/60 hidden md:flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-steel-500 font-sans font-semibold">Acoustic Link</span>
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${commsOnline ? 'bg-health-nominal animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-health-degraded animate-pulse'}`} />
          <span className={`text-[10px] font-mono font-bold ${commsOnline ? 'text-health-nominal' : 'text-health-degraded'}`}>{commsOnline ? 'OK' : 'FAIL'}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-steel-500 font-sans font-semibold">Target Depth</span>
        <span className="text-[10px] font-mono font-bold text-ice-400">{depth.toFixed(1)}m</span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-steel-500 font-sans font-semibold">Phase</span>
        <span className="text-[10px] font-mono font-bold text-amber-400">{phase}</span>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-steel-500 font-sans font-semibold">Mission Time</span>
        <span className="text-[10px] font-mono text-steel-300">T+{formatUptime(uptime)}</span>
      </div>
    </div>
  );
}
