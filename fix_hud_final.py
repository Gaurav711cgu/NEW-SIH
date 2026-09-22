import re

with open("frontend/src/pages/AUVTwin.tsx", "r") as f:
    content = f.read()

# 1. Move Depth Gauge to the TOP RIGHT (and make it h-64)
content = content.replace(
    'className="absolute top-16 left-2 h-64 w-14 bg-black/80',
    'className="absolute top-16 right-6 h-64 w-14 bg-black/80'
)

# 2. Move Standard Variables to the TOP LEFT (left-6)
content = content.replace(
    'className="absolute top-16 left-20 flex flex-col gap-2',
    'className="absolute top-16 left-6 flex flex-col gap-2'
)

# 3. Move TEOS-10 Terminal to the BOTTOM RIGHT and make it thinner (w-80 = 320px)
# But keep it slightly higher (bottom-10) to avoid the bottom control bar
content = content.replace(
    'className="absolute bottom-12 left-20 w-[26rem] bg-black/90',
    'className="absolute bottom-10 right-24 w-[22rem] bg-black/90'
)
# Wait, if depth gauge is at right-6 (w-14 = 56px), putting terminal at right-24 will clear it nicely!
# So depth gauge is on the extreme right, terminal is just to the left of the depth gauge at the bottom.

# 4. Fix the camera lookAt to shift the submarine slightly to the center-left to balance the UI
camera_lookat = """
          if (cameraRef.current) {
              // Lock camera
              cameraRef.current.position.lerp(new THREE.Vector3(16.0, 0.0, 16.0), 0.1);
              // cameraRef.current.lookAt(0,0,0);
          }"""
# Wait, earlier I removed the lerp! I should NOT put lerp back.
# The user wants to see it sink, the sinking logic is already there!
# I just need to make sure the AUV is visible.
# When sinking, targetY goes from +6.0 to -6.0.
# If camera is at (16,0,16), it might be too far. Let's make it (12, 0, 12).
content = content.replace(
    "case 'OBSERVATION': cameraRef.current.position.set(16.0, 0.0, 16.0); cameraRef.current.lookAt(0,0,0); break;",
    "case 'OBSERVATION': cameraRef.current.position.set(12.0, 0.0, 12.0); cameraRef.current.lookAt(0,0,0); break;"
)

with open("frontend/src/pages/AUVTwin.tsx", "w") as f:
    f.write(content)

