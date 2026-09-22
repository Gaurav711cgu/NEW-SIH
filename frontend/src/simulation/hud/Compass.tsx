import { useSimulationStore } from '../store/simulationStore';
import { motion } from 'framer-motion';

export default function Compass() {
  const heading = useSimulationStore((state) => state.heading);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-[60px] h-[60px] rounded-full border-2 border-steel-700 flex items-center justify-center bg-[#020617]">
        
        {/* Fixed Outer Markings (N, S, E, W) */}
        <div className="absolute inset-0 flex items-center justify-center font-bold text-[9px]">
          <span className="absolute top-0.5 text-steel-400">N</span>
          <span className="absolute bottom-0.5 text-steel-600">S</span>
          <span className="absolute right-0.5 text-steel-600">E</span>
          <span className="absolute left-0.5 text-steel-600">W</span>
        </div>

        {/* Rotating Inner Dial */}
        <motion.div 
          className="absolute inset-0 rounded-full border-2 border-t-ice-400 border-r-transparent border-b-transparent border-l-transparent"
          animate={{ rotate: heading }}
          transition={{ type: 'tween', ease: 'linear', duration: 0.2 }}
        />
        
        {/* Center Dot */}
        <div className="w-1.5 h-1.5 rounded-full bg-ice-400 shadow-[0_0_4px_#38bdf8]" />
      </div>

      <div className="mt-2 text-[10px] font-bold text-ice-400 tracking-wider">
        HDG: {heading.toFixed(0).padStart(3, '0')}°
      </div>
    </div>
  );
}
