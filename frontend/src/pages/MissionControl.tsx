import { motion } from 'framer-motion';
import { Activity, Battery, Database, Cpu, Thermometer, Gauge } from 'lucide-react';
import { useMission } from '../components/layout/MissionContext';

export function MissionControl() {
  const { 
    depth, phase, battery, uptime, 
    internalTemp, hullPressure, powerDraw, cpuLoad, 
    commsOnline, logs, cacheSize 
  } = useMission();


  const formatUptime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

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
            <h1 className="text-xl font-semibold text-ice-100 font-sans tracking-tight">MISSION CONTROL</h1>
            <p className="text-xs text-steel-400 font-sans mt-0.5">Internal Telemetry & Operational Matrix</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-ocean-800/60 backdrop-blur-md border border-white/[0.07] px-4 py-2 rounded-lg">
          <Battery className={`w-4 h-4 ${battery < 20 ? 'text-health-degraded animate-pulse' : 'text-ice-500'}`} />
          <div className="w-32 h-2 bg-ocean-950 rounded-full overflow-hidden">
            <div className={`h-full transition-all ${battery < 20 ? 'bg-health-degraded' : 'bg-ice-500'}`} style={{ width: `${battery}%` }} />
          </div>
          <span className="text-sm font-mono text-ice-100">{battery.toFixed(1)}%</span>
        </div>
      </header>

      {/* Internal Telemetry Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-ocean-800/60 backdrop-blur-md border border-white/[0.07] rounded-xl p-4 flex items-center justify-between">
          <div>
             <p className="text-[10px] uppercase tracking-wider text-steel-400 font-sans mb-1">Hull Pressure</p>
             <p className={`text-xl font-bold font-mono ${hullPressure > 1.5 ? 'text-health-degraded animate-pulse' : 'text-ice-100'}`}>{hullPressure.toFixed(3)} <span className="text-xs font-sans text-steel-400">atm</span></p>
          </div>
          <Gauge className={`w-6 h-6 ${hullPressure > 1.5 ? 'text-health-degraded' : 'text-steel-600'}`} />
        </div>
        <div className="bg-ocean-800/60 backdrop-blur-md border border-white/[0.07] rounded-xl p-4 flex items-center justify-between">
          <div>
             <p className="text-[10px] uppercase tracking-wider text-steel-400 font-sans mb-1">Internal Temp</p>
             <p className={`text-xl font-bold font-mono ${internalTemp > 45 ? 'text-amber-400' : 'text-ice-100'}`}>{internalTemp.toFixed(1)} <span className="text-xs font-sans text-steel-400">°C</span></p>
          </div>
          <Thermometer className="w-6 h-6 text-steel-600" />
        </div>
        <div className="bg-ocean-800/60 backdrop-blur-md border border-white/[0.07] rounded-xl p-4 flex items-center justify-between">
          <div>
             <p className="text-[10px] uppercase tracking-wider text-steel-400 font-sans mb-1">Power Draw</p>
             <p className="text-xl font-bold font-mono text-ice-100">{powerDraw.toFixed(1)} <span className="text-xs font-sans text-steel-400">W</span></p>
          </div>
          <Activity className="w-6 h-6 text-steel-600" />
        </div>
        <div className="bg-ocean-800/60 backdrop-blur-md border border-white/[0.07] rounded-xl p-4 flex items-center justify-between">
          <div>
             <p className="text-[10px] uppercase tracking-wider text-steel-400 font-sans mb-1">CPU Load</p>
             <p className="text-xl font-bold font-mono text-ice-100">{cpuLoad.toFixed(1)} <span className="text-xs font-sans text-steel-400">%</span></p>
          </div>
          <Cpu className="w-6 h-6 text-steel-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Sensor Health Matrix */}
        <div className="bg-ocean-800/60 backdrop-blur-md border border-white/[0.07] rounded-xl p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-steel-400 mb-4">Payload Health Matrix</h2>
          <div className="space-y-3">
            {[
              { name: 'CTD Array', status: 'ONLINE', color: 'bg-health-nominal text-health-nominal' },
              { name: 'IMU', status: 'ONLINE', color: 'bg-health-nominal text-health-nominal' },
              { name: 'Fluorometer', status: depth > 50 ? 'ONLINE' : 'DEGRADED', color: depth > 50 ? 'bg-health-nominal text-health-nominal' : 'bg-amber-400 text-amber-400' },
              { name: 'Sonar', status: phase === 'SURVEY' ? 'SCANNING' : 'STANDBY', color: phase === 'SURVEY' ? 'bg-ice-500 text-ice-500' : 'bg-steel-500 text-steel-400' },
              { name: 'Acoustic Modem', status: commsOnline ? 'ONLINE' : 'DROPOUT', color: commsOnline ? 'bg-health-nominal text-health-nominal' : 'bg-health-degraded text-health-degraded' },
            ].map(sensor => (
              <div key={sensor.name} className="flex justify-between items-center text-xs font-mono border-b border-steel-800/50 pb-2 last:border-0">
                <span className="text-ice-100">{sensor.name}</span>
                <div className="flex items-center gap-2 w-32 justify-end">
                  <span className={sensor.color.split(' ')[1]}>{sensor.status}</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${sensor.color.split(' ')[0]} ${sensor.status === 'SCANNING' ? 'animate-pulse' : ''}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* MQTT & Offline Sync */}
          <div className={`bg-ocean-800/60 backdrop-blur-md border rounded-xl p-6 relative overflow-hidden transition-all duration-300 ${commsOnline ? 'border-health-nominal/40' : 'border-health-degraded/60'}`}>
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-steel-400">Acoustic Uplink</h2>
              <div className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-mono font-semibold uppercase tracking-wider border ${commsOnline ? 'bg-health-nominal/10 border-health-nominal/40 text-health-nominal' : 'bg-health-degraded/10 border-health-degraded/40 text-health-degraded'}`}>
                <span className={`w-2 h-2 rounded-full ${commsOnline ? 'bg-health-nominal animate-pulse' : 'bg-health-degraded animate-pulse'}`} />
                {commsOnline ? 'LINK ACTIVE' : 'NO CARRIER'}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-steel-400 font-sans mb-1">Local Cache</p>
                <p className={`text-2xl font-bold font-mono ${cacheSize > 0 ? 'text-amber-400' : 'text-steel-400'}`}>
                  {cacheSize} <span className="text-sm ml-1">records</span>
                </p>
              </div>
              {cacheSize > 0 && commsOnline && (
                <div className="text-xs font-mono text-health-nominal animate-pulse flex items-center gap-1">
                  <Database size={12} /> Syncing...
                </div>
              )}
            </div>
          </div>

          {/* Mission Phase Tracker */}
          <div className="bg-ocean-800/60 backdrop-blur-md border border-white/[0.07] rounded-xl p-6 flex-1">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-steel-400 mb-4">Mission Phase</h2>
            <div className="mb-2 flex justify-between text-xs font-mono text-ice-500 font-bold">
              <span>{phase}</span>
              <span>{formatUptime(uptime)} Elapsed</span>
            </div>
            <div className="w-full h-1.5 bg-steel-800 rounded-full overflow-hidden mb-6">
              <div className="h-full bg-ice-500 transition-all duration-1000" style={{ width: phase === 'SURFACE' ? '10%' : phase === 'DESCENDING' ? '40%' : phase === 'SURVEY' ? '70%' : '100%' }} />
            </div>
            <div className="flex flex-col gap-2 opacity-60">
              <div className="flex justify-between items-end border-b border-steel-800 pb-1">
                <span className="text-[10px] uppercase tracking-wider text-steel-400 font-sans">Current Depth</span>
                <span className="text-xs font-mono text-ice-100">{depth.toFixed(1)}m</span>
              </div>
            </div>
          </div>
        </div>

        {/* Acoustic Terminal */}
        <div className="bg-[#0a0a0a] border border-steel-800/60 rounded-xl p-4 flex flex-col font-mono text-[10px] overflow-hidden relative">
           <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-[#0a0a0a] to-transparent z-10" />
           <div className="flex-1 flex flex-col-reverse overflow-hidden opacity-80">
              {logs.slice().reverse().map(log => (
                <div key={log.id} className={`py-0.5 ${log.type === 'WARN' ? 'text-amber-400' : log.type === 'DATA' ? 'text-ice-400' : 'text-steel-400'}`}>
                  <span className="opacity-50 mr-2">[{log.time}]</span>
                  {log.message}
                </div>
              ))}
           </div>
           <div className="mt-2 pt-2 border-t border-steel-800/50 text-ice-600 flex items-center gap-2">
              <span className="animate-pulse">_</span>
              <span>ttyS0 AWAITING DATA</span>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
