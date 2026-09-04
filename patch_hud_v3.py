import sys
with open('frontend/src/pages/AUVTwin.tsx', 'r') as f:
    content = f.read()

hud_html_start = """{/* TRUE FIRST-PERSON IMMERSIVE HUD */}"""
hud_html_end = """{/* Center Action Alert */}"""

# Extract everything between these two markers, and replace it
start_idx = content.find(hud_html_start)
end_idx = content.find(hud_html_end)

if start_idx != -1 and end_idx != -1:
    new_hud = """{/* TRUE FIRST-PERSON IMMERSIVE HUD */}
              <div className="absolute inset-0 z-20 pointer-events-none border-[8px] border-cyan-900/30" style={{ background: 'radial-gradient(circle, transparent 50%, rgba(2,6,23,0.8) 100%)' }}>
                
                {/* Top Left Telemetry (Stacked to avoid ANY center overlap) */}
                <div className="absolute top-40 left-8 flex flex-col gap-3 text-cyan-400 font-mono text-xs">
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-2 font-bold"><Target className="w-4 h-4 animate-pulse text-red-500" /> AUV-001 FWD CAM</span>
                    <span>DEPTH: 14.8m AGL</span>
                    <span>PITCH: -15.4°</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-bold">SYS: NOMINAL</span>
                    <span>BAT: 84% (ESP32)</span>
                    <span className="text-emerald-400">AI: YOLOv8s ACTIVE</span>
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

                {/* Bottom Left Telemetry */}
                <div className="absolute bottom-20 left-8 text-emerald-400 font-mono text-xs font-bold">
                  <span>SONAR FREQ: 900kHz SSS</span>
                </div>

                {/* Bottom Right Telemetry */}
                <div className="absolute bottom-20 right-8 text-emerald-400 font-mono text-xs flex items-center gap-2">
                  <span className="animate-pulse text-red-500">● REC</span>
                  <span>{new Date().toISOString().split('T')[1].substring(0,8)} UTC</span>
                </div>
              </div>

              {/* Top Right: Raw Sonar Waterfall PiP */}
              <div className="absolute top-36 right-4 w-44 h-44 bg-[#111] border border-steel-600 rounded overflow-hidden flex flex-col shadow-2xl z-30 pointer-events-none">
                <div className="bg-steel-800 text-[9px] font-mono font-bold text-ice-300 px-2 py-1 flex justify-between items-center">
                  <span>RAW SONAR WATERFALL</span>
                  <span className="text-red-400 animate-pulse flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>REC</span>
                </div>
                <div className="flex-1 relative overflow-hidden flex justify-center items-center" style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '6px 6px' }}>
                  <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-ice-500/30"></div>
                  <div className="absolute left-0 right-0 h-1 bg-ice-400/50 animate-[scan_2s_linear_infinite]" style={{ top: '0%' }}>
                     <style>{`@keyframes scan { 0% { top: 0%; } 100% { top: 100%; } }`}</style>
                  </div>
                  {detectionEvent && (
                    <div 
                      className={`absolute w-6 h-12 blur-[2px] rounded-full ${detectionEvent.isRock ? 'bg-sky-400/50 shadow-[0_0_15px_rgba(56,189,248,0.5)]' : detectionEvent.isUnknown ? 'bg-yellow-200 shadow-[0_0_20px_rgba(253,224,71,1)]' : 'bg-white shadow-[0_0_20px_rgba(255,255,255,1)]'} animate-pulse`}
                      style={{ top: `${detectionEvent.yOff}%`, left: `${detectionEvent.xOff}%`, transform: 'translate(-50%, -50%)' }}
                    ></div>
                  )}
                </div>
              </div>

              """
    
    new_content = content[:start_idx] + new_hud + content[end_idx:]
    with open('frontend/src/pages/AUVTwin.tsx', 'w') as f:
        f.write(new_content)
    print("HUD V3 Patched")
else:
    print("Markers not found")
