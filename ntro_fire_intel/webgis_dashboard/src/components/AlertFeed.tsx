import React from 'react';
import { 
  ShieldAlert, 
  Flame, 
  MapPin, 
  Navigation, 
  Phone, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  Clock
} from 'lucide-react';
import { SitrepAlert, EnrichedAnomaly } from '../types';

interface AlertFeedProps {
  sitreps: SitrepAlert[];
  anomalies: EnrichedAnomaly[];
  selectedAnomalyId?: string | null;
  onSelectAnomaly: (anomaly: EnrichedAnomaly) => void;
  onOpenSitrep: (sitrep: SitrepAlert) => void;
  threatFilter: string;
}

export const AlertFeed: React.FC<AlertFeedProps> = ({
  sitreps,
  anomalies,
  selectedAnomalyId,
  onSelectAnomaly,
  onOpenSitrep,
  threatFilter,
}) => {
  // Merge or map sitreps to matching anomalies
  const filteredSitreps = sitreps.filter(sitrep => {
    const threat = sitrep.threat_level || sitrep.classification?.threat_level || 'ELEVATED';
    const isIndustrial = sitrep.classification?.is_industrial ?? true;

    if (threatFilter === 'CRITICAL' && threat !== 'CRITICAL') return false;
    if (threatFilter === 'HIGH' && threat !== 'CRITICAL' && threat !== 'HIGH') return false;
    if (threatFilter === 'ELEVATED' && threat !== 'CRITICAL' && threat !== 'HIGH' && threat !== 'ELEVATED') return false;
    if (threatFilter === 'WILDFIRE' && isIndustrial) return false;
    return true;
  });

  return (
    <aside className="w-80 md:w-96 flex flex-col h-full bg-[#070c16]/95 border-r border-slate-800/80 backdrop-blur-md z-10 select-none">
      {/* Header */}
      <div className="p-3 border-b border-slate-800/80 bg-[#09101d]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-100 font-mono">
              Live SITREP C2 Stream
            </h2>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            {filteredSitreps.length} Active Feeds
          </span>
        </div>
        <p className="text-[11px] text-slate-400 font-mono mt-1">
          Autonomous tactical dispatches routed to DDMA & Fire Stations
        </p>
      </div>

      {/* Feed list */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-2">
        {filteredSitreps.length === 0 ? (
          <div className="p-8 text-center text-slate-500 font-mono text-xs">
            No active SITREPs matching current threat filter.
          </div>
        ) : (
          filteredSitreps.map((sitrep) => {
            const isSelected = selectedAnomalyId && sitrep.sitrep_id.includes(selectedAnomalyId);
            const threat = sitrep.threat_level || 'HIGH';
            const isCritical = threat === 'CRITICAL';
            const frp = sitrep.fire_radiative_power_mw || sitrep.frp || 45.0;
            const facilityName = sitrep.affected_facility?.name || 
                                 sitrep.spatial_enrichment?.nearest_facility || 
                                 'Hazira Industrial Area';
            const district = sitrep.jurisdiction?.district || 'Surat';
            const state = sitrep.jurisdiction?.state || 'Gujarat';
            const lat = sitrep.coordinates?.latitude || 21.1625;
            const lon = sitrep.coordinates?.longitude || 72.8312;

            // Find matching enriched anomaly if available
            const matchingAnomaly = anomalies.find(
              a => Math.abs(a.latitude - lat) < 0.05 && Math.abs(a.longitude - lon) < 0.05
            );

            return (
              <div
                key={sitrep.sitrep_id}
                onClick={() => {
                  if (matchingAnomaly) onSelectAnomaly(matchingAnomaly);
                  onOpenSitrep(sitrep);
                }}
                className={`p-3 rounded-lg border transition-all cursor-pointer group ${
                  isSelected
                    ? 'bg-slate-800/90 border-cyan-500/80 shadow-lg shadow-cyan-950/40'
                    : isCritical
                    ? 'bg-red-950/20 border-red-900/40 hover:border-red-600/60 hover:bg-red-950/30'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                }`}
              >
                {/* Top Row: Threat Badge, ID, Timestamp */}
                <div className="flex items-center justify-between gap-2 mb-1.5 font-mono text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-1.5 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1 ${
                        isCritical
                          ? 'bg-red-500 text-white text-glow-red animate-pulse'
                          : threat === 'HIGH'
                          ? 'bg-orange-500/90 text-white font-semibold'
                          : 'bg-amber-500/80 text-black font-semibold'
                      }`}
                    >
                      <ShieldAlert className="w-3 h-3" />
                      {threat}
                    </span>
                    <span className="text-slate-400 font-bold truncate max-w-[130px]">
                      {sitrep.sitrep_id}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{sitrep.timestamp ? new Date(sitrep.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '17:30'}</span>
                  </div>
                </div>

                {/* Facility & Location */}
                <div className="text-xs font-semibold text-slate-100 group-hover:text-cyan-300 transition truncate">
                  {facilityName}
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{district}, {state}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-400">{lat.toFixed(3)}°N, {lon.toFixed(3)}°E</span>
                </div>

                {/* Telemetry Chips */}
                <div className="mt-2 grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                  <div className="px-2 py-1 rounded bg-slate-950/60 border border-slate-800 text-amber-300 flex items-center justify-between">
                    <span className="text-slate-400">FRP:</span>
                    <span className="font-bold">{frp.toFixed(1)} MW</span>
                  </div>
                  <div className="px-2 py-1 rounded bg-slate-950/60 border border-slate-800 text-cyan-300 flex items-center justify-between">
                    <span className="text-slate-400">MODEL:</span>
                    <span className="font-bold">
                      {((sitrep.confidence_score || sitrep.confidence || 0.95) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Dispatch Status Bar */}
                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                  <div className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>DISPATCHED (HTTP 200)</span>
                  </div>

                  <div className="flex items-center gap-2 text-cyan-400 group-hover:translate-x-0.5 transition">
                    <span>INSPECT SITREP</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
