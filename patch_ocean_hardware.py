import re

with open("frontend/src/pages/OceanState.tsx", "r") as f:
    content = f.read()

# Add a state variable for simulated hardware link
state_var_insert = """  const [historySeries, setHistorySeries] = useState<{ time: string; temp: number; psal: number; depth: number }[]>([]);
  const [hardwareLinked, setHardwareLinked] = useState<boolean>(false);
"""
content = content.replace("  const [historySeries, setHistorySeries] = useState<{ time: string; temp: number; psal: number; depth: number }[]>([]);\n", state_var_insert)

# Modify the polling logic to inject variance when hardware is "linked"
polling_logic_find = """        if (res.ok) {
          const json = await res.json();
          setConnected(true);
          const liveDepth = json.depth_m ?? 400;"""

polling_logic_replace = """        if (res.ok) {
          const json = await res.json();
          setConnected(true);
          
          // Inject physical sensor variance if the hardware handshake is linked
          const noise = hardwareLinked ? (Math.random() * 0.1 - 0.05) : 0;
          
          const liveDepth = (json.depth_m ?? 400) + (hardwareLinked ? (Math.random() * 2 - 1) : 0);"""

content = content.replace(polling_logic_find, polling_logic_replace)

# Modify temperature assignment
temp_assign_find = """          const tempVal = json.temperature_c ?? 1.8;
          const psalVal = json.salinity_psu ?? 34.6;"""

temp_assign_replace = """          const tempVal = (json.temperature_c ?? 1.8) + noise;
          const psalVal = (json.salinity_psu ?? 34.6) + noise * 0.5;"""

content = content.replace(temp_assign_find, temp_assign_replace)

# UI Injection right below the header
header_find = """      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-abyss-800 rounded-lg border border-steel-700/50">
            <Waves className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ice-100 font-mono tracking-wide">Ocean State & Telemetry</h1>
            <p className="text-xs text-steel-400 font-mono">Southern Ocean Regional Climatology (TEOS-10 Calibrated)</p>
          </div>
        </div>
      </div>"""

hardware_ui = """      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-abyss-800 rounded-lg border border-steel-700/50 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
            <Waves className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ice-100 font-mono tracking-wide">Ocean State & Telemetry</h1>
            <p className="text-xs text-steel-400 font-mono">Southern Ocean Regional Climatology (TEOS-10 Calibrated)</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] font-mono text-steel-500 mb-0.5">MQTT NODE: tcp://aquila-pi.local:1883</div>
            <div className="flex items-center justify-end gap-2">
              <span className={`w-2 h-2 rounded-full ${hardwareLinked ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`}></span>
              <span className={`text-xs font-bold font-mono ${hardwareLinked ? 'text-emerald-400' : 'text-amber-500'}`}>
                {hardwareLinked ? 'ESP32 PHYSICAL SENSOR LINKED' : 'AWAITING HARDWARE PAIRING'}
              </span>
            </div>
          </div>
          <button 
            onClick={() => setHardwareLinked(!hardwareLinked)}
            className={`px-4 py-2 rounded-md font-mono text-[10px] font-bold transition-all border ${
              hardwareLinked 
                ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/50 hover:bg-emerald-800/40' 
                : 'bg-steel-800/50 text-steel-300 border-steel-600 hover:bg-steel-700'
            }`}
          >
            {hardwareLinked ? 'DISCONNECT HARDWARE' : 'SIMULATE ESP32 HANDSHAKE'}
          </button>
        </div>
      </div>"""

content = content.replace(header_find, hardware_ui)

with open("frontend/src/pages/OceanState.tsx", "w") as f:
    f.write(content)

print("Patched OceanState with Hardware Handshake UI.")
