import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklineCard } from '../components/ui/SparklineCard';
import { DepthProfileChart } from '../charts/DepthProfileChart';
import { useMission } from '../components/layout/MissionContext';

export function Biogeochemistry() {
  const { depth, commsOnline } = useMission();

  // Keep a history of readings to feed the SparklineCards
  const [history, setHistory] = useState(() => Array.from({ length: 30 }, () => ({
    doxy: 214, chla: 1.05, ph: 8.04, nitrate: 15.2
  })));

  useEffect(() => {
    // Generate current readings based on actual depth
    const currentDoxy = 214 - (depth / 2000) * 50 + (Math.random() * 2);
    
    // DCM (Deep Chlorophyll Maximum) is around 75m
    let currentChla = 0.1;
    if (depth > 20 && depth < 150) {
      currentChla += 1.2 * Math.exp(-Math.pow(depth - 75, 2) / 800);
    }
    currentChla += Math.random() * 0.05;

    const currentPh = 8.04 - (depth / 2000) * 0.2 + (Math.random() * 0.01);
    const currentNitrate = 15.2 + (depth / 2000) * 20 + (Math.random() * 0.5);

    if (commsOnline) {
      setHistory(prev => [...prev.slice(1), {
        doxy: currentDoxy,
        chla: currentChla,
        ph: currentPh,
        nitrate: currentNitrate
      }]);
    }
  }, [depth, commsOnline]);

  const bgcProfile = useMemo(() => {
    const data = [];
    for (let i = 0; i <= 50; i++) {
      const d = i * 40;
      let doxy = 214 - (d / 2000) * 50;
      let chla = 0.1;
      if (d > 20 && d < 150) {
        chla += 1.2 * Math.exp(-Math.pow(d - 75, 2) / 800);
      }
      data.push({ depth: d, doxy, chla });
    }
    return data;
  }, []);

  const latest = history[history.length - 1];
  // Degradation occurs below 50m for fluorometer
  const isChlaDegraded = depth > 50 && commsOnline;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="space-y-6 pb-10 flex flex-col"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2 py-4 border-b border-steel-800/60">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-ice-500 rounded-full" aria-hidden="true" />
          <div>
            <h1 className="text-xl font-semibold text-ice-100 font-sans tracking-tight">BIOGEOCHEMISTRY</h1>
            <p className="text-xs text-steel-400 font-sans mt-0.5">Biogeochemical Telemetry · Live Feed</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-bold uppercase tracking-wider border bg-emerald-500/20 border-emerald-400/40 text-emerald-400">
            CO₂ UPTAKE
          </span>
          <div className="bg-ocean-800/60 backdrop-blur-md border border-white/[0.07] px-4 py-1.5 rounded-lg flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-steel-400 font-sans">Surface pCO₂</span>
            <span className="text-sm font-mono font-bold text-ice-100">~385 µatm</span>
          </div>
        </div>
      </header>
      
      <div aria-live="assertive">
        <AnimatePresence>
          {isChlaDegraded && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-amber-400/10 border border-amber-400/40 rounded-lg p-3 flex items-center gap-3 mb-2"
            >
              <span className="text-amber-400 font-bold font-mono">⚠</span>
              <p className="text-sm font-sans text-ice-100">
                Fluorometer signal degrading in deep water · <span className="font-mono text-steel-400 text-xs">Calibration warning</span>
              </p>
            </motion.div>
          )}
          {!commsOnline && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-health-degraded/10 border border-health-degraded/40 rounded-lg p-3 flex items-center gap-3 mb-2"
            >
              <span className="text-health-degraded font-bold font-mono">⚠</span>
              <p className="text-sm font-sans text-ice-100">
                Acoustic modem disconnected. Caching BGC data internally.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <SparklineCard 
          label="Dissolved Oxygen (DOXY)" 
          value={commsOnline ? latest.doxy.toFixed(1) : "---"} 
          unit="µmol/kg" 
          source="LIVE" 
          data={history} 
          dataKey="doxy" 
          color="#00e5ff" 
        />
        <SparklineCard 
          label="Chlorophyll-a (CHLA)" 
          value={commsOnline ? latest.chla.toFixed(2) : "---"} 
          unit="mg/m³" 
          source="LIVE" 
          status={isChlaDegraded ? 'dropout' : 'nominal'}
          data={history} 
          dataKey="chla" 
          color="#34d399" 
        />
        <SparklineCard 
          label="pH" 
          value={commsOnline ? latest.ph.toFixed(3) : "---"} 
          unit="pH" 
          source="LIVE" 
          data={history} 
          dataKey="ph" 
          color="#a78bfa" 
        />
        <SparklineCard 
          label="Nitrate" 
          value={commsOnline ? latest.nitrate.toFixed(1) : "---"} 
          unit="µmol/L" 
          source="LIVE" 
          data={history} 
          dataKey="nitrate" 
          color="#00e5ff" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[400px]">
        {/* DO Depth Profile */}
        <div className="bg-ocean-800/60 backdrop-blur-md border border-white/[0.07] rounded-xl p-6 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-lg font-semibold mb-1 font-sans text-ice-100">DOXY Profile</h2>
              <p className="text-sm text-steel-400 font-sans">Dissolved Oxygen vs Depth</p>
            </div>
          </div>
          <div className="flex-1 min-h-[300px] relative">
            <DepthProfileChart data={bgcProfile} dataKey="doxy" color="#00e5ff" title="DOXY" unit="µmol/kg" />
            <div 
               className="absolute left-0 right-0 border-t border-ice-500/80 border-dashed z-10 transition-all duration-1000"
               style={{ top: `${(depth/2000)*100}%` }}
            >
               <span className="absolute -top-4 right-0 text-[10px] text-ice-500 bg-ocean-950 px-1">ROBOT</span>
            </div>
          </div>
        </div>
        
        {/* CHLA Depth Profile */}
        <div className="bg-ocean-800/60 backdrop-blur-md border border-white/[0.07] rounded-xl p-6 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-lg font-semibold mb-1 font-sans text-ice-100">CHLA Profile</h2>
              <p className="text-sm text-steel-400 font-sans">Chlorophyll-a vs Depth</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-bold uppercase tracking-wider border bg-emerald-500/20 border-emerald-400/40 text-emerald-400">
              DCM: ~75m
            </span>
          </div>
          <div className="flex-1 min-h-[300px] relative">
            <DepthProfileChart data={bgcProfile} dataKey="chla" color="#34d399" title="CHLA" unit="mg/m³" />
            <div 
               className="absolute left-0 right-0 border-t border-ice-500/80 border-dashed z-10 transition-all duration-1000"
               style={{ top: `${(depth/2000)*100}%` }}
            >
               <span className="absolute -top-4 right-0 text-[10px] text-ice-500 bg-ocean-950 px-1">ROBOT</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
