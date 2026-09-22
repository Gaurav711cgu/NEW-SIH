import re

with open("frontend/src/pages/AUVTwin.tsx", "r") as f:
    content = f.read()

# 1. Fix Zoom Level
content = content.replace(
    "case 'OBSERVATION': cameraRef.current.position.set(4.5, 1.5, 4.5); cameraRef.current.lookAt(0,0,0); break;",
    "case 'OBSERVATION': cameraRef.current.position.set(9.0, 3.0, 9.0); cameraRef.current.lookAt(0,0,0); break;"
)

# 2. Fix Layout overlap
# Move the depth gauge to the far LEFT edge, and move the telemetry box right next to it.
# Current Telemetry box: className="absolute top-16 left-6 flex flex-col gap-2 text-zinc-300 font-mono text-[10px]"
content = content.replace(
    'className="absolute top-16 left-6 flex flex-col gap-2 text-zinc-300 font-mono text-[10px]"',
    'className="absolute top-16 left-24 flex flex-col gap-2 text-zinc-300 font-mono text-[10px]"'
)

# Current Depth Gauge: className="absolute top-16 right-6 h-72 w-14 bg-black/80 ...
content = content.replace(
    'className="absolute top-16 right-6 h-72 w-14 bg-black/80 border border-steel-700/50 rounded flex flex-col items-center py-3 pointer-events-none shadow-lg"',
    'className="absolute top-16 left-6 h-64 w-14 bg-black/80 border border-steel-700/50 rounded flex flex-col items-center py-3 pointer-events-none shadow-lg"'
)

# Move the terminal slightly down and make it a bit shorter so it doesn't block the AUV
content = content.replace(
    'className="absolute bottom-6 right-6 w-[28rem] bg-black/90 border border-steel-700/50 rounded flex flex-col pointer-events-auto"',
    'className="absolute bottom-10 right-6 w-[28rem] bg-black/90 border border-steel-700/50 rounded flex flex-col pointer-events-auto"'
)
content = content.replace(
    '<div className="flex-1 p-2 font-mono text-[9px] flex flex-col justify-end gap-1 overflow-hidden h-48">',
    '<div className="flex-1 p-2 font-mono text-[9px] flex flex-col justify-end gap-1 overflow-hidden h-36">'
)

with open("frontend/src/pages/AUVTwin.tsx", "w") as f:
    f.write(content)
