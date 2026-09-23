import { Suspense, useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SceneErrorBoundary } from '../common/SceneErrorBoundary';
import { useSimulationStore } from '../store/simulationStore';

const MODEL_PATH = '/models/seabed.glb';
useGLTF.preload(MODEL_PATH);

// Helper to configure procedural caustics shader on MeshStandardMaterial
function applyCausticsShader(
  material: THREE.MeshStandardMaterial,
  uniforms: {
    uTime: { value: number };
    uHeadlightPos: { value: THREE.Vector3 };
    uCausticIntensity: { value: number };
  }
) {
  material.color.set('#1b344b');
  material.roughness = 0.85;
  material.metalness = 0.05;
  material.side = THREE.DoubleSide;
  material.customProgramCacheKey = () => 'seafloor_caustic_pbr_v1';

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.uTime;
    shader.uniforms.uHeadlightPos = uniforms.uHeadlightPos;
    shader.uniforms.uCausticIntensity = uniforms.uCausticIntensity;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      `
      #include <common>
      varying vec3 vSeafloorWorldPos;
      `
    );

    shader.vertexShader = shader.vertexShader.replace(
      '#include <worldpos_vertex>',
      `
      #include <worldpos_vertex>
      vSeafloorWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
      `
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      `
      #include <common>
      uniform float uTime;
      uniform vec3 uHeadlightPos;
      uniform float uCausticIntensity;
      varying vec3 vSeafloorWorldPos;

      // Deterministic 2D hash for Voronoi cellular noise
      vec2 causticHash2D(vec2 p) {
        p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
        return fract(sin(p) * 43758.5453123);
      }

      // Fast Voronoi cell-border distance metric for optical caustics
      float voronoiCaustic(vec2 p) {
        vec2 ip = floor(p);
        vec2 fp = fract(p);
        float d1 = 8.0;
        float d2 = 8.0;
        for (int j = -1; j <= 1; j++) {
          for (int i = -1; i <= 1; i++) {
            vec2 g = vec2(float(i), float(j));
            vec2 o = causticHash2D(ip + g);
            vec2 r = g + o - fp;
            float d = dot(r, r);
            if (d < d1) {
              d2 = d1;
              d1 = d;
            } else if (d < d2) {
              d2 = d;
            }
          }
        }
        float edge = sqrt(d2) - sqrt(d1);
        return pow(clamp(1.0 - edge * 3.2, 0.0, 1.0), 2.2);
      }
      `
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <opaque_fragment>',
      `
      // Dual-frequency procedural underwater caustics
      vec2 causticCoord = vSeafloorWorldPos.xz;
      float t = uTime * 0.85;

      // Primary refractive bands (broad undulating network)
      float c1 = voronoiCaustic(causticCoord * 0.18 + vec2(t * 0.035, t * 0.025));

      // Secondary capillary ripples (high-frequency interference)
      float c2 = voronoiCaustic(causticCoord * 0.42 + vec2(-t * 0.045, t * 0.038));

      // Superimposed interference caustic network
      float causticPattern = clamp((c1 * 0.65 + c2 * 0.45) * 1.5, 0.0, 2.5);

      // Modulate by AUV searchlight / floodlight proximity
      float distToAUV = length(vSeafloorWorldPos - uHeadlightPos);
      float headlightProximity = smoothstep(70.0, 14.0, distToAUV);
      float depthFactor = clamp((vSeafloorWorldPos.y + 160.0) / 20.0, 0.35, 1.0);

      // Deep-sea refractive oceanic cyan-white caustic light
      vec3 causticColor = vec3(0.38, 0.78, 1.0) * causticPattern * (0.28 + 0.95 * headlightProximity) * uCausticIntensity * depthFactor;

      // Micro-silt sediment texture variation (breaks visual flatness)
      float siltNoise = fract(sin(dot(vSeafloorWorldPos.xz, vec2(12.9898, 78.233))) * 43758.5453);
      outgoingLight = outgoingLight * (0.88 + 0.24 * siltNoise) + causticColor;

      #include <opaque_fragment>
      `
    );
  };
}

function ProceduralSeafloorFallback() {
  const geo = useMemo(() => new THREE.PlaneGeometry(500, 500, 48, 48), []);
  const uniforms = useRef({
    uTime: { value: 0 },
    uHeadlightPos: { value: new THREE.Vector3(0, -142, 0) },
    uCausticIntensity: { value: 1.0 },
  }).current;

  const mat = useMemo(() => {
    const m = new THREE.MeshStandardMaterial();
    applyCausticsShader(m, uniforms);
    return m;
  }, [uniforms]);

  const auvPosition = useSimulationStore((s) => s.auvPosition);

  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.getElapsedTime();
    uniforms.uHeadlightPos.value.set(auvPosition[0], auvPosition[1], auvPosition[2]);
  });

  return (
    <group position={[0, -145, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} geometry={geo} material={mat} receiveShadow />
    </group>
  );
}

function GLBSeafloor() {
  const { scene } = useGLTF(MODEL_PATH);
  const auvPosition = useSimulationStore((s) => s.auvPosition);

  const uniforms = useRef({
    uTime: { value: 0 },
    uHeadlightPos: { value: new THREE.Vector3(0, -142, 0) },
    uCausticIntensity: { value: 1.0 },
  }).current;

  useMemo(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        if (mesh.material && mesh.material instanceof THREE.MeshStandardMaterial) {
          applyCausticsShader(mesh.material, uniforms);
        }
      }
    });
  }, [scene, uniforms]);

  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.getElapsedTime();
    uniforms.uHeadlightPos.value.set(auvPosition[0], auvPosition[1], auvPosition[2]);
  });

  return (
    <group position={[0, -145, 0]}>
      <primitive object={scene} receiveShadow />
    </group>
  );
}

export function SeafloorModel() {
  return (
    <SceneErrorBoundary fallback={<ProceduralSeafloorFallback />}>
      <Suspense fallback={<ProceduralSeafloorFallback />}>
        <GLBSeafloor />
      </Suspense>
    </SceneErrorBoundary>
  );
}

export default SeafloorModel;
