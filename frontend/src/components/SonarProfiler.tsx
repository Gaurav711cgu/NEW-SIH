import { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine, 
  CartesianGrid 
} from 'recharts';
import { 
  Eye, 
  Layers, 
  Activity, 
  Zap, 
  Target,
  Info
} from 'lucide-react';

interface Scenario {
  id: string;
  title: string;
  category: string;
  natural: {
    name: string;
    image: string;
    highlightDesc: string;
    shadowDesc: string;
    classification: string;
    backscatterPeak: string;
    shadowGradient: string;
    impedance: string;
    waveform: { x: number; v: number }[];
  };
  manMade: {
    name: string;
    image: string;
    highlightDesc: string;
    shadowDesc: string;
    classification: string;
    backscatterPeak: string;
    shadowGradient: string;
    impedance: string;
    waveform: { x: number; v: number }[];
  };
}

const COMPARISON_SCENARIOS: Scenario[] = [
  {
    id: 'mine-vs-rock',
    title: 'Subsea Mine / UXO vs Seabed Boulder',
    category: 'NAVAL HARBOR DEFENSE & EXPLOSIVES',
    natural: {
      name: 'Natural Seabed Boulder Formation',
      image: '/testing_images/19_rock_formation_natural_shadow.jpg',
      highlightDesc: 'Diffuse, irregular rough backscatter with variable surface scattering angles.',
      shadowDesc: 'Soft, tapered organic shadow envelope without sharp geometric boundaries.',
      classification: 'NATURAL_GEOLOGY (REJECTED / 0% ALARM)',
      backscatterPeak: '+5.2 dB (Diffuse)',
      shadowGradient: '-1.2 dB/meter (Soft slope)',
      impedance: '2.8 × 10⁶ Pa·s/m (Granite)',
      waveform: [
        { x: 0, v: 12 }, { x: 1, v: 18 }, { x: 2, v: 34 }, { x: 3, v: 58 }, { x: 4, v: 76 },
        { x: 5, v: 79 }, { x: 6, v: 65 }, { x: 7, v: 42 }, { x: 8, v: 22 }, { x: 9, v: 12 }
      ]
    },
    manMade: {
      name: 'Cylindrical Moored Subsea Mine / UXO',
      image: '/testing_images/03_cylinder_mine_specular_highlight.jpg',
      highlightDesc: 'Intense specular metallic return with phase-coherent axial symmetry.',
      shadowDesc: 'Razor-sharp cylindrical shadow envelope with immediate drop to 0 dB backscatter.',
      classification: 'MAN_MADE_DEBRIS (PRIORITY 1 THREAT · 94.8%)',
      backscatterPeak: '+18.4 dB (Specular)',
      shadowGradient: '-19.6 dB/meter (Instant cutoff)',
      impedance: '46.5 × 10⁶ Pa·s/m (Hardened Steel)',
      waveform: [
        { x: 0, v: 10 }, { x: 1, v: 12 }, { x: 2, v: 22 }, { x: 3, v: 98 }, { x: 4, v: 96 },
        { x: 5, v: 1 }, { x: 6, v: 0 }, { x: 7, v: 1 }, { x: 8, v: 8 }, { x: 9, v: 11 }
      ]
    }
  },
  {
    id: 'container-vs-outcrop',
    title: 'ISO Cargo Container vs Rock Outcrop',
    category: 'SHIPPING FAIRWAY HAZARDS (DG SHIPPING)',
    natural: {
      name: 'Geological Bedrock Ledge / Outcrop',
      image: '/testing_images/22_natural_rock_outcrop_zero_shadow_trap.jpg',
      highlightDesc: 'Fractal, undulating ridge line with uneven elevation across swath.',
      shadowDesc: 'Discontinuous shadow with rocky breaks and gradual ambient light bleed.',
      classification: 'NATURAL_TOPOLOGY (SEABED RELIEF)',
      backscatterPeak: '+6.8 dB (Rough rock)',
      shadowGradient: '-2.4 dB/meter (Irregular)',
      impedance: '3.1 × 10⁶ Pa·s/m (Sediment/Rock)',
      waveform: [
        { x: 0, v: 14 }, { x: 1, v: 22 }, { x: 2, v: 45 }, { x: 3, v: 68 }, { x: 4, v: 72 },
        { x: 5, v: 60 }, { x: 6, v: 48 }, { x: 7, v: 30 }, { x: 8, v: 18 }, { x: 9, v: 13 }
      ]
    },
    manMade: {
      name: 'Sunken 40ft ISO Cargo Container',
      image: '/testing_images/23_sunken_iso_cargo_container_40ft.jpg',
      highlightDesc: 'Orthogonal 90° corner reflections matching standard ISO 2.5:1 ratio.',
      shadowDesc: 'Crisp, rectangular cast shadow maintaining constant 2.6m vertical height relief.',
      classification: 'MAN_MADE_DEBRIS (AUTO-LOGGED · 91.2%)',
      backscatterPeak: '+16.5 dB (Corrugated Steel)',
      shadowGradient: '-22.1 dB/meter (Step cliff)',
      impedance: '44.0 × 10⁶ Pa·s/m (Corten Steel)',
      waveform: [
        { x: 0, v: 11 }, { x: 1, v: 14 }, { x: 2, v: 16 }, { x: 3, v: 94 }, { x: 4, v: 92 },
        { x: 5, v: 0 }, { x: 6, v: 0 }, { x: 7, v: 0 }, { x: 8, v: 10 }, { x: 9, v: 12 }
      ]
    }
  },
  {
    id: 'ghostnet-vs-sand',
    title: 'Derelict Ghost Net vs Sand Ripple',
    category: 'MARINE ECOLOGY & FISHERIES (MoES / CMFRI)',
    natural: {
      name: 'Ambient Sand Ripple / Kelp Field',
      image: '/testing_images/14_low_contrast_sand_bed_target.jpg',
      highlightDesc: 'Periodic, sinusoidal low-amplitude acoustic waves with uniform wavelength.',
      shadowDesc: 'Minimal micro-shadows conforming to ambient hydrodynamic currents.',
      classification: 'NATURAL_SEABED (PERIODIC CURRENTS)',
      backscatterPeak: '+3.5 dB (Sand)',
      shadowGradient: '-0.6 dB/meter (Gentle ripple)',
      impedance: '1.9 × 10⁶ Pa·s/m (Fine Sand)',
      waveform: [
        { x: 0, v: 18 }, { x: 1, v: 24 }, { x: 2, v: 32 }, { x: 3, v: 42 }, { x: 4, v: 45 },
        { x: 5, v: 38 }, { x: 6, v: 28 }, { x: 7, v: 20 }, { x: 8, v: 16 }, { x: 9, v: 14 }
      ]
    },
    manMade: {
      name: 'Derelict Entangled Ghost Net & FAD Cluster',
      image: '/testing_images/25_entangled_synthetic_fad_trawl_mesh.jpg',
      highlightDesc: 'High spatial entropy chaotic mesh backscatter with acoustic fiber trapping.',
      shadowDesc: 'Diffuse, non-rigid irregular shadow with distinct synthetic clump clusters.',
      classification: 'SYNTHETIC_DEBRIS (GHOST GEAR · 93.6%)',
      backscatterPeak: '+11.8 dB (Polyamide clump)',
      shadowGradient: '-14.2 dB/meter (Clustered)',
      impedance: '8.4 × 10⁶ Pa·s/m (Nylon polymer)',
      waveform: [
        { x: 0, v: 12 }, { x: 1, v: 20 }, { x: 2, v: 40 }, { x: 3, v: 88 }, { x: 4, v: 82 },
        { x: 5, v: 3 }, { x: 6, v: 2 }, { x: 7, v: 1 }, { x: 8, v: 11 }, { x: 9, v: 13 }
      ]
    }
  },
  {
    id: 'pipe-vs-trench',
    title: 'Subsea Pipeline vs Natural Trench',
    category: 'OFFSHORE ENERGY & CRITICAL INFRASTRUCTURE (ONGC)',
    natural: {
      name: 'Bathymetric Fault Line / Seabed Trench',
      image: '/testing_images/20_wide_swath_waterfall_survey.jpg',
      highlightDesc: 'Meandering natural boundary with variable width and rough eroded edges.',
      shadowDesc: 'Non-uniform shadow depth reflecting natural sedimentation and erosion.',
      classification: 'NATURAL_BATHYMETRY (GEOLOGICAL FAULT)',
      backscatterPeak: '+4.8 dB (Sedimentary rock)',
      shadowGradient: '-1.8 dB/meter (Erosion slope)',
      impedance: '2.3 × 10⁶ Pa·s/m (Consolidated mud)',
      waveform: [
        { x: 0, v: 15 }, { x: 1, v: 28 }, { x: 2, v: 52 }, { x: 3, v: 62 }, { x: 4, v: 58 },
        { x: 5, v: 40 }, { x: 6, v: 25 }, { x: 7, v: 15 }, { x: 8, v: 12 }, { x: 9, v: 10 }
      ]
    },
    manMade: {
      name: 'High-Pressure Subsea Pipeline / Armor Cable',
      image: '/testing_images/05_subsea_pipeline_track.jpg',
      highlightDesc: 'Continuous straight linear acoustic track across 500+ sonar pings.',
      shadowDesc: 'Strictly parallel acoustic shadow line with uniform continuous height envelope.',
      classification: 'MAN_MADE_INFRASTRUCTURE (PIPELINE · 96.4%)',
      backscatterPeak: '+17.8 dB (Coated Steel)',
      shadowGradient: '-24.0 dB/meter (Straight line cutoff)',
      impedance: '47.2 × 10⁶ Pa·s/m (Armored Steel)',
      waveform: [
        { x: 0, v: 10 }, { x: 1, v: 12 }, { x: 2, v: 14 }, { x: 3, v: 96 }, { x: 4, v: 94 },
        { x: 5, v: 0 }, { x: 6, v: 0 }, { x: 7, v: 0 }, { x: 8, v: 8 }, { x: 9, v: 10 }
      ]
    }
  }
];

export default function SonarProfiler({ className = '' }: { className?: string }) {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('mine-vs-rock');

  const currentScenario = COMPARISON_SCENARIOS.find(s => s.id === selectedScenarioId) || COMPARISON_SCENARIOS[0];

  return (
    <div className={`bg-abyss-950 p-5 md:p-6 rounded-lg border border-steel-800 text-white shadow-md space-y-6 ${className}`}>
      
      {/* ── HEADER ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-steel-800 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900/50 border border-white/10 flex items-center justify-center text-zinc-300">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold font-mono text-ice-100 flex items-center gap-2">
                ACOUSTIC SIGNATURE &amp; SHADOW PROFILER (NATURAL VS MAN-MADE)
              </h2>
              <p className="text-xs font-mono text-steel-400">
                Visual side-scan sonar validation: Why sharp acoustic shadows physically separate artificial debris from seabed geology.
              </p>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-zinc-900/50 text-zinc-300 border border-white/10 flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-zinc-300" />
            ACOUSTIC SHADOW RAY-TRACING (URICK LAW)
          </span>
        </div>
      </div>

      {/* ── 1-CLICK SCENARIO SWITCHER TABS ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-steel-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-zinc-300" /> SELECT COMPARATIVE MISSION SCENARIO:
          </span>
          <span className="text-[10px] font-mono text-zinc-300">
            {currentScenario.category}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {COMPARISON_SCENARIOS.map((sc) => {
            const isSelected = sc.id === selectedScenarioId;
            return (
              <button
                key={sc.id}
                onClick={() => setSelectedScenarioId(sc.id)}
                className={`p-3 rounded-lg border text-left font-mono transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-zinc-900/50 border-white/10 text-ice-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] ring-1 ring-cyan-500/50'
                    : 'bg-ocean-900/60 border-steel-800/80 text-steel-400 hover:bg-ocean-800/80 hover:text-steel-200 hover:border-steel-700'
                }`}
              >
                <div className="text-[10px] font-bold text-steel-500 uppercase tracking-widest mb-1">
                  {sc.category.split(' ')[0]}
                </div>
                <div className="text-xs font-bold truncate">
                  {sc.title}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── DUAL SONAR VISUAL WINDOWS (SIDE-BY-SIDE) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* LEFT WINDOW: NATURAL FORMATION (SEABED ROCK / GEOLOGY) */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="bg-ocean-950/80 border-2 border-amber-500/30 rounded-lg p-4 md:p-5 flex flex-col justify-between space-y-4 relative overflow-hidden shadow-md">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-md blur-3xl pointer-events-none" />

          {/* Window Header */}
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-amber-500" />
              <h3 className="text-xs md:text-sm font-mono font-bold text-amber-300 uppercase tracking-wider">
                NATURAL GEOLOGY: {currentScenario.natural.name}
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-500/40 font-bold">
              ORGANIC WAVEFORM
            </span>
          </div>

          {/* Real Sonar Image Preview Window */}
          <div className="space-y-2">
            <div className="relative rounded-lg overflow-hidden border border-amber-500/40 bg-black h-48 group">
              <img 
                src={currentScenario.natural.image} 
                alt="Natural Sonar Formation"
                className="w-full h-full object-cover grayscale contrast-125 brightness-110"
              />
              
              {/* Overlaid Annotation Badges on the Sonar Image */}
              <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md px-2 py-1 rounded border border-amber-500/50 text-[10px] font-mono text-amber-300 font-bold">
                DIFFUSE HIGHLIGHT (LOW SPECULAR)
              </div>
              <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md px-2 py-1 rounded border border-amber-500/50 text-[10px] font-mono text-amber-300 font-bold">
                TAPERED / GRADUAL SHADOW
              </div>
            </div>
            
            <div className="text-[11px] font-mono text-steel-400 leading-relaxed bg-ocean-900/60 p-2.5 rounded-lg border border-steel-800">
              <span className="text-amber-400 font-bold">Visual Characteristics: </span>
              {currentScenario.natural.highlightDesc} {currentScenario.natural.shadowDesc}
            </div>
          </div>

          {/* Acoustic Cross-Sectional Waveform (Bell Curve) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-steel-400">
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <Activity className="w-3 h-3" /> ACOUSTIC BACKSCATTER INTENSITY TRANSECT
              </span>
              <span>Gaussian Bell Curve (Gradual)</span>
            </div>
            <div 
              role="img" 
              aria-label={`Acoustic backscatter intensity transect for natural target ${currentScenario.natural.name}, showing Gaussian bell curve waveform`}
              className="h-28 w-full bg-black/60 rounded-lg border border-amber-900/40 p-2"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentScenario.natural.waveform} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#1e293b" />
                  <XAxis dataKey="x" hide />
                  <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 9 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020617', border: '1px solid #d97706', fontSize: '11px', fontFamily: 'monospace' }} 
                    formatter={(val) => [`${val} dB Backscatter`, 'Intensity']}
                  />
                  <Area type="monotone" dataKey="v" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.25} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quantitative Metrics Badge */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-amber-500/20 text-[10px] font-mono">
            <div className="bg-ocean-900/70 p-2 rounded border border-steel-800">
              <span className="text-steel-500 block">PEAK REFLECTIVITY:</span>
              <span className="text-amber-300 font-bold">{currentScenario.natural.backscatterPeak}</span>
            </div>
            <div className="bg-ocean-900/70 p-2 rounded border border-steel-800">
              <span className="text-steel-500 block">SHADOW GRADIENT:</span>
              <span className="text-amber-300 font-bold">{currentScenario.natural.shadowGradient}</span>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* RIGHT WINDOW: MAN-MADE OBJECT (ARTIFICIAL DEBRIS / STRUCTURE) */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="bg-ocean-950/80 border-2 border-white/10 rounded-lg p-4 md:p-5 flex flex-col justify-between space-y-4 relative overflow-hidden shadow-md">
          <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-900/50 rounded-md blur-3xl pointer-events-none" />

          {/* Window Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-cyan-400" />
              <h3 className="text-xs md:text-sm font-mono font-bold text-zinc-300 uppercase tracking-wider">
                MAN-MADE DEBRIS: {currentScenario.manMade.name}
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900/50 text-zinc-300 border border-white/10 font-bold animate-pulse">
              SHARP RAYLEIGH OCCLUSION
            </span>
          </div>

          {/* Real Sonar Image Preview Window */}
          <div className="space-y-2">
            <div className="relative rounded-lg overflow-hidden border border-white/10 bg-black h-48 group">
              <img 
                src={currentScenario.manMade.image} 
                alt="Man Made Sonar Target"
                className="w-full h-full object-cover grayscale contrast-125 brightness-110"
              />
              
              {/* Overlaid Annotation Badges on the Sonar Image */}
              <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md px-2 py-1 rounded border border-zinc-800 text-[10px] font-mono text-zinc-300 font-bold shadow-sm">
                SPECULAR METALLIC HIGHLIGHT (+18.4 dB)
              </div>
              <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md px-2 py-1 rounded border border-red-500 text-[10px] font-mono text-red-400 font-bold shadow-sm">
                ABSOLUTE ZERO-RETURN SHADOW (0 dB)
              </div>
            </div>
            
            <div className="text-[11px] font-mono text-steel-400 leading-relaxed bg-ocean-900/60 p-2.5 rounded-lg border border-steel-800">
              <span className="text-zinc-300 font-bold">Visual Characteristics: </span>
              {currentScenario.manMade.highlightDesc} {currentScenario.manMade.shadowDesc}
            </div>
          </div>

          {/* Acoustic Cross-Sectional Waveform (Step Function Cliff) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-steel-400">
              <span className="flex items-center gap-1 text-zinc-300 font-bold">
                <Activity className="w-3 h-3" /> ACOUSTIC BACKSCATTER INTENSITY TRANSECT
              </span>
              <span>Step-Function Drop to 0 dB</span>
            </div>
            <div 
              role="img" 
              aria-label={`Acoustic backscatter intensity transect for target ${currentScenario.manMade.name}, showing step-function drop to 0 dB shadow envelope`}
              className="h-28 w-full bg-black/60 rounded-lg border border-white/10 p-2"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentScenario.manMade.waveform} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#1e293b" />
                  <XAxis dataKey="x" hide />
                  <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 9 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020617', border: '1px solid #06b6d4', fontSize: '11px', fontFamily: 'monospace' }} 
                    formatter={(val) => [`${val} dB Backscatter`, 'Intensity']}
                  />
                  <ReferenceLine 
                    x={4.5} 
                    stroke="#ef4444" 
                    strokeDasharray="3 3" 
                    label={{ position: 'top', value: 'SHADOW ENVELOPE (0 dB)', fill: '#ef4444', fontSize: 9, fontFamily: 'monospace' }} 
                  />
                  <Area type="stepAfter" dataKey="v" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.25} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quantitative Metrics Badge */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-[10px] font-mono">
            <div className="bg-ocean-900/70 p-2 rounded border border-steel-800">
              <span className="text-steel-500 block">PEAK REFLECTIVITY:</span>
              <span className="text-zinc-300 font-bold">{currentScenario.manMade.backscatterPeak}</span>
            </div>
            <div className="bg-ocean-900/70 p-2 rounded border border-steel-800">
              <span className="text-steel-500 block">SHADOW GRADIENT:</span>
              <span className="text-zinc-300 font-bold">{currentScenario.manMade.shadowGradient}</span>
            </div>
          </div>
        </div>

      </div>

      {/* ── 4 KEY PHYSICAL CHARACTERISTIC COMPARISON STRIPS ── */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-zinc-300" />
          <h4 className="text-xs font-mono font-bold tracking-wider text-steel-200 uppercase">
            PHYSICAL CHARACTERISTICS MATRIX &amp; ACOUSTIC CRITERIA STRIPS
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Strip 1: Highlight Edge Geometry */}
          <div className="bg-ocean-900/80 border border-steel-800 rounded-lg p-3.5 space-y-2">
            <div className="text-[10px] font-mono font-bold text-steel-400 uppercase tracking-wider flex items-center justify-between">
              <span>1. HIGHLIGHT GEOMETRY</span>
              <span className="text-zinc-300">EDGE SHAPE</span>
            </div>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="p-1.5 rounded bg-amber-950/40 border border-amber-500/30 text-amber-300 text-[11px]">
                <span className="font-bold block">NATURAL:</span> Organic, fractal contour with diffuse scatter.
              </div>
              <div className="p-1.5 rounded bg-zinc-900/50 border border-white/10 text-zinc-300 text-[11px]">
                <span className="font-bold block">MAN-MADE:</span> Orthogonal 90° or cylindrical symmetry.
              </div>
            </div>
          </div>

          {/* Strip 2: Shadow Envelope Cutoff */}
          <div className="bg-ocean-900/80 border border-steel-800 rounded-lg p-3.5 space-y-2">
            <div className="text-[10px] font-mono font-bold text-steel-400 uppercase tracking-wider flex items-center justify-between">
              <span>2. SHADOW ENVELOPE</span>
              <span className="text-zinc-300">OCCLUSION</span>
            </div>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="p-1.5 rounded bg-amber-950/40 border border-amber-500/30 text-amber-300 text-[11px]">
                <span className="font-bold block">NATURAL:</span> Tapered decay (-1.2 dB/m) with ambient bleed.
              </div>
              <div className="p-1.5 rounded bg-zinc-900/50 border border-white/10 text-zinc-300 text-[11px]">
                <span className="font-bold block">MAN-MADE:</span> Instant step cliff (-20 dB/m) to dead black 0 dB.
              </div>
            </div>
          </div>

          {/* Strip 3: Acoustic Impedance */}
          <div className="bg-ocean-900/80 border border-steel-800 rounded-lg p-3.5 space-y-2">
            <div className="text-[10px] font-mono font-bold text-steel-400 uppercase tracking-wider flex items-center justify-between">
              <span>3. ACOUSTIC IMPEDANCE</span>
              <span className="text-zinc-300">MATERIAL</span>
            </div>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="p-1.5 rounded bg-amber-950/40 border border-amber-500/30 text-amber-300 text-[11px]">
                <span className="font-bold block">NATURAL:</span> 2.5–3.2 × 10⁶ Pa·s/m (Sediment &amp; granite).
              </div>
              <div className="p-1.5 rounded bg-zinc-900/50 border border-white/10 text-zinc-300 text-[11px]">
                <span className="font-bold block">MAN-MADE:</span> 44–48 × 10⁶ Pa·s/m (Corten &amp; alloy steel).
              </div>
            </div>
          </div>

          {/* Strip 4: 3D Height Ray-Tracing */}
          <div className="bg-ocean-900/80 border border-steel-800 rounded-lg p-3.5 space-y-2">
            <div className="text-[10px] font-mono font-bold text-steel-400 uppercase tracking-wider flex items-center justify-between">
              <span>4. HEIGHT RAY-TRACING</span>
              <span className="text-zinc-300">3D RELIEF</span>
            </div>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="p-1.5 rounded bg-amber-950/40 border border-amber-500/30 text-amber-300 text-[11px]">
                <span className="font-bold block">NATURAL:</span> Uneven height slopes along bedrock ridges.
              </div>
              <div className="p-1.5 rounded bg-zinc-900/50 border border-white/10 text-zinc-300 text-[11px]">
                <span className="font-bold block">MAN-MADE:</span> Constant height (h = H·Ls / (Rs+Ls)) ±5cm.
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── FOOTER CALLOUT ── */}
      <div className="p-3 bg-zinc-900/50 border border-white/10 rounded-lg flex items-start gap-3 text-xs font-mono text-steel-300">
        <Info className="w-4 h-4 text-zinc-300 flex-shrink-0 mt-0.5" />
        <div>
          <span className="text-zinc-300 font-bold">Why This Acoustic Physics Architecture is Unrivaled in SIH: </span>
          Traditional vision models confuse rocky seafloor ridges with sunken containers or mines because both appear as bright pixels. By coupling YOLO with the <strong>Urick Acoustic Shadow Occlusion Law</strong>, AQUILA physically measures the shadow cliff behind each target. If the shadow is gradual or missing, the system penalizes the score and routes it to the human verification queue.
        </div>
      </div>

    </div>
  );
}
