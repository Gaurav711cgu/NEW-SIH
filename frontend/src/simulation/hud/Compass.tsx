
import { useSimulationStore } from '../store/simulationStore';
import { motion } from 'framer-motion';

export default function Compass() {
  const heading = useSimulationStore((state) => state.heading);

  return (
    <div className="flex flex-col items-center bg-black/60 p-4 border border-cyan-500/20 rounded-lg backdrop-blur-sm">
      <div className="relative w-[80px] h-[80px] rounded-full border-2 border-cyan-500/40 flex items-center justify-center bg-black/40">
        
        {/* Fixed Outer Markings (N, S, E, W) */}
        <div className="absolute inset-0 flex items-center justify-center font-bold text-xs">
          <span className="absolute top-1 text-cyan-200">N</span>
          <span className="absolute bottom-1 text-cyan-700">S</span>
          <span className="absolute right-1 text-cyan-700">E</span>
          <span className="absolute left-1 text-cyan-700">W</span>
        </div>

        {/* Rotating Inner Dial */}
        <motion.div 
          className="absolute inset-0 rounded-full border-4 border-t-cyan-400 border-r-transparent border-b-transparent border-l-transparent"
          animate={{ rotate: heading }}
          transition={{ type: 'tween', ease: 'linear', duration: 0.2 }}
        />
        
        {/* Center Dot */}
        <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_5px_#00e5ff]" />
      </div>

      <div className="mt-3 text-sm font-bold text-cyan-400">
        HDG: {heading.toFixed(0).padStart(3, '0')}°
      </div>
    </div>
  );
}
