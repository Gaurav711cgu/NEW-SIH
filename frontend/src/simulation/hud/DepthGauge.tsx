import { useSimulationStore } from '../store/simulationStore';

export default function DepthGauge() {
  const depth = useSimulationStore((state) => state.depth);
  const targetDepth = useSimulationStore((state) => state.targetDepth);

  const MAX_DEPTH = 200;
  
  const depthPercent = Math.min(100, Math.max(0, (depth / MAX_DEPTH) * 100));
  const targetPercent = Math.min(100, Math.max(0, (targetDepth / MAX_DEPTH) * 100));

  return (
    <div className="flex items-center">
      {/* Scale values */}
      <div className="flex flex-col justify-between h-[80px] text-[8px] text-steel-500 mr-2 py-0.5 font-bold">
        <span>0m</span>
        <span>200m</span>
      </div>

      {/* Bar container */}
      <div className="relative w-3 h-[80px] bg-abyss-900 border border-steel-800/80 rounded-full overflow-hidden">
        
        {/* Fill based on depth */}
        <div 
          className="absolute top-0 w-full bg-abyss-800 transition-all duration-300"
          style={{ height: `${depthPercent}%` }}
        />

        {/* Target Depth Line */}
        <div 
          className="absolute w-full h-px bg-yellow-500 opacity-70 transition-all duration-1000"
          style={{ top: `${targetPercent}%` }}
        />

        {/* Current Depth Indicator */}
        <div 
          className="absolute w-full h-1 bg-ice-400 shadow-[0_0_8px_#38bdf8] transition-all duration-300"
          style={{ top: `${depthPercent}%` }}
        >
          {/* Arrow pointing right */}
          <div className="absolute -left-1.5 -top-[3px] w-0 h-0 border-t-[3px] border-t-transparent border-l-[4px] border-l-ice-400 border-b-[3px] border-b-transparent" />
        </div>
      </div>

      {/* Current Depth Value Text */}
      <div className="ml-3 flex flex-col justify-center">
        <span className="text-[10px] text-steel-400 tracking-wider">DEPTH</span>
        <span className="text-sm font-bold text-ice-100 font-mono">{depth.toFixed(1)}m</span>
        <span className="text-[9px] text-yellow-500 mt-0.5 font-mono">TGT: {targetDepth.toFixed(0)}m</span>
      </div>
    </div>
  );
}
