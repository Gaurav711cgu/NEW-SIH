import sys
with open('frontend/src/pages/AUVTwin.tsx', 'r') as f:
    content = f.read()

# Change the camera position for POV to be a true First Person View on the nose
content = content.replace(
    "case 'POV': cameraRef.current.position.set(-9.0, 4.5, 0.0); break;",
    "case 'POV': cameraRef.current.position.set(3.0, 0.0, 0.0); break;"
)
# Change where the camera looks in POV
content = content.replace(
    "cameraRef.current.lookAt(3, -2, 0); // Look slightly ahead of the submarine to see the seabed",
    "cameraRef.current.lookAt(15, -4, 0); // True First-Person looking down at the sonar swath"
)

with open('frontend/src/pages/AUVTwin.tsx', 'w') as f:
    f.write(content)
print("POV Patched")
