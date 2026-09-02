import { useState, useEffect } from 'react';
import { 
  Activity, 
  Battery, 
  Compass, 
  Navigation, 
  Radio, 
  DatabaseZap, 
  Cpu, 
  Anchor, 
  ShieldCheck, 
  AlertTriangle,
  Zap,
  Target,
  Radar,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import MissionTerminal from '../components/MissionTerminal';

type SurveyMode = 'LAWNMOWER' | 'CONTOUR_FOLLOW' | 'HOVER_STATION';

interface ModeConfig {
  name: string;
  code: string;
  speed: string;
  altitude: string;
  sonarFreq: string;
  swathWidth: string;
  powerDraw: string;
  desc: string;
  waypoints: { id: string; target: string; eta: string; status: 'DONE' | 'ACTIVE' | 'PENDING' }[];
}

const MODE_PROFILES: Record<SurveyMode, ModeConfig> = {
  LAWNMOWER: {
    name: 'LAWNMOWER SWATH MAPPING',
    code: 'NAV_PATT_PARALLEL_SSS',
    speed: '3.2 kts (1.65 m/s)',
    altitude: '25.0 m above seabed',
    sonarFreq: '450 kHz High-Res',
    swathWidth: '150 m total swath',
    powerDraw: '142 Watts (Cruising)',
    desc: 'Systematic parallel swath coverage for wide-area marine debris search and high-speed acoustic imaging.',
    waypoints: [
      { id: 'WP-01', target: '54.218°S, 60.812°E (Transect Alpha)', eta: '00:00', status: 'DONE' },
      { id: 'WP-02', target: '54.224°S, 60.835°E (Transect Bravo)', eta: '00:14', status: 'ACTIVE' },
      { id: 'WP-03', target: '54.230°S, 60.858°E (Transect Charlie)', eta: '00:38', status: 'PENDING' },
      { id: 'WP-04', target: '54.236°S, 60.881°E (Transect Delta)', eta: '01:02', status: 'PENDING' }
    ]
  },
  CONTOUR_FOLLOW: {
    name: 'BATHYMETRIC CONTOUR TRACKING',
    code: 'NAV_TERRAIN_AVOID_CLOSE',
    speed: '1.8 kts (0.92 m/s)',
    altitude: '12.0 m (Seabed Lock)',
    sonarFreq: '900 kHz Ultra-Res',
    swathWidth: '70 m targeted swath',
    powerDraw: '188 Watts (Vertical Dynamic)',
    desc: 'Close-range terrain-following autopilot riding bathymetric contours to detect debris hidden in seabed trenches and rock drops.',
    waypoints: [
      { id: 'CP-01', target: 'Seabed Ridge (420m Contour)', eta: '00:00', status: 'DONE' },
      { id: 'CP-02', target: 'Subsea Canyon Wall (-485m)', eta: '00:08', status: 'ACTIVE' },
      { id: 'CP-03', target: 'Acoustic Shadow Basin (-510m)', eta: '00:24', status: 'PENDING' },
      { id: 'CP-04', target: 'Shelf Boundary Ascent (-390m)', eta: '00:45', status: 'PENDING' }
    ]
  },
  HOVER_STATION: {
    name: 'STATIONARY TARGET HOVER',
    code: 'NAV_INSPECTION_360_ORBIT',
    speed: '0.2 kts (Station Holding)',
    altitude: '6.5 m Precision Orbit',
    sonarFreq: '1.2 MHz Optical/Acoustic',
    swathWidth: '15 m Micro-Inspection Grid',
    powerDraw: '96 Watts (Vector Hover)',
    desc: '360° closed-loop interrogation around an identified high-value anomaly or ghost net cluster with thruster active stabilization.',
    waypoints: [
      { id: 'HP-01', target: 'Target Acquisition Centroid', eta: '00:00', status: 'DONE' },
      { id: 'HP-02', target: 'Quadrant 1 Photogrammetry (0°)', eta: '00:03', status: 'ACTIVE' },
      { id: 'HP-03', target: 'Quadrant 2 Shadow Profile (90°)', eta: '00:09', status: 'PENDING' },
      { id: 'HP-04', target: 'Quadrant 3-4 Multi-Angle (180°-270°)', eta: '00:18', status: 'PENDING' }
    ]
  }
};

export function MissionControl() {
  const [data, setData] = useState<any>({
    depth_m: 412.5,
    battery_pct: 88.4,
    imu_roll: 1.2,
    imu_pitch: -0.8,
    lat: -54.2184,
    lon: 60.8312,
    phase: 'SUBMERGED_EDGE_AI',
    mission_state: 'SUBMERGED_EDGE_AI',
    uptime_s: 1420
  });

  const [phase, setPhase] = useState("SUBMERGED_EDGE_AI");
  const [commandLog, setCommandLog] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] AUTOPILOT INITIALIZED: LAWNMOWER PATTERN ACTIVE`,
    `[${new Date().toLocaleTimeString()}] SSS ACOUSTIC TRANSLATION: 450 kHz NOMINAL`
  ]);
  const [activeMode, setActiveMode] = useState<SurveyMode>('LAWNMOWER');
  const [syncing, setSyncing] = useState(false);
  const [calibrating, setCalibrating] = useState(false);
  const [emergencyModal, setEmergencyModal] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/telemetry', { signal: AbortSignal.timeout(2000) });
        if (res.ok) {
          const json = await res.json();
          setData(json);
          setPhase(json.mission_state || json.phase || 'SUBMERGED_EDGE_AI');
        }
      } catch {
        setData((prev: any) => ({
          ...prev
        }));
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectMode = (mode: SurveyMode) => {
    setActiveMode(mode);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setCommandLog(prev => [
      `[${timeStr}] MODE SHIFT: ${MODE_PROFILES[mode].name} (${MODE_PROFILES[mode].code}) -> ENGAGED`,
      ...prev.slice(0, 7)
    ]);
    setSyncing(true);
    setTimeout(() => setSyncing(false), 900);
  };

  const handleSendCommand = (cmd: string, desc: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setCommandLog(prev => [`[${timeStr}] UPLINK DISPATCH: ${desc} -> ACK_0x9F (EXECUTING)`, ...prev.slice(0, 7)]);
    
    if (cmd === 'CALIBRATE') {
      setCalibrating(true);
      setTimeout(() => {
        setCalibrating(false);
        const t2 = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setCommandLog(prev => [`[${t2}] SSS CALIBRATION COMPLETE: Slant-Range & Radiometric Gain Corrected`, ...prev.slice(0, 7)]);
      }, 2500);
    } else {
      setSyncing(true);
      setTimeout(() => setSyncing(false), 1200);
    }
  };

  const currentProfile = MODE_PROFILES[activeMode];

  return (
    <div className="h-full p-4 md:p-6 overflow-y-auto flex flex-col gap-5 text-steel-100 bg-gradient-to-b from-abyss-950 via-abyss-900 to-abyss-950">
      
      {/* ── TOP OPERATIONAL LINK STATUS BAR ── */}
      <div className="bg-abyss-900/90 border border-steel-800/80 rounded-xl p-4 shadow-2xl backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-ice-500/10 border border-ice-500/30 flex items-center justify-center text-ice-400">
            <Anchor className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-mono font-bold text-sm text-ice-100 tracking-wider">AUV MISSION COMMAND & CONTROL</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                LINK: USBL ACOUSTIC MODEM (8.5 kHz)
              </span>
            </div>
            <p className="text-xs font-mono text-steel-400 mt-0.5">
              ACTIVE PATTERN: <span className="text-ice-300 font-semibold">{currentProfile.name}</span> | TRANSECT 7G
            </p>
          </div>
        </div>

        {/* Status Mode Banner */}
        <div className="flex items-center gap-4">
          <div className={`px-3.5 py-1.5 rounded-lg border font-mono text-xs tracking-wider flex items-center gap-2 ${
            phase === 'SATCOM_UPLINK' 
              ? 'border-ice-500/50 text-ice-300 bg-ice-950/40 shadow-ice-500/10' 
              : 'border-cyan-500/40 text-cyan-300 bg-cyan-950/30'
          }`}>
            <Radio className="w-3.5 h-3.5 animate-pulse text-ice-400" />
            <span>
              {phase === 'SATCOM_UPLINK' 
                ? 'SATCOM BURST UPLINK ACTIVE' 
                : 'SUBMERGED: EDGE AI ACTIVE + USBL TELEMETRY'}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-steel-800">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono text-steel-300 font-semibold">C2 LINK: NOMINAL</span>
          </div>
        </div>

      </div>

      {/* ── ROW 1: LIVE VEHICLE TELEMETRY MATRIX ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Metric 1: Depth */}
        <div className="bg-abyss-900/80 border border-steel-800/80 hover:border-ice-500/40 rounded-xl p-4 shadow-lg relative group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-steel-400 tracking-wider">VEHICLE DEPTH</span>
            <Activity className="w-4 h-4 text-ice-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-steel-50">
              {(data?.depth_m || 412.5).toFixed(1)}
            </span>
            <span className="text-xs font-mono text-ice-400">METERS</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[9px] font-mono text-steel-500 border-t border-steel-800/60 pt-2">
            <span>TARGET ALTITUDE: {currentProfile.altitude}</span>
            <span className="text-emerald-400">STATUS: LOCKED</span>
          </div>
        </div>

        {/* Metric 2: Battery */}
        <div className="bg-abyss-900/80 border border-steel-800/80 hover:border-ice-500/40 rounded-xl p-4 shadow-lg relative group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-steel-400 tracking-wider">POWER CONSUMPTION</span>
            <Battery className={`w-4 h-4 ${(data?.battery_pct || 88) < 25 ? 'text-red-400' : 'text-emerald-400'}`} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-steel-50">
              {(data?.battery_pct || 88.4).toFixed(1)}
            </span>
            <span className="text-xs font-mono text-ice-400">%</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[9px] font-mono text-steel-500 border-t border-steel-800/60 pt-2">
            <span>DRAW: {currentProfile.powerDraw}</span>
            <span className="text-ice-300">EST: 18.2 HRS</span>
          </div>
        </div>

        {/* Metric 3: Survey Speed */}
        <div className="bg-abyss-900/80 border border-steel-800/80 hover:border-ice-500/40 rounded-xl p-4 shadow-lg relative group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-steel-400 tracking-wider">NAV SPEED & FREQ</span>
            <Compass className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-steel-50">
              {currentProfile.speed.split(' ')[0]}
            </span>
            <span className="text-xs font-mono text-ice-400">KNOTS</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[9px] font-mono text-steel-500 border-t border-steel-800/60 pt-2">
            <span>SONAR: {currentProfile.sonarFreq}</span>
            <span className="text-emerald-400">SWATH: {currentProfile.swathWidth.split(' ')[0]}m</span>
          </div>
        </div>

        {/* Metric 4: Navigation Lock */}
        <div className="bg-abyss-900/80 border border-steel-800/80 hover:border-ice-500/40 rounded-xl p-4 shadow-lg relative group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-steel-400 tracking-wider">SUBSEA POSITIONING</span>
            <Navigation className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-mono font-bold text-steel-50 tracking-tight">
              INS + DVL
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-semibold">USBL LOCKED</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[9px] font-mono text-steel-500 border-t border-steel-800/60 pt-2">
            <span>DRIFT: ±0.08 m/hr</span>
            <span className="text-ice-300">CODE: {currentProfile.code.split('_')[1]}</span>
          </div>
        </div>

      </div>

      {/* ── ROW 2: INTERACTIVE DYNAMIC TRAJECTORY & FLIGHT PATH VISUALIZER ── */}
      <div className="bg-abyss-900/80 border border-steel-800/80 rounded-xl p-5 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-steel-800/80">
          <div>
            <div className="flex items-center gap-2">
              <Radar className="w-5 h-5 text-ice-400 animate-spin" style={{ animationDuration: '6s' }} />
              <h2 className="text-xs font-mono font-bold tracking-widest text-ice-100 uppercase">
                DYNAMIC FLIGHT PATH & ACOUSTIC SWATH FOOTPRINT — {currentProfile.name}
              </h2>
            </div>
            <p className="text-xs text-steel-400 mt-1 font-sans">
              {currentProfile.desc}
            </p>
          </div>

          {/* Mode Selector Buttons with Immediate Visual Responsiveness */}
          <div className="flex items-center gap-2 bg-abyss-950 p-1.5 rounded-lg border border-steel-800">
            <button 
              onClick={() => handleSelectMode('LAWNMOWER')}
              className={`px-3 py-2 rounded-md font-mono text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeMode === 'LAWNMOWER'
                  ? 'bg-ice-500 text-abyss-950 shadow-lg shadow-ice-500/25 scale-[1.02]'
                  : 'text-steel-400 hover:text-ice-300 hover:bg-steel-900'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              LAWNMOWER
            </button>

            <button 
              onClick={() => handleSelectMode('CONTOUR_FOLLOW')}
              className={`px-3 py-2 rounded-md font-mono text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeMode === 'CONTOUR_FOLLOW'
                  ? 'bg-amber-400 text-abyss-950 shadow-lg shadow-amber-400/25 scale-[1.02]'
                  : 'text-steel-400 hover:text-amber-300 hover:bg-steel-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              CONTOUR
            </button>

            <button 
              onClick={() => handleSelectMode('HOVER_STATION')}
              className={`px-3 py-2 rounded-md font-mono text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeMode === 'HOVER_STATION'
                  ? 'bg-emerald-400 text-abyss-950 shadow-lg shadow-emerald-400/25 scale-[1.02]'
                  : 'text-steel-400 hover:text-emerald-300 hover:bg-steel-900'
              }`}
            >
              <Anchor className="w-3.5 h-3.5" />
              STATION HOVER
            </button>
          </div>
        </div>

        {/* Dynamic Canvas / SVG Display that completely transforms per mode */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Visual Vector Trajectory Display with Real Bathymetry & Tactical Navigation */}
          <div className="lg:col-span-8 bg-abyss-950 rounded-xl border border-steel-800 p-3 relative overflow-hidden h-[340px] flex flex-col justify-between">
            
            {/* Real Bathymetric Map Header Overlay */}
            <div className="absolute top-2.5 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-2 bg-abyss-900/90 px-2.5 py-1 rounded border border-steel-800 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-[10px] text-steel-200 font-bold">
                  SECTOR 7G HYDROGRAPHIC SURVEY
                </span>
                <span className="font-mono text-[9px] text-steel-500">| 54°13.2'S, 72°01.4'E</span>
              </div>

              {/* Compass Rose */}
              <div className="bg-abyss-900/90 p-1.5 rounded-full border border-steel-800 flex items-center justify-center w-8 h-8 shadow-md">
                <div className="relative w-full h-full flex items-center justify-center font-mono text-[8px] font-bold text-steel-400">
                  <span className="absolute -top-1 text-red-400 font-black">N</span>
                  <div className="w-[1px] h-4 bg-gradient-to-b from-red-500 to-steel-600 rotate-12" />
                </div>
              </div>
            </div>

            {/* ── MODE 1: LAWNMOWER TACTICAL SEABED MAP ── */}
            {activeMode === 'LAWNMOWER' && (
              <svg className="w-full h-full relative z-10" viewBox="0 0 680 300">
                <defs>
                  {/* Bathymetry Gradient */}
                  <linearGradient id="bathyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#031022" />
                    <stop offset="50%" stopColor="#051937" />
                    <stop offset="100%" stopColor="#020b18" />
                  </linearGradient>
                  {/* Sonar Swath Glow */}
                  <linearGradient id="swathGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(0, 229, 255, 0.04)" />
                    <stop offset="50%" stopColor="rgba(0, 229, 255, 0.22)" />
                    <stop offset="100%" stopColor="rgba(0, 229, 255, 0.04)" />
                  </linearGradient>
                </defs>

                {/* Seafloor Background */}
                <rect width="680" height="300" fill="url(#bathyGradient)" rx="8" />

                {/* Bathymetric Depth Contours */}
                <path d="M 0 60 Q 200 40 400 70 T 680 50" fill="none" stroke="rgba(56, 189, 248, 0.12)" strokeWidth="1.5" />
                <text x="610" y="48" fill="#475569" fontSize="8" fontFamily="monospace">420m</text>

                <path d="M 0 140 Q 220 120 440 150 T 680 130" fill="none" stroke="rgba(56, 189, 248, 0.12)" strokeWidth="1.5" />
                <text x="610" y="128" fill="#475569" fontSize="8" fontFamily="monospace">440m</text>

                <path d="M 0 220 Q 240 200 480 230 T 680 210" fill="none" stroke="rgba(56, 189, 248, 0.12)" strokeWidth="1.5" />
                <text x="610" y="208" fill="#475569" fontSize="8" fontFamily="monospace">460m</text>

                {/* ── TRANSECT 1 (COMPLETED & SCANNED) ── */}
                <rect x="50" y="45" width="560" height="34" fill="url(#swathGlow)" rx="4" />
                <line x1="50" y1="62" x2="610" y2="62" stroke="#10b981" strokeWidth="2" strokeDasharray="6 4" />
                <circle cx="60" cy="62" r="5" fill="#10b981" />
                <text x="72" y="66" fill="#10b981" fontSize="10" fontFamily="monospace" fontWeight="bold">WP-01 [SCANNED]</text>

                {/* Turn Radius 1 */}
                <path d="M 610 62 C 640 62 640 130 610 130" fill="none" stroke="#00e5ff" strokeWidth="2" strokeDasharray="3 3" />
                <circle cx="625" cy="96" r="4" fill="#f59e0b" />
                <text x="560" y="100" fill="#f59e0b" fontSize="9" fontFamily="monospace">TURN R=25m</text>

                {/* ── TRANSECT 2 (ACTIVE SWEEP WITH MOVING AUV) ── */}
                {/* Scanned portion behind AUV */}
                <rect x="360" y="113" width="250" height="34" fill="url(#swathGlow)" rx="4" />
                {/* Upcoming unscanned portion */}
                <rect x="50" y="113" width="310" height="34" fill="rgba(30, 41, 59, 0.35)" stroke="rgba(71, 85, 105, 0.4)" strokeDasharray="4 4" rx="4" />
                <line x1="610" y1="130" x2="50" y2="130" stroke="#00e5ff" strokeWidth="2.5" strokeDasharray="8 4" />

                {/* Sonar Acoustic Swath Waves emitting from AUV */}
                <path d="M 360 130 L 320 95 L 320 165 Z" fill="rgba(0, 229, 255, 0.2)" stroke="#00e5ff" strokeWidth="1" />
                <path d="M 360 130 L 400 95 L 400 165 Z" fill="rgba(0, 229, 255, 0.2)" stroke="#00e5ff" strokeWidth="1" />
                
                {/* AUV Submarine Vessel Glyph */}
                <g transform="translate(360, 130) rotate(180)">
                  <ellipse cx="0" cy="0" rx="14" ry="6" fill="#facc15" stroke="#ffffff" strokeWidth="1.5" />
                  <rect x="-16" y="-3" width="4" height="6" fill="#ef4444" />
                  <circle cx="10" cy="0" r="2.5" fill="#00e5ff" />
                </g>

                <text x="385" y="125" fill="#ffffff" fontSize="11" fontFamily="monospace" fontWeight="bold">AUV MATSYA 6000</text>
                <text x="385" y="139" fill="#00e5ff" fontSize="9" fontFamily="monospace">SPD: 2.8 kts · ALT: 14.8m</text>

                {/* Detected Target Marker along transect */}
                <circle cx="210" cy="130" r="8" fill="rgba(239, 68, 68, 0.3)" className="animate-ping" />
                <rect x="204" y="124" width="12" height="12" fill="#ef4444" stroke="#ffffff" strokeWidth="1" />
                <text x="160" y="110" fill="#ef4444" fontSize="9" fontFamily="monospace" fontWeight="bold">⚠️ TARGET 01: NET DEBRIS</text>

                {/* Turn Radius 2 */}
                <path d="M 50 130 C 20 130 20 198 50 198" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="3 3" />

                {/* ── TRANSECT 3 (QUEUED) ── */}
                <rect x="50" y="181" width="560" height="34" fill="rgba(15, 23, 42, 0.6)" stroke="rgba(51, 65, 85, 0.5)" strokeDasharray="4 4" rx="4" />
                <line x1="50" y1="198" x2="610" y2="198" stroke="#64748b" strokeWidth="1.5" strokeDasharray="6 6" />
                <circle cx="60" cy="198" r="4" fill="#64748b" />
                <text x="72" y="202" fill="#64748b" fontSize="9" fontFamily="monospace">WP-03 [QUEUED TRANSECT]</text>

                {/* Turn Radius 3 */}
                <path d="M 610 198 C 640 198 640 260 610 260" fill="none" stroke="#334155" strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="610" y1="260" x2="50" y2="260" stroke="#334155" strokeWidth="1.5" strokeDasharray="6 6" />
                <text x="72" y="264" fill="#475569" fontSize="9" fontFamily="monospace">WP-04 [FINAL LEG]</text>
              </svg>
            )}

            {/* ── MODE 2: CONTOUR-FOLLOWING 2.5D TERRAIN PROFILE ── */}
            {activeMode === 'CONTOUR_FOLLOW' && (
              <svg className="w-full h-full relative z-10" viewBox="0 0 680 300">
                <defs>
                  <linearGradient id="seabedGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1e293b" />
                    <stop offset="100%" stopColor="#090d16" />
                  </linearGradient>
                </defs>

                {/* Water Column */}
                <rect width="680" height="300" fill="#020b18" rx="8" />

                {/* Depth Guidelines */}
                <line x1="40" y1="80" x2="640" y2="80" stroke="rgba(71, 85, 105, 0.3)" strokeDasharray="4 4" />
                <text x="45" y="75" fill="#64748b" fontSize="9" fontFamily="monospace">DEPTH: 400m</text>

                <line x1="40" y1="160" x2="640" y2="160" stroke="rgba(71, 85, 105, 0.3)" strokeDasharray="4 4" />
                <text x="45" y="155" fill="#64748b" fontSize="9" fontFamily="monospace">DEPTH: 450m</text>

                {/* Rugged Seafloor Bathymetry Terrain */}
                <path d="M 0 240 Q 140 180 260 250 T 480 190 T 680 230 L 680 300 L 0 300 Z" fill="url(#seabedGrad)" stroke="#475569" strokeWidth="2.5" />

                {/* Constant 15m Altitude Flight Envelope Profile */}
                <path d="M 0 195 Q 140 135 260 205 T 480 145 T 680 185" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="6 4" />

                {/* Active AUV on Terrain Lock */}
                <g transform="translate(360, 168)">
                  <ellipse cx="0" cy="0" rx="14" ry="6" fill="#facc15" stroke="#ffffff" strokeWidth="1.5" />
                  <circle cx="10" cy="0" r="2.5" fill="#00e5ff" />
                  {/* Downward Altimeter Laser Ping */}
                  <line x1="0" y1="6" x2="0" y2="48" stroke="#ef4444" strokeWidth="2" strokeDasharray="2 2" className="animate-pulse" />
                  <circle cx="0" cy="48" r="4" fill="#ef4444" />
                </g>

                <text x="390" y="162" fill="#f59e0b" fontSize="11" fontFamily="monospace" fontWeight="bold">TERRAIN ALTIMETER LOCK</text>
                <text x="390" y="176" fill="#94a3b8" fontSize="9" fontFamily="monospace">ALTITUDE: 15.0m AGL · PITCH: -4.2°</text>

                {/* Sonar Scan Swath on Terrain */}
                <polygon points="360,174 300,230 420,210" fill="rgba(245, 158, 11, 0.15)" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="1" />
              </svg>
            )}

            {/* ── MODE 3: STATION-HOVER 360° ORBITAL INSPECTION ── */}
            {activeMode === 'HOVER_STATION' && (
              <svg className="w-full h-full relative z-10" viewBox="0 0 680 300">
                {/* Seafloor Target Background */}
                <rect width="680" height="300" fill="#020b18" rx="8" />

                {/* Target Anomaly in Center */}
                <g transform="translate(340, 150)">
                  <rect x="-24" y="-18" width="48" height="36" fill="rgba(239, 68, 68, 0.3)" stroke="#ef4444" strokeWidth="2" rx="4" />
                  <text x="-48" y="-26" fill="#ef4444" fontSize="10" fontFamily="monospace" fontWeight="bold">TARGET CONTACT: SHIPWRECK HULL</text>
                  <text x="-36" y="32" fill="#94a3b8" fontSize="8" fontFamily="monospace">LAT: 54.231°S · LON: 72.018°E</text>

                  {/* 360 Degree Orbit Inspection Rings */}
                  <circle cx="0" cy="0" r="70" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="6 4" />
                  <circle cx="0" cy="0" r="105" fill="none" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="1" />

                  {/* 8 Multi-Angle Capture Nodes */}
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
                    const rad = (deg * Math.PI) / 180;
                    const nx = Math.cos(rad) * 70;
                    const ny = Math.sin(rad) * 70;
                    return (
                      <g key={deg}>
                        <circle cx={nx} cy={ny} r="3.5" fill="#10b981" />
                        <line x1={nx} y1={ny} x2="0" y2="0" stroke="rgba(16, 185, 129, 0.15)" strokeWidth="1" />
                      </g>
                    );
                  })}

                  {/* Active AUV at 45 degree station */}
                  <g transform="translate(49, -49) rotate(-135)">
                    <ellipse cx="0" cy="0" rx="12" ry="5" fill="#facc15" stroke="#ffffff" strokeWidth="1.5" />
                    <line x1="0" y1="0" x2="0" y2="-60" stroke="#00e5ff" strokeWidth="1.5" strokeDasharray="2 2" />
                    {/* Camera Spotlight Cone */}
                    <polygon points="0,0 -20,-50 20,-50" fill="rgba(0, 229, 255, 0.2)" />
                  </g>
                </g>

                <text x="420" y="90" fill="#10b981" fontSize="11" fontFamily="monospace" fontWeight="bold">ORBITAL STATION LOCK</text>
                <text x="420" y="104" fill="#94a3b8" fontSize="9" fontFamily="monospace">RADIUS: 12.5m · 8/8 ANGLE INSPECTION</text>
              </svg>
            )}

            {/* ── MAP FOOTER: SCALE BAR & TACTICAL LEGEND ── */}
            <div className="absolute bottom-2 left-3 right-3 z-20 flex flex-wrap items-center justify-between font-mono text-[9px] bg-abyss-900/90 px-3 py-1.5 rounded-lg border border-steel-800 backdrop-blur-sm pointer-events-none">
              
              {/* Tactical Legend */}
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2.5 h-2 rounded bg-emerald-500/30 border border-emerald-400 inline-block" /> SCANNED SWATH
                </span>
                <span className="flex items-center gap-1 text-ice-400">
                  <span className="w-2.5 h-0.5 bg-ice-400 inline-block" /> FLIGHT TRANSECT
                </span>
                <span className="flex items-center gap-1 text-yellow-300">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" /> AUV VESSEL
                </span>
                <span className="flex items-center gap-1 text-red-400">
                  <span className="w-2 h-2 bg-red-500 inline-block" /> TARGET CONTACT
                </span>
              </div>

              {/* Scale Bar */}
              <div className="flex items-center gap-2 text-steel-400">
                <span>SCALE:</span>
                <div className="flex items-center">
                  <div className="w-8 h-1 bg-steel-400" />
                  <div className="w-8 h-1 bg-steel-600" />
                </div>
                <span className="text-steel-300 font-bold">100 METERS</span>
              </div>

            </div>

          </div>

          <div className="lg:col-span-4 bg-abyss-950 rounded-xl border border-steel-800 p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-steel-800">
                <span className="text-[10px] font-mono font-bold text-steel-400 tracking-wider">
                  WAYPOINT TRANSECT QUEUE
                </span>
                <span className="text-[9px] font-mono text-emerald-400 font-semibold">SEQUENCING</span>
              </div>

              <div className="space-y-2">
                {currentProfile.waypoints.map((wp) => (
                  <div 
                    key={wp.id} 
                    className={`p-2 rounded-lg border font-mono text-[10px] flex items-center justify-between ${
                      wp.status === 'ACTIVE' 
                        ? 'bg-ice-500/10 border-ice-500/40 text-ice-200 shadow-md' 
                        : wp.status === 'DONE'
                        ? 'bg-steel-900/40 border-steel-800/60 text-steel-500'
                        : 'bg-abyss-900/40 border-steel-800 text-steel-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {wp.status === 'DONE' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      ) : wp.status === 'ACTIVE' ? (
                        <div className="w-2 h-2 rounded-full bg-ice-400 animate-ping flex-shrink-0" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-steel-600 flex-shrink-0" />
                      )}
                      <div className="truncate">
                        <span className="font-bold text-steel-300 mr-1">{wp.id}:</span>
                        <span className="truncate">{wp.target}</span>
                      </div>
                    </div>
                    <span className="text-[9px] text-steel-500 flex-shrink-0 ml-2">{wp.eta}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-steel-800/80 text-[9px] font-mono text-steel-500 flex justify-between">
              <span>EST TOTAL DURATION: 03H 45M</span>
              <span className="text-ice-400">AUTO-RESUME: ON</span>
            </div>

          </div>

        </div>

      </div>

      {/* ── ROW 3: LIVE MISSION TERMINAL + C2 UPLINK COMMANDS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left (7 Cols): Live Tactical Mission Terminal */}
        <div className="lg:col-span-7 flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-ice-400" />
              <h2 className="text-xs font-mono font-bold tracking-widest text-steel-200 uppercase">
                TACTICAL C2 DATASTREAM & EDGE AI TELEMETRY
              </h2>
            </div>
            <span className="text-[10px] font-mono text-emerald-400">STREAM: 8.5 kHz CARRIER</span>
          </div>

          <div className="bg-abyss-950 rounded-xl border border-steel-800/80 shadow-2xl overflow-hidden">
            <MissionTerminal height={340} />
          </div>
        </div>

        {/* Right (5 Cols): Command Dispatch Actions */}
        <div className="lg:col-span-5 bg-abyss-900/80 border border-steel-800/80 rounded-xl p-4 shadow-xl flex flex-col justify-between">
          
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-steel-800 pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-mono font-bold tracking-wider text-steel-200 uppercase">
                  DIRECTIVE UPLINK ACTIONS
                </h3>
              </div>
              <span className="text-[10px] font-mono text-ice-400">ACOUSTIC MODEM</span>
            </div>

            {/* Quick Command Directives */}
            <div className="grid grid-cols-2 gap-2.5 font-mono text-xs mb-4">
              
              <button 
                onClick={() => handleSendCommand('CALIBRATE', 'EXEC_SWATH_CALIBRATION')}
                disabled={calibrating}
                className="p-3 bg-abyss-950 hover:bg-steel-800/80 border border-steel-800 hover:border-ice-500/60 rounded-xl text-left text-steel-200 flex items-center justify-between transition-all group shadow-md"
              >
                <div>
                  <span className="font-bold text-ice-300 block">CALIBRATE SSS</span>
                  <span className="text-[9px] text-steel-500">Radiometric gain</span>
                </div>
                <Zap className={`w-4 h-4 text-ice-400 group-hover:scale-110 transition-transform ${calibrating ? 'animate-spin' : ''}`} />
              </button>

              <button 
                onClick={() => handleSendCommand('BURST', 'TRIGGER_BURST_SATCOM')}
                className="p-3 bg-abyss-950 hover:bg-steel-800/80 border border-steel-800 hover:border-cyan-500/60 rounded-xl text-left text-steel-200 flex items-center justify-between transition-all group shadow-md"
              >
                <div>
                  <span className="font-bold text-cyan-300 block">BURST SYNC</span>
                  <span className="text-[9px] text-steel-500">Flush data buffer</span>
                </div>
                <DatabaseZap className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              </button>

              <button 
                onClick={() => handleSendCommand('HOLD', 'HOLD_DEPTH_STATION')}
                className="p-3 bg-abyss-950 hover:bg-steel-800/80 border border-steel-800 hover:border-amber-500/60 rounded-xl text-left text-steel-200 flex items-center justify-between transition-all group shadow-md"
              >
                <div>
                  <span className="font-bold text-amber-300 block">HOLD DEPTH</span>
                  <span className="text-[9px] text-steel-500">Stationary hover</span>
                </div>
                <Anchor className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              </button>

              <button 
                onClick={() => setEmergencyModal(true)}
                className="p-3 bg-red-950/30 hover:bg-red-900/50 border border-red-800/60 hover:border-red-500 rounded-xl text-left text-red-300 flex items-center justify-between transition-all group shadow-md"
              >
                <div>
                  <span className="font-bold text-red-400 block">EMERGENCY SURFACE</span>
                  <span className="text-[9px] text-red-500">Drop ballast</span>
                </div>
                <AlertTriangle className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
              </button>

            </div>

            {/* Command Dispatch Feedback */}
            <div className="bg-abyss-950 p-3 rounded-lg border border-steel-800 font-mono text-[10px] space-y-1 min-h-[90px]">
              <div className="flex justify-between text-steel-500 mb-1 border-b border-steel-800/60 pb-1">
                <span>TELECOMMAND ACKNOWLEDGEMENT LOG:</span>
                <span className="text-emerald-400 font-semibold">BURST DISPATCH READY</span>
              </div>
              {calibrating && (
                <div className="text-ice-400 animate-pulse font-bold">CALIBRATING SLANT-RANGE & RADIOMETRIC SSS TRANSDUCER...</div>
              )}
              {syncing && !calibrating && (
                <div className="text-cyan-400 animate-pulse">TRANSMITTING ACOUSTIC TELECOMMAND VIA USBL MODEM...</div>
              )}
              {commandLog.map((log, idx) => (
                <div key={idx} className="text-emerald-400/90 truncate">{log}</div>
              ))}
            </div>

          </div>

          <div className="mt-3 pt-2 border-t border-steel-800/60 flex items-center justify-between text-[10px] font-mono text-steel-500">
            <span>ENCRYPTION: AES-256 (NAVAL C2)</span>
            <span className="text-emerald-400">TRANSPONDER: LOCKED</span>
          </div>

        </div>

      </div>

      {/* Emergency Abort Confirmation Modal */}
      {emergencyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-abyss-900 border-2 border-red-500 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-500">
              <AlertTriangle className="w-8 h-8 animate-bounce" />
              <h3 className="text-lg font-mono font-bold">CONFIRM EMERGENCY SURFACE</h3>
            </div>
            
            <p className="text-xs font-mono text-steel-300 leading-relaxed">
              This will drop the magnetic drop-weight ballast, inflate emergency buoyancy bladders, and command immediate vertical ascent to surface for satcom recovery.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-steel-800">
              <button 
                onClick={() => setEmergencyModal(false)}
                className="px-4 py-2 rounded-lg font-mono text-xs bg-steel-800 hover:bg-steel-700 text-steel-300"
              >
                CANCEL
              </button>
              <button 
                onClick={() => {
                  setEmergencyModal(false);
                  handleSendCommand('EMERGENCY_SURFACE', 'CRITICAL_BALLAST_DROP_INITIATED');
                }}
                className="px-4 py-2 rounded-lg font-mono text-xs bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg shadow-red-600/30"
              >
                DISPATCH BALLAST DROP
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
