
import { useSimulationStore } from '../store/simulationStore';

export default function DepthGauge() {
  const depth = useSimulationStore((state) => state.depth);
  const targetDepth = useSimulationStore((state) => state.targetDepth);

  const MAX_DEPTH = 200;
  
  // Calculate percentage down the bar (0m at top, 200m at bottom)
  const depthPercent = Math.min(100, Math.max(0, (depth / MAX_DEPTH) * 100));
  const targetPercent = Math.min(100, Math.max(0, (targetDepth / MAX_DEPTH) * 100));

  return (
    <div className="flex items-center bg-black/40 backdrop-blur-sm p-3 rounded-xl border border-cyan-500/20">
      {/* Scale values */}
      <div className="flex flex-col justify-between h-[120px] text-[10px] text-cyan-600 mr-3 py-1 font-bold">
        <span>0m</span>
        <span>50m</span>
        <span>100m</span>
        <span>150m</span>
        <span>200m</span>
      </div>

      {/* Bar container */}
      <div className="relative w-6 h-[120px] bg-gradient-to-b from-blue-900/50 to-black/90 border border-cyan-500/40 rounded-full overflow-hidden">
        
        {/* Fill based on depth */}
        <div 
          className="absolute top-0 w-full bg-cyan-900/40 transition-all duration-300"
          style={{ height: `${depthPercent}%` }}
        />

        {/* Target Depth Line */}
        <div 
          className="absolute w-full h-0.5 border-t-2 border-dashed border-yellow-400 opacity-70 transition-all duration-1000"
          style={{ top: `${targetPercent}%` }}
        />

        {/* Current Depth Indicator */}
        <div 
          className="absolute w-full h-1 bg-cyan-400 shadow-[0_0_8px_#00e5ff] transition-all duration-300"
          style={{ top: `${depthPercent}%` }}
        >
          {/* Arrow pointing right */}
          <div className="absolute -left-2 -top-1.5 w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] border-l-cyan-400 border-b-[4px] border-b-transparent" />
        </div>
      </div>

      {/* Current Depth Value Text */}
      <div className="ml-3 flex flex-col bg-black/60 px-3 py-2 border border-cyan-500/20 rounded">
        <span className="text-xs text-cyan-200">DEPTH</span>
        <span className="text-2xl font-bold text-cyan-400 shadow-cyan-400/50">{depth.toFixed(1)}m</span>
        <span className="text-xs text-yellow-500 mt-1">TGT: {targetDepth.toFixed(0)}m</span>
      </div>
    </div>
  );
}
