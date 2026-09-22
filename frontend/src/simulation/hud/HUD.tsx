import DepthGauge from './DepthGauge';
import Compass from './Compass';
import TelemetryPanel from './TelemetryPanel';
import { useSimulationStore } from '../store/simulationStore';

export default function HUD() {
  const missionPhase = useSimulationStore((state) => state.missionPhase);
  const missionTimer = useSimulationStore((state) => state.missionTimer);

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-3 text-steel-100 font-mono">
      {/* Mission Info */}
      <div className="flex justify-between items-end border-b border-steel-800/80 pb-2">
        <div className="flex flex-col">
          <div className="text-[10px] text-steel-500 uppercase tracking-wider">Mission Phase</div>
          <div className="text-xs font-bold text-ice-100">{missionPhase.replace('STAGE_', '').replace(/_/g, ' ')}</div>
        </div>
        <div className="flex flex-col text-right">
          <div className="text-[10px] text-steel-500 uppercase tracking-wider">T+</div>
          <div className="text-sm font-bold text-ice-400">{formatTime(missionTimer)}</div>
        </div>
      </div>

      {/* Instruments (Depth & Compass side by side) */}
      <div className="flex justify-between items-center border-b border-steel-800/80 pb-3 px-1 pt-1">
        <DepthGauge />
        <Compass />
      </div>

      {/* Telemetry */}
      <div className="w-full">
        <TelemetryPanel />
      </div>
    </div>
  );
}
