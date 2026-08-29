import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Navigation, Thermometer, Wind, Layers } from 'lucide-react';
import { MetricCard } from '../components/ui/MetricCard';
import { DepthProfileChart } from '../charts/DepthProfileChart';
import { TSDiagram } from '../charts/TSDiagram';
import { useMission } from '../components/layout/MissionContext';

export function OceanState() {
  const { depth, commsOnline } = useMission();

  // Compute live physics based on real depth
  const liveTemp = Math.max(1.5, 20 - (depth / 100)); // Drops as we go deeper
  const livePressure = 1013.25 + (depth * 100); // Hydrostatic
  
  // MLD is ~68m. If we are below it, we are in deep water.

  const mockProfile = useMemo(() => {
    const data = [];
    for (let i = 0; i <= 50; i++) {
      const d = i * 40;
      let temp, salinity, soundVelocity;

      if (d < 68) {
        temp = 4.2 + (Math.random() * 0.1 - 0.05);
        salinity = 33.8 + (Math.random() * 0.02 - 0.01);
      } else if (d < 500) {
        temp = 4.2 - ((d - 68) / 432) * 2.5 + (Math.random() * 0.1);
        salinity = 33.8 + ((d - 68) / 432) * 0.4;
      } else {
        temp = 1.7 - ((d - 500) / 1500) * 1.5;
        salinity = 34.2 + ((d - 500) / 1500) * 0.5;
      }

      soundVelocity = 1449.2 + 4.6 * temp - 0.055 * temp * temp + 0.00029 * temp * temp * temp + (1.34 - 0.01 * temp) * (salinity - 35) + 0.016 * d;
      data.push({ depth: d, temp, salinity, soundVelocity });
    }
    return data;
  }, []);

  const timeStr = new Date().toISOString().substring(11, 19);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="space-y-8 pb-10 flex flex-col"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2 py-4 border-b border-steel-800/60">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-ice-500 rounded-full" aria-hidden="true" />
          <div>
            <h1 className="text-xl font-semibold text-ice-100 font-sans tracking-tight">OCEAN STATE</h1>
            <p className="text-xs text-steel-400 font-sans mt-0.5">Physical Environment · Live CTD Stream</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard label="Water Temperature" value={commsOnline ? liveTemp.toFixed(2) : "---"} unit="°C" source="LIVE" icon={<Thermometer size={18} />} depth={`${depth.toFixed(0)}m`} timestamp={timeStr} />
        <MetricCard label="External Pressure" value={commsOnline ? livePressure.toFixed(0) : "---"} unit="hPa" source="LIVE" icon={<Wind size={18} />} depth={`${depth.toFixed(0)}m`} timestamp={timeStr} />
        <MetricCard label="Current Depth" value={commsOnline ? depth.toFixed(1) : "---"} unit="m" source="LIVE" icon={<Navigation size={18} />} timestamp={timeStr} />
        <MetricCard label="Mixed Layer Depth" value="68" unit="m" source="LIVE" icon={<Layers size={18} />} timestamp={timeStr} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[400px]">
        {/* Temperature Depth Profile Plot */}
        <div className="lg:col-span-1 bg-ocean-800/60 backdrop-blur-md border border-white/[0.07] rounded-xl p-6 flex flex-col">
          <h2 className="text-lg font-semibold mb-2 font-sans text-ice-100">Temp Profile</h2>
          <p className="text-sm text-steel-400 mb-6 font-sans">AQUILA Primary CTD Array (QC=1)</p>
          <div className="flex-1 min-h-[300px] relative">
            <DepthProfileChart data={mockProfile} dataKey="temp" color="#00e5ff" title="Temperature" unit="°C" />
            {/* Draw current depth line on the chart to ground the user in reality */}
            <div 
               className="absolute left-0 right-0 border-t border-ice-500/80 border-dashed z-10 transition-all duration-1000"
               style={{ top: `${(depth/2000)*100}%` }}
            >
               <span className="absolute -top-4 right-0 text-[10px] text-ice-500 bg-ocean-950 px-1">ROBOT</span>
            </div>
          </div>
        </div>
        
        {/* T-S Diagram */}
        <div className="lg:col-span-1 bg-ocean-800/60 backdrop-blur-md border border-white/[0.07] rounded-xl p-6 flex flex-col">
          <h2 className="text-lg font-semibold mb-2 font-sans text-ice-100">T-S Diagram</h2>
          <p className="text-sm text-steel-400 mb-6 font-sans">Water Mass Analysis</p>
          <div className="flex-1 min-h-[300px]">
            <TSDiagram data={mockProfile} />
          </div>
        </div>

        {/* Sound Velocity Profile Plot */}
        <div className="lg:col-span-1 bg-ocean-800/60 backdrop-blur-md border border-white/[0.07] rounded-xl p-6 flex flex-col">
          <h2 className="text-lg font-semibold mb-2 font-sans text-ice-100">Sound Velocity</h2>
          <p className="text-sm text-steel-400 mb-6 font-sans">Chen-Millero Equation</p>
          <div className="flex-1 min-h-[300px]">
            <DepthProfileChart data={mockProfile} dataKey="soundVelocity" color="#a78bfa" title="Sound Vel" unit="m/s" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
