import * as THREE from 'three';
import { OSMCluster } from '../../types';
import { geoToScene, SCALE } from './IndiaBaseplate';

export function createIndustrialPerimeters(clusters: OSMCluster[]): THREE.Group {
  const group = new THREE.Group();
  group.name = "industrial_perimeters";

  clusters.forEach(cluster => {
    const centerPos = geoToScene(cluster.center.lat, cluster.center.lon, 0);

    // Evacuation radius in meters converted to 3D scene units
    // Approx 1 deg lat = 111 km = 111,000m -> 1 unit in scene = 111,000 / SCALE = ~24,666m
    // To make 2km (2000m) visually prominent and tactically readable on the regional map:
    const evacMeters = cluster.jurisdiction.evacuation_radius_m || 2000;
    const perimeterRadius = Math.max(3.2, Math.min(8.5, (evacMeters / 1000) * 2.2));

    const isPetro = cluster.tags.industrial === 'petrochemical' || cluster.tags.man_made === 'refinery';
    const zoneColor = isPetro ? 0xf43f5e : 0x38bdf8; // Rose-Red for Petrochemical / BLEVE vs Sky Blue for general industrial

    // 1. Semi-transparent 3D Cylindrical Hazard Perimeter Wall (Cyber Wall)
    const wallHeight = 2.4;
    const wallGeo = new THREE.CylinderGeometry(perimeterRadius, perimeterRadius, wallHeight, 32, 1, true);
    const wallMat = new THREE.MeshBasicMaterial({
      color: zoneColor,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const wallMesh = new THREE.Mesh(wallGeo, wallMat);
    wallMesh.position.set(centerPos.x, wallHeight / 2, centerPos.z);
    wallMesh.name = `zone_wall_${cluster.cluster_id}`;
    group.add(wallMesh);

    // 2. Glowing Upper Rim Wire
    const rimGeo = new THREE.RingGeometry(perimeterRadius - 0.1, perimeterRadius + 0.1, 36);
    const rimMat = new THREE.MeshBasicMaterial({
      color: zoneColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.rotation.x = -Math.PI / 2;
    rimMesh.position.set(centerPos.x, wallHeight, centerPos.z);
    group.add(rimMesh);

    // 3. Ground Evacuation Perimeter Ring
    const groundRingGeo = new THREE.RingGeometry(perimeterRadius - 0.15, perimeterRadius, 36);
    const groundRingMat = new THREE.MeshBasicMaterial({
      color: zoneColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7
    });
    const groundRingMesh = new THREE.Mesh(groundRingGeo, groundRingMat);
    groundRingMesh.rotation.x = -Math.PI / 2;
    groundRingMesh.position.set(centerPos.x, 0.05, centerPos.z);
    group.add(groundRingMesh);

    // 4. Tactical Coordinate Bounds Box (if bounds available)
    if (cluster.bounds) {
      const p1 = geoToScene(cluster.bounds.min_lat, cluster.bounds.min_lon, 0.06);
      const p2 = geoToScene(cluster.bounds.min_lat, cluster.bounds.max_lon, 0.06);
      const p3 = geoToScene(cluster.bounds.max_lat, cluster.bounds.max_lon, 0.06);
      const p4 = geoToScene(cluster.bounds.max_lat, cluster.bounds.min_lon, 0.06);

      const boxGeo = new THREE.BufferGeometry().setFromPoints([p1, p2, p3, p4]);
      const boxMat = new THREE.LineBasicMaterial({
        color: zoneColor,
        transparent: true,
        opacity: 0.35
      });
      const boxLine = new THREE.LineLoop(boxGeo, boxMat);
      group.add(boxLine);
    }
  });

  return group;
}

export function updateIndustrialPerimetersAnimation(group: THREE.Group, time: number): void {
  group.children.forEach(child => {
    if (child.name.startsWith('zone_wall_')) {
      const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = 0.14 + 0.08 * Math.sin(time * 2.5);
      }
    }
  });
}
