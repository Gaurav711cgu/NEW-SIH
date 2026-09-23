import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStore } from '../store/simulationStore';

// Custom GLSL Shader for soft volumetric light shafts
const godRayVertexShader = /* glsl */ `
  varying vec3 vWorldPosition;
  varying vec3 vViewPosition;
  varying vec3 vNormal;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = viewMatrix * worldPos;
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const godRayFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uDepth;
  uniform float uBaseOpacity;
  uniform vec3 uColor;

  varying vec3 vWorldPosition;
  varying vec3 vViewPosition;
  varying vec3 vNormal;
  varying vec2 vUv;

  void main() {
    // 1. Vertical falloff along shaft length
    // vUv.y: 0 is bottom (deep), 1 is top (near surface)
    float topFade = smoothstep(1.0, 0.85, vUv.y);
    float bottomFade = smoothstep(0.0, 0.38, vUv.y);
    float verticalFade = topFade * bottomFade;

    // 2. Global depth extinction: fade out completely at depth > 75m
    float depthExtinction = 1.0 - smoothstep(15.0, 75.0, uDepth);

    // 3. Near-camera distance fade (eliminates near-frustum clipping to solid white polygons)
    float distToCamera = length(vViewPosition);
    // Fragments closer than 3.0m smoothly fade to 0; full opacity beyond 10.0m
    float nearCameraFade = smoothstep(3.0, 10.0, distToCamera);

    // 4. View-angle Fresnel attenuation (softens silhouette and glancing faces)
    vec3 viewDir = normalize(vViewPosition);
    vec3 norm = normalize(vNormal);
    float cosTheta = abs(dot(norm, viewDir));
    float fresnel = pow(1.0 - cosTheta, 1.4) * 0.75 + pow(cosTheta, 2.2) * 0.25;

    // 5. Subtle caustics / water wave shimmer
    float shimmer = 0.88 + 0.12 * sin(uTime * 1.5 + vWorldPosition.x * 0.2 + vWorldPosition.z * 0.2);

    // 6. Compute final alpha
    float alpha = uBaseOpacity * verticalFade * nearCameraFade * depthExtinction * fresnel * shimmer;
    
    if (alpha < 0.002) {
      discard;
    }

    // Pre-multiplied style additive output
    gl_FragColor = vec4(uColor * alpha, alpha);
  }
`;

interface RayConfig {
  position: [number, number, number];
  rotation: [number, number, number];
  radiusTop: number;
  radiusBottom: number;
  height: number;
  opacity: number;
}

export default function GodRays() {
  const depth = useSimulationStore((s) => s.depth);
  const groupRef = useRef<THREE.Group>(null);

  // 8 soft volumetric shafts strategically placed along realistic sun angle
  const rayConfigs = useMemo<RayConfig[]>(() => {
    return [
      { position: [-14, -40, 8], rotation: [-0.18, 0.2, 0.18], radiusTop: 2.2, radiusBottom: 16.0, height: 90, opacity: 0.32 },
      { position: [-6, -42, 14], rotation: [-0.16, -0.15, 0.22], radiusTop: 1.8, radiusBottom: 14.0, height: 92, opacity: 0.28 },
      { position: [12, -38, -6], rotation: [-0.22, 0.4, 0.15], radiusTop: 2.5, radiusBottom: 18.0, height: 88, opacity: 0.30 },
      { position: [18, -44, 10], rotation: [-0.20, -0.3, 0.20], radiusTop: 3.0, radiusBottom: 20.0, height: 95, opacity: 0.25 },
      { position: [-22, -40, -12], rotation: [-0.19, 0.1, 0.25], radiusTop: 2.0, radiusBottom: 15.0, height: 90, opacity: 0.27 },
      { position: [4, -42, -18], rotation: [-0.24, 0.25, 0.16], radiusTop: 2.4, radiusBottom: 17.0, height: 92, opacity: 0.34 },
      { position: [-10, -45, -24], rotation: [-0.17, -0.2, 0.21], radiusTop: 2.8, radiusBottom: 19.0, height: 96, opacity: 0.26 },
      { position: [24, -39, -15], rotation: [-0.21, 0.35, 0.19], radiusTop: 2.0, radiusBottom: 16.0, height: 88, opacity: 0.29 },
    ];
  }, []);

  // Shared geometry instances and materials
  const resources = useMemo(() => {
    const geometries: THREE.CylinderGeometry[] = [];
    const materials: THREE.ShaderMaterial[] = [];

    rayConfigs.forEach((cfg) => {
      // Cylinder with open ends: top radius, bottom radius, height, radial segments, height segments, openEnded
      const geom = new THREE.CylinderGeometry(cfg.radiusTop, cfg.radiusBottom, cfg.height, 32, 16, true);
      const mat = new THREE.ShaderMaterial({
        vertexShader: godRayVertexShader,
        fragmentShader: godRayFragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uDepth: { value: 0 },
          uBaseOpacity: { value: cfg.opacity },
          uColor: { value: new THREE.Color('#8cd5f8') },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      });

      geometries.push(geom);
      materials.push(mat);
    });

    return { geometries, materials };
  }, [rayConfigs]);

  // Clean up WebGL resources on unmount
  useEffect(() => {
    return () => {
      resources.geometries.forEach((g) => g.dispose());
      resources.materials.forEach((m) => m.dispose());
    };
  }, [resources]);

  useFrame(({ clock }) => {
    // Animate subtle ocean current sway
    if (groupRef.current) {
      const t = clock.getElapsedTime();
      groupRef.current.rotation.x = Math.sin(t * 0.18) * 0.03;
      groupRef.current.rotation.z = Math.cos(t * 0.14) * 0.03;
    }

    // Update uniform values across materials
    const time = clock.getElapsedTime();
    resources.materials.forEach((mat) => {
      mat.uniforms.uTime.value = time;
      mat.uniforms.uDepth.value = depth;
    });
  });

  // Fade out completely and do not render when vehicle is deeper than 75m
  if (depth >= 75) {
    return null;
  }

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {rayConfigs.map((cfg, i) => (
        <mesh
          key={i}
          position={cfg.position}
          rotation={cfg.rotation}
          geometry={resources.geometries[i]}
          material={resources.materials[i]}
        />
      ))}
    </group>
  );
}
