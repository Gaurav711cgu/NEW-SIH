import re

with open("frontend/src/pages/AUVTwin.tsx", "r") as f:
    content = f.read()

# 1. Make the AUV much smaller by zooming out the camera
content = content.replace(
    "case 'OBSERVATION': cameraRef.current.position.set(12.0, 0.0, 12.0); cameraRef.current.lookAt(0,0,0); break;",
    "case 'OBSERVATION': cameraRef.current.position.set(20.0, 0.0, 20.0); cameraRef.current.lookAt(0,0,0); break;"
)

# 2. Increase the sinking range and make it smooth
# Map 0m to +8.0 Y, 500m to -8.0 Y
content = content.replace(
    "const targetY = 6.0 - ((depthRef.current / 500.0) * 12.0);",
    "const targetY = 8.0 - ((depthRef.current / 500.0) * 16.0);"
)
# Change lerp speed to make it feel more like a constant glide rather than a jump
content = content.replace(
    "auvGroupRef.current.position.y = THREE.MathUtils.lerp(auvGroupRef.current.position.y, targetY, 0.05);",
    "auvGroupRef.current.position.y = THREE.MathUtils.lerp(auvGroupRef.current.position.y, targetY, 0.02);"
)

# 3. Fix the TEOS-10 Terminal position! Move it to the bottom LEFT so the middle is empty.
content = content.replace(
    'className="absolute bottom-10 right-24 w-72 h-44 bg-black/90 border border-steel-700/50 rounded flex flex-col pointer-events-auto"',
    'className="absolute bottom-10 left-6 w-[22rem] h-44 bg-black/90 border border-steel-700/50 rounded flex flex-col pointer-events-auto"'
)

with open("frontend/src/pages/AUVTwin.tsx", "w") as f:
    f.write(content)

