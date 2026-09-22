import * as THREE from 'three';
import { EnrichedAnomaly } from '../../types';
import { geoToScene } from './IndiaBaseplate';

export interface PillarMetadata {
  anomalyId: string;
  anomaly: EnrichedAnomaly;
  baseColor: number;
  height: number;
  basePos: THREE.Vector3;
}

export function getThreatColor(threatLevel?: string, classLabel?: string): number {
  if (threatLevel === 'CRITICAL' || classLabel === 'INDUSTRIAL_FIRE') {
    return 0xef4444; // Crimson Red
  }
  if (threatLevel === 'HIGH') {
    return 0xf97316; // Blazing Orange
  }
  if (threatLevel === 'ELEVATED') {
    return 0xeab308; // Gold
  }
  if (classLabel === 'WILDFIRE') {
    return 0xd97706; // Forest Amber
  }
  return 0x06b6d4; // Cyan Flaring / Moderate
}

export function createThermalPillars(
  anomalies: EnrichedAnomaly[],
  filterThreat: string = 'ALL'
): { group: THREE.Group; interactiveMeshes: THREE.Mesh[]; metadataMap: Map<string, PillarMetadata> } {
  const group = new THREE.Group();
  group.name = "thermal_pillars";
  const interactiveMeshes: THREE.Mesh[] = [];
  const metadataMap = new Map<string, PillarMetadata>();

  anomalies.forEach((anomaly, index) => {
    const threat = anomaly.prediction?.threat_level || 'ELEVATED';
    const isIndustrial = anomaly.prediction?.class_label === 'INDUSTRIAL_FIRE';

    // Apply filter if specified
    if (filterThreat === 'CRITICAL' && threat !== 'CRITICAL') return;
    if (filterThreat === 'HIGH' && threat !== 'CRITICAL' && threat !== 'HIGH') return;
    if (filterThreat === 'ELEVATED' && threat !== 'CRITICAL' && threat !== 'HIGH' && threat !== 'ELEVATED') return;
    if (filterThreat === 'WILDFIRE' && isIndustrial) return;

    const frp = Math.max(5, anomaly.frp || anomaly.features?.frp || 20);
    // Extrusion height proportional to FRP (MW)
    const height = Math.max(5.0, Math.min(45.0, frp * 0.28));
    const radius = Math.max(0.65, Math.min(2.4, Math.sqrt(frp) * 0.16));
    const baseColor = getThreatColor(threat, anomaly.prediction?.class_label);

    const basePos = geoToScene(anomaly.latitude, anomaly.longitude, 0);

    // 1. Core Thermal Pillar Mesh (extending vertically upward)
    const coreGeo = new THREE.CylinderGeometry(radius * 0.6, radius, height, 16);
    const coreMat = new THREE.MeshStandardMaterial({
      color: baseColor,
      emissive: baseColor,
      emissiveIntensity: 0.85,
      roughness: 0.2,
      metalness: 0.5,
      transparent: true,
      opacity: 0.92,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    // Center of cylinder is at height / 2
    coreMesh.position.set(basePos.x, height / 2, basePos.z);
    coreMesh.castShadow = true;

    // Attach metadata for raycasting interaction
    coreMesh.userData = {
      anomalyId: anomaly.anomaly_id,
      anomaly: anomaly,
      isThermalPillar: true,
      baseColor: baseColor,
      height: height,
    };
    interactiveMeshes.push(coreMesh);
    metadataMap.set(anomaly.anomaly_id, {
      anomalyId: anomaly.anomaly_id,
      anomaly,
      baseColor,
      height,
      basePos,
    });
    group.add(coreMesh);

    // 2. Outer Thermal Aura (Conical Heat Plume with additive blending)
    const auraGeo = new THREE.ConeGeometry(radius * 1.8, height * 1.1, 16, 1, true);
    const auraMat = new THREE.MeshBasicMaterial({
      color: baseColor,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const auraMesh = new THREE.Mesh(auraGeo, auraMat);
    auraMesh.position.set(basePos.x, (height * 1.1) / 2, basePos.z);
    group.add(auraMesh);

    // 3. Ground Base Thermal Contact Pad (Pulsing ring on ground)
    const ringGeo = new THREE.RingGeometry(radius * 1.2, radius * 2.0, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: baseColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.set(basePos.x, 0.08, basePos.z);
    ringMesh.name = `pulse_ring_${anomaly.anomaly_id}`;
    group.add(ringMesh);

    // 4. Apex Beacon Star / Warning Cap
    const apexGeo = new THREE.OctahedronGeometry(radius * 0.7, 0);
    const apexMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
    });
    const apexMesh = new THREE.Mesh(apexGeo, apexMat);
    apexMesh.position.set(basePos.x, height + 0.5, basePos.z);
    apexMesh.name = `apex_${anomaly.anomaly_id}`;
    group.add(apexMesh);

    // 5. Vertical Sky Tracer Ray (Laser indicator towards satellite)
    const tracerGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(basePos.x, height, basePos.z),
      new THREE.Vector3(basePos.x, height + 18, basePos.z),
    ]);
    const tracerMat = new THREE.LineBasicMaterial({
      color: baseColor,
      transparent: true,
      opacity: 0.45,
    });
    const tracerLine = new THREE.Line(tracerGeo, tracerMat);
    group.add(tracerLine);
  });

  return { group, interactiveMeshes, metadataMap };
}

// Animate heat pillars and rings per frame
export function updateThermalPillarsAnimation(group: THREE.Group, time: number): void {
  group.children.forEach((child) => {
    // Pulse ground rings
    if (child.name.startsWith('pulse_ring_')) {
      const s = 1.0 + 0.25 * Math.sin(time * 3.5);
      child.scale.set(s, s, s);
    }
    // Rotate apex beacons
    if (child.name.startsWith('apex_')) {
      child.rotation.y = time * 2.0;
      child.rotation.x = time * 1.2;
    }
    // Subtle emissive breathing on core cylinders
    if ((child as THREE.Mesh).isMesh && child.userData && child.userData.isThermalPillar) {
      const mesh = child as THREE.Mesh;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (mat && mat.emissive) {
        mat.emissiveIntensity = 0.75 + 0.35 * Math.sin(time * 3.0 + child.position.x);
      }
    }
  });
}
