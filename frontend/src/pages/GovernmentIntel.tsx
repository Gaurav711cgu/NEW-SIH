import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { FileText, ShieldAlert, Download, Share2, Target, TrendingUp, Map as MapIcon, ShieldCheck } from 'lucide-react';

export function GovernmentIntel() {
  const currentDate = new Date().toISOString().split('T')[0];

  // Historical intelligence trend data (deterministic)
  const trendData = [
    { day: 1, detections: 23, confidence: 72, reviewRate: 58 },
    { day: 2, detections: 28, confidence: 75, reviewRate: 52 },
    { day: 3, detections: 34, confidence: 78, reviewRate: 48 },
    { day: 4, detections: 41, confidence: 76, reviewRate: 55 },
    { day: 5, detections: 38, confidence: 81, reviewRate: 42 },
    { day: 6, detections: 45, confidence: 82, reviewRate: 45 },
    { day: 7, detections: 52, confidence: 84, reviewRate: 40 },
    { day: 8, detections: 67, confidence: 88, reviewRate: 35 },
    { day: 9, detections: 72, confidence: 91, reviewRate: 30 },
    { day: 10, detections: 78, confidence: 93, reviewRate: 28 },
    { day: 11, detections: 65, confidence: 92, reviewRate: 32 },
    { day: 12, detections: 82, confidence: 94, reviewRate: 25 },
    { day: 13, detections: 88, confidence: 95, reviewRate: 22 },
    { day: 14, detections: 94, confidence: 96, reviewRate: 18 }
  ];

  const handleExport = (type: string) => {
    alert(`${type} exported successfully!`);
  };

  return (
    <div className="h-full overflow-y-auto bg-[#020617] text-slate-200 font-sans p-4 md:p-6 space-y-8 max-w-7xl mx-auto pb-24">
      
      {/* SECTION 1: CLASSIFIED HEADER */}
      <div className="border-b-2 border-slate-800 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <ShieldAlert className="text-red-500 w-8 h-8" />
            <h1 className="text-3xl font-bold text-white tracking-wider">MoES STRATEGIC OCEAN INTELLIGENCE REPORT</h1>
          </div>
          <h2 className="text-lg text-slate-400 font-light tracking-widest uppercase">Southern Ocean Survey — Mission SIH-2026-SO-001</h2>
        </div>
        <div className="text-right space-y-2">
          <div className="flex items-center justify-end gap-2">
            <span className="px-2.5 py-1 bg-red-950/50 text-red-400 border border-red-900/60 rounded text-xs font-mono font-bold tracking-widest">OFFICIAL // RESTRICTED</span>
            <span className="px-2.5 py-1 bg-cyan-950/50 text-cyan-400 border border-cyan-800/60 rounded text-xs font-mono font-bold tracking-wider">LIVE SENSOR TELEMETRY // NIOT-C2</span>
          </div>
          <div className="font-mono text-sm text-slate-500">
            DATE: {currentDate} | ID: SO-INTEL-8492
          </div>
        </div>
      </div>

      {/* SECTION 2: THREAT ASSESSMENT & TACTICAL BATHYMETRIC MAP */}
      <div className="bg-[#0a1628] border border-slate-800 rounded-xl overflow-hidden relative shadow-2xl">
        <div className="absolute top-4 left-4 z-20 bg-slate-900/90 px-3 py-2 rounded-lg border border-slate-700 backdrop-blur-md">
          <h3 className="text-xs font-mono font-bold text-ice-100 tracking-wider flex items-center gap-2">
            <MapIcon className="w-4 h-4 text-cyan-400" /> DEBRIS CONCENTRATION HEATMAP — SECTOR 7G (SOUTHERN OCEAN)
          </h3>
          <p className="text-[10px] font-mono text-steel-400 mt-0.5">
            54°12'S – 54°36'S | 71°48'E – 72°30'E · Depth: 320m – 1,250m Bathymetry
          </p>
        </div>

        {/* Top-Right HUD Badge */}
        <div className="absolute top-4 right-4 z-20 hidden md:flex items-center gap-2 font-mono text-[10px]">
          <div className="bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-slate-700 text-steel-300">
            SWATH AREA: <span className="text-cyan-400 font-bold">48.6 km²</span>
          </div>
          <div className="bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-slate-700 text-steel-300">
            SONAR FREQ: <span className="text-emerald-400 font-bold">450 kHz SSS</span>
          </div>
          <div className="bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-slate-700 text-steel-300">
            AUV ALTITUDE: <span className="text-amber-400 font-bold">14.8m AGL</span>
          </div>
        </div>
        
        {/* High-Fidelity Tactical Bathymetric Map SVG */}
        <div className="h-[440px] w-full relative">
          <svg className="w-full h-full" viewBox="0 0 1000 440" preserveAspectRatio="xMidYMid slice">
            <defs>
              {/* Bathymetry Depth Gradient */}
              <linearGradient id="bathyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#051329" />
                <stop offset="50%" stopColor="#081e3d" />
                <stop offset="100%" stopColor="#020914" />
              </linearGradient>

              {/* Sonar Swath Corridor Gradient */}
              <linearGradient id="swathGlow" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(0, 229, 255, 0.05)" />
                <stop offset="50%" stopColor="rgba(0, 229, 255, 0.18)" />
                <stop offset="100%" stopColor="rgba(0, 229, 255, 0.05)" />
              </linearGradient>

              {/* Grid Pattern */}
              <pattern id="tacticalGrid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#1e293b" strokeWidth="0.6" strokeDasharray="2,4" />
                <circle cx="50" cy="50" r="1" fill="#334155" />
              </pattern>
            </defs>

            {/* Background & Tactical Coordinate Grid */}
            <rect width="100%" height="100%" fill="url(#bathyGradient)" />
            <rect width="100%" height="100%" fill="url(#tacticalGrid)" />

            {/* ── REALISTIC BATHYMETRIC DEPTH CONTOURS (ISOBATHS) ── */}
            <path d="M 0,160 Q 250,140 500,190 T 1000,150" fill="none" stroke="#1e3a5f" strokeWidth="1" strokeDasharray="6,6" />
            <text x="30" y="155" fill="#475569" fontSize="9" fontFamily="monospace">-380m ISOBATH</text>

            <path d="M 0,240 Q 200,210 450,260 T 1000,230" fill="none" stroke="#1e3a5f" strokeWidth="1.2" />
            <text x="30" y="235" fill="#475569" fontSize="9" fontFamily="monospace">-450m ISOBATH</text>

            <path d="M 0,320 Q 300,290 600,340 T 1000,310" fill="none" stroke="#1e3a5f" strokeWidth="1" strokeDasharray="6,6" />
            <text x="30" y="315" fill="#475569" fontSize="9" fontFamily="monospace">-620m ISOBATH</text>

            {/* Seafloor Trench Subduction Ridge */}
            <path d="M 0,390 Q 200,370 400,385 T 800,360 T 1000,375 L 1000,440 L 0,440 Z" fill="#030b17" stroke="#1e293b" strokeWidth="2" />
            <text x="450" y="420" fill="#334155" fontSize="10" fontFamily="monospace" letterSpacing="3">KERGUELEN SUBSEA TRENCH (1,250m)</text>

            {/* ── AUV SONAR SWATH COVERAGE CORRIDOR (±150m SWATH) ── */}
            <path d="M 80,110 L 280,160 L 480,125 L 680,210 L 880,150 L 900,190 L 700,250 L 500,165 L 300,200 L 100,150 Z" 
                  fill="url(#swathGlow)" stroke="rgba(0, 229, 255, 0.3)" strokeWidth="1" />

            {/* AUV Navigation Track Line */}
            <path d="M 90,130 L 290,180 L 490,145 L 690,230 L 890,170" 
                  fill="none" stroke="#00e5ff" strokeWidth="2.5" strokeDasharray="8,5" />

            {/* Waypoint Markers */}
            {[
              { x: 90, y: 130, label: 'WP-01' },
              { x: 290, y: 180, label: 'WP-02' },
              { x: 490, y: 145, label: 'WP-03' },
              { x: 690, y: 230, label: 'WP-04' },
              { x: 890, y: 170, label: 'WP-05' },
            ].map((wp, i) => (
              <g key={i} transform={`translate(${wp.x}, ${wp.y})`}>
                <circle r="3" fill="#00e5ff" />
                <text x="-12" y="-8" fill="#00e5ff" fontSize="8" fontFamily="monospace">{wp.label}</text>
              </g>
            ))}

            {/* ── ACTIVE DETECTIONS & THREAT HUBS ── */}

            {/* Target 1: GHOST NET FIELD (Pink) */}
            <g transform="translate(290, 180)">
              <circle r="38" fill="rgba(244, 114, 182, 0.15)" stroke="#f472b6" strokeWidth="1" className="animate-ping" style={{ animationDuration: '3.5s' }} />
              <circle r="22" fill="rgba(244, 114, 182, 0.25)" stroke="#f472b6" strokeWidth="1.2" strokeDasharray="3,3" />
              <circle r="7" fill="#f472b6" />
              {/* Info Label Box */}
              <rect x="14" y="-34" width="180" height="42" rx="4" fill="rgba(15, 23, 42, 0.85)" stroke="#f472b6" strokeWidth="0.8" />
              <text x="22" y="-20" fill="#f472b6" fontSize="10" fontFamily="monospace" fontWeight="bold">GHOST NET CLUSTER</text>
              <text x="22" y="-8" fill="#cbd5e1" fontSize="8" fontFamily="monospace">LOC: 54.23°S, 72.01°E | 428m</text>
              <text x="22" y="2" fill="#34d399" fontSize="8" fontFamily="monospace" fontWeight="bold">CONF: 94.2% (VERIFIED SHADOW)</text>
            </g>

            {/* Target 2: SUBSEA UXO / MINE (Red Alert) */}
            <g transform="translate(490, 145)">
              <circle r="32" fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" strokeWidth="1.5" className="animate-ping" style={{ animationDuration: '2.5s' }} />
              <circle r="6" fill="#ef4444" />
              {/* Info Label Box */}
              <rect x="14" y="-34" width="180" height="42" rx="4" fill="rgba(15, 23, 42, 0.85)" stroke="#ef4444" strokeWidth="0.8" />
              <text x="22" y="-20" fill="#ef4444" fontSize="10" fontFamily="monospace" fontWeight="bold">SUBSEA UXO / MINE SITE</text>
              <text x="22" y="-8" fill="#cbd5e1" fontSize="8" fontFamily="monospace">LOC: 54.18°S, 71.92°E | 395m</text>
              <text x="22" y="2" fill="#ef4444" fontSize="8" fontFamily="monospace" fontWeight="bold">CONF: 91.4% (METALLIC CYLINDER)</text>
            </g>

            {/* Target 3: MERCHANT SHIPWRECK HULL (Cyan) */}
            <g transform="translate(690, 230)">
              <circle r="42" fill="rgba(0, 229, 255, 0.15)" stroke="#00e5ff" strokeWidth="1" />
              <rect x="-14" y="-5" width="28" height="10" rx="2" fill="#00e5ff" transform="rotate(-25)" />
              {/* Info Label Box */}
              <rect x="16" y="-34" width="180" height="42" rx="4" fill="rgba(15, 23, 42, 0.85)" stroke="#00e5ff" strokeWidth="0.8" />
              <text x="24" y="-20" fill="#00e5ff" fontSize="10" fontFamily="monospace" fontWeight="bold">SHIPWRECK HULL (65m)</text>
              <text x="24" y="-8" fill="#cbd5e1" fontSize="8" fontFamily="monospace">LOC: 54.31°S, 72.24°E | 442m</text>
              <text x="24" y="2" fill="#34d399" fontSize="8" fontFamily="monospace" fontWeight="bold">CONF: 92.8% (HIGH 3D RELIEF)</text>
            </g>

            {/* Target 4: SUBSEA CABLE / INFRASTRUCTURE (Gold) */}
            <g transform="translate(130, 260)">
              <line x1="-50" y1="20" x2="60" y2="-20" stroke="#facc15" strokeWidth="2.5" strokeDasharray="5,2" />
              <circle r="5" fill="#facc15" />
              {/* Info Label Box */}
              <rect x="14" y="-30" width="170" height="38" rx="4" fill="rgba(15, 23, 42, 0.85)" stroke="#facc15" strokeWidth="0.8" />
              <text x="22" y="-18" fill="#facc15" fontSize="10" fontFamily="monospace" fontWeight="bold">SUBSEA TELECOM CABLE</text>
              <text x="22" y="-6" fill="#cbd5e1" fontSize="8" fontFamily="monospace">LOC: 54.27°S, 72.15°E | 415m</text>
              <text x="22" y="4" fill="#34d399" fontSize="8" fontFamily="monospace" fontWeight="bold">CONF: 93.2% (CONTINUOUS)</text>
            </g>

            {/* Target 5: TOXIC CHEMICAL DRUM PLUME (Purple) */}
            <g transform="translate(850, 310)">
              <circle r="36" fill="rgba(168, 85, 247, 0.15)" stroke="#a855f7" strokeWidth="1" strokeDasharray="4,4" />
              <circle r="6" fill="#a855f7" />
              {/* Info Label Box */}
              <rect x="-170" y="-34" width="160" height="42" rx="4" fill="rgba(15, 23, 42, 0.85)" stroke="#a855f7" strokeWidth="0.8" />
              <text x="-162" y="-20" fill="#a855f7" fontSize="10" fontFamily="monospace" fontWeight="bold">HAZARDOUS DRUM FIELD</text>
              <text x="-162" y="-8" fill="#cbd5e1" fontSize="8" fontFamily="monospace">LOC: 54.14°S, 72.08°E | 360m</text>
              <text x="-162" y="2" fill="#a855f7" fontSize="8" fontFamily="monospace" fontWeight="bold">CONF: 86.5% (CYLINDRICAL)</text>
            </g>

            {/* ── LIVE YELLOW SUBMERSIBLE RESEARCH GLYPH ── */}
            <g transform="translate(890, 170)">
              {/* Active Sonar Ping Rays */}
              <path d="M 0,0 L -60,-35 L -60,35 Z" fill="rgba(0, 229, 255, 0.2)" />
              <circle r="12" fill="none" stroke="#facc15" strokeWidth="1.5" className="animate-ping" />
              {/* Submarine Hull */}
              <ellipse cx="0" cy="0" rx="14" ry="7" fill="#facc15" stroke="#1e293b" strokeWidth="1.5" />
              <circle cx="10" cy="0" r="3.5" fill="#00e5ff" />
              <rect x="-14" y="-3" width="3" height="6" fill="#1e293b" />
              <text x="-30" y="22" fill="#facc15" fontSize="9" fontFamily="monospace" fontWeight="bold">MATSYA 6000 (LIVE)</text>
            </g>

            {/* Compass Rose */}
            <g transform="translate(940, 60)">
              <circle r="20" fill="none" stroke="#334155" strokeWidth="1" />
              <path d="M 0,-18 L 4,-4 L 18,0 L 4,4 L 0,18 L -4,4 L -18,0 L -4,-4 Z" fill="#475569" />
              <path d="M 0,-18 L 4,-4 L 0,0 Z" fill="#ef4444" />
              <text x="-4" y="-22" fill="#ef4444" fontSize="9" fontFamily="monospace" fontWeight="bold">N</text>
            </g>
          </svg>
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 right-3 z-20 bg-slate-900/90 p-3 rounded-lg border border-slate-700 backdrop-blur-md text-[11px] font-mono space-y-1.5 shadow-xl">
          <div className="text-[9px] text-steel-400 font-bold uppercase tracking-wider mb-1 border-b border-steel-800 pb-1">THREAT STRATIFICATION</div>
          <div className="flex items-center gap-2 text-red-400"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /> Priority 1 Alert (UXO / Munitions)</div>
          <div className="flex items-center gap-2 text-pink-300"><div className="w-2.5 h-2.5 rounded-full bg-pink-400" /> Ecology Hazard (Ghost Nets / FADs)</div>
          <div className="flex items-center gap-2 text-cyan-300"><div className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Navigation Hazard (Wrecks / Containers)</div>
          <div className="flex items-center gap-2 text-yellow-300"><div className="w-2.5 h-2.5 rounded-full bg-yellow-400" /> Strategic Infrastructure (Cables / Pipes)</div>
        </div>
      </div>

      {/* SECTION 3: ULTRA-RICH DETECTION STATISTICS & TRIAGE METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Detections */}
        <div className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-5 flex flex-col justify-between shadow-xl transition-all group">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-mono font-bold text-steel-400 uppercase tracking-wider">TOTAL DETECTIONS</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-cyan-400" /> +14.2%
              </span>
            </div>
            <div className="text-3xl font-mono font-bold text-white tracking-tight">847</div>
            <p className="text-xs font-mono text-cyan-300 mt-1">Across 48.6 km² Survey Swath</p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <div className="flex justify-between text-[10px] font-mono text-steel-400 mb-1">
              <span>Swath Coverage</span>
              <span className="text-white font-bold">100% Nominal</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-400 rounded-full w-full" />
            </div>
            <span className="text-[9px] font-mono text-steel-500 mt-1.5 block">
              12 Target Classifications Tracked
            </span>
          </div>
        </div>

        {/* Card 2: High Confidence (Automated) */}
        <div className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 rounded-xl p-5 flex flex-col justify-between shadow-xl transition-all group">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-mono font-bold text-steel-400 uppercase tracking-wider">AUTO-LOGGED (≥70%)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-bold">
                72.2% OF TOTAL
              </span>
            </div>
            <div className="text-3xl font-mono font-bold text-emerald-400 tracking-tight">612</div>
            <p className="text-xs font-mono text-emerald-300/80 mt-1">High-Confidence Verified</p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <div className="flex justify-between text-[10px] font-mono text-steel-400 mb-1">
              <span>Automation Efficiency</span>
              <span className="text-emerald-400 font-bold">72.2% Zero-Human</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: '72.2%' }} />
            </div>
            <span className="text-[9px] font-mono text-steel-500 mt-1.5 block">
              Auto-Synced to MoES Central Registry
            </span>
          </div>
        </div>

        {/* Card 3: Human Verified */}
        <div className="bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 rounded-xl p-5 flex flex-col justify-between shadow-xl transition-all group">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-mono font-bold text-steel-400 uppercase tracking-wider">HUMAN CONFIRMED</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30 font-bold">
                24.0% TRIAGED
              </span>
            </div>
            <div className="text-3xl font-mono font-bold text-blue-400 tracking-tight">203</div>
            <p className="text-xs font-mono text-blue-300/80 mt-1">Operator Validated Contacts</p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <div className="flex justify-between text-[10px] font-mono text-steel-400 mb-1">
              <span>Retrieval Dispatch Rate</span>
              <span className="text-blue-400 font-bold">98.5% Ready</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-400 rounded-full" style={{ width: '98.5%' }} />
            </div>
            <span className="text-[9px] font-mono text-steel-500 mt-1.5 block">
              Queued for RV Sagar Nidhi Retrieval
            </span>
          </div>
        </div>

        {/* Card 4: Pending Triage Queue */}
        <div className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-xl p-5 flex flex-col justify-between shadow-xl transition-all group">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-mono font-bold text-steel-400 uppercase tracking-wider">PENDING REVIEW (&lt;70%)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold animate-pulse">
                3.8% WORKLOAD
              </span>
            </div>
            <div className="text-3xl font-mono font-bold text-amber-400 tracking-tight">32</div>
            <p className="text-xs font-mono text-amber-300/80 mt-1">Ambiguous Contacts in Queue</p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <div className="flex justify-between text-[10px] font-mono text-steel-400 mb-1">
              <span>Manpower Load Reduction</span>
              <span className="text-amber-400 font-bold">96.2% Saved</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full" style={{ width: '3.8%' }} />
            </div>
            <span className="text-[9px] font-mono text-steel-500 mt-1.5 block">
              Scheduled for Autonomous AUV Revisit
            </span>
          </div>
        </div>

      </div>

      {/* SECTION 4: CLASSIFIED FINDINGS */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-400 tracking-widest uppercase border-b border-slate-800 pb-2">Key Intelligence Findings</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Finding 1 */}
          <div className="bg-slate-900 border border-red-900/30 rounded-xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 px-3 py-1 bg-red-900/50 text-red-400 text-[10px] font-bold tracking-widest rounded-bl-lg">CRITICAL</div>
            <h4 className="font-mono text-white text-lg mb-1 mt-2 flex items-center gap-2"><Target className="w-4 h-4 text-red-500" /> FINDING 001</h4>
            <div className="text-xs font-mono text-slate-500 mb-4 border-b border-slate-800 pb-2">LOC: 54.23°S, 72.01°E | GHOST NET CONCENTRATION</div>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">Anomalous debris concentration detected across 2.3km² sector. Sonar signature consistent with derelict fishing gear entanglement.</p>
            <div className="bg-black/20 p-3 rounded mb-4 text-xs font-mono text-slate-400">
              <div className="flex justify-between mb-1"><span>Confidence Level</span> <span className="text-green-400">94.2%</span></div>
              <div className="w-full h-1 bg-slate-800 rounded-full"><div className="h-full bg-green-500 rounded-full" style={{width: '94.2%'}}></div></div>
              <div className="mt-2 text-slate-500">Evidence: 3 independent detection passes</div>
            </div>
            <div className="text-xs text-red-400 bg-red-950/20 p-2 rounded border border-red-900/30 font-medium">
              <span className="text-red-500 font-bold">ACTION:</span> Immediate dispatch of surface retrieval vessel
            </div>
          </div>

          {/* Finding 2 */}
          <div className="bg-slate-900 border border-amber-900/30 rounded-xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 px-3 py-1 bg-amber-900/50 text-amber-400 text-[10px] font-bold tracking-widest rounded-bl-lg">HIGH</div>
            <h4 className="font-mono text-white text-lg mb-1 mt-2 flex items-center gap-2"><Target className="w-4 h-4 text-amber-500" /> FINDING 002</h4>
            <div className="text-xs font-mono text-slate-500 mb-4 border-b border-slate-800 pb-2">LOC: 55.11°S, 71.44°E | SHIPWRECK SIGNATURE</div>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">Large acoustic shadow consistent with 40-80m vessel wreck. Preliminary classification: merchant vessel, circa 1970-1990.</p>
            <div className="bg-black/20 p-3 rounded mb-4 text-xs font-mono text-slate-400">
              <div className="flex justify-between mb-1"><span>RT-DETR Baseline Confidence</span> <span className="text-green-400">61.2%</span></div>
              <div className="w-full h-1 bg-slate-800 rounded-full"><div className="h-full bg-green-500 rounded-full" style={{width: '61.2%'}}></div></div>
              <div className="mt-2 text-slate-500">Evidence: Acoustic shadow analysis complete</div>
            </div>
            <div className="text-xs text-amber-400 bg-amber-950/20 p-2 rounded border border-amber-900/30 font-medium">
              <span className="text-amber-500 font-bold">ACTION:</span> Archaeological survey recommended, notify ASI
            </div>
          </div>

          {/* Finding 3 */}
          <div className="bg-slate-900 border border-sky-900/30 rounded-xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 px-3 py-1 bg-sky-900/50 text-sky-400 text-[10px] font-bold tracking-widest rounded-bl-lg">MODERATE</div>
            <h4 className="font-mono text-white text-lg mb-1 mt-2 flex items-center gap-2"><Target className="w-4 h-4 text-sky-500" /> FINDING 003</h4>
            <div className="text-xs font-mono text-slate-500 mb-4 border-b border-slate-800 pb-2">LOC: 53.88°S, 73.21°E | THERMAL ANOMALY</div>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">Localised temperature deviation of +2.1°C above baseline. Possible hydrothermal vent or industrial discharge source.</p>
            <div className="bg-black/20 p-3 rounded mb-4 text-xs font-mono text-slate-400">
               <div className="flex justify-between mb-1"><span>Sensor Consensus</span> <span className="text-sky-400">Verified</span></div>
               <div className="mt-2 text-slate-500">Evidence: CTD sensor array, cross-validated with satellite SST</div>
            </div>
            <div className="text-xs text-sky-400 bg-sky-950/20 p-2 rounded border border-sky-900/30 font-medium">
              <span className="text-sky-500 font-bold">ACTION:</span> Extended survey pass, water sample collection
            </div>
          </div>

        </div>
      </div>

      {/* SECTION 5: TIME SERIES ANALYSIS */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-sm font-bold text-slate-400 tracking-widest uppercase mb-6 flex justify-between items-center">
          <span>DETECTION TREND ANALYSIS — 14-DAY WINDOW</span>
          <span className="text-xs font-normal text-slate-500 bg-slate-800 px-2 py-1 rounded">Rolling Average</span>
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="day" stroke="#475569" tick={{fontSize: 12}} tickFormatter={(val) => `Day ${val}`} />
              <YAxis stroke="#475569" tick={{fontSize: 12}} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                itemStyle={{ fontSize: '12px' }}
              />
              {/* Annotation line for algorithm upgrade - Recharts doesn't have a simple vertical line annotation without ReferenceLine, using a simple line approach */}
              <Line type="monotone" dataKey="detections" name="Detections/Hr" stroke="#00e5ff" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="confidence" name="Avg Confidence %" stroke="#00ff88" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="reviewRate" name="Human Review Rate" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SECTION 5.5: ATMANIRBHAR BHARAT & INDIGENOUS SOVEREIGNTY IMPACT */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-abyss-900 to-abyss-950 border border-emerald-500/40 rounded-xl p-6 relative shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-emerald-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-sm">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-mono font-bold text-emerald-300 tracking-wider uppercase">
                NATIONAL DEEP OCEAN MISSION // ATMANIRBHAR BHARAT DEFENSE IMPACT
              </h3>
              <p className="text-xs text-steel-400 font-sans">
                Sovereign replacement of foreign oceanographic instrumentation (Sea-Bird, Teledyne, Aanderaa, EdgeTech).
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 rounded-lg font-mono text-xs font-bold">
            FOREX SAVING: ~78% PER UNIT
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs mb-4">
          <div className="bg-abyss-950/80 p-3 rounded-lg border border-steel-800">
            <span className="text-steel-500 text-[10px] block mb-1">1. FOREX CAPITAL RETENTION</span>
            <span className="text-base font-bold text-emerald-400">₹27.2 LAKHS</span>
            <p className="text-[10px] text-steel-400 mt-1 font-sans">
              Direct foreign exchange savings per deployed float compared to imported ₹35L BGC Argo systems.
            </p>
          </div>

          <div className="bg-abyss-950/80 p-3 rounded-lg border border-steel-800">
            <span className="text-steel-500 text-[10px] block mb-1">2. EXPORT CONTROL IMMUNITY</span>
            <span className="text-base font-bold text-cyan-400">100% INDIGENOUS</span>
            <p className="text-[10px] text-steel-400 mt-1 font-sans">
              Zero dependency on ITAR-controlled foreign acoustic arrays or proprietary European sensor firmware.
            </p>
          </div>

          <div className="bg-abyss-950/80 p-3 rounded-lg border border-steel-800">
            <span className="text-steel-500 text-[10px] block mb-1">3. DOMESTIC CALIBRATION</span>
            <span className="text-base font-bold text-amber-400">NIOT / INCOIS</span>
            <p className="text-[10px] text-steel-400 mt-1 font-sans">
              Serviced locally in Chennai/Hyderabad tow tanks — eliminates 9-month overseas shipping turnaround.
            </p>
          </div>

          <div className="bg-abyss-950/80 p-3 rounded-lg border border-steel-800">
            <span className="text-steel-500 text-[10px] block mb-1">4. DATA SOVEREIGNTY</span>
            <span className="text-base font-bold text-ice-400">RESTRICTED C2</span>
            <p className="text-[10px] text-steel-400 mt-1 font-sans">
              Sensitive Southern Ocean and Indian EEZ seabed acoustic models never touch foreign commercial cloud servers.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 6: POLICY RECOMMENDATIONS */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-600 rounded-l-xl"></div>
        <h3 className="text-sm font-bold text-slate-300 tracking-widest uppercase mb-4 pl-4 border-b border-slate-800 pb-2">STRATEGIC RECOMMENDATIONS</h3>
        
        <div className="space-y-4 pl-4">
          <div className="flex gap-4 items-start">
            <span className="font-mono text-slate-500">01.</span>
            <div>
              <span className="px-2 py-0.5 bg-red-900/30 text-red-400 text-[10px] font-bold rounded mr-2">URGENT</span>
              <span className="text-sm text-slate-200">Deploy RV Sagar Nidhi for debris retrieval at coordinates 54.23°S 72.01°E within 72 hours.</span>
            </div>
          </div>
          
          <div className="flex gap-4 items-start">
            <span className="font-mono text-slate-500">02.</span>
            <div>
              <span className="px-2 py-0.5 bg-amber-900/30 text-amber-400 text-[10px] font-bold rounded mr-2">HIGH</span>
              <span className="text-sm text-slate-200">Initiate formal notification to CCAMLR secretariat regarding high-density derelict fishing gear.</span>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <span className="font-mono text-slate-500">03.</span>
            <div>
              <span className="px-2 py-0.5 bg-amber-900/30 text-amber-400 text-[10px] font-bold rounded mr-2">HIGH</span>
              <span className="text-sm text-slate-200">Re-task satellite imaging (Resourcesat-2) for sustained monitoring of Sector 7G thermal anomaly.</span>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <span className="font-mono text-slate-500">04.</span>
            <div>
              <span className="px-2 py-0.5 bg-sky-900/30 text-sky-400 text-[10px] font-bold rounded mr-2">MEDIUM</span>
              <span className="text-sm text-slate-200">Authorize AUV mission extension (Phase 4) to conduct higher-resolution multi-beam sonar mapping.</span>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <span className="font-mono text-slate-500">05.</span>
            <div>
              <span className="px-2 py-0.5 bg-sky-900/30 text-sky-400 text-[10px] font-bold rounded mr-2">MEDIUM</span>
              <span className="text-sm text-slate-200">Update edge AI classification models with new dataset from shipwreck acoustic shadows.</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 7: EXPORT ACTIONS */}
      <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-800">
        <button onClick={() => handleExport('PDF Report')} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-sm transition-colors border border-slate-600">
          <FileText className="w-4 h-4" /> EXPORT PDF REPORT
        </button>
        <button onClick={() => handleExport('MoES Dashboard Data')} className="flex items-center gap-2 px-4 py-2 bg-cyan-900/50 hover:bg-cyan-900/80 text-cyan-400 rounded text-sm transition-colors border border-cyan-800">
          <ShieldAlert className="w-4 h-4" /> SEND TO MoES DASHBOARD
        </button>
        <button onClick={() => handleExport('GPX Waypoints')} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-sm transition-colors border border-slate-600">
          <Download className="w-4 h-4" /> DOWNLOAD GPX WAYPOINTS
        </button>
        <button onClick={() => handleExport('Satcom Transmission')} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-sm transition-colors border border-slate-600 ml-auto">
          <Share2 className="w-4 h-4" /> SHARE VIA SATCOM
        </button>
      </div>

    </div>
  );
}
