import { Environment } from "@react-three/drei";
import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStore } from '../store/simulationStore';

// Soft volumetric headlight beam shader
const beamVertexShader = /* glsl */ `
  varying vec3 vViewPosition;
  varying vec3 vNormal;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = viewMatrix * modelMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const beamFragmentShader = /* glsl */ `
  uniform float uIntensity;
  uniform vec3 uColor;
  varying vec3 vViewPosition;
  varying vec3 vNormal;
  varying vec2 vUv;

  void main() {
    // Distance along cone (vUv.y: 0 is apex/lamp, 1 is base/far)
    float longitudinalFade = smoothstep(0.0, 0.05, vUv.y) * (1.0 - smoothstep(0.35, 1.0, vUv.y));
    
    // Near-camera distance fade to prevent camera traversal clipping
    float distToCamera = length(vViewPosition);
    float nearCameraFade = smoothstep(1.5, 6.0, distToCamera);

    // View-angle Fresnel falloff (soft outer edges)
    vec3 viewDir = normalize(vViewPosition);
    vec3 norm = normalize(vNormal);
    float cosTheta = abs(dot(norm, viewDir));
    float edgeFalloff = pow(1.0 - cosTheta, 1.2);

    float alpha = uIntensity * longitudinalFade * nearCameraFade * edgeFalloff;
    if (alpha < 0.001) discard;

    gl_FragColor = vec4(uColor * alpha, alpha);
  }
`;

export default function Lighting() {
  const depth = useSimulationStore((s) => s.depth);
  const auvPosition = useSimulationStore((s) => s.auvPosition);
  const auvRotation = useSimulationStore((s) => s.auvRotation);

  const scene = useThree((state) => state.scene);

  // SpotLight references
  const portLightRef = useRef<THREE.SpotLight>(null);
  const stbdLightRef = useRef<THREE.SpotLight>(null);
  const floodLightRef = useRef<THREE.SpotLight>(null);
  const vehicleObserverRef = useRef<THREE.SpotLight>(null);
  const abyssalDirLightRef = useRef<THREE.DirectionalLight>(null);

  // Volumetric beam meshes
  const portBeamRef = useRef<THREE.Mesh>(null);
  const stbdBeamRef = useRef<THREE.Mesh>(null);

  // Target objects for lights
  const portTarget = useMemo(() => new THREE.Object3D(), []);
  const stbdTarget = useMemo(() => new THREE.Object3D(), []);
  const floodTarget = useMemo(() => new THREE.Object3D(), []);
  const vehicleTarget = useMemo(() => new THREE.Object3D(), []);
  const seafloorTarget = useMemo(() => new THREE.Object3D(), []);

  // Shared geometry and materials for volumetric light cones
  const beamResources = useMemo(() => {
    // Cone: radius 4.5m, height 36m, 24 segments, open-ended
    const geom = new THREE.ConeGeometry(4.5, 36, 24, 8, true);
    // Shift geometry so apex is at origin (0, 0, 0) and base extends along -Y
    geom.translate(0, -18, 0);

    const portMat = new THREE.ShaderMaterial({
      vertexShader: beamVertexShader,
      fragmentShader: beamFragmentShader,
      uniforms: {
        uIntensity: { value: 0.32 },
        uColor: { value: new THREE.Color('#a0d8ff') },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });

    const stbdMat = portMat.clone();

    return { geom, portMat, stbdMat };
  }, []);

  useEffect(() => {
    return () => {
      beamResources.geom.dispose();
      beamResources.portMat.dispose();
      beamResources.stbdMat.dispose();
    };
  }, [beamResources]);

  // Reusable vectors for frame updates to avoid GC pressure
  const euler = useMemo(() => new THREE.Euler(0, 0, 0, 'YXZ'), []);
  const forward = useMemo(() => new THREE.Vector3(), []);
  const up = useMemo(() => new THREE.Vector3(), []);
  const right = useMemo(() => new THREE.Vector3(), []);
  const auvPos = useMemo(() => new THREE.Vector3(), []);
  const portPos = useMemo(() => new THREE.Vector3(), []);
  const stbdPos = useMemo(() => new THREE.Vector3(), []);
  const floodPos = useMemo(() => new THREE.Vector3(), []);
  const observerPos = useMemo(() => new THREE.Vector3(), []);
  const beamQuat = useMemo(() => new THREE.Quaternion(), []);
  const coneDown = useMemo(() => new THREE.Vector3(0, -1, 0), []);

  // Lighting calculations per frame
  // Calibrated ambient floor increased for a clean, clear, and realistic view
  const ambientFloor = 1.2;
  const ambientIntensity = Math.max(ambientFloor, THREE.MathUtils.lerp(1.5, ambientFloor, Math.min(depth / 80, 1)));
  const sunIntensity = Math.max(0.5, 1.4 - (depth / 50)); // Keep some sun even at depth

  // High-intensity searchlight headlights ramp up with depth
  const headlightIntensity = depth < 4 ? 15 : THREE.MathUtils.lerp(15, 35, Math.min((depth - 4) / 40, 1));
  const floodIntensity = depth < 4 ? 10 : THREE.MathUtils.lerp(10, 30, Math.min((depth - 4) / 40, 1));
  const vehicleLightIntensity = depth < 4 ? 10 : THREE.MathUtils.lerp(10, 25, Math.min((depth - 4) / 40, 1));

  // Fog tuning: Clean, bright, and realistic blue environment (Digital Twin style)
  const surfaceFogColor = useMemo(() => new THREE.Color('#004a80'), []);
  const deepFogColor = useMemo(() => new THREE.Color('#003366'), []);
  const fogColor = useMemo(() => new THREE.Color(), []);

  useFrame(() => {
    // 1. Update clean deep ocean fog & background
    fogColor.copy(surfaceFogColor).lerp(deepFogColor, Math.min(depth / 90, 1));
    const fogDensity = THREE.MathUtils.lerp(0.001, 0.002, Math.min(depth / 120, 1)); // Very low density for clear view

    if (scene.fog instanceof THREE.FogExp2) {
      scene.fog.color.lerp(fogColor, 0.08);
      scene.fog.density = fogDensity;
    } else {
      scene.fog = new THREE.FogExp2(fogColor, fogDensity);
    }

    // Set scene background to match fog color so transmission materials (like water) refract correctly
    if (!scene.background || !(scene.background instanceof THREE.Color)) {
      scene.background = fogColor.clone();
    } else {
      scene.background.lerp(fogColor, 0.08);
    }

    // 2. Derive AUV forward orientation in world coordinates
    // AUV hull forward is along +X in local space
    euler.set(auvRotation[0], auvRotation[1], auvRotation[2], 'YXZ');
    forward.set(1, 0, 0).applyEuler(euler).normalize();
    up.set(0, 1, 0).applyEuler(euler).normalize();
    right.set(0, 0, 1).applyEuler(euler).normalize();

    auvPos.set(auvPosition[0], auvPosition[1], auvPosition[2]);

    // Lamp mounting positions on AUV nose (length scale 0.6, nose at +1.4m forward)
    const noseForwardOffset = 1.35;
    portPos.copy(auvPos).addScaledVector(forward, noseForwardOffset).addScaledVector(right, 0.35).addScaledVector(up, 0.08);
    stbdPos.copy(auvPos).addScaledVector(forward, noseForwardOffset).addScaledVector(right, -0.35).addScaledVector(up, 0.08);
    floodPos.copy(auvPos).addScaledVector(up, -0.35);

    // Aim headlights along forward path, angled down to cast pool on seabed at 25-35m distance
    if (portLightRef.current) {
      portLightRef.current.position.copy(portPos);
      portTarget.position.copy(portPos).addScaledVector(forward, 28).addScaledVector(up, -7.5);
      portTarget.updateMatrixWorld();
    }

    if (stbdLightRef.current) {
      stbdLightRef.current.position.copy(stbdPos);
      stbdTarget.position.copy(stbdPos).addScaledVector(forward, 28).addScaledVector(up, -7.5);
      stbdTarget.updateMatrixWorld();
    }

    // Downward bathymetry survey floodlight (illuminates seabed 3-10m below vehicle)
    if (floodLightRef.current) {
      floodLightRef.current.position.copy(floodPos);
      floodTarget.position.copy(floodPos).addScaledVector(up, -16).addScaledVector(forward, 6);
      floodTarget.updateMatrixWorld();
    }

    // Dedicated camera/observer keylight focused directly on the AUV body
    if (vehicleObserverRef.current) {
      observerPos.copy(auvPos).addScaledVector(forward, -4.0).addScaledVector(up, 3.0).addScaledVector(right, 4.0);
      vehicleObserverRef.current.position.copy(observerPos);
      vehicleTarget.position.copy(auvPos);
      vehicleTarget.updateMatrixWorld();
    }

    // Abyssal directional fill light: positioned above seafloor, points DOWN towards seabed
    if (abyssalDirLightRef.current) {
      abyssalDirLightRef.current.position.set(auvPos.x + 30, -110, auvPos.z - 30);
      seafloorTarget.position.set(auvPos.x, -150, auvPos.z);
      seafloorTarget.updateMatrixWorld();
    }

    // Update volumetric light cone orientation (cone -Y aligned to forward vector)
    beamQuat.setFromUnitVectors(coneDown, forward);

    if (portBeamRef.current) {
      portBeamRef.current.position.copy(portPos);
      portBeamRef.current.quaternion.copy(beamQuat);
    }
    if (stbdBeamRef.current) {
      stbdBeamRef.current.position.copy(stbdPos);
      stbdBeamRef.current.quaternion.copy(beamQuat);
    }

    // Update volumetric beam intensity based on depth
    const beamAlpha = depth < 4 ? 0.06 : THREE.MathUtils.lerp(0.10, 0.22, Math.min((depth - 4) / 40, 1));
    beamResources.portMat.uniforms.uIntensity.value = beamAlpha;
    beamResources.stbdMat.uniforms.uIntensity.value = beamAlpha;
  });

  return (
    <group>
      {/* Provide an HDRI Environment map so physical materials (transmission, metalness) can reflect/refract properly */}
      <Environment preset="night" />

      {/* ── AMBIENT & DIRECTIONAL SUNLIGHT ── */}
      <ambientLight intensity={ambientIntensity} color="#60a5fa" />
      <directionalLight
        position={[20, 50, -20]}
        intensity={sunIntensity}
        color="#aaddff"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      {/* Deep Seafloor Benthic Fill (aimed DOWNWARDS onto the seabed at Y = -150m) */}
      <primitive object={seafloorTarget} />
      {depth > 60 && (
        <directionalLight
          ref={abyssalDirLightRef}
          target={seafloorTarget}
          intensity={1.6}
          color="#3b7cb5"
        />
      )}

      {/* ── AUV HEADLIGHTS & FLOODLIGHT ── */}
      <primitive object={portTarget} />
      <primitive object={stbdTarget} />
      <primitive object={floodTarget} />
      <primitive object={vehicleTarget} />

      {/* High-Intensity Port Searchlight */}
      <spotLight
        ref={portLightRef}
        target={portTarget}
        color="#eef8ff"
        intensity={headlightIntensity}
        distance={120}
        angle={Math.PI / 3.8}
        penumbra={0.7}
        decay={1.0}
        castShadow
        shadow-bias={-0.0005}
        shadow-mapSize={[1024, 1024]}
      />

      {/* High-Intensity Starboard Searchlight */}
      <spotLight
        ref={stbdLightRef}
        target={stbdTarget}
        color="#eef8ff"
        intensity={headlightIntensity}
        distance={120}
        angle={Math.PI / 3.8}
        penumbra={0.7}
        decay={1.0}
      />

      {/* Wide Downward Bathymetry Survey Floodlight */}
      <spotLight
        ref={floodLightRef}
        target={floodTarget}
        color="#a2e0ff"
        intensity={floodIntensity}
        distance={60}
        angle={Math.PI / 2.6}
        penumbra={0.85}
        decay={1.0}
      />

      {/* Camera/Observer keylight illuminating vehicle hull and tactical markings */}
      <spotLight
        ref={vehicleObserverRef}
        target={vehicleTarget}
        color="#cce6ff"
        intensity={vehicleLightIntensity}
        distance={25}
        angle={Math.PI / 3.0}
        penumbra={0.6}
        decay={1.0}
      />

      {/* Volumetric Headlight Beams */}
      <mesh
        ref={portBeamRef}
        geometry={beamResources.geom}
        material={beamResources.portMat}
      />
      <mesh
        ref={stbdBeamRef}
        geometry={beamResources.geom}
        material={beamResources.stbdMat}
      />
    </group>
  );
}
