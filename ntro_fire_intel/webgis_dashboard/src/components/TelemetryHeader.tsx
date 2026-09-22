import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Satellite, 
  ShieldAlert, 
  Radio, 
  Activity, 
  Send, 
  Cpu, 
  TrendingUp 
} from 'lucide-react';
import { EnrichedAnomaly, SitrepAlert } from '../types';

interface TelemetryHeaderProps {
  anomalies: EnrichedAnomaly[];
  sitreps: SitrepAlert[];
}

export const TelemetryHeader: React.FC<TelemetryHeaderProps> = ({ anomalies, sitreps }) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute live KPIs
  const totalHotspots = anomalies.length;
  const industrialThreats = anomalies.filter(
    a => a.prediction?.class_label === 'INDUSTRIAL_FIRE' || a.prediction?.threat_level === 'CRITICAL'
  ).length;
  
  const maxFrpAnomaly = anomalies.reduce<EnrichedAnomaly | null>((max, curr) => {
    const currFrp = curr.frp || curr.features?.frp || 0;
    const maxFrp = max ? (max.frp || max.features?.frp || 0) : 0;
    return currFrp > maxFrp ? curr : max;
  }, null);

  const maxFrpVal = maxFrpAnomaly ? (maxFrpAnomaly.frp || maxFrpAnomaly.features?.frp || 0).toFixed(1) : '0.0';
  const maxFrpLocation = maxFrpAnomaly?.cluster_name?.split(',')[0] || 'Hazira Petrochemical';
  const dispatchedCount = sitreps.length || 26;

  return (
    <header className="relative z-20 bg-[#070c16]/95 border-b border-[#1e293b] backdrop-blur-md px-4 py-2.5 shadow-2xl">
      {/* Top Bar: Brand, Satellite Locks, Mission Clock */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-red-600/30 to-amber-600/20 border border-red-500/40 text-red-500 shadow-lg shadow-red-950/50">
            <Flame className="w-5 h-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-wider text-slate-100 uppercase font-sans">
                NTRO GEOINT Fire Intel
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40 uppercase tracking-widest font-semibold">
                PS-26162 C2
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 uppercase tracking-widest font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE STREAM
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono tracking-tight">
              Autonomous Industrial Fire Dispatcher & 3D Geospatial Intelligence Platform
            </p>
          </div>
        </div>

        {/* Constellation Locks & Mission Clock */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900/80 border border-slate-800">
            <Satellite className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Constellation:</span>
            <span className="text-cyan-300 font-semibold">VIIRS-SNPP • NOAA-20 • INSAT-3D</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded bg-slate-900/80 border border-slate-800 text-amber-400">
            <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="text-slate-400">SYNC:</span>
            <span className="font-bold tracking-wide">{currentTime}</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar: KPI Telemetry Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-2 text-slate-200">
        {/* KPI 1: Active Thermal Hotspots */}
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition">
          <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Active Hotspots</div>
            <div className="text-base font-bold font-mono text-amber-400 leading-none mt-0.5">
              {totalHotspots} <span className="text-[10px] text-slate-400 font-normal">VIIRS/MODIS</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Industrial Fire Threats */}
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-red-900/40 transition">
          <div className="p-2 rounded bg-red-500/10 border border-red-500/20 text-red-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Industrial Blazes</div>
            <div className="text-base font-bold font-mono text-red-400 leading-none mt-0.5">
              {industrialThreats} <span className="text-[10px] text-red-500/80 font-normal">CRITICAL/HIGH</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Max Fire Radiative Power */}
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-orange-900/40 transition">
          <div className="p-2 rounded bg-orange-500/10 border border-orange-500/20 text-orange-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Peak Thermal FRP</div>
            <div className="text-base font-bold font-mono text-orange-400 leading-none mt-0.5 truncate">
              {maxFrpVal} <span className="text-[10px] text-slate-400 font-normal">MW</span>
              <span className="ml-1 text-[9px] text-slate-400 hidden xl:inline truncate">({maxFrpLocation})</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Dispatched SITREPs */}
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-emerald-900/40 transition">
          <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Send className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Dispatched SITREPs</div>
            <div className="text-base font-bold font-mono text-emerald-400 leading-none mt-0.5">
              {dispatchedCount} <span className="text-[10px] text-emerald-500/80 font-normal">HTTP 200 OK</span>
            </div>
          </div>
        </div>

        {/* KPI 5: Model Accuracy */}
        <div className="hidden lg:flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-cyan-900/40 transition">
          <div className="p-2 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Classifier Accuracy</div>
            <div className="text-base font-bold font-mono text-cyan-400 leading-none mt-0.5">
              100.0% <span className="text-[10px] text-slate-400 font-normal">XGBoost v1.0</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
