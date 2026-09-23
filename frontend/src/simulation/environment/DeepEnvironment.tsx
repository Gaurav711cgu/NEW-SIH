import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStore } from '../store/simulationStore';
import { Sparkles } from '@react-three/drei';

interface BioluminescentJellyProps {
  position?: [number, number, number];
  scale?: number;
}

function BioluminescentJelly({ position = [0, 0, 0], scale = 1 }: BioluminescentJellyProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bellMatRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const coreMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const tentacleRefs = useRef<(THREE.Mesh | null)[]>([]);
  
  const offset = useMemo(() => Math.random() * 100, []);
  const tentacleCount = 6;
  const tentacleAngles = useMemo(() => {
    return Array.from({ length: tentacleCount }, (_, i) => (i * Math.PI * 2) / tentacleCount);
  }, [tentacleCount]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const time = clock.getElapsedTime() + offset;

    // Organic hydrostatic drift & gentle bobbing
    groupRef.current.position.y += Math.sin(time * 0.8) * 0.015;
    groupRef.current.position.x += Math.cos(time * 0.4) * 0.008;

    // Rhythmic swimming bell contraction stroke (pulse)
    const stroke = Math.sin(time * 2.2);
    const bellPulseY = 1 + (stroke > 0 ? stroke * 0.22 : stroke * 0.08);
    const bellPulseXZ = 1 - (stroke > 0 ? stroke * 0.12 : stroke * 0.04);
    groupRef.current.scale.set(
      scale * bellPulseXZ,
      scale * bellPulseY,
      scale * bellPulseXZ
    );

    // Dynamic bioluminescent flash during swimming propulsion stroke
    const flashIntensity = 0.3 + Math.max(0, stroke) * 0.7;
    if (coreMatRef.current) {
      coreMatRef.current.emissiveIntensity = 1.2 + flashIntensity * 1.5;
    }
    if (bellMatRef.current) {
      bellMatRef.current.emissiveIntensity = 0.15 + flashIntensity * 0.35;
    }

    // Trailing tentacle swaying with hydrodynamics lag
    tentacleRefs.current.forEach((mesh, idx) => {
      if (mesh) {
        const lagTime = time * 2.0 - idx * 0.4;
        mesh.rotation.x = Math.sin(lagTime) * 0.25;
        mesh.rotation.z = Math.cos(lagTime * 0.8) * 0.20;
      }
    });
  });

  return (
    <group ref={groupRef} position={position}>
      {/* ── 1. TRANSLUCENT EXUMBRELLA (JELLY BELL) ── */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1.0, 32, 24, 0, Math.PI * 2, 0, Math.PI / 1.75]} />
        <meshPhysicalMaterial
          ref={bellMatRef}
          color="#dbeafe"
          emissive="#00f0ff"
          emissiveIntensity={0.25}
          transmission={0.94}
          thickness={1.8}
          ior={1.35}
          roughness={0.08}
          metalness={0.0}
          clearcoat={1.0}
          clearcoatRoughness={0.04}
          attenuationColor="#0284c7"
          attenuationDistance={1.4}
          transparent
          opacity={0.92}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* ── 2. INTERNAL BIOLUMINESCENT GASTRIC CORE (MANUBRIUM) ── */}
      <mesh position={[0, -0.22, 0]}>
        <sphereGeometry args={[0.32, 24, 16]} />
        <meshStandardMaterial
          ref={coreMatRef}
          color="#0284c7"
          emissive="#00f0ff"
          emissiveIntensity={1.8}
          roughness={0.2}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* ── 3. MARGINAL TENTACLES (TRAILING FILAMENTS) ── */}
      {tentacleAngles.map((angle, idx) => {
        const rad = 0.78;
        const tx = Math.cos(angle) * rad;
        const tz = Math.sin(angle) * rad;
        return (
          <group key={idx} position={[tx, -0.45, tz]}>
            <mesh ref={(el) => { tentacleRefs.current[idx] = el; }} position={[0, -1.2, 0]}>
              <cylinderGeometry args={[0.015, 0.005, 2.4, 8]} />
              <meshStandardMaterial
                color="#7dd3fc"
                emissive="#38bdf8"
                emissiveIntensity={0.7}
                transparent
                opacity={0.75}
                roughness={0.3}
              />
            </mesh>
          </group>
        );
      })}

      {/* ── 4. BIOLUMINESCENT LUCIFERIN EXUDATE SPARKLES ── */}
      <Sparkles
        position={[0, -1.8, 0]}
        count={20}
        scale={[1.2, 3.5, 1.2]}
        size={1.8}
        color="#00f0ff"
        speed={0.4}
        opacity={0.6}
      />
    </group>
  );
}

export default function DeepEnvironment() {
  const depth = useSimulationStore((s) => s.depth);

  // Deep-sea elements active exclusively in the bathypelagic / abyssal zone (> 80m)
  if (depth < 80) return null;

  // Smooth fade-in across 80m to 120m depth
  const visibility = Math.min(1, (depth - 80) / 40);

  return (
    <group>
      {/* Ambient Planktonic Bioluminescence (Authentic Oceanic Cyan & Emerald) */}
      <Sparkles
        count={500}
        scale={[200, 100, 200]}
        position={[0, -100, 0]}
        size={1.4}
        color="#00ffff"
        opacity={visibility * 0.32}
        speed={0.12}
      />
      <Sparkles
        count={450}
        scale={[200, 100, 200]}
        position={[0, -100, 0]}
        size={1.6}
        color="#00f5d4"
        opacity={visibility * 0.24}
        speed={0.08}
      />

      {/* ── Midwater Bioluminescent Jellyfish Swarms ── */}
      {/* Cluster Alpha (Port/Forward flank at Y = -90m) */}
      <group position={[20, -90, -30]}>
        {[
          { pos: [-4.2, 1.5, 3.1], scale: 1.1 },
          { pos: [3.8, -2.2, -1.4], scale: 0.85 },
          { pos: [-1.5, -4.0, 5.2], scale: 1.25 },
          { pos: [5.1, 3.8, 2.0], scale: 0.95 },
          { pos: [-6.0, -1.8, -4.5], scale: 1.05 },
        ].map((item, i) => (
          <BioluminescentJelly key={`jelly-a-${i}`} position={item.pos as [number, number, number]} scale={item.scale} />
        ))}
      </group>

      {/* Cluster Beta (Starboard/Deep horizon at Y = -110m) */}
      <group position={[-25, -110, 10]}>
        {[
          { pos: [2.5, -1.0, -2.8], scale: 1.2 },
          { pos: [-3.2, 2.4, 1.9], scale: 0.9 },
          { pos: [1.8, -3.5, 4.1], scale: 1.15 },
        ].map((item, i) => (
          <BioluminescentJelly key={`jelly-b-${i}`} position={item.pos as [number, number, number]} scale={item.scale} />
        ))}
      </group>
    </group>
  );
}
