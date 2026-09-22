import * as THREE from 'three';
import { OSMCluster } from '../../types';

// Geospatial conversion constants for Indian Subcontinent
export const CENTER_LAT = 22.0;
export const CENTER_LON = 82.0;
export const SCALE = 4.5;

export function geoToScene(lat: number, lon: number, y: number = 0): THREE.Vector3 {
  const x = (lon - CENTER_LON) * SCALE;
  const z = -(lat - CENTER_LAT) * SCALE;
  return new THREE.Vector3(x, y, z);
}

// Approximate coastal and territorial outline of India for geospatial context
const INDIA_BORDER_COORDS: [number, number][] = [
  [35.5, 74.8], [34.5, 76.5], [32.5, 78.5], [30.5, 79.5], [28.5, 80.5],
  [27.5, 84.5], [27.0, 88.0], [27.5, 92.0], [28.0, 95.0], [27.0, 97.0],
  [24.5, 94.5], [23.5, 92.5], [22.0, 91.5], [22.0, 89.0], [21.5, 87.0],
  [19.5, 85.5], [17.5, 83.5], [15.5, 80.5], [13.0, 80.3], [10.0, 79.8],
  [8.1, 77.5],  [9.5, 76.5],  [11.5, 75.8], [13.0, 74.8], [15.5, 73.8],
  [18.8, 72.8], [21.0, 72.6], [22.3, 69.0], [23.5, 68.5], [24.5, 71.0],
  [27.0, 70.0], [30.0, 72.5], [32.5, 74.8], [35.5, 74.8]
];

export function createIndiaBaseplate(clusters: OSMCluster[]): THREE.Group {
  const group = new THREE.Group();
  group.name = "india_baseplate";

  // 1. Main tactical obsidian ground plane
  const planeGeo = new THREE.PlaneGeometry(240, 200, 48, 40);
  const planeMat = new THREE.MeshStandardMaterial({
    color: 0x070c14,
    roughness: 0.85,
    metalness: 0.25,
    side: THREE.DoubleSide
  });
  const plane = new THREE.Mesh(planeGeo, planeMat);
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = -0.05;
  plane.receiveShadow = true;
  group.add(plane);

  // 2. High-precision coordinate grid
  const gridHelper = new THREE.GridHelper(220, 44, 0x1e3a8a, 0x0f1d3a);
  gridHelper.position.y = 0.0;
  group.add(gridHelper);

  // 3. Latitude parallels and Longitude meridians with tactical markings
  const lineMat = new THREE.LineBasicMaterial({
    color: 0x1e40af,
    transparent: true,
    opacity: 0.35
  });

  // Longitude lines (68°E to 96°E)
  for (let lon = 68; lon <= 96; lon += 4) {
    const pStart = geoToScene(7.0, lon, 0.05);
    const pEnd = geoToScene(37.0, lon, 0.05);
    const geo = new THREE.BufferGeometry().setFromPoints([pStart, pEnd]);
    const line = new THREE.Line(geo, lineMat);
    group.add(line);
  }

  // Latitude lines (8°N to 36°N)
  for (let lat = 8; lat <= 36; lat += 4) {
    const pStart = geoToScene(lat, 67.0, 0.05);
    const pEnd = geoToScene(lat, 97.0, 0.05);
    const geo = new THREE.BufferGeometry().setFromPoints([pStart, pEnd]);
    const line = new THREE.Line(geo, lineMat);
    group.add(line);
  }

  // 4. Subcontinent geographic coastline contour
  const borderPoints: THREE.Vector3[] = INDIA_BORDER_COORDS.map(([lat, lon]) => 
    geoToScene(lat, lon, 0.1)
  );
  const borderGeo = new THREE.BufferGeometry().setFromPoints(borderPoints);
  const borderMat = new THREE.LineBasicMaterial({
    color: 0x38bdf8,
    linewidth: 2,
    transparent: true,
    opacity: 0.75
  });
  const borderLine = new THREE.LineLoop(borderGeo, borderMat);
  group.add(borderLine);

  // 5. Strategic Radar Circles (Centric around Nagpur geographic center ~21.1°N, 79.1°E)
  const centerPos = geoToScene(21.1458, 79.0882, 0.08);
  const radarRadii = [25, 50, 75, 100];
  radarRadii.forEach(r => {
    const ringGeo = new THREE.RingGeometry(r - 0.15, r, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.22
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.copy(centerPos);
    group.add(ring);
  });

  // 6. Industrial Cluster Base Anchors
  clusters.forEach(cluster => {
    const pos = geoToScene(cluster.center.lat, cluster.center.lon, 0.1);
    
    // Hexagonal tactical anchor pad
    const padGeo = new THREE.CircleGeometry(1.8, 6);
    const padMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.rotation.x = -Math.PI / 2;
    pad.position.copy(pos);
    group.add(pad);

    // Outline ring
    const ringGeo = new THREE.RingGeometry(1.75, 1.9, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.copy(pos);
    group.add(ring);
  });

  return group;
}
