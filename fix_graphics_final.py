import re

file_scene = 'frontend/src/simulation/AntarcticScene.tsx'
with open(file_scene, 'r') as f:
    content = f.read()

# 1. Remove the Grid from Seafloor
new_seafloor = """function Seafloor() {
  const geo = React.useMemo(() => {
    const g = new THREE.PlaneGeometry(1000, 1000, 128, 128);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = Math.sin(x * 0.1) * 2 + Math.cos(y * 0.05) * 3 + Math.sin((x+y)*0.01)*5;
      pos.setZ(i, z);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  
  return (
    <group position={[0, -142, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} geometry={geo} receiveShadow>
        <meshStandardMaterial color="#050a0f" roughness={1.0} metalness={0.0} flatShading />
      </mesh>
    </group>
  );
}"""

content = re.sub(r'function Seafloor\(\) \{.*?\n\}\n', new_seafloor + '\n', content, flags=re.DOTALL)

# 2. Fix the GodRays so they aren't huge blocking polygons
# Make them thinner, fewer, and much much softer.
new_godrays = """function GodRays() {
  const depth = useSimulationStore((s) => s.depth);
  const groupRef = useRef<THREE.Group>(null);
  
  const rays = React.useMemo(() => {
    return [...Array(6)].map(() => ({
      // Keep them away from the direct 0,0,0 center where the camera is
      position: [(Math.random() > 0.5 ? 1 : -1) * (15 + Math.random() * 30), 0, (Math.random() > 0.5 ? 1 : -1) * (15 + Math.random() * 30)] as [number, number, number],
      rotation: [Math.random() * 0.1, Math.random() * Math.PI, Math.random() * 0.1] as [number, number, number],
      args: [2 + Math.random() * 8, 150, 16, 1, true, 0, Math.PI * 2] as any,
      opacityMult: 0.1 + Math.random() * 0.15
    }));
  }, []);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.2) * 0.05;
      groupRef.current.rotation.z = Math.cos(clock.elapsedTime * 0.15) * 0.05;
    }
  });

  // Start fading immediately, completely gone by 80m
  const opacity = Math.max(0, 0.5 - (depth / 160));

  if (opacity <= 0 || depth < 5) return null; // Don't render when on the surface!

  return (
    <group ref={groupRef} position={[0, 10, 0]}>
      {rays.map((ray, i) => (
        <mesh key={i} position={ray.position} rotation={ray.rotation}>
          <coneGeometry args={ray.args} />
          <meshBasicMaterial 
            color="#99ddff" 
            transparent 
            opacity={opacity * ray.opacityMult} 
            blending={THREE.AdditiveBlending} 
            depthWrite={false} 
            side={THREE.DoubleSide} 
          />
        </mesh>
      ))}
    </group>
  );
}"""

content = re.sub(r'function GodRays\(\) \{.*?\n\}\n', new_godrays + '\n', content, flags=re.DOTALL)

with open(file_scene, 'w') as f:
    f.write(content)
print("Updated AntarcticScene.tsx")

