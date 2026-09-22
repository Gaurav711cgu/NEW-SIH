import { useSimulationStore } from '../store/simulationStore';

export default function TelemetryPanel() {
  const speed = useSimulationStore((state) => state.speed);
  const auvRotation = useSimulationStore((state) => state.auvRotation);
  const temp = useSimulationStore((state) => state.temperature);
  const sal = useSimulationStore((state) => state.salinity);
  const do2 = useSimulationStore((state) => state.dissolvedOxygen);
  const press = useSimulationStore((state) => state.pressure);
  const powerMode = useSimulationStore((state) => state.powerMode);
  const currentAssist = useSimulationStore((state) => state.currentAssist);
  const powerDraw = useSimulationStore((state) => state.powerDraw);

  // Convert radians to degrees for display
  const pitch = (auvRotation[0] * 180) / Math.PI;
  const yaw = (auvRotation[1] * 180) / Math.PI;
  const roll = (auvRotation[2] * 180) / Math.PI;

  const TelemetryRow = ({ label, value, unit }: { label: string, value: string | number, unit: string }) => (
    <div className="flex justify-between items-center py-0.5">
      <span className="text-[11px] text-steel-400 uppercase tracking-wider">{label}:</span>
      <div className="flex items-baseline gap-2">
        <span className="text-xs font-bold text-ice-100 font-mono text-right min-w-[40px]">{value}</span>
        <span className="text-[10px] text-steel-500 w-8">{unit}</span>
      </div>
    </div>
  );

  return (
    <div className="w-full flex flex-col gap-4 mt-2">
      <div>
        <h4 className="text-[10px] font-bold text-ice-500 tracking-wider mb-2 uppercase">Vehicle Dynamics</h4>
        <div className="flex flex-col">
          <TelemetryRow label="SPD" value={speed.toFixed(1)} unit="m/s" />
          <TelemetryRow label="PITCH" value={Math.abs(pitch).toFixed(1)} unit={pitch >= 0 ? '▲' : '▼'} />
          <TelemetryRow label="ROLL" value={roll.toFixed(1)} unit="°" />
          <TelemetryRow label="YAW" value={yaw.toFixed(1)} unit="°" />
        </div>
      </div>

      <div>
        <h4 className="text-[10px] font-bold text-ice-500 tracking-wider mb-2 uppercase mt-1">Power Management</h4>
        <div className="flex flex-col">
          <TelemetryRow label="MODE" value={powerMode === 'ECO_GLIDE' ? 'GLIDE' : 'ACTIVE'} unit="" />
          <TelemetryRow label="ASSIST" value={`+${currentAssist.toFixed(1)}`} unit="m/s" />
          <TelemetryRow label="PWR" value={(powerMode === 'ECO_GLIDE' ? powerDraw * 0.2 : powerDraw).toFixed(1)} unit="kW" />
        </div>
      </div>

      <div>
        <h4 className="text-[10px] font-bold text-ice-500 tracking-wider mb-2 uppercase mt-1">Ocean State</h4>
        <div className="flex flex-col">
          <TelemetryRow label="TEMP" value={temp.toFixed(2)} unit="°C" />
          <TelemetryRow label="SALIN" value={sal.toFixed(1)} unit="PSU" />
          <TelemetryRow label="DOXY" value={do2.toFixed(1)} unit="mg/L" />
          <TelemetryRow label="PRESS" value={press.toFixed(2)} unit="atm" />
        </div>
      </div>
    </div>
  );
}
