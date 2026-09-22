
import { useSimulationStore } from '../store/simulationStore';

export default function TelemetryPanel() {
  const speed = useSimulationStore((state) => state.speed);
  const auvRotation = useSimulationStore((state) => state.auvRotation);
  const temp = useSimulationStore((state) => state.temperature);
  const sal = useSimulationStore((state) => state.salinity);
  const do2 = useSimulationStore((state) => state.dissolvedOxygen);
  const press = useSimulationStore((state) => state.pressure);

  // Convert radians to degrees for display
  const pitch = (auvRotation[0] * 180) / Math.PI;
  const yaw = (auvRotation[1] * 180) / Math.PI;
  const roll = (auvRotation[2] * 180) / Math.PI;

  const TelemetryBox = ({ label, value, unit }: { label: string, value: string, unit: string }) => (
    <div className="flex flex-col items-start bg-[#2c2c2e]/50 px-3 py-2 rounded-md border border-[#38383a] hover:bg-[#38383a] transition-colors cursor-default">
      <span className="text-[10px] text-[#ebebf599] font-semibold">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-bold text-white">{value}</span>
        <span className="text-xs text-[#ebebf57a]">{unit}</span>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-2 mt-2">
      <TelemetryBox label="SPD" value={speed.toFixed(1)} unit="m/s" />
      
      {/* Attitude */}
      <TelemetryBox 
        label="PITCH" 
        value={`${Math.abs(pitch).toFixed(1)}`} 
        unit={pitch >= 0 ? '▲' : '▼'} 
      />
      <TelemetryBox label="ROLL" value={roll.toFixed(1)} unit="°" />
      <TelemetryBox label="YAW" value={yaw.toFixed(1)} unit="°" />
      
      {/* Environment */}
      <TelemetryBox label="TEMP" value={temp.toFixed(2)} unit="°C" />
      <TelemetryBox label="SAL" value={sal.toFixed(1)} unit="ppt" />
      <TelemetryBox label="DO" value={do2.toFixed(1)} unit="mg/L" />
      <TelemetryBox label="PRESS" value={press.toFixed(2)} unit="atm" />
    </div>
  );
}
