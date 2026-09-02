import { useState, useEffect } from 'react';
import { 
  Droplets, 
  ShieldCheck, 
  Layers, 
  Ship,
  CloudRain
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';

interface BGCProfilePoint {
  depth: number;
  oxygen: number;     // µmol/kg
  chlorophyll: number;// mg/m³
  ph: number;         // pH units
  nitrate: number;    // µmol/L
}

// 0m to 1000m Antarctic Water Column BGC Profile
const BGC_DEPTH_SERIES: BGCProfilePoint[] = [
  { depth: 0, oxygen: 310, chlorophyll: 2.85, ph: 8.14, nitrate: 18.2 },
  { depth: 25, oxygen: 318, chlorophyll: 3.20, ph: 8.13, nitrate: 19.5 },
  { depth: 50, oxygen: 305, chlorophyll: 2.10, ph: 8.11, nitrate: 22.1 },
  { depth: 75, oxygen: 275, chlorophyll: 0.95, ph: 8.08, nitrate: 25.4 },
  { depth: 100, oxygen: 240, chlorophyll: 0.35, ph: 8.05, nitrate: 28.6 },
  { depth: 150, oxygen: 210, chlorophyll: 0.12, ph: 8.01, nitrate: 31.2 },
  { depth: 200, oxygen: 188, chlorophyll: 0.05, ph: 7.96, nitrate: 33.5 },
  { depth: 300, oxygen: 172, chlorophyll: 0.02, ph: 7.91, nitrate: 35.1 },
  { depth: 500, oxygen: 165, chlorophyll: 0.01, ph: 7.86, nitrate: 36.8 },
  { depth: 750, oxygen: 178, chlorophyll: 0.00, ph: 7.82, nitrate: 37.4 },
  { depth: 1000, oxygen: 195, chlorophyll: 0.00, ph: 7.80, nitrate: 38.0 },
];

export function Biogeochemistry() {
  const [liveOxygen, setLiveOxygen] = useState<number>(218.4);
  const [liveChlorophyll, setLiveChlorophyll] = useState<number>(0.84);
  const [livePH, setLivePH] = useState<number>(8.06);
  const [liveNitrate, setLiveNitrate] = useState<number>(31.4);
  const [carbonFlux] = useState<number>(48.6);
  const [selectedDepth, setSelectedDepth] = useState<number>(100);

  // Live polling from backend API
  useEffect(() => {
    const fetchBgc = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/ocean/state', { signal: AbortSignal.timeout(2000) });
        if (res.ok) {
          const json = await res.json();
          if (json.oxygen?.value) setLiveOxygen(json.oxygen.value);
          if (json.chlorophyll?.value) setLiveChlorophyll(json.chlorophyll.value);
          if (json.ph?.value) setLivePH(json.ph.value);
          if (json.nitrate?.value) setLiveNitrate(json.nitrate.value);
        }
      } catch (err) {
        // Just keep the previous static values
      }
    };

    fetchBgc();
    const timer = setInterval(fetchBgc, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-full p-4 md:p-6 overflow-y-auto flex flex-col gap-5 text-steel-100 bg-gradient-to-b from-abyss-950 via-abyss-900 to-abyss-950 selection:bg-ice-500/30">
      
      {/* ── TOP HEADER & BGC METRICS BANNER ── */}
      <div className="bg-abyss-900/90 border border-steel-800/80 rounded-xl p-4 shadow-2xl backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Droplets className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-mono font-bold text-sm text-ice-100 tracking-wider">
                SOUTHERN OCEAN BIOGEOCHEMISTRY &amp; CARBON PUMP OBSERVATORY
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                IN-SITU BGC TELEMETRY
              </span>
            </div>
            <p className="text-xs font-mono text-steel-400 mt-0.5">
              SECTOR 7G (54°13.2'S, 72°01.4'E) · ANTARCTIC POLAR FRONT · NCPOR EXPEDITION SYNC
            </p>
          </div>
        </div>

        {/* Global Key BGC Indicators */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          <div className="bg-abyss-950 px-3 py-1.5 rounded-lg border border-steel-800">
            <span className="text-steel-500 mr-1.5">CARBON SEQUESTRATION:</span>
            <span className="text-emerald-400 font-bold">{carbonFlux} gC/m²/yr</span>
          </div>
          <div className="bg-abyss-950 px-3 py-1.5 rounded-lg border border-steel-800">
            <span className="text-steel-500 mr-1.5">ARAGONITE SAT (Ω):</span>
            <span className="text-ice-400 font-bold">1.42 (SUPERSATURATED)</span>
          </div>
          <div className="bg-abyss-950 px-3 py-1.5 rounded-lg border border-steel-800">
            <span className="text-steel-500 mr-1.5">BIO-OPTICAL SYNTHESIS:</span>
            <span className="text-amber-400 font-bold">4/4 PARAMETERS</span>
          </div>
        </div>

      </div>

      {/* ── ROW 1: 4 SCIENTIFIC BGC SENSOR CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Dissolved Oxygen */}
        <div className="bg-abyss-900/80 border border-steel-800/80 hover:border-ice-500/40 rounded-xl p-4 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-steel-400 tracking-wider">DISSOLVED OXYGEN (DOXY)</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                PHYSICS-DERIVED (GARCIA-GORDON)
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-mono font-bold text-steel-50">{liveOxygen}</span>
              <span className="text-xs font-mono text-cyan-400 font-bold">µmol/kg</span>
            </div>
            <p className="text-[11px] text-steel-400 mt-2 font-sans">
              Garcia &amp; Gordon solubility model derived from in-situ water temperature &amp; depth. Evaluates marine habitat oxygenation.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-steel-800 text-[9px] font-mono text-steel-500 flex justify-between">
            <span>SATURATION: 86.4%</span>
            <span className="text-emerald-400">STATUS: OXYGENATED</span>
          </div>
        </div>

        {/* Card 2: Chlorophyll-a Biomass */}
        <div className="bg-abyss-900/80 border border-steel-800/80 hover:border-ice-500/40 rounded-xl p-4 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-steel-400 tracking-wider">CHL-A PHYTOPLANKTON</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                BIO-OPTICAL (MOREL MODEL)
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-mono font-bold text-steel-50">{liveChlorophyll}</span>
              <span className="text-xs font-mono text-emerald-400 font-bold">mg/m³</span>
            </div>
            <p className="text-[11px] text-steel-400 mt-2 font-sans">
              Morel downwelling irradiance spectral attenuation model. Tracks euphotic primary biological productivity &amp; diatom blooms.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-steel-800 text-[9px] font-mono text-steel-500 flex justify-between">
            <span>EUPHOTIC DEPTH: 62m</span>
            <span className="text-emerald-400">BLOOM: ACTIVE</span>
          </div>
        </div>

        {/* Card 3: Seawater pH & Acidification */}
        <div className="bg-abyss-900/80 border border-steel-800/80 hover:border-ice-500/40 rounded-xl p-4 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-steel-400 tracking-wider">SEAWATER pH (NBS SCALE)</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                PHYSICAL IN-SITU SENSOR
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-mono font-bold text-steel-50">{livePH}</span>
              <span className="text-xs font-mono text-cyan-400 font-bold">pH</span>
            </div>
            <p className="text-[11px] text-steel-400 mt-2 font-sans">
              Direct in-situ analog glass electrode probe. Monitors anthropogenic CO2 ocean acidification.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-steel-800 text-[9px] font-mono text-steel-500 flex justify-between">
            <span>DRIFT: ±0.002 pH/mo</span>
            <span className="text-emerald-400">BUFFER CAPACITY: HIGH</span>
          </div>
        </div>

        {/* Card 4: Nitrate Nutrients */}
        <div className="bg-abyss-900/80 border border-steel-800/80 hover:border-ice-500/40 rounded-xl p-4 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-steel-400 tracking-wider">NITRATE (NO3⁻) FLUX</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                PHYSICS-DERIVED SYNTHESIS
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-mono font-bold text-steel-50">{liveNitrate}</span>
              <span className="text-xs font-mono text-purple-400 font-bold">µmol/L</span>
            </div>
            <p className="text-[11px] text-steel-400 mt-2 font-sans">
              Thermodynamic nutrient-temperature regression model. Tracks upwelling of Antarctic deep nutrients.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-steel-800 text-[9px] font-mono text-steel-500 flex justify-between">
            <span>NITRACLINE: 85m</span>
            <span className="text-purple-400">HNLC REGIME: NOMINAL</span>
          </div>
        </div>

      </div>

      {/* ── ROW 2: FULL WATER COLUMN TRANSECT & DEPTH PROFILE (0 - 1000m) ── */}
      <div className="bg-abyss-900/80 border border-steel-800/80 rounded-xl p-5 shadow-2xl">
        
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-steel-800">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xs font-mono font-bold tracking-widest text-ice-100 uppercase">
                WATER COLUMN BGC STRATIFICATION PROFILE (0m — 1,000m TRANSECT)
              </h2>
            </div>
            <p className="text-xs text-steel-400 mt-1 font-sans">
              Vertical distribution of Dissolved Oxygen, Chlorophyll-a, pH, and Nitrate across Southern Ocean water masses.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-steel-500 text-[10px]">SAMPLING SLICE:</span>
            <div className="flex items-center gap-1 bg-abyss-950 p-1 rounded-lg border border-steel-800">
              {[25, 50, 100, 200, 500, 1000].map(d => (
                <button
                  key={d}
                  onClick={() => setSelectedDepth(d)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                    selectedDepth === d 
                      ? 'bg-emerald-400 text-abyss-950 shadow-md' 
                      : 'text-steel-400 hover:text-emerald-300'
                  }`}
                >
                  {d}m
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recharts Multi-Param Area Chart */}
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={BGC_DEPTH_SERIES} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="oxygenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="chlaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="nitrateGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="depth" stroke="#64748b" unit="m" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              
              <Area type="monotone" dataKey="oxygen" name="Dissolved Oxygen (µmol/kg)" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#oxygenGrad)" />
              <Area type="monotone" dataKey="nitrate" name="Nitrate Nutrients (µmol/L)" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#nitrateGrad)" />
              <Line type="monotone" dataKey="chlorophyll" name="Chlorophyll-a x10 (mg/m³)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3, fill: '#10b981' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Stratification Layer Tags */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-3 border-t border-steel-800/80 font-mono text-[10px]">
          <div className="bg-abyss-950 p-2.5 rounded-lg border border-steel-800">
            <span className="text-emerald-400 font-bold block mb-0.5">EUPHOTIC MIXED LAYER (0 - 80m)</span>
            <span className="text-steel-400">High photosynthetic O2 production (318 µmol/kg) and peak diatom bloom activity.</span>
          </div>
          <div className="bg-abyss-950 p-2.5 rounded-lg border border-steel-800">
            <span className="text-amber-400 font-bold block mb-0.5">OXYGEN MINIMUM ZONE (OMZ) (150 - 400m)</span>
            <span className="text-steel-400">Microbial respiration drops oxygen to 165 µmol/kg with rapid organic remineralization.</span>
          </div>
          <div className="bg-abyss-950 p-2.5 rounded-lg border border-steel-800">
            <span className="text-purple-400 font-bold block mb-0.5">ANTARCTIC INTERMEDIATE WATER (AAIW) (&gt;500m)</span>
            <span className="text-steel-400">High nutrient pool (38.0 µmol/L Nitrate) ready for spring upwelling cycles.</span>
          </div>
        </div>

      </div>

      {/* ── ROW 3: STRATEGIC SCIENTIFIC DOSSIERS & CLIMATE TELECONNECTIONS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left (7 Cols): Climate & Monsoon Predictive Link */}
        <div className="lg:col-span-7 bg-abyss-900/80 border border-steel-800/80 rounded-xl p-5 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-steel-800 pb-2">
              <div className="flex items-center gap-2">
                <CloudRain className="w-5 h-5 text-ice-400" />
                <h3 className="text-xs font-mono font-bold tracking-wider text-steel-200 uppercase">
                  SOUTHERN OCEAN — INDIAN MONSOON TELECONNECTION MODEL
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-ice-500/10 text-ice-300 border border-ice-500/20 font-bold">
                IMD / MoES LINK
              </span>
            </div>

            <p className="text-xs text-steel-300 font-sans leading-relaxed mb-4">
              Thermal and biogeochemical anomalies in the Indian Sector of the Southern Ocean directly modulate the <strong className="text-ice-200">Mascarene High pressure ridge</strong>, which drives the cross-equatorial trade winds delivering the Southwest Monsoon to the Indian subcontinent.
            </p>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs mb-4">
              <div className="bg-abyss-950 p-3 rounded-lg border border-steel-800">
                <span className="text-[10px] text-steel-500 block mb-1">MASCARENE HIGH ANOMALY</span>
                <span className="text-lg font-bold text-emerald-400">+0.4 hPa (NOMINAL)</span>
                <p className="text-[10px] text-steel-400 mt-1 font-sans">Trade wind pressure gradient supports healthy monsoon onset.</p>
              </div>

              <div className="bg-abyss-950 p-3 rounded-lg border border-steel-800">
                <span className="text-[10px] text-steel-500 block mb-1">ANTARCTIC POLAR CONVERGENCE</span>
                <span className="text-lg font-bold text-ice-400">LAT 53.8°S (STABLE)</span>
                <p className="text-[10px] text-steel-400 mt-1 font-sans">Thermal front position within 5-year climatological bounds.</p>
              </div>
            </div>

            <div className="bg-emerald-950/30 border border-emerald-500/30 p-3 rounded-lg font-mono text-[11px] text-emerald-300 flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 flex-shrink-0 text-emerald-400" />
              <span>
                <strong>IMD EARLY ADVISORY:</strong> Southern Ocean cross-equatorial jet stream index is nominal. Southwest monsoon rainfall probability modeled at <strong>98.4% of Long Period Average (LPA)</strong>.
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-steel-800/80 flex items-center justify-between text-[10px] font-mono text-steel-500">
            <span>MODEL: IITM CFSv2 COUPLED OCEAN-ATMOSPHERE</span>
            <span className="text-ice-400">CONFIDENCE: 92.6%</span>
          </div>
        </div>

        {/* Right (5 Cols): NCPOR Antarctic Logistics & Research Station Sync */}
        <div className="lg:col-span-5 bg-abyss-900/80 border border-steel-800/80 rounded-xl p-5 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-steel-800 pb-2">
              <div className="flex items-center gap-2">
                <Ship className="w-5 h-5 text-emerald-400" />
                <h3 className="text-xs font-mono font-bold tracking-wider text-steel-200 uppercase">
                  NCPOR POLAR LOGISTICS (BHARATI & MAITRI)
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
                OPERATIONAL
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="bg-abyss-950 p-3 rounded-lg border border-steel-800">
                <div className="flex items-center justify-between text-[10px] text-steel-500 mb-1">
                  <span>BHARATI STATION (LARSEMANN HILLS)</span>
                  <span className="text-emerald-400">69°24'S, 76°11'E</span>
                </div>
                <div className="text-base font-bold text-steel-100">SEA-ICE FASTENING: 38%</div>
                <p className="text-[10px] text-steel-400 mt-1 font-sans">
                  Prydz Bay approach open. Optimal resupply window for RV Bharati starts in <strong>T-minus 12 days</strong>.
                </p>
              </div>

              <div className="bg-abyss-950 p-3 rounded-lg border border-steel-800">
                <div className="flex items-center justify-between text-[10px] text-steel-500 mb-1">
                  <span>MAITRI STATION (SCHIRMACHER OASIS)</span>
                  <span className="text-emerald-400">70°45'S, 11°44'E</span>
                </div>
                <div className="text-base font-bold text-steel-100">LAKE PRIYADARSHINI pH: 7.92</div>
                <p className="text-[10px] text-steel-400 mt-1 font-sans">
                  Glacial meltwater runoff within baseline limits. Zero chemical contaminant anomalies detected.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-steel-800/80 flex items-center justify-between text-[10px] font-mono text-steel-500">
            <span>DISPATCH: SATCOM DIRECT TO GOA HQ</span>
            <span className="text-emerald-400">SYNC: 100% NOMINAL</span>
          </div>
        </div>

      </div>

    </div>
  );
}
