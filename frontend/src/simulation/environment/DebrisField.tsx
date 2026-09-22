import { useMemo } from 'react';

import { useSimulationStore } from '../store/simulationStore';

export default function DebrisField() {
  const depth = useSimulationStore(s => s.depth);

  // Generate deterministic random positions for debris
  const debrisData = useMemo(() => {
    const data = [];
    // Scattered metal scrap
    for (let i = 0; i < 40; i++) {
      data.push({
        type: 'scrap',
        pos: [(Math.random() - 0.5) * 400, -141.5, (Math.random() - 0.5) * 400],
        rot: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
        scale: 1 + Math.random() * 3
      });
    }
    // Barrels
    for (let i = 0; i < 15; i++) {
      data.push({
        type: 'barrel',
        pos: [(Math.random() - 0.5) * 300, -141, (Math.random() - 0.5) * 300],
        rot: [0, Math.random() * Math.PI, Math.PI / 2 * Math.floor(Math.random() * 2)],
        scale: 1.5
      });
    }
    // Rocks
    for (let i = 0; i < 80; i++) {
      data.push({
        type: 'rock',
        pos: [(Math.random() - 0.5) * 800, -142, (Math.random() - 0.5) * 800],
        rot: [0, Math.random() * Math.PI, 0],
        scale: 3 + Math.random() * 10
      });
    }
    return data;
  }, []);

  // Only render if we are deep enough to see the seafloor
  if (depth < 60) return null;

  return (
    <group>
      {debrisData.map((obj, i) => {
        if (obj.type === 'rock') {
          return (
            <mesh key={i} position={obj.pos as [number,number,number]} rotation={obj.rot as [number,number,number]} scale={obj.scale} receiveShadow castShadow>
              <dodecahedronGeometry args={[1, 1]} />
              <meshStandardMaterial color="#0f172a" roughness={0.9} />
            </mesh>
          );
        }
        if (obj.type === 'barrel') {
          return (
            <mesh key={i} position={obj.pos as [number,number,number]} rotation={obj.rot as [number,number,number]} scale={obj.scale} receiveShadow castShadow>
              <cylinderGeometry args={[0.5, 0.5, 1.5, 16]} />
              <meshStandardMaterial color="#7f1d1d" roughness={0.6} metalness={0.4} />
            </mesh>
          );
        }
        return (
          <mesh key={i} position={obj.pos as [number,number,number]} rotation={obj.rot as [number,number,number]} scale={obj.scale} receiveShadow castShadow>
            <boxGeometry args={[1, 0.2, 1.5]} />
            <meshStandardMaterial color="#475569" roughness={0.7} metalness={0.8} />
          </mesh>
        );
      })}
    </group>
  );
}
