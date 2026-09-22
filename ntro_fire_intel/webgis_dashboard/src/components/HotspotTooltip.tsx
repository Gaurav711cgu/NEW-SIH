import React from 'react';
import { ShieldAlert, Flame, MapPin, Crosshair } from 'lucide-react';
import { EnrichedAnomaly } from '../types';

interface HotspotTooltipProps {
  anomaly: EnrichedAnomaly | null;
  coords?: { x: number; y: number };
}

export const HotspotTooltip: React.FC<HotspotTooltipProps> = ({ anomaly, coords }) => {
  if (!anomaly || !coords) return null;

  const threat = anomaly.prediction?.threat_level || 'ELEVATED';
  const isIndustrial = anomaly.prediction?.class_label === 'INDUSTRIAL_FIRE';
  const frp = anomaly.frp || anomaly.features?.frp || 0;
  const facilityName = anomaly.cluster_name || anomaly.osm_enrichment?.matched_cluster || 'Industrial Facility';
  const district = anomaly.district || anomaly.osm_enrichment?.jurisdiction?.agency?.split(' ')[0] || 'Unknown';
  const state = anomaly.state || 'India';

  // Keep tooltip on screen
  const x = Math.min(coords.x + 15, window.innerWidth - 300);
  const y = Math.min(coords.y + 15, window.innerHeight - 200);

  return (
    <div
      style={{ left: `${x}px`, top: `${y}px` }}
      className="fixed z-30 pointer-events-none w-72 bg-[#080d18]/95 border border-cyan-500/60 rounded-lg p-3 shadow-2xl backdrop-blur-md text-slate-100 font-mono text-xs animate-in fade-in zoom-in-95 duration-100"
    >
      {/* Header with reticle */}
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
        <div className="flex items-center gap-1.5 text-cyan-400">
          <Crosshair className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="font-bold tracking-wider">{anomaly.anomaly_id}</span>
        </div>
        <span
          className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
            threat === 'CRITICAL'
              ? 'bg-red-600 text-white'
              : threat === 'HIGH'
              ? 'bg-orange-500 text-white'
              : 'bg-amber-500 text-black'
          }`}
        >
          {threat}
        </span>
      </div>

      {/* Facility & Location */}
      <div className="mt-2 text-xs font-bold text-slate-100 truncate">
        {facilityName}
      </div>
      <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
        <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
        <span className="truncate">{district}, {state}</span>
        <span>•</span>
        <span>{anomaly.latitude.toFixed(3)}°N, {anomaly.longitude.toFixed(3)}°E</span>
      </div>

      {/* FRP Progress bar */}
      <div className="mt-2.5 pt-2 border-t border-slate-800/80">
        <div className="flex justify-between text-[10px] mb-1">
          <span className="text-slate-400">FIRE RADIATIVE POWER:</span>
          <span className="font-bold text-orange-400">{frp.toFixed(1)} MW</span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-red-600 rounded-full"
            style={{ width: `${Math.min(100, (frp / 160) * 100)}%` }}
          />
        </div>
      </div>

      {/* Target prompt */}
      <div className="mt-2 text-[10px] text-cyan-400/80 text-center uppercase tracking-widest pt-1 border-t border-slate-800/60">
        [ CLICK PILLAR TO INSPECT SITREP ]
      </div>
    </div>
  );
};
