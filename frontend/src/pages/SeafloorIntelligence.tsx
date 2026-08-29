import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Download, Map } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { SonarCanvas } from '../components/ui/SonarCanvas';
import { useMission } from '../components/layout/MissionContext';

export function SeafloorIntelligence() {
  const { depth, phase, commsOnline, uptime } = useMission();
  const [preprocessing, setPreprocessing] = useState(true);
  
  const isSurvey = phase === 'SURVEY';

  const detections = [
    { id: 1, type: 'HYDROTHERMAL_VENT', lat: -62.153, lon: 170.21, conf: 0.94, depth: 1000 },
    { id: 2, type: 'COLD_SEEP', lat: -62.155, lon: 170.22, conf: 0.88, depth: 1002 },
  ];

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(detections, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "aquila_detections.json");
    dlAnchorElem.click();
  };

  const handleDownloadCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "id,type,lat,lon,conf,depth\n"
      + detections.map(d => `${d.id},${d.type},${d.lat},${d.lon},${d.conf},${d.depth}`).join("\n");
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", csvContent);
    dlAnchorElem.setAttribute("download", "aquila_detections.csv");
    dlAnchorElem.click();
  };

  const CustomTooltip = ({ active, payload }: { active?: boolean, payload?: any }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-ocean-950/90 border border-ice-500/30 p-3 rounded-lg shadow-xl backdrop-blur-md font-sans text-xs">
          <p className="font-bold text-ice-100 mb-1">{data.type.replace('_', ' ')}</p>
          <p className="text-steel-400 font-mono">Conf: {(data.conf * 100).toFixed(1)}%</p>
          <p className="text-steel-400 font-mono">Depth: {data.depth}m</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="space-y-6 pb-10 flex flex-col h-full"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2 py-4 border-b border-steel-800/60">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-ice-500 rounded-full" aria-hidden="true" />
          <div>
            <h1 className="text-xl font-semibold text-ice-100 font-sans tracking-tight">SEAFLOOR INTELLIGENCE</h1>
            <p className="text-xs text-steel-400 font-sans mt-0.5">High-Res Acoustic Imaging & Benthic Target Recognition</p>
          </div>
        </div>
        
        <div className="flex gap-2">
           <button onClick={handleDownloadCSV} className="flex items-center gap-2 px-4 py-2 bg-ocean-800/80 hover:bg-ocean-700 text-ice-100 text-xs font-mono font-bold tracking-wider rounded-lg border border-steel-700 transition-colors">
              <Download size={14} /> CSV
           </button>
           <button onClick={handleDownloadJSON} className="flex items-center gap-2 px-4 py-2 bg-ocean-800/80 hover:bg-ocean-700 text-ice-100 text-xs font-mono font-bold tracking-wider rounded-lg border border-steel-700 transition-colors">
              <Download size={14} /> JSON
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sonar Waterfall View */}
        <div className="lg:col-span-2 bg-ocean-800/60 backdrop-blur-md border border-white/[0.07] rounded-xl p-6 flex flex-col min-h-[500px]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-steel-400">Side-Scan Sonar Feed</h2>
              <p className="text-xs text-steel-500 font-mono mt-1">FREQ: 900kHz | RANGE: 50m</p>
            </div>
            
            <div className="flex items-center gap-4">
               <button 
                  onClick={() => setPreprocessing(!preprocessing)}
                  className={`px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider border rounded ${preprocessing ? 'bg-ice-500/20 border-ice-500/40 text-ice-400' : 'bg-steel-800 border-steel-700 text-steel-500'}`}
               >
                  AI Enhance {preprocessing ? 'ON' : 'OFF'}
               </button>
               <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-bold uppercase tracking-wider border ${isSurvey ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-400' : 'bg-steel-800/50 border-steel-700/50 text-steel-500'}`}>
                 <span className={`w-2 h-2 rounded-full ${isSurvey ? 'bg-emerald-400 animate-pulse' : 'bg-steel-600'}`} />
                 {isSurvey ? 'SCANNING' : 'STANDBY (DESCENT)'}
               </span>
            </div>
          </div>
          
          <div className="flex-1 rounded-lg border border-steel-800/80 overflow-hidden relative bg-[#050b14]">
             {!isSurvey && (
                <div className="absolute inset-0 z-10 bg-ocean-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-steel-400 font-mono text-sm">
                   <Target size={32} className="mb-4 opacity-50" />
                   <p>SONAR OFFLINE</p>
                   <p className="text-xs opacity-50 mt-1">Awaiting Survey Depth (1000m). Current: {depth.toFixed(0)}m</p>
                </div>
             )}
             <SonarCanvas 
                 detections={commsOnline && isSurvey ? [
                   { id: "TGT-01", type: "VENT", x: 60, y: 30, w: 10, h: 10, rawScore: 0.9, shadowPenalty: 0 },
                   { id: "TGT-02", type: "SEEP", x: 20, y: 70, w: 15, h: 5, rawScore: 0.8, shadowPenalty: 2 }
                 ] : []}
                 pingCount={uptime}
                 processed={preprocessing}
                 showShadows={true}
              />
          </div>
        </div>

        <div className="flex flex-col gap-6">
           {/* Geomap */}
           <div className="bg-ocean-800/60 backdrop-blur-md border border-white/[0.07] rounded-xl p-6 flex-1 min-h-[300px] flex flex-col">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-steel-400 mb-4 flex items-center gap-2"><Map size={16}/> Target Geomap</h2>
              <div className="flex-1 w-full bg-ocean-900/50 rounded-lg border border-steel-800/50 p-2">
                 <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a3b5c" />
                    <XAxis type="number" dataKey="lon" domain={['dataMin - 0.05', 'dataMax + 0.05']} stroke="#64748b" tick={{fontSize: 10}} tickFormatter={(v) => v.toFixed(2)} />
                    <YAxis type="number" dataKey="lat" domain={['dataMin - 0.05', 'dataMax + 0.05']} stroke="#64748b" tick={{fontSize: 10}} tickFormatter={(v) => v.toFixed(2)} />
                    <Tooltip content={<CustomTooltip />} />
                    <Scatter name="Detections" data={commsOnline ? detections : []} fill="#00e5ff" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* Detections Panel */}
           <div className="bg-ocean-800/60 backdrop-blur-md border border-white/[0.07] rounded-xl p-6 flex-1">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-steel-400">Target Detections</h2>
                <span className="bg-ice-500/20 text-ice-500 text-[10px] px-2 py-0.5 rounded font-mono border border-ice-500/30">LIVE</span>
             </div>
             
             {!commsOnline ? (
                <div className="text-center py-8 text-sm font-mono text-health-degraded animate-pulse">
                   AWAITING ACOUSTIC SYNC...
                </div>
             ) : (
                <div className="space-y-3">
                  {detections.map(d => (
                    <div key={d.id} className="p-3 bg-ocean-900/50 border border-steel-800/50 rounded-lg flex flex-col gap-2">
                       <div className="flex justify-between items-start">
                          <span className="text-xs font-bold text-ice-100">{d.type.replace('_', ' ')}</span>
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-1.5 rounded">{d.conf * 100}%</span>
                       </div>
                       <div className="flex justify-between items-center text-[10px] font-mono text-steel-400">
                          <span>LAT: {d.lat} | LON: {d.lon}</span>
                          <span>{d.depth}m</span>
                       </div>
                    </div>
                  ))}
                </div>
             )}
           </div>
        </div>

      </div>
    </motion.div>
  );
}
