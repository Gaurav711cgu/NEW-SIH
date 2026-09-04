import sys
with open('frontend/src/pages/AUVTwin.tsx', 'r') as f:
    content = f.read()

hud_html = """
          {viewPreset === 'POV' && (
            <>
              {/* TRUE FIRST-PERSON IMMERSIVE HUD */}
              <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-8 border-[8px] border-cyan-900/30" style={{ background: 'radial-gradient(circle, transparent 50%, rgba(2,6,23,0.8) 100%)' }}>
                
                {/* HUD Top Bar */}
                <div className="flex justify-between items-start text-cyan-400 font-mono text-xs">
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-2"><Target className="w-4 h-4 animate-pulse text-red-500" /> AUV-001 FORWARD CAMERA</span>
                    <span>DEPTH: 14.8m AGL</span>
                    <span>PITCH: -15.4°</span>
                  </div>
                  <div className="flex flex-col gap-1 text-right">
                    <span>SYS: NOMINAL</span>
                    <span>BAT: 84% (ESP32 NODE)</span>
                    <span>AI: YOLOv8s ACTIVE</span>
                  </div>
                </div>

                {/* Center Crosshair */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-50 flex items-center justify-center">
                  <div className="w-32 h-32 border border-cyan-500/50 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-cyan-400 rounded-full"></div>
                  </div>
                  <div className="absolute w-48 h-[1px] bg-cyan-500/30"></div>
                  <div className="absolute h-48 w-[1px] bg-cyan-500/30"></div>
                </div>

                {/* HUD Bottom Bar */}
                <div className="flex justify-between items-end text-emerald-400 font-mono text-xs">
                  <span>SONAR FREQ: 900kHz SSS</span>
                  <div className="flex items-center gap-2">
                    <span className="animate-pulse">● RECORDING</span>
                    <span>{new Date().toISOString().split('T')[1].substring(0,8)} UTC</span>
                  </div>
                </div>
              </div>
"""

# Replace the beginning of the POV block with our enhanced version
content = content.replace("{viewPreset === 'POV' && (\n            <>", hud_html)

with open('frontend/src/pages/AUVTwin.tsx', 'w') as f:
    f.write(content)
print("POV HUD Patched")
