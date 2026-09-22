import re

with open("frontend/src/pages/AUVTwin.tsx", "r") as f:
    content = f.read()

# 1. Update the camera preset to zoom way out so we can see the full descent
content = content.replace(
    "case 'OBSERVATION': cameraRef.current.position.set(9.0, 3.0, 9.0); cameraRef.current.lookAt(0,0,0); break;",
    "case 'OBSERVATION': cameraRef.current.position.set(16.0, 0.0, 16.0); cameraRef.current.lookAt(0,0,0); break;"
)

# 2. Animate the AUV physically sinking from +6.0 to -6.0 based on depth
sink_logic = """
          // Pitch AUV down
          if (auvGroupRef.current) {
              auvGroupRef.current.rotation.z = THREE.MathUtils.lerp(auvGroupRef.current.rotation.z, -0.4, 0.05); // Tilt nose down
              
              // Physical sinking: map 0m -> +6.0 Y, 500m -> -6.0 Y
              const targetY = 6.0 - ((depthRef.current / 500.0) * 12.0);
              auvGroupRef.current.position.y = THREE.MathUtils.lerp(auvGroupRef.current.position.y, targetY, 0.05);
          }
"""
content = content.replace(
    """          // Pitch AUV down
          if (auvGroupRef.current) {
              auvGroupRef.current.rotation.z = THREE.MathUtils.lerp(auvGroupRef.current.rotation.z, -0.4, 0.05); // Tilt nose down
          }""",
    sink_logic
)

# 3. Reset AUV position when leaving OBSERVATION mode
reset_logic = """      } else {
          // Reset AUV rotation if leaving observation
          if (auvGroupRef.current && viewPresetRef.current !== 'POV') {
              auvGroupRef.current.rotation.z = THREE.MathUtils.lerp(auvGroupRef.current.rotation.z, 0, 0.05);
              auvGroupRef.current.position.y = THREE.MathUtils.lerp(auvGroupRef.current.position.y, 0, 0.05);
          }"""
content = content.replace(
    """      } else {
          // Reset AUV rotation if leaving observation
          if (auvGroupRef.current && viewPresetRef.current !== 'POV') {
              auvGroupRef.current.rotation.z = THREE.MathUtils.lerp(auvGroupRef.current.rotation.z, 0, 0.05);
          }""",
    reset_logic
)

with open("frontend/src/pages/AUVTwin.tsx", "w") as f:
    f.write(content)

