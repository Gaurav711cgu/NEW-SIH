import re

with open("frontend/src/pages/AUVTwin.tsx", "r") as f:
    content = f.read()

# 1. Add depthRef
content = content.replace(
    "const viewPresetRef = useRef(viewPreset);",
    "const viewPresetRef = useRef(viewPreset);\n  const depthRef = useRef(0);"
)

# 2. Update depthRef inside the setInterval
content = content.replace(
    "setObsDepth(currentDepth);",
    "setObsDepth(currentDepth);\n      depthRef.current = currentDepth;"
)

# 3. Create Particles in the Three.js scene setup
particle_setup = """
    // ── MARINE SNOW (PARTICLES) ──
    const particleCount = 1500;
    const particles = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    for(let i=0; i<particleCount*3; i++) {
        pPos[i] = (Math.random() - 0.5) * 40;
    }
    particles.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.05,
        transparent: true,
        opacity: 0.4
    });
    const particleSystem = new THREE.Points(particles, pMat);
    scene.add(particleSystem);
    const particlesRef = { current: particleSystem };
"""
content = content.replace(
    "// ── POV ENVIRONMENT SCENE ──",
    particle_setup + "\n    // ── POV ENVIRONMENT SCENE ──"
)

# 4. Add the Dive Animation Logic to the animate loop
animate_injection = """
      // --- OBSERVATION DIVE ANIMATION ---
      if (viewPresetRef.current === 'OBSERVATION') {
          // Pitch AUV down
          if (auvGroupRef.current) {
              auvGroupRef.current.rotation.z = THREE.MathUtils.lerp(auvGroupRef.current.rotation.z, -0.4, 0.05); // Tilt nose down
              auvGroupRef.current.rotation.y = 0; // lock rotation
          }
          
          // Move particles UP to simulate diving
          if (particlesRef.current) {
              const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
              for(let i=1; i<particleCount*3; i+=3) {
                  positions[i] += 0.15; // Move Y up
                  if (positions[i] > 20) positions[i] = -20;
              }
              particlesRef.current.geometry.attributes.position.needsUpdate = true;
          }

          // Darken the water based on depth (0m = light blue, 500m = pitch black)
          const depthRatio = Math.min(depthRef.current / 500.0, 1.0);
          const surfaceColor = new THREE.Color(0x0077be); // Ocean blue
          const abyssColor = new THREE.Color(0x020617);   // Abyss black
          const currentColor = surfaceColor.clone().lerp(abyssColor, depthRatio);
          scene.background = currentColor;
          scene.fog.color = currentColor;
          
          if (cameraRef.current) {
              // Lock camera
              cameraRef.current.position.lerp(new THREE.Vector3(3.5, 1.0, 3.5), 0.1);
              cameraRef.current.lookAt(0,0,0);
          }
      } else {
          // Reset AUV rotation if leaving observation
          if (auvGroupRef.current && viewPresetRef.current !== 'POV') {
              auvGroupRef.current.rotation.z = THREE.MathUtils.lerp(auvGroupRef.current.rotation.z, 0, 0.05);
          }
          // Reset background
          scene.background = new THREE.Color(0x020617);
          scene.fog.color = new THREE.Color(0x020617);
      }
"""
content = content.replace(
    "if (viewPresetRef.current === 'POV') {",
    animate_injection + "\n      if (viewPresetRef.current === 'POV') {"
)

with open("frontend/src/pages/AUVTwin.tsx", "w") as f:
    f.write(content)
