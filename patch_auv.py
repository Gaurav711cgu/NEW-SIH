import re

with open("frontend/src/pages/AUVTwin.tsx", "r") as f:
    content = f.read()

# 1. Update preset state
content = content.replace(
    "useState<'ISO' | 'BOW' | 'BELLY' | 'STERN' | 'TOP' | 'POV'>('ISO');",
    "useState<'ISO' | 'BOW' | 'BELLY' | 'STERN' | 'TOP' | 'POV' | 'OBSERVATION'>('ISO');"
)

# 2. Update handleSetPreset param
content = content.replace(
    "handleSetPreset = (preset: 'ISO' | 'BOW' | 'BELLY' | 'STERN' | 'TOP' | 'POV') => {",
    "handleSetPreset = (preset: 'ISO' | 'BOW' | 'BELLY' | 'STERN' | 'TOP' | 'POV' | 'OBSERVATION') => {"
)

# 3. Add OBSERVATION to switch in handleSetPreset
content = content.replace(
    "case 'POV': cameraRef.current.position.set(3.0, 0.0, 0.0); break;",
    "case 'POV': cameraRef.current.position.set(3.0, 0.0, 0.0); break;\n      case 'OBSERVATION': cameraRef.current.position.set(6.0, 2.0, 6.0); break;"
)

# 4. Add the button in the UI
content = content.replace(
    "{(['ISO', 'BOW', 'BELLY', 'STERN', 'TOP', 'POV'] as const).map(p => (",
    "{(['ISO', 'BOW', 'BELLY', 'STERN', 'TOP', 'POV', 'OBSERVATION'] as const).map(p => ("
)

# 5. We need to add state variables for OBSERVATION mode
# Find the end of terminalLogs state
state_injection = """
  // --- OBSERVATION MODE STATE ---
  const [obsDepth, setObsDepth] = useState(0);
  const [obsTemp, setObsTemp] = useState(1.5);
  const [obsSal, setObsSal] = useState(34.0);
  const [obsDO, setObsDO] = useState(250.0);
  const [obsSilicate, setObsSilicate] = useState(60.0);
  const [obsDMS, setObsDMS] = useState(2.1);
  const [obsDensity, setObsDensity] = useState(1027.0);
  const [obsFlag, setObsFlag] = useState(1);
  const [obsLogs, setObsLogs] = useState<string[]>(['> Ocean Observation Sequence Initiated...']);

  useEffect(() => {
    if (viewPreset !== 'OBSERVATION') return;
    
    let currentDepth = 0;
    const interval = setInterval(() => {
      currentDepth += 5;
      if (currentDepth > 500) currentDepth = 0;
      
      const temp = 1.5 - (currentDepth / 200);
      const sal = 34.00 + (currentDepth / 1000);
      const dox = 250 - (currentDepth / 5);
      const silicate = 60.0 + (currentDepth / 10);
      const dms = 2.1 - (currentDepth / 500); // DMS higher at surface
      
      const isFailure = Math.random() < 0.05;
      const finalSal = isFailure ? 12.0 : sal;
      const flag = isFailure ? 4 : 1;
      const density = isFailure ? 980.5 : 1027.0 + (currentDepth / 500);

      setObsDepth(currentDepth);
      setObsTemp(temp);
      setObsSal(finalSal);
      setObsDO(dox);
      setObsSilicate(silicate);
      setObsDMS(dms);
      setObsDensity(density);
      setObsFlag(flag);

      setObsLogs(prev => {
        const newLogs = [...prev, `[TEOS-10] Calculated Density: ${density.toFixed(2)} kg/m³`];
        if (isFailure) {
          newLogs.push(`[CRITICAL] THERMODYNAMIC VIOLATION! Salinity ${finalSal.toFixed(2)} PSU is impossible.`);
          newLogs.push(`[REJECTED] FLAG 4 - Packet Dropped.`);
        } else {
          newLogs.push(`[VALID] FLAG 1 - Nominal. Stored to DB.`);
        }
        if (newLogs.length > 8) return newLogs.slice(newLogs.length - 8);
        return newLogs;
      });

    }, 2000);

    return () => clearInterval(interval);
  }, [viewPreset]);
"""

content = content.replace(
    "    '[AI] YOLOv8 TensorRT Engine Loaded'\n  ]);",
    "    '[AI] YOLOv8 TensorRT Engine Loaded'\n  ]);\n" + state_injection
)

# 6. Inject the OBSERVATION HUD next to the POV HUD
obs_hud_injection = """
          {/* === OBSERVATION MODE HUD === */}
          {viewPreset === 'OBSERVATION' && (
            <div className="absolute inset-0 z-20 pointer-events-none border-[8px] border-ice-500/20" style={{ background: 'radial-gradient(circle, transparent 50%, rgba(2,6,23,0.7) 100%)' }}>
              
              {/* Top Left Telemetry */}
              <div className="absolute top-16 left-6 flex flex-col gap-2 text-zinc-300 font-mono text-[10px]">
                <div className="flex items-center gap-2 font-bold text-ice-400 text-sm mb-2">
                  <Activity className="w-4 h-4 animate-pulse" /> BGC OBSERVATION MISSION
                </div>
                
                <div className="grid grid-cols-2 gap-x-8 gap-y-1 bg-abyss-950/80 p-3 border border-steel-700/50 rounded">
                  <div className="col-span-2 text-emerald-400 font-bold border-b border-steel-800 pb-1 mb-1">STANDARD VARIABLES</div>
                  <span className="text-steel-400">DEPTH:</span> <span className="text-white font-bold">{obsDepth.toFixed(1)} m</span>
                  <span className="text-steel-400">TEMP:</span> <span className="text-white font-bold">{obsTemp.toFixed(2)} °C</span>
                  <span className="text-steel-400">SALIN:</span> <span className={`${obsFlag === 4 ? 'text-red-500' : 'text-white'} font-bold`}>{obsSal.toFixed(2)} PSU</span>
                  <span className="text-steel-400">DOXY:</span> <span className="text-white font-bold">{obsDO.toFixed(1)} µmol/kg</span>
                  <span className="text-steel-400">pH:</span> <span className="text-white font-bold">8.1</span>
                  <span className="text-steel-400">CHL-A:</span> <span className="text-white font-bold">0.4 mg/m³</span>
                  
                  <div className="col-span-2 text-purple-400 font-bold border-b border-steel-800 pb-1 mt-2 mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> UNDERRATED CLIMATE VARIABLES
                  </div>
                  <span className="text-steel-400" title="Subglacial Meltwater Indicator">SILICATE:</span> <span className="text-purple-300 font-bold">{obsSilicate.toFixed(1)} µmol/kg</span>
                  <span className="text-steel-400" title="Cloud Condensation Nuclei">DMS (Gas):</span> <span className="text-purple-300 font-bold">{obsDMS.toFixed(2)} nM</span>
                </div>
              </div>

              {/* Bottom Right Terminal Overlay */}
              <div className="absolute bottom-6 right-6 w-80 bg-black/90 border border-steel-700/50 rounded flex flex-col pointer-events-auto">
                <div className="bg-steel-900/80 px-2 py-1 flex items-center gap-2 text-[10px] font-mono text-ice-400 border-b border-steel-800">
                  <ShieldCheck className="w-3 h-3" /> TEOS-10 PHYSICS CAGE
                </div>
                <div className="flex-1 p-2 font-mono text-[9px] flex flex-col justify-end gap-1 overflow-hidden h-32">
                  <div className={`font-bold p-1 rounded text-center mb-1 ${obsFlag === 1 ? 'bg-emerald-900/40 text-emerald-400' : 'bg-red-900/40 text-red-400'}`}>
                    QC FLAG: {obsFlag}
                  </div>
                  {obsLogs.map((log, i) => (
                    <div key={i} className={`${log.includes('CRITICAL') || log.includes('REJECTED') ? 'text-red-400 font-bold' : log.includes('VALID') ? 'text-emerald-400' : 'text-zinc-300'}`}>
                      {log}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
"""

content = content.replace(
    "{viewPreset === 'POV' && (",
    obs_hud_injection + "\n          {viewPreset === 'POV' && ("
)

with open("frontend/src/pages/AUVTwin.tsx", "w") as f:
    f.write(content)

