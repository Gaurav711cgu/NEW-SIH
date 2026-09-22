
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
    <div className="flex flex-col gap-6 text-steel-100 font-mono">
      {/* Mission Info */}
      <div className="flex flex-col gap-1 border-b border-steel-800/80 pb-4">
        <div className="text-xs text-steel-400">MISSION PHASE</div>
        <div className="text-lg font-bold text-steel-100">{missionPhase}</div>
        <div className="text-xs text-steel-400 mt-2">ELAPSED TIME</div>
        <div className="text-xl text-steel-100">{formatTime(missionTimer)}</div>
      </div>

      {/* Depth Gauge */}
      <div className="flex justify-center border-b border-steel-800/80 pb-4">
        <DepthGauge />
      </div>

      {/* Compass */}
      <div className="flex justify-center border-b border-steel-800/80 pb-4">
        <Compass />
      </div>

      {/* Telemetry */}
      <div className="w-full">
        <TelemetryPanel />
      </div>
    </div>
  );
}
