import re

with open("frontend/src/pages/AUVTwin.tsx", "r") as f:
    content = f.read()

# 1. Remove the camera lock from the animate loop so the user can zoom/pan
camera_lock = """          if (cameraRef.current) {
              // Lock camera
              cameraRef.current.position.lerp(new THREE.Vector3(3.5, 1.0, 3.5), 0.1);
              cameraRef.current.lookAt(0,0,0);
          }"""
content = content.replace(camera_lock, "")

# 2. Add the Vertical Depth Scale UI
depth_gauge = """              {/* Vertical Depth Gauge */}
              <div className="absolute top-16 right-6 h-72 w-14 bg-black/80 border border-steel-700/50 rounded flex flex-col items-center py-3 pointer-events-none shadow-lg">
                <div className="text-[9px] text-ice-400 font-mono font-bold mb-2 text-center">SURF<br/>0m</div>
                <div className="flex-1 w-1.5 bg-steel-900 rounded-full relative overflow-visible shadow-inner">
                  {/* Indicator Track */}
                  <div 
                    className="absolute top-0 left-0 w-full bg-ice-500/30 rounded-full transition-all duration-[2500ms] ease-linear"
                    style={{ height: `${(obsDepth / 500) * 100}%` }}
                  />
                  {/* Submarine Blip */}
                  <div 
                    className="absolute left-1/2 -translate-x-1/2 w-5 h-5 bg-black border-2 border-ice-400 rounded-full shadow-[0_0_12px_#00e5ff] flex items-center justify-center transition-all duration-[2500ms] ease-linear z-10"
                    style={{ top: `calc(${(obsDepth / 500) * 100}% - 10px)` }}
                  >
                    <div className="w-1.5 h-1.5 bg-ice-400 rounded-full animate-pulse" />
                    {/* Depth label sticking out to the left */}
                    <div className="absolute right-7 bg-abyss-950/90 text-ice-300 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border border-steel-700/50 whitespace-nowrap">
                      {obsDepth.toFixed(0)} m
                    </div>
                  </div>
                </div>
                <div className="text-[9px] text-ice-400 font-mono font-bold mt-2 text-center">ABYSS<br/>500m</div>
              </div>"""

# Insert the depth gauge right before the terminal overlay
content = content.replace(
    "{/* Bottom Right Terminal Overlay */}",
    depth_gauge + "\n\n              {/* Bottom Right Terminal Overlay */}"
)

# 3. Increase FOV or reset camera for better initial view, since we removed lerp lock
content = content.replace(
    "case 'OBSERVATION': cameraRef.current.position.set(3.5, 1.0, 3.5); cameraRef.current.lookAt(0,0,0); break;",
    "case 'OBSERVATION': cameraRef.current.position.set(4.5, 1.5, 4.5); cameraRef.current.lookAt(0,0,0); break;"
)


with open("frontend/src/pages/AUVTwin.tsx", "w") as f:
    f.write(content)

