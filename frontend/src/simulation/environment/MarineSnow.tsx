import { Sparkles } from '@react-three/drei';
import { useSimulationStore } from '../store/simulationStore';

export default function MarineSnow() {
  const currentAssist = useSimulationStore((s) => s.currentAssist);
  const auvPosition = useSimulationStore((s) => s.auvPosition);

  // Organic particulate drift responding to ocean current assist
  const columnSpeed = 0.25 + (currentAssist * 1.6);
  const localSpeed = 0.35 + (currentAssist * 2.2);

  return (
    <group>
      {/* ── 1. Full Water Column Particulate (Surface Y=0m down to Seabed Y=-145m) ── */}
      {/* Centered at Y=-72.5 with height 160m (spans Y = +7.5m down to -152.5m) */}
      <Sparkles
        count={3500}
        position={[0, -72.5, 0]}
        scale={[180, 160, 180]}
        size={0.8}
        speed={columnSpeed}
        opacity={0.38}
        color="#88aacc"
        noise={[15, 8, 15]}
      />

      {/* ── 2. Localized Near-Field Particulates (Tracks AUV & Submersible Headlights) ── */}
      {/* Creates dense, flocculent organic marine snow drifting past vehicle viewport */}
      <Sparkles
        count={1500}
        position={[auvPosition[0], auvPosition[1], auvPosition[2]]}
        scale={[45, 30, 45]}
        size={1.1}
        speed={localSpeed}
        opacity={0.46}
        color="#88aacc"
        noise={[10, 5, 10]}
      />
    </group>
  );
}
