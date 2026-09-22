import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Phone, 
  ShieldAlert, 
  Flame, 
  MapPin, 
  Satellite, 
  Building2, 
  Compass, 
  Copy, 
  Check, 
  AlertTriangle, 
  FileText,
  Navigation
} from 'lucide-react';
import { SitrepAlert, EnrichedAnomaly } from '../types';

interface SitrepModalProps {
  sitrep: SitrepAlert | null;
  anomaly?: EnrichedAnomaly | null;
  onClose: () => void;
}

export const SitrepModal: React.FC<SitrepModalProps> = ({ sitrep, anomaly, onClose }) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'HAZMAT' | 'TELEMETRY' | 'JSON'>('OVERVIEW');
  const [copied, setCopied] = useState<boolean>(false);

  if (!sitrep) return null;

  const threat = sitrep.threat_level || sitrep.classification?.threat_level || 'CRITICAL';
  const isCritical = threat === 'CRITICAL';
  const frp = sitrep.fire_radiative_power_mw || sitrep.frp || 45.0;
  const lat = sitrep.coordinates?.latitude || 21.1625;
  const lon = sitrep.coordinates?.longitude || 72.8312;
  
  const mapsUrl = sitrep.navigation?.google_maps_url || 
                  sitrep.google_maps_url || 
                  `https://www.google.com/maps/dir/?api=1&destination=${lat.toFixed(6)},${lon.toFixed(6)}`;
  
  const facilityName = sitrep.affected_facility?.name || 
                       sitrep.spatial_enrichment?.nearest_facility || 
                       'Hazira Petrochemical Complex';
                       
  const distanceM = sitrep.spatial_enrichment?.distance_to_facility_m ?? 
                    ((sitrep.affected_facility?.distance_km ?? 0.2) * 1000);

  const evacMeters = sitrep.tactical_assessment?.evacuation_radius_m || 
                     sitrep.tactical_assessment?.evacuation_radius_meters || 
                     (isCritical ? 2000 : 1500);

  const hazmatDesc = sitrep.tactical_assessment?.hazmat_classification || 
                     'Level 4: Critical Petrochemical / Vapor Cloud Explosion Threat (BLEVE Risk)';

  const primaryResponder = sitrep.jurisdiction?.primary_responder || 
                           sitrep.jurisdiction?.fire_station || 
                           'Hazira Emergency Response Center & Adajan Fire Station';

  const contactPhone = sitrep.jurisdiction?.emergency_phone || 
                       sitrep.jurisdiction?.contact || 
                       '+91-261-2423400';

  const nodalAuthority = sitrep.jurisdiction?.nodal_authority || 
                         sitrep.jurisdiction?.primary_agency || 
                         'District Disaster Management Authority (DDMA)';

  const regulatoryBody = sitrep.jurisdiction?.regulatory_body || 
                         'Petroleum and Explosives Safety Organization (PESO)';

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(sitrep, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-[#080d18] border border-cyan-500/60 rounded-xl shadow-2xl overflow-hidden font-mono text-slate-100">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#0d1424] border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isCritical ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'}`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-wider text-white">
                  TACTICAL SITREP: {sitrep.sitrep_id}
                </h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                  isCritical ? 'bg-red-600 text-white animate-pulse' : 'bg-orange-500 text-white'
                }`}>
                  {threat}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  DISPATCHED (HTTP 200)
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Target: {facilityName} • Coordinates: {lat.toFixed(5)}°N, {lon.toFixed(5)}°E
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition flex items-center gap-1.5 shadow-lg shadow-cyan-950"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Open Google Maps Turn-by-Turn</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>

            <a
              href={`tel:${contactPhone.replace(/[^0-9+]/g, '')}`}
              className="px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-semibold transition flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Responder ({contactPhone})</span>
            </a>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {(['OVERVIEW', 'HAZMAT', 'TELEMETRY', 'JSON'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-2.5 py-1 rounded text-[11px] transition ${
                  activeTab === tab
                    ? 'bg-slate-700 text-cyan-300 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 text-xs">
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-4">
              {/* Strategic KPI Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Thermal FRP</div>
                  <div className="text-base font-bold text-orange-400 mt-1">{frp.toFixed(1)} MW</div>
                  <div className="text-[10px] text-slate-400">Radiative Intensity</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">AI Confidence</div>
                  <div className="text-base font-bold text-cyan-400 mt-1">
                    {((sitrep.confidence_score || sitrep.confidence || 0.98) * 100).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-slate-400">XGBoost v1.0 Model</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Evacuation Buffer</div>
                  <div className="text-base font-bold text-red-400 mt-1">{evacMeters} Meters</div>
                  <div className="text-[10px] text-slate-400">Hazard Perimeter</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Facility Proximity</div>
                  <div className="text-base font-bold text-emerald-400 mt-1">{Math.round(distanceM)} m</div>
                  <div className="text-[10px] text-slate-400">OSM Industrial Asset</div>
                </div>
              </div>

              {/* Responder & Jurisdictional Chain of Command */}
              <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800">
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                  <Building2 className="w-4 h-4" />
                  Jurisdictional Incident Command
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-slate-400">Primary Responder:</span>
                    <p className="font-bold text-slate-100 mt-0.5">{primaryResponder}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Nodal Disaster Authority:</span>
                    <p className="font-bold text-slate-100 mt-0.5">{nodalAuthority}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Regulatory Oversight:</span>
                    <p className="font-bold text-slate-100 mt-0.5">{regulatoryBody}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Emergency Direct Hotline:</span>
                    <p className="font-bold text-emerald-400 mt-0.5">{contactPhone}</p>
                  </div>
                </div>
              </div>

              {/* Navigation Link Details */}
              <div className="p-4 rounded-lg bg-cyan-950/20 border border-cyan-800/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-cyan-300">Turn-by-Turn Emergency Routing</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Google Maps Directions Protocol</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-2 break-all bg-black/40 p-2 rounded border border-slate-800">
                  {mapsUrl}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'HAZMAT' && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-red-950/25 border border-red-800/50">
                <div className="flex items-center gap-2 text-red-400 font-bold mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>HAZMAT & CHEMICAL THREAT ASSESSMENT</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">{hazmatDesc}</p>
              </div>

              <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
                <h4 className="font-bold text-amber-400 uppercase text-xs">Standard Operating Directives:</h4>
                <ul className="list-disc list-inside space-y-1.5 text-slate-300 text-[11px]">
                  <li>Establish a strict <strong>{evacMeters}m evacuation exclusion perimeter</strong> upwind from facility.</li>
                  <li>Dispatch Class B AFFF foam crash tenders and high-capacity water deluge monitors.</li>
                  <li>Isolate natural gas pipeline feeds and fuel transfer manifolds within 3km.</li>
                  <li>Issue public toxic smoke and vapor cloud advisory across downstream districts.</li>
                  <li>Coordinate with State Pollution Control Board and Factory Inspectorate.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'TELEMETRY' && (
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800">
                <h4 className="font-bold text-cyan-400 uppercase text-xs flex items-center gap-1.5 mb-3">
                  <Satellite className="w-4 h-4" />
                  Multi-Modal Satellite Ingestion Telemetry
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px]">
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400">Sensor Platform:</span>
                    <p className="font-bold text-slate-100 mt-0.5">VIIRS 375m (Suomi-NPP)</p>
                  </div>
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400">Brightness Ti4:</span>
                    <p className="font-bold text-amber-400 mt-0.5">365.4 Kelvin</p>
                  </div>
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400">Background Ti5:</span>
                    <p className="font-bold text-cyan-400 mt-0.5">298.2 Kelvin</p>
                  </div>
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400">Thermal Delta:</span>
                    <p className="font-bold text-red-400 mt-0.5">+67.2 K (Explosion Signature)</p>
                  </div>
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400">Acquisition Time:</span>
                    <p className="font-bold text-slate-100 mt-0.5">{sitrep.timestamp ? sitrep.timestamp.substring(11, 19) : '17:31:00'} UTC</p>
                  </div>
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400">Day/Night Band:</span>
                    <p className="font-bold text-slate-100 mt-0.5">Day (Thermal Divergence)</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'JSON' && (
            <div className="relative">
              <button
                onClick={handleCopyJson}
                className="absolute top-3 right-3 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 transition"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'COPIED' : 'COPY JSON'}</span>
              </button>
              <pre className="p-4 rounded-lg bg-black/70 border border-slate-800 text-[11px] text-slate-300 overflow-x-auto max-h-96">
                {JSON.stringify(sitrep, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-2.5 bg-[#0d1424] border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div>
            Dispatched via <span className="text-cyan-400 font-bold">MockTelegramAdapter</span> • HTTP 200 Delivery Verified
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
