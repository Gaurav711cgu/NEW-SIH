import React, { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EnrichedAnomaly, OSMCluster, LayerVisibility, CameraPreset } from '../../types';
import { createIndiaBaseplate, geoToScene } from './IndiaBaseplate';
import { createThermalPillars, updateThermalPillarsAnimation } from './ThermalPillars';
import { createIndustrialPerimeters, updateIndustrialPerimetersAnimation } from './IndustrialPerimeters';

interface GeoIntCanvas3DProps {
  anomalies: EnrichedAnomaly[];
  clusters: OSMCluster[];
  layers: LayerVisibility;
  threatFilter: string;
  cameraPreset: CameraPreset;
  selectedAnomalyId?: string | null;
  onSelectAnomaly: (anomaly: EnrichedAnomaly) => void;
  onHoverAnomaly: (anomaly: EnrichedAnomaly | null, screenCoords?: { x: number; y: number }) => void;
}

export const GeoIntCanvas3D: React.FC<GeoIntCanvas3DProps> = ({
  anomalies,
  clusters,
  layers,
  threatFilter,
  cameraPreset,
  selectedAnomalyId,
  onSelectAnomaly,
  onHoverAnomaly,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animFrameRef = useRef<number>(0);

  // Groups
  const baseplateGroupRef = useRef<THREE.Group | null>(null);
  const pillarsGroupRef = useRef<THREE.Group | null>(null);
  const perimetersGroupRef = useRef<THREE.Group | null>(null);
  const interactiveMeshesRef = useRef<THREE.Mesh[]>([]);

  // Hover tracking
  const hoveredMeshRef = useRef<THREE.Mesh | null>(null);
  const mousePosRef = useRef<THREE.Vector2>(new THREE.Vector2(-1000, -1000));
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());

  // Camera animation target
  const targetCamPosRef = useRef<THREE.Vector3 | null>(null);
  const targetLookAtRef = useRef<THREE.Vector3 | null>(null);

  // Initialize Scene
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06090e);
    scene.fog = new THREE.FogExp2(0x06090e, 0.0035);
    sceneRef.current = scene;

    // 2. Camera (Initial Isometric View)
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 1000);
    camera.position.set(0, 85, 105);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 - 0.04; // Prevent going below ground
    controls.minDistance = 15;
    controls.maxDistance = 250;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // 5. Tactical Lighting
    const ambientLight = new THREE.AmbientLight(0x1e293b, 1.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x93c5fd, 2.2);
    dirLight.position.set(40, 90, 60);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x38bdf8, 1.6, 180);
    pointLight.position.set(0, 40, 0);
    scene.add(pointLight);

    // 6. Baseplate
    const baseplate = createIndiaBaseplate(clusters);
    scene.add(baseplate);
    baseplateGroupRef.current = baseplate;

    // 7. Industrial Perimeters
    const perimeters = createIndustrialPerimeters(clusters);
    scene.add(perimeters);
    perimetersGroupRef.current = perimeters;

    // 8. Animation Loop
    const clock = new THREE.Clock();
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Controls update
      controls.update();

      // Smooth camera interpolation if transitioning
      if (targetCamPosRef.current && cameraRef.current) {
        cameraRef.current.position.lerp(targetCamPosRef.current, 0.05);
        if (targetLookAtRef.current) {
          controls.target.lerp(targetLookAtRef.current, 0.05);
        }
        if (cameraRef.current.position.distanceTo(targetCamPosRef.current) < 0.2) {
          targetCamPosRef.current = null;
          targetLookAtRef.current = null;
        }
      }

      // Animate heat pillars and perimeters
      if (pillarsGroupRef.current) {
        updateThermalPillarsAnimation(pillarsGroupRef.current, time);
      }
      if (perimetersGroupRef.current) {
        updateIndustrialPerimetersAnimation(perimetersGroupRef.current, time);
      }

      renderer.render(scene, camera);
    };
    animate();

    // 9. Resize handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animFrameRef.current);
      controls.dispose();
      renderer.dispose();
    };
  }, [clusters]);

  // Re-render Thermal Pillars when anomalies or threat filter changes
  useEffect(() => {
    if (!sceneRef.current) return;

    if (pillarsGroupRef.current) {
      sceneRef.current.remove(pillarsGroupRef.current);
      pillarsGroupRef.current = null;
    }

    const { group, interactiveMeshes } = createThermalPillars(anomalies, threatFilter);
    sceneRef.current.add(group);
    pillarsGroupRef.current = group;
    interactiveMeshesRef.current = interactiveMeshes;
  }, [anomalies, threatFilter]);

  // Handle Layer Visibility toggles
  useEffect(() => {
    if (pillarsGroupRef.current) {
      pillarsGroupRef.current.visible = layers.thermalPillars;
    }
    if (perimetersGroupRef.current) {
      perimetersGroupRef.current.visible = layers.industrialZones;
    }
    if (baseplateGroupRef.current) {
      baseplateGroupRef.current.visible = layers.coordinateGrid;
    }
  }, [layers]);

  // Handle Camera Presets
  useEffect(() => {
    if (!controlsRef.current || !cameraRef.current) return;
    const controls = controlsRef.current;

    switch (cameraPreset) {
      case 'ORTHO': // Top-down Nadir
        targetCamPosRef.current = new THREE.Vector3(0, 135, 0.5);
        targetLookAtRef.current = new THREE.Vector3(0, 0, 0);
        break;
      case 'WEST': // Gujarat & Maharashtra Corridor
        targetCamPosRef.current = new THREE.Vector3(-45, 38, 30);
        targetLookAtRef.current = new THREE.Vector3(-45, 0, 8);
        break;
      case 'EAST': // West Bengal & Odisha Corridor
        targetCamPosRef.current = new THREE.Vector3(25, 40, 20);
        targetLookAtRef.current = new THREE.Vector3(25, 0, 0);
        break;
      case 'SOUTH': // Tamil Nadu & Andhra Corridor
        targetCamPosRef.current = new THREE.Vector3(-5, 45, 60);
        targetLookAtRef.current = new THREE.Vector3(-5, 0, 35);
        break;
      case 'ISOMETRIC':
      case 'DEFAULT':
      default:
        targetCamPosRef.current = new THREE.Vector3(0, 85, 105);
        targetLookAtRef.current = new THREE.Vector3(0, 0, 0);
        break;
    }
  }, [cameraPreset]);

  // Fly to selected anomaly when selected from feed or prop
  useEffect(() => {
    if (!selectedAnomalyId || !cameraRef.current || !controlsRef.current) return;
    const selected = anomalies.find(a => a.anomaly_id === selectedAnomalyId);
    if (!selected) return;

    const targetPos = geoToScene(selected.latitude, selected.longitude, 0);
    // Position camera slightly offset to admire the 3D extrusion
    targetCamPosRef.current = new THREE.Vector3(targetPos.x, targetPos.y + 22, targetPos.z + 28);
    targetLookAtRef.current = new THREE.Vector3(targetPos.x, targetPos.y + 4, targetPos.z);
  }, [selectedAnomalyId, anomalies]);

  // Raycasting Mouse Events
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current || !cameraRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    mousePosRef.current.set(x, y);

    raycasterRef.current.setFromCamera(mousePosRef.current, cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(interactiveMeshesRef.current, false);

    if (intersects.length > 0) {
      const hit = intersects[0].object as THREE.Mesh;
      if (hoveredMeshRef.current !== hit) {
        // Reset previous
        if (hoveredMeshRef.current) {
          const oldMat = hoveredMeshRef.current.material as THREE.MeshStandardMaterial;
          if (oldMat && oldMat.emissive) {
            oldMat.emissiveIntensity = 0.85;
          }
        }
        // Highlight new
        hoveredMeshRef.current = hit;
        const newMat = hit.material as THREE.MeshStandardMaterial;
        if (newMat && newMat.emissive) {
          newMat.emissiveIntensity = 1.6;
        }
      }

      const anomaly = hit.userData.anomaly as EnrichedAnomaly;
      onHoverAnomaly(anomaly, { x: e.clientX, y: e.clientY });
    } else {
      if (hoveredMeshRef.current) {
        const oldMat = hoveredMeshRef.current.material as THREE.MeshStandardMaterial;
        if (oldMat && oldMat.emissive) {
          oldMat.emissiveIntensity = 0.85;
        }
        hoveredMeshRef.current = null;
      }
      onHoverAnomaly(null);
    }
  }, [onHoverAnomaly]);

  const handleClick = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current || !cameraRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(interactiveMeshesRef.current, false);

    if (intersects.length > 0) {
      const hit = intersects[0].object as THREE.Mesh;
      const anomaly = hit.userData.anomaly as EnrichedAnomaly;
      if (anomaly) {
        onSelectAnomaly(anomaly);
      }
    }
  }, [onSelectAnomaly]);

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onClick={handleClick}
      className="relative w-full h-full cursor-grab active:cursor-grabbing overflow-hidden select-none outline-none"
    />
  );
};
