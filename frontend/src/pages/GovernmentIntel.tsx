import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { FileText, ShieldAlert, Download, Share2, Target, TrendingUp, Map as MapIcon, ShieldCheck, X } from 'lucide-react';

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

  // Export & communication state
  const [moesSubmission, setMoesSubmission] = useState<{
    refId: string;
    timestamp: string;
    status: string;
  } | null>(null);

  const [satcomTransmission, setSatcomTransmission] = useState<{
    frequency: string;
    checksum: string;
    timestamp: string;
    status: string;
    packetBytes: number;
  } | null>(null);

  const [gpxDownloaded, setGpxDownloaded] = useState<boolean>(false);

  // 1. Download GPX waypoints
  const handleDownloadGPX = () => {
    const waypoints = [
      { lat: -54.2300, lon: 72.0100, ele: -428, name: 'WP-01 GHOST NET CLUSTER', desc: 'Target: Derelict Fishing Gear | Conf: 94.2% | Verified Acoustic Shadow', type: 'Debris Target' },
      { lat: -54.1800, lon: 71.9200, ele: -395, name: 'WP-02 SUBSEA UXO MINE', desc: 'Target: Subsea Ordnance / Mine Site | Conf: 91.4% | Metallic Cylinder', type: 'Hazmat Threat' },
      { lat: -54.3100, lon: 72.2400, ele: -442, name: 'WP-03 SHIPWRECK HULL', desc: 'Target: Merchant Vessel Hull (65m) | Conf: 92.8% | High 3D Relief', type: 'Archaeological' },
      { lat: -54.2700, lon: 72.1500, ele: -415, name: 'WP-04 SUBSEA CABLE', desc: 'Target: Subsea Telecom Cable | Conf: 93.2% | Continuous Linear Return', type: 'Infrastructure' },
      { lat: -54.1400, lon: 72.0800, ele: -360, name: 'WP-05 HAZARDOUS DRUM FIELD', desc: 'Target: Chemical Drum Plume | Conf: 86.5% | Cylindrical Container Field', type: 'Hazmat Threat' },
    ];

    const wptXml = waypoints.map(w => `  <wpt lat="${w.lat.toFixed(4)}" lon="${w.lon.toFixed(4)}">
    <ele>${w.ele}</ele>
    <name>${w.name}</name>
    <desc>${w.desc}</desc>
    <type>${w.type}</type>
  </wpt>`).join('\n');

    const gpxString = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="AQUILA OS - Autonomous Subsea Intelligence" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>AQUILA Mission Waypoints - Southern Ocean Survey</name>
    <desc>Mission SIH-2026-SO-001 Target Contacts &amp; Tactical Waypoints</desc>
    <time>${new Date().toISOString()}</time>
  </metadata>
${wptXml}
</gpx>`;

    const blob = new Blob([gpxString], { type: 'application/gpx+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'aquila_mission_waypoints.gpx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setGpxDownloaded(true);
    setTimeout(() => setGpxDownloaded(false), 4000);
  };

  // 2. Export PDF Report
  const handleExportPDF = () => {
    window.print();
  };

  // 3. Send to MoES Dashboard
  const handleSendMoES = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setMoesSubmission({
      refId: `MOES-INCOIS-SIH2024-${randomSuffix}`,
      timestamp: new Date().toISOString(),
      status: 'TRANSMITTED & ACKNOWLEDGED'
    });
  };

  // 4. Share via Satcom
  const handleShareSatcom = () => {
    const randomChecksum = '0x' + Math.floor(Math.random() * 0xFFFFFFFF).toString(16).toUpperCase().padStart(8, '0');
    setSatcomTransmission({
      frequency: '401.65 MHz (Argos-4 / INSAT MSS)',
      checksum: randomChecksum,
      timestamp: new Date().toISOString(),
      status: 'BURST UPLINK SYNCHRONIZED',
      packetBytes: 4280
    });
  };

  return (
    <div className="h-full overflow-y-auto bg-transparent text-slate-200 font-sans p-4 md:p-6 space-y-8 max-w-7xl mx-auto pb-24">
      
      {/* SECTION 1: CLASSIFIED HEADER */}
      <div className="border-b-2 border-slate-700/50 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <ShieldAlert className="text-slate-400 w-8 h-8" />
            <h1 className="text-3xl font-bold text-white tracking-wider">MoES STRATEGIC OCEAN INTELLIGENCE REPORT</h1>
          </div>
          <h2 className="text-lg text-slate-400 font-light tracking-widest uppercase">Southern Ocean Survey — Mission SIH-2026-SO-001</h2>
        </div>
        <div className="text-right space-y-2">
          <div className="flex items-center justify-end gap-2">
            <span className="px-2.5 py-1 bg-slate-800/60 text-slate-400 border border-slate-700/50 rounded text-xs font-mono font-bold tracking-widest">MISSION DEMONSTRATION DATA</span>
            <span className="px-2.5 py-1 bg-slate-800/60 text-zinc-300 border border-slate-700/50 rounded text-xs font-mono font-bold tracking-wider">SIMULATED 14-DAY MISSION REPLAY</span>
          </div>
          <div className="font-mono text-sm text-slate-500">
            DATE: {currentDate} | ID: SO-INTEL-8492
          </div>
        </div>
      </div>

      {/* SECTION 2: THREAT ASSESSMENT & TACTICAL BATHYMETRIC MAP */}
      <div className="bg-slate-900/60 backdrop-blur-sm/60 backdrop-blur-sm border border-slate-700/50 rounded-lg overflow-hidden relative shadow-md">
        <div className="absolute top-4 left-4 z-20 bg-slate-900/60 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-700 backdrop-blur-md">
          <h3 className="text-xs font-mono font-bold text-ice-100 tracking-wider flex items-center gap-2">
            <MapIcon className="w-4 h-4 text-zinc-300" /> DEBRIS CONCENTRATION HEATMAP — SECTOR 7G (SOUTHERN OCEAN)
          </h3>
          <p className="text-[10px] font-mono text-steel-400 mt-0.5">
            54°12'S – 54°36'S | 71°48'E – 72°30'E · Depth: 320m – 1,250m Bathymetry
          </p>
        </div>

        {/* Top-Right HUD Badge */}
        <div className="absolute top-4 right-4 z-20 hidden md:flex items-center gap-2 font-mono text-[10px]">
          <div className="bg-slate-900/60 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-slate-700 text-steel-300">
            SWATH AREA: <span className="text-zinc-300 font-bold">48.6 km²</span>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-slate-700 text-steel-300">
            SONAR FREQ: <span className="text-slate-300 font-bold">450 kHz SSS</span>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-slate-700 text-steel-300">
            AUV ALTITUDE: <span className="text-slate-300 font-bold">14.8m AGL</span>
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
                <stop offset="0%" stopColor="rgba(148, 163, 184, 0.05)" />
                <stop offset="50%" stopColor="rgba(148, 163, 184, 0.18)" />
                <stop offset="100%" stopColor="rgba(148, 163, 184, 0.05)" />
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
                  fill="url(#swathGlow)" stroke="rgba(148, 163, 184, 0.3)" strokeWidth="1" />

            {/* AUV Navigation Track Line */}
            <path d="M 90,130 L 290,180 L 490,145 L 690,230 L 890,170" 
                  fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeDasharray="8,5" />

            {/* Waypoint Markers */}
            {[
              { x: 90, y: 130, label: 'WP-01' },
              { x: 290, y: 180, label: 'WP-02' },
              { x: 490, y: 145, label: 'WP-03' },
              { x: 690, y: 230, label: 'WP-04' },
              { x: 890, y: 170, label: 'WP-05' },
            ].map((wp, i) => (
              <g key={i} transform={`translate(${wp.x}, ${wp.y})`}>
                <circle r="3" fill="#94a3b8" />
                <text x="-12" y="-8" fill="#94a3b8" fontSize="8" fontFamily="monospace">{wp.label}</text>
              </g>
            ))}

            {/* ── ACTIVE DETECTIONS & THREAT HUBS ── */}

            {/* Target 1: GHOST NET FIELD (Pink) */}
            <g transform="translate(290, 180)">
              <circle r="38" fill="rgba(148, 163, 184, 0.1)" stroke="#94a3b8" strokeWidth="1"  style={{ animationDuration: '3.5s' }} />
              <circle r="22" fill="rgba(148, 163, 184, 0.2)" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="3,3" />
              <circle r="7" fill="#94a3b8" />
              {/* Info Label Box */}
              <rect x="14" y="-34" width="180" height="42" rx="4" fill="rgba(15, 23, 42, 0.85)" stroke="#94a3b8" strokeWidth="0.8" />
              <text x="22" y="-20" fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">GHOST NET CLUSTER</text>
              <text x="22" y="-8" fill="#94a3b8" fontSize="8" fontFamily="monospace">LOC: 54.23°S, 72.01°E | 428m</text>
              <text x="22" y="2" fill="#94a3b8" fontSize="8" fontFamily="monospace" fontWeight="bold">CONF: 94.2% (VERIFIED SHADOW)</text>
            </g>

            {/* Target 2: SUBSEA UXO / MINE (Red Alert) */}
            <g transform="translate(490, 145)">
              <circle r="32" fill="rgba(148, 163, 184, 0.15)" stroke="#94a3b8" strokeWidth="1.5"  style={{ animationDuration: '2.5s' }} />
              <circle r="6" fill="#94a3b8" />
              {/* Info Label Box */}
              <rect x="14" y="-34" width="180" height="42" rx="4" fill="rgba(15, 23, 42, 0.85)" stroke="#94a3b8" strokeWidth="0.8" />
              <text x="22" y="-20" fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">SUBSEA UXO / MINE SITE</text>
              <text x="22" y="-8" fill="#94a3b8" fontSize="8" fontFamily="monospace">LOC: 54.18°S, 71.92°E | 395m</text>
              <text x="22" y="2" fill="#94a3b8" fontSize="8" fontFamily="monospace" fontWeight="bold">CONF: 91.4% (METALLIC CYLINDER)</text>
            </g>

            {/* Target 3: MERCHANT SHIPWRECK HULL (Cyan) */}
            <g transform="translate(690, 230)">
              <circle r="42" fill="rgba(148, 163, 184, 0.15)" stroke="#94a3b8" strokeWidth="1" />
              <rect x="-14" y="-5" width="28" height="10" rx="2" fill="#94a3b8" transform="rotate(-25)" />
              {/* Info Label Box */}
              <rect x="16" y="-34" width="180" height="42" rx="4" fill="rgba(15, 23, 42, 0.85)" stroke="#94a3b8" strokeWidth="0.8" />
              <text x="24" y="-20" fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">SHIPWRECK HULL (65m)</text>
              <text x="24" y="-8" fill="#94a3b8" fontSize="8" fontFamily="monospace">LOC: 54.31°S, 72.24°E | 442m</text>
              <text x="24" y="2" fill="#94a3b8" fontSize="8" fontFamily="monospace" fontWeight="bold">CONF: 92.8% (HIGH 3D RELIEF)</text>
            </g>

            {/* Target 4: SUBSEA CABLE / INFRASTRUCTURE (Gold) */}
            <g transform="translate(130, 260)">
              <line x1="-50" y1="20" x2="60" y2="-20" stroke="#94a3b8" strokeWidth="2.5" strokeDasharray="5,2" />
              <circle r="5" fill="#94a3b8" />
              {/* Info Label Box */}
              <rect x="14" y="-30" width="170" height="38" rx="4" fill="rgba(15, 23, 42, 0.85)" stroke="#94a3b8" strokeWidth="0.8" />
              <text x="22" y="-18" fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">SUBSEA TELECOM CABLE</text>
              <text x="22" y="-6" fill="#94a3b8" fontSize="8" fontFamily="monospace">LOC: 54.27°S, 72.15°E | 415m</text>
              <text x="22" y="4" fill="#94a3b8" fontSize="8" fontFamily="monospace" fontWeight="bold">CONF: 93.2% (CONTINUOUS)</text>
            </g>

            {/* Target 5: TOXIC CHEMICAL DRUM PLUME (Purple) */}
            <g transform="translate(850, 310)">
              <circle r="36" fill="rgba(148, 163, 184, 0.1)" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4,4" />
              <circle r="6" fill="#94a3b8" />
              {/* Info Label Box */}
              <rect x="-170" y="-34" width="160" height="42" rx="4" fill="rgba(15, 23, 42, 0.85)" stroke="#94a3b8" strokeWidth="0.8" />
              <text x="-162" y="-20" fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">HAZARDOUS DRUM FIELD</text>
              <text x="-162" y="-8" fill="#94a3b8" fontSize="8" fontFamily="monospace">LOC: 54.14°S, 72.08°E | 360m</text>
              <text x="-162" y="2" fill="#94a3b8" fontSize="8" fontFamily="monospace" fontWeight="bold">CONF: 86.5% (CYLINDRICAL)</text>
            </g>

            {/* ── LIVE YELLOW SUBMERSIBLE RESEARCH GLYPH ── */}
            <g transform="translate(890, 170)">
              {/* Active Sonar Ping Rays */}
              <path d="M 0,0 L -60,-35 L -60,35 Z" fill="rgba(148, 163, 184, 0.2)" />
              <circle r="12" fill="none" stroke="#94a3b8" strokeWidth="1.5"  />
              {/* Submarine Hull */}
              <ellipse cx="0" cy="0" rx="14" ry="7" fill="#94a3b8" stroke="#1e293b" strokeWidth="1.5" />
              <circle cx="10" cy="0" r="3.5" fill="#94a3b8" />
              <rect x="-14" y="-3" width="3" height="6" fill="#1e293b" />
              <text x="-30" y="22" fill="#94a3b8" fontSize="9" fontFamily="monospace" fontWeight="bold">MATSYA 6000 (LIVE)</text>
            </g>

            {/* Compass Rose */}
            <g transform="translate(940, 60)">
              <circle r="20" fill="none" stroke="#334155" strokeWidth="1" />
              <path d="M 0,-18 L 4,-4 L 18,0 L 4,4 L 0,18 L -4,4 L -18,0 L -4,-4 Z" fill="#475569" />
              <path d="M 0,-18 L 4,-4 L 0,0 Z" fill="#94a3b8" />
              <text x="-4" y="-22" fill="#94a3b8" fontSize="9" fontFamily="monospace" fontWeight="bold">N</text>
            </g>
          </svg>
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 right-3 z-20 bg-slate-900/60 backdrop-blur-sm p-3 rounded-lg border border-slate-700 backdrop-blur-md text-[11px] font-mono space-y-1.5 shadow-md">
          <div className="text-[9px] text-steel-400 font-bold uppercase tracking-wider mb-1 border-b border-steel-800 pb-1">THREAT STRATIFICATION</div>
          <div className="flex items-center gap-2 text-slate-400"><div className="w-2.5 h-2.5 rounded-full bg-slate-800/60" /> Priority 1 Alert (UXO / Munitions)</div>
          <div className="flex items-center gap-2 text-zinc-300"><div className="w-2.5 h-2.5 rounded-md bg-slate-800/60" /> Ecology Hazard (Ghost Nets / FADs)</div>
          <div className="flex items-center gap-2 text-zinc-300"><div className="w-2.5 h-2.5 rounded-md bg-cyan-400" /> Navigation Hazard (Wrecks / Containers)</div>
          <div className="flex items-center gap-2 text-zinc-400"><div className="w-2.5 h-2.5 rounded-md bg-slate-800/60" /> Strategic Infrastructure (Cables / Pipes)</div>
        </div>
      </div>

      {/* SECTION 3: ULTRA-RICH DETECTION STATISTICS & TRIAGE METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Detections */}
        <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 hover:border-slate-700/50 rounded-lg p-5 flex flex-col justify-between shadow-md transition-all group">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-mono font-bold text-steel-400 uppercase tracking-wider">TOTAL DETECTIONS</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/60 text-zinc-300 border border-slate-700/50 font-bold flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-zinc-300" /> +14.2%
              </span>
            </div>
            <div className="text-3xl font-mono font-bold text-white tracking-tight">847</div>
            <p className="text-xs font-mono text-zinc-300 mt-1">Across 48.6 km² Survey Swath</p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-700/50/80">
            <div className="flex justify-between text-[10px] font-mono text-steel-400 mb-1">
              <span>Swath Coverage</span>
              <span className="text-white font-bold">100% Nominal</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-md overflow-hidden">
              <div className="h-full bg-cyan-400 rounded-md w-full" />
            </div>
            <span className="text-[9px] font-mono text-steel-500 mt-1.5 block">
              12 Target Classifications Tracked
            </span>
          </div>
        </div>

        {/* Card 2: High Confidence (Automated) */}
        <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 hover:border-slate-700/50 rounded-lg p-5 flex flex-col justify-between shadow-md transition-all group">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-mono font-bold text-steel-400 uppercase tracking-wider">AUTO-LOGGED (≥70%)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/60 text-slate-300 border border-slate-700/50 font-bold">
                72.2% OF TOTAL
              </span>
            </div>
            <div className="text-3xl font-mono font-bold text-slate-300 tracking-tight">612</div>
            <p className="text-xs font-mono text-slate-300/80 mt-1">High-Confidence Verified</p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-700/50/80">
            <div className="flex justify-between text-[10px] font-mono text-steel-400 mb-1">
              <span>Automation Efficiency</span>
              <span className="text-slate-300 font-bold">72.2% Zero-Human</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-md overflow-hidden">
              <div className="h-full bg-slate-800/60 rounded-md" style={{ width: '72.2%' }} />
            </div>
            <span className="text-[9px] font-mono text-steel-500 mt-1.5 block">
              Auto-Synced to MoES Central Registry
            </span>
          </div>
        </div>

        {/* Card 3: Human Verified */}
        <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 hover:border-slate-700/50 rounded-lg p-5 flex flex-col justify-between shadow-md transition-all group">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-mono font-bold text-steel-400 uppercase tracking-wider">HUMAN CONFIRMED</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/60 text-zinc-300 border border-slate-700/50 font-bold">
                24.0% TRIAGED
              </span>
            </div>
            <div className="text-3xl font-mono font-bold text-zinc-300 tracking-tight">203</div>
            <p className="text-xs font-mono text-zinc-300/80 mt-1">Operator Validated Contacts</p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-700/50/80">
            <div className="flex justify-between text-[10px] font-mono text-steel-400 mb-1">
              <span>Retrieval Dispatch Rate</span>
              <span className="text-zinc-300 font-bold">98.5% Ready</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-md overflow-hidden">
              <div className="h-full bg-blue-400 rounded-md" style={{ width: '98.5%' }} />
            </div>
            <span className="text-[9px] font-mono text-steel-500 mt-1.5 block">
              Queued for RV Sagar Nidhi Retrieval
            </span>
          </div>
        </div>

        {/* Card 4: Pending Triage Queue */}
        <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 hover:border-slate-600 rounded-lg p-5 flex flex-col justify-between shadow-md transition-all group">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-mono font-bold text-steel-400 uppercase tracking-wider">PENDING REVIEW (&lt;70%)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/60 text-slate-400 border border-slate-700/50 font-bold ">
                3.8% WORKLOAD
              </span>
            </div>
            <div className="text-3xl font-mono font-bold text-slate-300 tracking-tight">32</div>
            <p className="text-xs font-mono text-slate-400/80 mt-1">Ambiguous Contacts in Queue</p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-700/50/80">
            <div className="flex justify-between text-[10px] font-mono text-steel-400 mb-1">
              <span>Manpower Load Reduction</span>
              <span className="text-slate-300 font-bold">96.2% Saved</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-md overflow-hidden">
              <div className="h-full bg-slate-800/60 rounded-md" style={{ width: '3.8%' }} />
            </div>
            <span className="text-[9px] font-mono text-steel-500 mt-1.5 block">
              Scheduled for Autonomous AUV Revisit
            </span>
          </div>
        </div>

      </div>

      {/* SECTION 4: CLASSIFIED FINDINGS */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-400 tracking-widest uppercase border-b border-slate-700/50 pb-2">Key Intelligence Findings</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Finding 1 */}
          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 rounded-lg p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 px-3 py-1 bg-slate-800/60 text-slate-400 text-[10px] font-bold tracking-widest rounded-bl-lg">CRITICAL</div>
            <h4 className="font-mono text-white text-lg mb-1 mt-2 flex items-center gap-2"><Target className="w-4 h-4 text-slate-400" /> FINDING 001</h4>
            <div className="text-xs font-mono text-slate-500 mb-4 border-b border-slate-700/50 pb-2">LOC: 54.23°S, 72.01°E | GHOST NET CONCENTRATION</div>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">Anomalous debris concentration detected across 2.3km² sector. Sonar signature consistent with derelict fishing gear entanglement.</p>
            <div className="bg-black/20 p-3 rounded mb-4 text-xs font-mono text-slate-400">
              <div className="flex justify-between mb-1"><span>Confidence Level</span> <span className="text-green-400">94.2%</span></div>
              <div className="w-full h-1 bg-slate-800 rounded-md"><div className="h-full bg-green-500 rounded-md" style={{width: '94.2%'}}></div></div>
              <div className="mt-2 text-slate-500">Evidence: 3 independent detection passes</div>
            </div>
            <div className="text-xs text-slate-400 bg-slate-800/60 p-2 rounded border border-slate-700/50 font-medium">
              <span className="text-slate-400 font-bold">ACTION:</span> Immediate dispatch of surface retrieval vessel
            </div>
          </div>

          {/* Finding 2 */}
          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700 rounded-lg p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 px-3 py-1 bg-slate-800/60 text-slate-300 text-[10px] font-bold tracking-widest rounded-bl-lg">HIGH</div>
            <h4 className="font-mono text-white text-lg mb-1 mt-2 flex items-center gap-2"><Target className="w-4 h-4 text-slate-300" /> FINDING 002</h4>
            <div className="text-xs font-mono text-slate-500 mb-4 border-b border-slate-700/50 pb-2">LOC: 55.11°S, 71.44°E | SHIPWRECK SIGNATURE</div>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">Large acoustic shadow consistent with 40-80m vessel wreck. Preliminary classification: merchant vessel, circa 1970-1990.</p>
            <div className="bg-black/20 p-3 rounded mb-4 text-xs font-mono text-slate-400">
              <div className="flex justify-between mb-1"><span>RT-DETR Baseline Confidence</span> <span className="text-slate-300">35.4% mAP50</span></div>
              <div className="w-full h-1 bg-slate-800 rounded-md"><div className="h-full bg-slate-800/60 rounded-md" style={{width: '35.4%'}}></div></div>
              <div className="mt-2 text-slate-500">Evidence: Acoustic shadow analysis complete (Ablation Baseline: 35.4%)</div>
            </div>
            <div className="text-xs text-slate-300 bg-slate-800/60 p-2 rounded border border-slate-700 font-medium">
              <span className="text-slate-300 font-bold">ACTION:</span> Archaeological survey recommended, notify ASI
            </div>
          </div>

          {/* Finding 3 */}
          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700 rounded-lg p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 px-3 py-1 bg-blue-500/20 text-zinc-300 text-[10px] font-bold tracking-widest rounded-bl-lg">MODERATE</div>
            <h4 className="font-mono text-white text-lg mb-1 mt-2 flex items-center gap-2"><Target className="w-4 h-4 text-zinc-300" /> FINDING 003</h4>
            <div className="text-xs font-mono text-slate-500 mb-4 border-b border-slate-700/50 pb-2">LOC: 53.88°S, 73.21°E | THERMAL ANOMALY</div>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">Localised temperature deviation of +2.1°C above baseline. Possible hydrothermal vent or industrial discharge source.</p>
            <div className="bg-black/20 p-3 rounded mb-4 text-xs font-mono text-slate-400">
               <div className="flex justify-between mb-1"><span>Sensor Consensus</span> <span className="text-zinc-300">Verified</span></div>
               <div className="mt-2 text-slate-500">Evidence: CTD sensor array, cross-validated with satellite SST</div>
            </div>
            <div className="text-xs text-zinc-300 bg-slate-800/60 p-2 rounded border border-slate-700 font-medium">
              <span className="text-zinc-300 font-bold">ACTION:</span> Extended survey pass, water sample collection
            </div>
          </div>

        </div>
      </div>

      {/* SECTION 5: TIME SERIES ANALYSIS */}
      <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
        <h3 className="text-sm font-bold text-slate-400 tracking-widest uppercase mb-6 flex justify-between items-center">
          <span>DETECTION TREND ANALYSIS — 14-DAY WINDOW</span>
          <span className="text-xs font-normal text-slate-300 bg-slate-800 px-2 py-1 rounded">Rolling Average</span>
        </h3>
        <div 
          role="img" 
          aria-label="14-day detection trend analysis chart showing detections per hour, average confidence, and human review rate"
          className="h-64"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="day" stroke="#94a3b8" tick={{fontSize: 12, fill: '#94a3b8'}} tickFormatter={(val) => `Day ${val}`} />
              <YAxis stroke="#94a3b8" tick={{fontSize: 12, fill: '#94a3b8'}} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                itemStyle={{ fontSize: '12px' }}
              />
              {/* Annotation line for algorithm upgrade - Recharts doesn't have a simple vertical line annotation without ReferenceLine, using a simple line approach */}
              <Line type="monotone" dataKey="detections" name="Detections/Hr" stroke="#94a3b8" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="confidence" name="Avg Confidence %" stroke="#64748b" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="reviewRate" name="Human Review Rate" stroke="#94a3b8" strokeWidth={2} dot={false} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SECTION 5.5: DEEP OCEAN MISSION (DOM) ALIGNMENT */}
      <div className="bg-slate-900/60 backdrop-blur-sm/60 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6 relative shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-700/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-800/60 border border-slate-700/50 flex items-center justify-center text-slate-300 font-bold text-sm">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-mono font-bold text-slate-300 tracking-wider uppercase">
                DEEP OCEAN MISSION (DOM) ALIGNMENT — ₹4,077 CRORE INITIATIVE
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                Indigenous, low-cost prototype addressing the Ministry of Earth Sciences mandate.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="px-4 py-1.5 bg-slate-800/60 text-slate-300 border border-slate-700/50 rounded-lg font-mono text-xs font-bold flex flex-col items-end">
              <span className="text-sm">AQUILA COST: ₹75,000</span>
              <span className="text-[9px] text-slate-400/80">VS ₹30 LAKH COMMERCIAL ARGO FLOAT</span>
            </span>
            <span className="px-4 py-1.5 bg-emerald-900/30 text-emerald-400 border border-emerald-800/50 rounded-lg font-mono text-xs font-bold flex flex-col items-end shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <span className="text-sm">SCALE: 54,360 UNITS</span>
              <span className="text-[9px] text-emerald-500/80">DEPLOYABLE PER DOM BUDGET</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs mb-4">
          <div className="bg-slate-900/60 backdrop-blur-sm/50 p-3 rounded-lg border border-slate-700/50 opacity-50">
            <span className="text-slate-500 text-[10px] block mb-1">PILLAR 1</span>
            <span className="text-sm font-bold text-slate-400">Deep Sea Mining</span>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-sm/50 p-3 rounded-lg border border-slate-700/50 opacity-50">
            <span className="text-slate-500 text-[10px] block mb-1">PILLAR 2</span>
            <span className="text-sm font-bold text-slate-400">Ocean Climate Change</span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50 relative overflow-hidden ">
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-slate-500 rounded-r"></div>
            <span className="text-slate-400 text-[10px] block mb-1 font-bold">PILLAR 3 (ADDRESSED)</span>
            <span className="text-sm font-bold text-slate-300">Technological Innovations</span>
            <p className="text-[10px] text-slate-300/70 mt-1 font-sans">
              Edge AI for underwater debris & ghost net detection (PS-26057).
            </p>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50 relative overflow-hidden ">
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-slate-500 rounded-r"></div>
            <span className="text-slate-400 text-[10px] block mb-1 font-bold">PILLAR 4 (ADDRESSED)</span>
            <span className="text-sm font-bold text-slate-300">Deep Ocean Survey</span>
            <p className="text-[10px] text-slate-300/70 mt-1 font-sans">
              Autonomous Southern Ocean Observation (PS-26057) at 1/100th cost.
            </p>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-sm/50 p-3 rounded-lg border border-slate-700/50 opacity-50">
            <span className="text-slate-500 text-[10px] block mb-1">PILLAR 5</span>
            <span className="text-sm font-bold text-slate-400">Ocean Energy</span>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-sm/50 p-3 rounded-lg border border-slate-700/50 opacity-50">
            <span className="text-slate-500 text-[10px] block mb-1">PILLAR 6</span>
            <span className="text-sm font-bold text-slate-400">Marine Station</span>
          </div>
        </div>
      </div>

      {/* SECTION 6: POLICY RECOMMENDATIONS */}
      <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6 relative">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-600 rounded-l-xl"></div>
        <h3 className="text-sm font-bold text-slate-300 tracking-widest uppercase mb-4 pl-4 border-b border-slate-700/50 pb-2">STRATEGIC RECOMMENDATIONS</h3>
        
        <div className="space-y-4 pl-4">
          <div className="flex gap-4 items-start">
            <span className="font-mono text-slate-500">01.</span>
            <div>
              <span className="px-2 py-0.5 bg-slate-800/60 text-slate-400 text-[10px] font-bold rounded mr-2">URGENT</span>
              <span className="text-sm text-slate-200">Deploy RV Sagar Nidhi for debris retrieval at coordinates 54.23°S 72.01°E within 72 hours.</span>
            </div>
          </div>
          
          <div className="flex gap-4 items-start">
            <span className="font-mono text-slate-500">02.</span>
            <div>
              <span className="px-2 py-0.5 bg-slate-800/60 text-slate-300 text-[10px] font-bold rounded mr-2">HIGH</span>
              <span className="text-sm text-slate-200">Initiate formal notification to CCAMLR secretariat regarding high-density derelict fishing gear.</span>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <span className="font-mono text-slate-500">03.</span>
            <div>
              <span className="px-2 py-0.5 bg-slate-800/60 text-slate-300 text-[10px] font-bold rounded mr-2">HIGH</span>
              <span className="text-sm text-slate-200">Re-task satellite imaging (Resourcesat-2) for sustained monitoring of Sector 7G thermal anomaly.</span>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <span className="font-mono text-slate-500">04.</span>
            <div>
              <span className="px-2 py-0.5 bg-slate-800/60 text-zinc-300 text-[10px] font-bold rounded mr-2">MEDIUM</span>
              <span className="text-sm text-slate-200">Authorize AUV mission extension (Phase 4) to conduct higher-resolution multi-beam sonar mapping.</span>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <span className="font-mono text-slate-500">05.</span>
            <div>
              <span className="px-2 py-0.5 bg-slate-800/60 text-zinc-300 text-[10px] font-bold rounded mr-2">MEDIUM</span>
              <span className="text-sm text-slate-200">Update edge AI classification models with new dataset from shipwreck acoustic shadows.</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 7: EXPORT ACTIONS */}
      <div className="space-y-4 pt-4 border-t border-slate-700/50">
        <div className="flex flex-wrap gap-4">
          <button
            type="button"
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-sm transition-colors border border-slate-600 active:scale-95"
          >
            <FileText className="w-4 h-4" /> EXPORT PDF REPORT
          </button>
          <button
            type="button"
            onClick={handleSendMoES}
            className={`flex items-center gap-2 px-4 py-2 rounded text-sm transition-all border active:scale-95 ${
              moesSubmission
                ? 'bg-slate-800/60 border-slate-600 text-slate-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : 'bg-slate-800/60 hover:bg-zinc-800/80 text-zinc-300 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <ShieldAlert className="w-4 h-4" /> {moesSubmission ? 'MoES DASHBOARD SYNCED [VIEW]' : 'SEND TO MoES DASHBOARD'}
          </button>
          <button
            type="button"
            onClick={handleDownloadGPX}
            className={`flex items-center gap-2 px-4 py-2 rounded text-sm transition-all border active:scale-95 ${
              gpxDownloaded
                ? 'bg-slate-800/60 border-slate-600 text-slate-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600'
            }`}
          >
            <Download className="w-4 h-4" /> {gpxDownloaded ? 'GPX WAYPOINTS DOWNLOADED' : 'DOWNLOAD GPX WAYPOINTS'}
          </button>
          <button
            type="button"
            onClick={handleShareSatcom}
            className={`flex items-center gap-2 px-4 py-2 rounded text-sm transition-all border ml-auto active:scale-95 ${
              satcomTransmission
                ? 'bg-slate-800/60 border-slate-600 text-slate-200 shadow-[0_0_10px_rgba(14,165,233,0.2)]'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600'
            }`}
          >
            <Share2 className="w-4 h-4" /> {satcomTransmission ? 'SATCOM UPLINK ACTIVE [VIEW]' : 'SHARE VIA SATCOM'}
          </button>
        </div>

        {/* MoES In-App Submission Banner */}
        {moesSubmission && (
          <div className="p-4 bg-slate-900/60 backdrop-blur-sm border-2 border-slate-600 rounded-lg shadow-lg relative animate-fade-in text-slate-100">
            <button
              type="button"
              onClick={() => setMoesSubmission(null)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800/60"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-slate-500/20 text-slate-300 rounded-md border border-slate-600">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-slate-300">
                    MoES &amp; INCOIS CENTRAL DASHBOARD TRANSMISSION CONFIRMED
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-900/40 text-emerald-400 text-[10px] font-mono font-bold rounded border border-slate-600">
                    {moesSubmission.status}
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Tactical threat dossier and 5 subsea detections successfully pushed to Ministry of Earth Sciences Ocean Portal (INCOIS Integrated Coastal and Ocean Observation System).
                </p>
                <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono text-slate-400">
                  <div>REFERENCE ID: <span className="text-slate-300 font-bold">{moesSubmission.refId}</span></div>
                  <div>TRANSMISSION TIMESTAMP: <span className="text-cyan-300 font-semibold">{moesSubmission.timestamp}</span></div>
                  <div>TARGETS LOGGED: <span className="text-cyan-300 font-semibold">5 High-Priority Contacts</span></div>
                  <div>SECURITY: <span className="text-slate-300 font-semibold">TLS 1.3 / SHA-256 SIGNED</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Satcom Uplink Simulation Banner */}
        {satcomTransmission && (
          <div className="p-4 bg-slate-800/60 border-2 border-slate-600 rounded-lg shadow-lg relative animate-fade-in text-slate-100">
            <button
              type="button"
              onClick={() => setSatcomTransmission(null)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800/60"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-slate-800/60 text-slate-300 rounded-md border border-slate-600">
                <Share2 className="w-5 h-5 text-blue-400" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-slate-300">
                    SATCOM BURST UPLINK SIMULATION — TRANSMISSION COMPLETE
                  </span>
                  <span className="px-2 py-0.5 bg-slate-800/60 text-slate-200 text-[10px] font-mono font-bold rounded border border-slate-600">
                    {satcomTransmission.status}
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Compressed tactical telemetry payload modulated and uplinked via Argos-4 / INSAT MSS subsea burst modem transponder.
                </p>
                <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono text-slate-400">
                  <div>CARRIER FREQUENCY: <span className="text-slate-200 font-bold">{satcomTransmission.frequency}</span></div>
                  <div>PACKET CHECKSUM: <span className="text-slate-200 font-bold">{satcomTransmission.checksum}</span></div>
                  <div>FRAME PAYLOAD: <span className="text-cyan-300 font-semibold">{satcomTransmission.packetBytes} bytes (L-Band Burst)</span></div>
                  <div>UPLINK TIMESTAMP: <span className="text-cyan-300 font-semibold">{satcomTransmission.timestamp}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    
      {/* SECTION 4: PHASE 2 MISSION ROADMAP */}
      <div className="bg-slate-900/60 backdrop-blur-sm/60 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6 mt-8 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <TrendingUp className="w-48 h-48 text-zinc-300" />
        </div>
        <h2 className="text-xl font-mono font-bold text-zinc-300 mb-6 flex items-center gap-3">
          <ShieldCheck className="w-6 h-6" />
          PHASE 2 STRATEGIC ROADMAP (MINISTRY OF EARTH SCIENCES)
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          <div className="bg-transparent border border-slate-700/50 p-5 rounded-lg">
            <h3 className="text-slate-300 font-bold font-mono text-sm mb-2">1. SYNTHETIC SONAR DATA ENGINE</h3>
            <p className="text-slate-400 text-xs font-mono leading-relaxed">
              To overcome the global scarcity of SSS data, we are integrating <strong>CycleGANs</strong> and <strong>Unreal Engine 5</strong>. We will ray-trace acoustic waves off 3D shipwrecks to generate 10,000+ synthetic sonar images, unlocking larger datasets to evaluate advanced hybrid transformer backbones while maintaining YOLOv8ss as the primary edge deployment model.
            </p>
          </div>
          
          <div className="bg-transparent border border-slate-700/50 p-5 rounded-lg">
            <h3 className="text-zinc-300 font-bold font-mono text-sm mb-2">2. AUTONOMOUS SWARM ARCHITECTURE</h3>
            <p className="text-slate-400 text-xs font-mono leading-relaxed">
              By reducing unit costs from ₹30 Lakhs to ₹75,000, we will deploy a <strong>Swarm of 40 ultra-cheap autonomous floats</strong> communicating via underwater acoustic modems to rapidly map massive sectors of the Indian Ocean simultaneously.
            </p>
          </div>
          
          <div className="bg-transparent border border-slate-700/50 p-5 rounded-lg">
            <h3 className="text-slate-300 font-bold font-mono text-sm mb-2">3. POLAR-RATED ENERGY ARCHITECTURE</h3>
            <p className="text-slate-400 text-xs font-mono leading-relaxed">
              Transitioning from standard lab bench power to subsea <strong>LiFePO4 cold-rated battery cells</strong> (-20°C operating rating, retaining 70-80% capacity in polar waters) supplemented by solar surface-recharging buoys for multi-month mission endurance.
            </p>
          </div>
          
          <div className="bg-transparent border border-slate-700/50 p-5 rounded-lg">
            <h3 className="text-zinc-300 font-bold font-mono text-sm mb-2">4. INCOIS & NAVY INTEGRATION</h3>
            <p className="text-slate-400 text-xs font-mono leading-relaxed">
              Operationalizing the platform for the Government of India by routing our MQTT AI detection streams directly into the <strong>INCOIS (Indian National Centre for Ocean Information Services)</strong> API for real-time Coast Guard intelligence.
            </p>
          </div>
        </div>
      </div>
</div>
  );
}
