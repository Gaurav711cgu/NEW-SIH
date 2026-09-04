import { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { 
  Target, Cpu, 
  Layers, 
  RotateCw, 
  Eye, 
  Zap, 
  Maximize2, 
  Crosshair, 
  IndianRupee,
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, YAxis } from 'recharts';
import MissionTerminal from '../components/MissionTerminal';

function warpGeometry(geometry: THREE.BufferGeometry, noiseScale: number) {
  const pos = geometry.attributes.position;
  if (!pos) return;
  for (let i = 0; i < pos.count; i++) {
    pos.setXYZ(
      i,
      pos.getX(i) + (Math.random() - 0.5) * noiseScale,
      pos.getY(i) + (Math.random() - 0.5) * noiseScale,
      pos.getZ(i) + (Math.random() - 0.5) * noiseScale
    );
  }
  geometry.computeVertexNormals();
}

type TierType = 'INDIGENOUS_PHYSICAL' | 'DL_VIRTUAL_REPLICATED' | 'MODULAR_UPGRADE';

interface SensorSpec {
  id: string;
  name: string;
  tier: TierType;
  hardwareBOM: string;
  componentCostINR: number;
  importedEquivalent: string;
  importedCostINR: number;
  position3D: [number, number, number];
  color: string;
  unit: string;
  baseVal: number;
  min: number;
  max: number;
  samplingRate: string;
  operatingRange: string;
  depthRating?: string;
  desc: string;
  indigenousAdvantage: string;
  status: 'ONLINE' | 'ACTIVE_REPLICATION' | 'PLUG_READY';
}

const SENSOR_SPECS: SensorSpec[] = [
  {
    id: 'temp',
    name: 'In-Situ Ocean Temperature Probe',
    tier: 'INDIGENOUS_PHYSICAL',
    hardwareBOM: 'DS18B20 Stainless Steel Waterproof Probe',
    componentCostINR: 80,
    importedEquivalent: 'Sea-Bird SBE 3plus Oceanographic Temp',
    importedCostINR: 150000,
    position3D: [2.5, -0.2, 0.4],
    color: '#00e5ff',
    unit: '°C',
    baseVal: 1.84,
    min: -55.0,
    max: 125.0,
    samplingRate: '2 Hz Live Hardware',
    operatingRange: '-1.8°C to +4.0°C (Antarctic Polar Validated)',
    desc: 'Low-cost commercial stainless steel temperature probe deployed directly on the outer intake shroud. Operates reliably at polar sea ice temperatures without foreign import dependency.',
    indigenousAdvantage: 'Cost: ₹80 vs Imported ₹1.5 Lakhs SBE 3plus (1,875x savings). 100% locally serviceable.',
    status: 'ONLINE'
  },
  {
    id: 'pressure',
    name: 'Hydrostatic Depth & Pressure Transducer',
    tier: 'INDIGENOUS_PHYSICAL',
    hardwareBOM: 'BMP280 Barometric / Hydrostatic Sensor Module',
    componentCostINR: 120,
    importedEquivalent: 'Keller Subsea High-Precision Pressure',
    importedCostINR: 280000,
    position3D: [1.8, -0.5, 0],
    color: '#38bdf8',
    unit: 'dbar',
    baseVal: 41.6,
    min: 0.0,
    max: 600.0,
    samplingRate: '10 Hz Continuous',
    operatingRange: '0 - 6,000 dbar pressure equivalent',
    desc: 'High-precision piezoresistive pressure transducer calibrated for subsea hydrostatic depth calculation via ocean water column density models.',
    indigenousAdvantage: 'Cost: ₹120 vs Imported ₹2.8 Lakhs. Direct I2C interface to ESP32 sensor bus.',
    status: 'ONLINE'
  },
  {
    id: 'imu',
    name: 'Subsea Attitude & Heading Reference (AHRS)',
    tier: 'INDIGENOUS_PHYSICAL',
    hardwareBOM: 'MPU6050 6-Axis Accelerometer + Gyroscope',
    componentCostINR: 150,
    importedEquivalent: 'Commercial Subsea MEMS AHRS Module',
    importedCostINR: 45000,
    position3D: [0.2, 0.1, 0],
    color: '#a855f7',
    unit: 'deg',
    baseVal: 1.2,
    min: -180.0,
    max: 180.0,
    samplingRate: '50 Hz IMU Stream',
    operatingRange: '±2g / ±250 deg/s Dynamic Range',
    desc: '6-axis MEMS inertial measurement unit providing real-time roll, pitch, and yaw stabilization vectors for the autopilot dead-reckoning filter.',
    indigenousAdvantage: 'Cost: ₹150 (MPU6050) vs Imported ₹45,000 commercial subsea AHRS module. 6-axis attitude estimation filtered on edge.',
    status: 'ONLINE'
  },
  {
    id: 'salinity_ai',
    name: 'In-Situ Practical Salinity (UNESCO EOS-80 / TEOS-10)',
    tier: 'DL_VIRTUAL_REPLICATED',
    hardwareBOM: 'TDS In-Situ Sensor (₹200) + UNESCO EOS-80 Seawater Formulation',
    componentCostINR: 200,
    importedEquivalent: 'Sea-Bird SBE 49 FastCAT CTD Sensor',
    importedCostINR: 1800000,
    position3D: [-0.6, 0.5, 0.35],
    color: '#10b981',
    unit: 'PSU',
    baseVal: 34.62,
    min: 30.0,
    max: 38.0,
    samplingRate: 'In-Situ Computed (Real-Time)',
    operatingRange: '33.5 to 36.5 Practical Salinity Units',
    desc: 'Real-time thermodynamic calculation combining in-situ electrical conductivity, temperature, and hydrostatic pressure using the international UNESCO EOS-80 standard.',
    indigenousAdvantage: 'Indigenous TDS and hydrostatic depth proxy delivering practical salinity estimation at student budget, backed by BGC-Argo historical profile ground truth.',
    status: 'ONLINE'
  },
  {
    id: 'doxy_ai',
    name: 'Dissolved Oxygen Marine Telemetry (Garcia-Gordon Model)',
    tier: 'DL_VIRTUAL_REPLICATED',
    hardwareBOM: 'Garcia & Gordon Seawater O2 Solubility In-Situ Model',
    componentCostINR: 0,
    importedEquivalent: 'Aanderaa Optode 4330 Dissolved Oxygen',
    importedCostINR: 900000,
    position3D: [-0.6, -0.5, -0.35],
    color: '#f59e0b',
    unit: 'µmol/kg',
    baseVal: 218.5,
    min: 100.0,
    max: 320.0,
    samplingRate: 'In-Situ Computed (Real-Time)',
    operatingRange: '140 to 290 µmol/kg Dissolved Oxygen',
    desc: 'Physics-based solubility model deriving subsea dissolved oxygen concentrations from water density gradients, in-situ temperature, and depth.',
    indigenousAdvantage: 'Zero hardware sensor cost. Avoids biofouling optical drift of imported sensors.',
    status: 'ONLINE'
  },
  {
    id: 'chla_ai',
    name: 'Chlorophyll-a Bio-Optical Biomass (Morel Model)',
    tier: 'DL_VIRTUAL_REPLICATED',
    hardwareBOM: 'Morel & Maritorena Downwelling Irradiance Spectral Model',
    componentCostINR: 0,
    importedEquivalent: 'WET Labs ECO-AFL Fluorometer Sensor',
    importedCostINR: 1200000,
    position3D: [0.8, -0.4, 0],
    color: '#eab308',
    unit: 'mg/m³',
    baseVal: 0.84,
    min: 0.01,
    max: 3.5,
    samplingRate: 'In-Situ Computed (Real-Time)',
    operatingRange: '0.05 to 3.5 mg/m³ Phytoplankton Biomass',
    desc: 'Computes euphotic zone phytoplankton biomass and biological productivity using solar attenuation curves and depth-temperature profiles.',
    indigenousAdvantage: 'Eliminates ₹12 Lakh optical fluorometer that degrades in remote Antarctic waters.',
    status: 'ONLINE'
  },
  {
    id: 'ph_sensor',
    name: 'Subsea Seawater Acidity (pH) Probe',
    tier: 'INDIGENOUS_PHYSICAL',
    hardwareBOM: 'SEN0161 Subsea Glass Electrode pH Module',
    componentCostINR: 350,
    importedEquivalent: 'Honeywell Durafet Subsea ISFET pH Sensor',
    importedCostINR: 380000,
    position3D: [1.2, -0.4, -0.3],
    color: '#14b8a6',
    unit: 'pH',
    baseVal: 8.06,
    min: 6.5,
    max: 9.0,
    samplingRate: '1 Hz Continuous',
    operatingRange: '7.60 to 8.25 pH Units (Ocean Acidification)',
    desc: 'Low-cost commercial glass electrode analog pH probe calibrated for ocean carbon sink monitoring and ocean acidification tracking.',
    indigenousAdvantage: 'Cost: ₹350 vs Imported ₹3.8 Lakhs (1,080x savings). Directly interfaced to ADC.',
    status: 'ONLINE'
  },
  {
    id: 'tds_cond',
    name: 'Analog TDS / Conductivity Proxy Cell',
    tier: 'INDIGENOUS_PHYSICAL',
    hardwareBOM: 'Gravity Analog TDS / Electrical Conductivity Probe',
    componentCostINR: 200,
    importedEquivalent: 'Aanderaa 4319 Subsea Conductivity Cell',
    importedCostINR: 620000,
    position3D: [0.9, -0.4, 0.3],
    color: '#06b6d4',
    unit: 'ppm',
    baseVal: 540,
    min: 0,
    max: 1000,
    samplingRate: '5 Hz Continuous',
    operatingRange: '0 - 1000 ppm (Conductivity Proxy)',
    desc: 'Analog electrical conductivity probe providing the base ionic density proxy feed used by the UNESCO EOS-80 Salinity model.',
    indigenousAdvantage: 'Cost: ₹200 vs Imported ₹6.2 Lakhs. Feeds the deep learning virtual sensor model.',
    status: 'ONLINE'
  },
  {
    id: 'usbl_beacon',
    name: 'Modular Micro-USBL Acoustic Transponder (Post-Selection)',
    tier: 'MODULAR_UPGRADE',
    hardwareBOM: 'Domestic Micro-USBL Acoustic Transponder (NIOT Architecture)',
    componentCostINR: 95000,
    importedEquivalent: 'Sonardyne Micro-USBL Underwater Positioning',
    importedCostINR: 3500000,
    position3D: [0, 1.1, 0],
    color: '#8b5cf6',
    unit: 'ms ping',
    baseVal: 12.4,
    min: 5.0,
    max: 50.0,
    samplingRate: '1 ping / 2 sec',
    operatingRange: 'Up to 2,000m Slant Acoustic Range',
    depthRating: '1,000m Rated Pressure Housing',
    desc: 'Acoustic positioning transponder communicating with mother ship surface hydrophone array to compute real-time subsea lat/lon fixes.',
    indigenousAdvantage: 'Cost ₹95,000 vs ₹35.0 Lakhs foreign USBL. Eliminates ITAR export-control dependencies.',
    status: 'PLUG_READY'
  },
  {
    id: 'orin_nx_pod',
    name: 'Modular NVIDIA Orin NX Deep Subsea AI Pod (Post-Selection)',
    tier: 'MODULAR_UPGRADE',
    hardwareBOM: 'NVIDIA Jetson Orin NX (20W SOM) in 6061-T6 Pressure Hull (Post-Selection Upgrade)',
    componentCostINR: 48000,
    importedEquivalent: 'Kongsberg Subsea High-Performance Compute Rack',
    importedCostINR: 2800000,
    position3D: [-0.4, 0, 0],
    color: '#10b981',
    unit: 'TOPS AI',
    baseVal: 100,
    min: 20,
    max: 100,
    samplingRate: 'Edge ONNX Runtime',
    operatingRange: '100 TOPS AI Compute @ 20 Watts',
    depthRating: 'Hard-anodized internal dry electronics pod',
    desc: 'Post-selection hardware upgrade target for high-throughput multi-swath sonar inference. Qualification prototype utilizes Raspberry Pi 4 (4GB) edge node with ESP32 sensor hub.',
    indigenousAdvantage: 'Post-selection upgrade target vs ₹28.0 Lakhs imported computing rack. Lab prototype runs on ₹4,500 Raspberry Pi 4.',
    status: 'PLUG_READY'
  },
  {
    id: 'sss_payload',
    name: 'Modular SSS Compact Sonar Bay (Post-Selection)',
    tier: 'MODULAR_UPGRADE',
    hardwareBOM: 'Indigenous Ping360 / Blueprint Subsea Oculus Bay',
    componentCostINR: 150000,
    importedEquivalent: 'EdgeTech 2205 SSS Deep Towed System',
    importedCostINR: 4500000,
    position3D: [0, -0.65, 0.45],
    color: '#ec4899',
    unit: 'kHz',
    baseVal: 450,
    min: 450,
    max: 900,
    samplingRate: '32 pings/sec',
    operatingRange: '50m to 150m Total Swath Coverage',
    depthRating: 'Modular Mounting Bracket (Plug-and-Play)',
    desc: 'Dedicated payload bay engineered into the AUV belly for rapid post-selection procurement of compact high-frequency sonar transducers.',
    indigenousAdvantage: 'Cost ₹1.5 Lakhs vs ₹45 Lakhs imported tow-fish. Runs our edge YOLOv8s acoustic detection pipeline natively.',
    status: 'PLUG_READY'
  },
  {
    id: 'satcom_payload',
    name: 'Modular Satellite Burst Modem (Post-Selection)',
    tier: 'MODULAR_UPGRADE',
    hardwareBOM: 'RockBLOCK 9603 Iridium SBD Transceiver',
    componentCostINR: 25000,
    importedEquivalent: 'Military-Grade Deep Ocean Satcom Buoy',
    importedCostINR: 850000,
    position3D: [0.6, 1.15, 0],
    color: '#6366f1',
    unit: 'Bytes/Burst',
    baseVal: 340,
    min: 50,
    max: 1000,
    samplingRate: '1 burst / surface cycle',
    operatingRange: 'Global Iridium Constellation L-Band',
    depthRating: 'Pressure-tight dome (200m rating)',
    desc: 'Low-cost satellite Short Burst Data transceiver for uploading compressed AI detection logs and GPS geotags to the Ministry dashboard.',
    indigenousAdvantage: 'Cost ₹25,000 vs ₹8.5 Lakhs foreign buoy. Uses standard ₹1,200/month MoES datalink.',
    status: 'PLUG_READY'
  }
];

export default function AUVTwin() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedSensor, setSelectedSensor] = useState<SensorSpec>(SENSOR_SPECS[0]);
  const [selectedTier, setSelectedTier] = useState<TierType | 'ALL'>('ALL');
  const [xrayMode, setXrayMode] = useState<boolean>(false);
  const [wireframeMode, setWireframeMode] = useState<boolean>(false);
  const [beamVisible, setBeamVisible] = useState<boolean>(true);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const autoRotateRef = useRef(true);
  const [viewPreset, setViewPreset] = useState<'ISO' | 'BOW' | 'BELLY' | 'STERN' | 'TOP' | 'POV'>('ISO');
  const viewPresetRef = useRef(viewPreset);
  const sonarPingsRef = useRef<THREE.Mesh[]>([]);
  const [detectionEvent, setDetectionEvent] = useState<any>(null);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '[SYSTEM] AUV Edge Node Online', 
    '[SONAR] 900kHz Transducer Active',
    '[AI] YOLOv8 TensorRT Engine Loaded'
  ]);

  useEffect(() => {
    const handleSetHud = (e: any) => {
      const d = e.detail;
      if (!d.active) {
         setDetectionEvent(null);
         return;
      }
      setDetectionEvent(d);
      
      const newLogs = [
        `> Sonar shadow extracted at Z=${(Math.random()*15).toFixed(1)}m`,
        `> [AI] Applying CLAHE enhancement...`,
        `> [AI] Inference -> Class: ${d.type}`,
        `> [AI] Confidence Score: ${d.confidence}%`,
        d.isRock
          ? `> [AI] FILTERED: Organic structure ignored`
          : d.isUnknown 
            ? `> [DB] AMBIGUOUS: Tagged for HUMAN_VERIFICATION` 
            : `> [DB] CRITICAL: Saved to local SQLite`
      ];
      
      setTerminalLogs(prev => {
        const combined = [...prev, ...newLogs];
        return combined.slice(combined.length - 8);
      });
    };
    window.addEventListener('SET_HUD', handleSetHud);
    return () => window.removeEventListener('SET_HUD', handleSetHud);
  }, []);
  
  const [liveMetric, setLiveMetric] = useState<number>(selectedSensor.baseVal);
  const [sparklineData, setSparklineData] = useState<{ i: number; v: number }[]>(() =>
    Array.from({ length: 18 }).map((_, i) => ({
      i,
      v: parseFloat((selectedSensor.baseVal + (Math.sin(i) * (selectedSensor.baseVal * 0.04))).toFixed(2))
    }))
  );
  const [prevSensorId, setPrevSensorId] = useState(selectedSensor.id);

  if (selectedSensor.id !== prevSensorId) {
    setPrevSensorId(selectedSensor.id);
    setLiveMetric(selectedSensor.baseVal);
    setSparklineData(Array.from({ length: 18 }).map((_, i) => ({
      i,
      v: parseFloat((selectedSensor.baseVal + (Math.sin(i) * (selectedSensor.baseVal * 0.04))).toFixed(2))
    })));
  }

  // 3D Scene Refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const cameraPivotRef = useRef<THREE.Group | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const auvGroupRef = useRef<THREE.Group | null>(null);
  const propellerRef = useRef<THREE.Mesh | null>(null);
  const beamGroupRef = useRef<THREE.Group | null>(null);
  const hullMaterialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const internalComponentsRef = useRef<THREE.Group | null>(null);
  
  const hotspotMeshesRef = useRef<THREE.Mesh[]>([]);
  const envGroupRef = useRef<THREE.Group | null>(null);
  const gridRef = useRef<THREE.GridHelper | null>(null);
  const debrisRef = useRef<THREE.Mesh[]>([]);
  const rockRef = useRef<THREE.Mesh[]>([]);


  // Telemetry stream generator (deterministic visualization)
  useEffect(() => {
    const timer = setInterval(() => {
      const t = Date.now() / 2000;
      const jitter = Math.sin(t) * (selectedSensor.baseVal * 0.03);
      const nextVal = parseFloat((selectedSensor.baseVal + jitter).toFixed(selectedSensor.unit === 'PSU' ? 2 : 1));
      setLiveMetric(nextVal);
      setSparklineData(prev => [...prev.slice(1), { i: Date.now(), v: nextVal }]);
    }, 1500);

    return () => clearInterval(timer);
  }, [selectedSensor]);

  // ── THREE.JS 3D ENGINE INITIALIZATION ──
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.045);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(5.5, 2.5, 6.0);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;
    
    const cameraPivot = new THREE.Group();
    cameraPivot.add(camera);
    scene.add(cameraPivot);
    cameraPivotRef.current = cameraPivot;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0x94a3b8, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(8, 12, 8);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.6);
    fillLight.position.set(-6, 4, 6);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x00e5ff, 3.2);
    rimLight.position.set(-8, -4, -8);
    scene.add(rimLight);

    // Seafloor grid
    const gridHelper = new THREE.GridHelper(24, 24, 0x00e5ff, 0x334155);
    gridHelper.position.y = -2.2;
    gridHelper.material.opacity = 0.35;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Build the AUV Model
    const auvGroup = new THREE.Group();
    auvGroupRef.current = auvGroup;

    // ── Primary High-Visibility Expedition Yellow Hull Material ──
    const hullMat = new THREE.MeshPhysicalMaterial({
      color: 0xfacc15, // Bright Subsea Research Yellow
      emissive: 0x452a00,
      emissiveIntensity: 0.15,
      metalness: 0.25,
      roughness: 0.2,
      clearcoat: 0.9,
      clearcoatRoughness: 0.1,
      transmission: 0.0,
      opacity: 1.0,
      transparent: true,
      wireframe: false
    });
    hullMaterialRef.current = hullMat;

    // Contrasting Carbon-Titanium Trim Material for Nose, Sail & Fins
    const carbonTrimMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.3
    });

    // Main Torpedo Cylinder (High-Vis Yellow)
    const fuselageGeo = new THREE.CylinderGeometry(0.7, 0.7, 4.2, 32);
    fuselageGeo.rotateZ(Math.PI / 2);
    const fuselage = new THREE.Mesh(fuselageGeo, hullMat);
    fuselage.castShadow = true;
    fuselage.receiveShadow = true;
    auvGroup.add(fuselage);

    // Nose Parabolic Dome (High-Vis Yellow with Carbon Front Trim)
    const noseGeo = new THREE.SphereGeometry(0.7, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    noseGeo.rotateZ(-Math.PI / 2);
    noseGeo.translate(2.1, 0, 0);
    const nose = new THREE.Mesh(noseGeo, hullMat);
    auvGroup.add(nose);

    // Nose Ring Trim
    const noseRingGeo = new THREE.TorusGeometry(0.71, 0.04, 16, 32);
    noseRingGeo.rotateY(Math.PI / 2);
    noseRingGeo.translate(2.08, 0, 0);
    const noseRing = new THREE.Mesh(noseRingGeo, carbonTrimMat);
    auvGroup.add(noseRing);

    // Camera Window Optical Dome
    const opticalGlassGeo = new THREE.SphereGeometry(0.35, 24, 12);
    const opticalGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x00e5ff,
      metalness: 0.1,
      roughness: 0.05,
      transmission: 0.9,
      thickness: 0.5,
      transparent: true,
      opacity: 0.85
    });
    const opticalWindow = new THREE.Mesh(opticalGlassGeo, opticalGlassMat);
    opticalWindow.position.set(2.65, 0.1, 0);
    auvGroup.add(opticalWindow);

    // Conical Tailcone (Contrasting Carbon Slate)
    const tailGeo = new THREE.ConeGeometry(0.7, 1.4, 32);
    tailGeo.rotateZ(Math.PI / 2);
    tailGeo.translate(-2.8, 0, 0);
    const tailcone = new THREE.Mesh(tailGeo, carbonTrimMat);
    auvGroup.add(tailcone);

    // Conning Sail (Dorsal Mast - High-Vis Yellow with Slate Top)
    const sailGeo = new THREE.BoxGeometry(1.2, 0.6, 0.35);
    const sail = new THREE.Mesh(sailGeo, hullMat);
    sail.position.set(0.4, 0.85, 0);
    auvGroup.add(sail);

    // Sail Cap Trim
    const sailCapGeo = new THREE.BoxGeometry(1.24, 0.08, 0.37);
    const sailCap = new THREE.Mesh(sailCapGeo, carbonTrimMat);
    sailCap.position.set(0.4, 1.15, 0);
    auvGroup.add(sailCap);

    // Top USBL Antenna Mast
    const mastGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.5, 12);
    const mastMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, metalness: 0.9, roughness: 0.1, emissive: 0x3b0764, emissiveIntensity: 0.4 });
    const mast = new THREE.Mesh(mastGeo, mastMat);
    mast.position.set(0.6, 1.42, 0);
    auvGroup.add(mast);

    // 4 X-Rudder Stabilizing Fins (Carbon Slate with Yellow Tips)
    const finShape = new THREE.BoxGeometry(0.06, 0.9, 0.45);
    const finAngles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
    finAngles.forEach(angle => {
      const fin = new THREE.Mesh(finShape, carbonTrimMat);
      fin.position.set(-2.5, 0, 0);
      fin.rotation.x = angle;
      fin.translateY(0.65);
      auvGroup.add(fin);
    });

    // Rear 7-Blade Scimitar Propeller
    const propHubGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.3, 16);
    propHubGeo.rotateZ(Math.PI / 2);
    const propHubMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.9, roughness: 0.2 });
    const propHub = new THREE.Mesh(propHubGeo, propHubMat);
    propHub.position.set(-3.55, 0, 0);

    const bladeGeo = new THREE.BoxGeometry(0.03, 0.45, 0.12);
    for (let b = 0; b < 7; b++) {
      const blade = new THREE.Mesh(bladeGeo, propHubMat);
      blade.rotation.x = (b * Math.PI * 2) / 7;
      blade.translateY(0.24);
      propHub.add(blade);
    }
    propellerRef.current = propHub;
    auvGroup.add(propHub);

    // Side-Scan Sonar Port/Starboard Transducer Pods
    const sssPodGeo = new THREE.BoxGeometry(1.6, 0.16, 0.22);
    const sssPodMat = new THREE.MeshStandardMaterial({ color: 0x00e5ff, metalness: 0.8, roughness: 0.2, emissive: 0x0088aa, emissiveIntensity: 0.6 });
    const sssPodRight = new THREE.Mesh(sssPodGeo, sssPodMat);
    sssPodRight.position.set(0, -0.65, 0.45);
    auvGroup.add(sssPodRight);

    const sssPodLeft = new THREE.Mesh(sssPodGeo, sssPodMat);
    sssPodLeft.position.set(0, -0.65, -0.45);
    auvGroup.add(sssPodLeft);

    // Internal components for X-ray
    const internalGroup = new THREE.Group();
    internalComponentsRef.current = internalGroup;
    const rpiBoardMat = new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.5, roughness: 0.5 });
    const rpiBoard = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.5), rpiBoardMat);
    rpiBoard.position.set(0.8, 0, 0);
    internalGroup.add(rpiBoard);

    const esp32Mat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.5, roughness: 0.5 });
    const esp32 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.3), esp32Mat);
    esp32.position.set(-0.2, 0, 0);
    internalGroup.add(esp32);

    internalGroup.visible = false;
    auvGroup.add(internalGroup);

    // Acoustic Sonar Beams
    const beamGroup = new THREE.Group();
    beamGroupRef.current = beamGroup;
    const beamGeo = new THREE.ConeGeometry(2.4, 2.0, 16, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const starboardBeam = new THREE.Mesh(beamGeo, beamMat);
    starboardBeam.position.set(0, -1.6, 1.2);
    starboardBeam.rotation.x = Math.PI / 6;
    beamGroup.add(starboardBeam);

    const portBeam = new THREE.Mesh(beamGeo, beamMat);
    portBeam.position.set(0, -1.6, -1.2);
    portBeam.rotation.x = -Math.PI / 6;
    beamGroup.add(portBeam);
    auvGroup.add(beamGroup);

    // 3D Hotspot Nodes
    const hotspotMeshes: THREE.Mesh[] = [];
    SENSOR_SPECS.forEach(spec => {
      const pinGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const pinMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(spec.color),
        emissive: new THREE.Color(spec.color),
        emissiveIntensity: 0.9,
        roughness: 0.2
      });
      const pin = new THREE.Mesh(pinGeo, pinMat);
      pin.position.set(...spec.position3D);
      pin.userData = { sensorId: spec.id };

      const ringGeo = new THREE.RingGeometry(0.18, 0.23, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(spec.color),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.lookAt(camera.position);
      pin.add(ring);

      auvGroup.add(pin);
      hotspotMeshes.push(pin);
    });
    hotspotMeshesRef.current = hotspotMeshes;

    scene.add(auvGroup);

    // ── POV ENVIRONMENT SCENE ──
    const envGroup = new THREE.Group();
    envGroupRef.current = envGroup;
    
    // Infinite scrolling seabed grid
    const grid = new THREE.GridHelper(80, 80, 0x00e5ff, 0x0f172a);
    grid.position.y = -3.5;
    envGroup.add(grid);
    gridRef.current = grid;

    // ── HIGH FIDELITY DEBRIS SCATTER ──
    const debrisArray: THREE.Mesh[] = [];
    for(let i=0; i<12; i++) {
        // Randomly choose between a sunken tire (Torus) or a metal pipe/barrel (Cylinder)
        const rand = Math.random();
        let geo, typeStr, matColor, matMetal, matRough;
        
        if (rand > 0.6) {
            geo = new THREE.TorusGeometry(0.5, 0.2, 16, 32);
            typeStr = 'GHOST_NET_TIRE'; matColor = 0x1f2937; matMetal = 0.1; matRough = 0.9;
        } else if (rand > 0.2) {
            geo = new THREE.CylinderGeometry(0.3, 0.3, 1.5, 16, 4);
            typeStr = 'UXO_PIPE'; matColor = 0x94a3b8; matMetal = 0.8; matRough = 0.4;
        } else {
            geo = new THREE.TetrahedronGeometry(0.6);
            typeStr = 'UNKNOWN_ANOMALY'; matColor = 0x5c5c5c; matMetal = 0.3; matRough = 0.7;
        }
        
        warpGeometry(geo, 0.1);
        const mat = new THREE.MeshStandardMaterial({ color: matColor, metalness: matMetal, roughness: matRough });
        const d = new THREE.Mesh(geo, mat);
        d.userData = { type: typeStr, originalColor: matColor };
        envGroup.add(d);
        debrisArray.push(d);
    }
    debrisRef.current = debrisArray;
    
    // ── ROCKS / NATURAL SEABED FEATURES (AI SHOULD IGNORE THESE) ──
    const rockArray: THREE.Mesh[] = [];
    for(let i=0; i<40; i++) {
        const size = Math.random() * 1.5 + 0.5;
        const rockGeo = new THREE.IcosahedronGeometry(size, 1);
        warpGeometry(rockGeo, 0.3); // Warp heavily to look organic
        const rockMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 1.0, metalness: 0.0 });
        const rock = new THREE.Mesh(rockGeo, rockMat);
        rock.position.set(Math.random() * 100 - 20, -3.5 + size/2, (Math.random() - 0.5) * 60);
        rock.userData = { type: 'NATURAL_ROCK_FORMATION', originalColor: 0x1e293b, detected: false };
        envGroup.add(rock);
        rockArray.push(rock);
    }
    rockRef.current = rockArray;

    // ── SONAR PING RINGS ──
    const pingGeo = new THREE.RingGeometry(0.1, 0.15, 32);
    const pingMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
    const pings: THREE.Mesh[] = [new THREE.Mesh(pingGeo, pingMat), new THREE.Mesh(pingGeo, pingMat)];
    pings[0].rotation.x = Math.PI / 2; pings[0].position.set(0, -1.6, 0); // Port ping
    pings[1].rotation.x = Math.PI / 2; pings[1].position.set(0, -1.6, 0); // Starboard ping
    envGroup.add(pings[0]); envGroup.add(pings[1]);
    sonarPingsRef.current = pings;
    scene.add(envGroup);

    // Controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging || !cameraPivotRef.current) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      
      // Orbit the camera instead of spinning the submarine!
      cameraPivotRef.current.rotation.y -= deltaX * 0.005;
      cameraPivotRef.current.rotation.x -= deltaY * 0.005;
      
      // Clamp vertical rotation so we don't flip upside down
      cameraPivotRef.current.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, cameraPivotRef.current.rotation.x));
    };

    const onPointerUp = () => { isDragging = false; };
    const onWheel = (e: WheelEvent) => {
      if (!cameraRef.current) return;
      e.preventDefault();
      // Translate camera along its local Z axis for zooming
      cameraRef.current.translateZ(e.deltaY * 0.005);
      
      // Clamp distance from origin
      const dist = cameraRef.current.position.length();
      if (dist < 2.0) {
          cameraRef.current.position.setLength(2.0);
      } else if (dist > 15.0) {
          cameraRef.current.position.setLength(15.0);
      }
    };

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      if (!cameraRef.current) return;
      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObjects(hotspotMeshesRef.current);
      if (intersects.length > 0) {
        const hitId = intersects[0].object.userData.sensorId;
        const matched = SENSOR_SPECS.find(s => s.id === hitId);
        if (matched) setSelectedSensor(matched);
      }
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('click', onClick);

    const onResize = () => {
      if (!container || !cameraRef.current || !rendererRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (propellerRef.current) propellerRef.current.rotation.x += 0.1;
      if (autoRotateRef.current && auvGroupRef.current && !isDragging && viewPresetRef.current !== 'POV') auvGroupRef.current.rotation.y += 0.004;

      hotspotMeshesRef.current.forEach((mesh, idx) => {
        mesh.rotation.y += 0.02;
        mesh.rotation.x += 0.01;
        const scale = 1 + Math.sin(Date.now() * 0.003 + idx) * 0.2;
        mesh.scale.set(scale, scale, scale);
      });
      
      if (viewPresetRef.current === 'POV') {
          if (envGroupRef.current) envGroupRef.current.position.x = 0;
          if (gridRef.current) {
              gridRef.current.position.x -= 0.06;
              if (gridRef.current.position.x < -1) gridRef.current.position.x += 1;
          }
          
          const checkDetection = (d: THREE.Mesh) => {
              if (d.position.x < 1.0 && d.position.x > -1.0) {
                  if (!d.userData.detected) {
                      d.userData.detected = true;
                      const isUnknown = d.userData.type === 'UNKNOWN_ANOMALY';
                      const isRock = d.userData.type === 'NATURAL_ROCK_FORMATION';
                      
                      if (isRock) {
                          (d.material as THREE.MeshStandardMaterial).color.setHex(0x38bdf8);
                          (d.material as THREE.MeshStandardMaterial).emissive.setHex(0x0284c7);
                      } else {
                          (d.material as THREE.MeshStandardMaterial).color.setHex(isUnknown ? 0xffaa00 : 0xff0044);
                          (d.material as THREE.MeshStandardMaterial).emissive.setHex(isUnknown ? 0xaa5500 : 0xaa0000);
                      }
                      (d.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.8;
                      
                      if (internalComponentsRef.current) {
                          const piNode = internalComponentsRef.current.children[0] as THREE.Mesh;
                          if (piNode) {
                             (piNode.material as THREE.MeshStandardMaterial).emissive.setHex(0x00ff00);
                             (piNode.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.0;
                             setTimeout(() => {
                                 if (piNode) (piNode.material as THREE.MeshStandardMaterial).emissive.setHex(0x000000);
                             }, 500);
                          }
                      }
                      
                      const conf = isUnknown ? Math.floor(Math.random() * 15 + 40) : isRock ? Math.floor(Math.random() * 10 + 85) : Math.floor(Math.random() * 10 + 85);
                      const yOff = Math.floor(Math.random() * 60 + 20);
                      const xOff = d.position.z > 0 ? Math.floor(Math.random() * 20 + 60) : Math.floor(Math.random() * 20 + 10);

                      window.dispatchEvent(new CustomEvent('SET_HUD', { 
                          detail: { active: true, type: d.userData.type, confidence: conf, isUnknown, isRock, yOff, xOff }
                      }));
                      
                      setTimeout(() => window.dispatchEvent(new CustomEvent('SET_HUD', { detail: { active: false } })), 3500);
                  }
              } else if (d.position.x > 1.0) {
                  d.userData.detected = false;
                  (d.material as THREE.MeshStandardMaterial).color.setHex(d.userData.originalColor);
                  (d.material as THREE.MeshStandardMaterial).emissive.setHex(0x000000);
              }
          };

          if (debrisRef.current) {
              debrisRef.current.forEach(d => {
                  d.position.x -= 0.06;
                  if (d.position.x < -5) {
                      d.position.x = 30 + Math.random() * 20;
                      d.position.z = (Math.random() - 0.5) * 30;
                      (d.material as THREE.MeshStandardMaterial).color.setHex(d.userData.originalColor);
                      (d.material as THREE.MeshStandardMaterial).emissive.setHex(0x000000);
                      d.userData.detected = false;
                  }
                  checkDetection(d);
              });
          }

          if (rockRef.current) {
              rockRef.current.forEach(r => {
                  r.position.x -= 0.06;
                  if (r.position.x < -20) {
                      r.position.x = 80 + Math.random() * 20;
                      r.position.z = (Math.random() - 0.5) * 60;
                      (r.material as THREE.MeshStandardMaterial).color.setHex(r.userData.originalColor);
                      (r.material as THREE.MeshStandardMaterial).emissive.setHex(0x000000);
                      r.userData.detected = false;
                  }
                  checkDetection(r);
              });
          }
          
          const pings = sonarPingsRef.current;
          if (pings && pings.length) {
              pings.forEach((p: THREE.Mesh, i: number) => {
                  p.scale.x += 0.15; p.scale.y += 0.15;
                  p.position.z = i === 0 ? p.scale.x * 0.5 : -p.scale.x * 0.5;
                  (p.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.9 - p.scale.x * 0.03);
                  if (p.scale.x > 22) {
                      p.scale.set(1,1,1);
                      p.position.set(0, -1.6, 0);
                      (p.material as THREE.MeshBasicMaterial).opacity = 0.9;
                  }
              });
          }
      }

      rendererRef.current?.render(sceneRef.current!, cameraRef.current!);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('click', onClick);
      window.removeEventListener('resize', onResize);
      if (rendererRef.current?.domElement) container.removeChild(rendererRef.current.domElement);
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (!hullMaterialRef.current || !internalComponentsRef.current || !beamGroupRef.current) return;
    if (xrayMode) {
      hullMaterialRef.current.transmission = 0.85;
      hullMaterialRef.current.opacity = 0.25;
      internalComponentsRef.current.visible = true;
    } else {
      hullMaterialRef.current.transmission = 0.0;
      hullMaterialRef.current.opacity = 1.0;
      internalComponentsRef.current.visible = false;
    }
    hullMaterialRef.current.wireframe = wireframeMode;
    beamGroupRef.current.visible = beamVisible;
  }, [xrayMode, wireframeMode, beamVisible]);

  const handleSetPreset = (preset: 'ISO' | 'BOW' | 'BELLY' | 'STERN' | 'TOP' | 'POV') => {
    setViewPreset(preset);
    viewPresetRef.current = preset;
    if (!cameraRef.current || !cameraPivotRef.current) return;
    
    // Reset pivot rotation so the preset angle is absolute
    cameraPivotRef.current.rotation.set(0, 0, 0);
    // Ensure AUV isn't spun around
    if (auvGroupRef.current) auvGroupRef.current.rotation.set(0, 0, 0);
    switch (preset) {
      case 'ISO': cameraRef.current.position.set(5.5, 2.5, 6.0); break;
      case 'BOW': cameraRef.current.position.set(6.2, 0.4, 0.0); break;
      case 'BELLY': cameraRef.current.position.set(0.0, -5.2, 4.5); break;
      case 'STERN': cameraRef.current.position.set(-6.5, 1.2, 0.0); break;
      case 'TOP': cameraRef.current.position.set(0.0, 7.5, 0.0); break;
      case 'POV': cameraRef.current.position.set(3.0, 0.0, 0.0); break;
    }
    if (preset === 'POV') {
      cameraRef.current.lookAt(15, -4, 0); // True First-Person looking down at the sonar swath
    } else {
      cameraRef.current.lookAt(0, 0, 0);
    }
  };

  const filteredSensors = useMemo(() => {
    if (selectedTier === 'ALL') return SENSOR_SPECS;
    return SENSOR_SPECS.filter(s => s.tier === selectedTier);
  }, [selectedTier]);

  return (
    <div className="h-full p-4 md:p-6 overflow-y-auto flex flex-col gap-5 text-steel-100 bg-transparent selection:bg-ice-500/30">
      
      {/* ── TOP HEADER & STRATEGIC COST DEFENSE BANNER ── */}
      <div className="bg-abyss-900/90 border border-steel-800/80 rounded-lg p-4 shadow-md backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-zinc-900/50 border border-white/10 flex items-center justify-center text-emerald-400">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-mono font-bold text-sm text-ice-100 tracking-wider">
                INDIGENOUS LOW-COST AUV ARCHITECTURE & 3D TWIN
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900/50 text-emerald-300 border border-white/10 font-bold">
                MAKE IN INDIA ROADMAP
              </span>
            </div>
            <p className="text-xs font-mono text-steel-400 mt-0.5">
              LAB PROTOTYPE: <span className="text-emerald-300 font-semibold">₹6,100</span> · TARGET AT SCALE: <span className="text-ice-300 font-semibold">₹75,000 – ₹1.0 LAKH</span> · IMPORTED FLOAT BENCHMARK: <span className="text-red-300 font-semibold">₹25–30 LAKHS</span>
            </p>
          </div>
        </div>

        {/* Global Architecture Summary with Grounded Metrics */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          <div className="bg-abyss-950 px-3 py-1.5 rounded-lg border border-steel-800">
            <span className="text-steel-500 mr-2">DEMO PROTOTYPE:</span>
            <span className="text-emerald-400 font-bold">₹6,100 BOM</span>
          </div>
          <div className="bg-abyss-950 px-3 py-1.5 rounded-lg border border-steel-800">
            <span className="text-steel-500 mr-2">TARGET AT SCALE:</span>
            <span className="text-ice-400 font-bold">₹75,000 – ₹1.0 L</span>
          </div>
          <div className="bg-abyss-950 px-3 py-1.5 rounded-lg border border-steel-800">
            <span className="text-steel-500 mr-2">REALISTIC SAVINGS:</span>
            <span className="text-amber-400 font-bold">25x–30x COST REDUCTION</span>
          </div>
        </div>
      </div>

      {/* ── 3-TIER ARCHITECTURAL FILTER TABS ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-abyss-900/60 p-2 rounded-lg border border-steel-800">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold text-steel-400 uppercase tracking-wider pl-2">
            ARCHITECTURAL TIERS:
          </span>
          
          <button
            onClick={() => setSelectedTier('ALL')}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${
              selectedTier === 'ALL'
                ? 'bg-ice-500 text-abyss-950 shadow-md'
                : 'text-steel-400 hover:text-ice-200 bg-abyss-950 border border-steel-800'
            }`}
          >
            ALL SUBSYSTEMS (8)
          </button>

          <button
            onClick={() => setSelectedTier('INDIGENOUS_PHYSICAL')}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedTier === 'INDIGENOUS_PHYSICAL'
                ? 'bg-emerald-400 text-abyss-950 shadow-md'
                : 'text-emerald-400 hover:bg-zinc-900/50 bg-abyss-950 border border-white/10'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            1. IN-SITU PHYSICAL SENSORS (₹6.1k BOM)
          </button>

          <button
            onClick={() => setSelectedTier('DL_VIRTUAL_REPLICATED')}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedTier === 'DL_VIRTUAL_REPLICATED'
                ? 'bg-amber-400 text-abyss-950 shadow-md'
                : 'text-amber-400 hover:bg-amber-950/30 bg-abyss-950 border border-amber-900/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            2. PHYSICS-DERIVED PARAMETERS (UNESCO EOS-80)
          </button>

          <button
            onClick={() => setSelectedTier('MODULAR_UPGRADE')}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedTier === 'MODULAR_UPGRADE'
                ? 'bg-purple-400 text-abyss-950 shadow-md'
                : 'text-zinc-300 hover:bg-zinc-900/50 bg-abyss-950 border border-white/10'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            3. POST-SELECTION MODULAR BAYS
          </button>
        </div>

        <span className="text-[10px] font-mono text-steel-500 pr-2 hidden md:inline">
          AQUILA OS · AUTONOMOUS SUBSEA INTELLIGENCE PLATFORM
        </span>
      </div>

      {/* ── MAIN 3D WORKSPACE & INSPECTOR GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Left (8 Cols): Interactive Three.js 3D Viewport */}
        <div className="lg:col-span-8 bg-abyss-950/90 border border-steel-800/80 rounded-lg overflow-hidden shadow-md relative flex flex-col justify-between min-h-[500px]">
          
          {/* === NEW PiP UI SYSTEM === */}
          
          {viewPreset === 'POV' && (
            <>
              {/* TRUE FIRST-PERSON IMMERSIVE HUD */}
              <div className="absolute inset-0 z-20 pointer-events-none border-[8px] border-white/10" style={{ background: 'radial-gradient(circle, transparent 50%, rgba(2,6,23,0.8) 100%)' }}>
                
                {/* Top Left Telemetry (Stacked to avoid ANY center overlap) */}
                <div className="absolute top-40 left-8 flex flex-col gap-3 text-zinc-300 font-mono text-xs">
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-2 font-bold"><Target className="w-4 h-4 animate-pulse text-red-500" /> AUV-001 FWD CAM</span>
                    <span>DEPTH: 14.8m AGL</span>
                    <span>PITCH: -15.4°</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-bold">SYS: NOMINAL</span>
                    <span>BAT: 84% (ESP32)</span>
                    <span className="text-emerald-400">AI: YOLOv8s ACTIVE</span>
                  </div>
                </div>

                {/* Center Crosshair */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-50 flex items-center justify-center">
                  <div className="w-32 h-32 border border-white/10 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-zinc-800 rounded-md"></div>
                  </div>
                  <div className="absolute w-48 h-[1px] bg-zinc-900/50"></div>
                  <div className="absolute h-48 w-[1px] bg-zinc-900/50"></div>
                </div>

                {/* Bottom Left Telemetry */}
                <div className="absolute bottom-20 left-8 text-emerald-400 font-mono text-xs font-bold">
                  <span>SONAR FREQ: 900kHz SSS</span>
                </div>

                {/* Bottom Right Telemetry */}
                <div className="absolute bottom-20 right-8 text-emerald-400 font-mono text-xs flex items-center gap-2">
                  <span className="animate-pulse text-red-500">● REC</span>
                  <span>{new Date().toISOString().split('T')[1].substring(0,8)} UTC</span>
                </div>
              </div>

              {/* Top Right: Raw Sonar Waterfall PiP */}
              <div className="absolute top-36 right-4 w-44 h-44 bg-[#111] border border-steel-600 rounded overflow-hidden flex flex-col shadow-md z-30 pointer-events-none">
                <div className="bg-steel-800 text-[9px] font-mono font-bold text-ice-300 px-2 py-1 flex justify-between items-center">
                  <span>RAW SONAR WATERFALL</span>
                  <span className="text-red-400 animate-pulse flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>REC</span>
                </div>
                <div className="flex-1 relative overflow-hidden flex justify-center items-center" style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '6px 6px' }}>
                  <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-ice-500/30"></div>
                  <div className="absolute left-0 right-0 h-1 bg-ice-400/50 animate-[scan_2s_linear_infinite]" style={{ top: '0%' }}>
                     <style>{`@keyframes scan { 0% { top: 0%; } 100% { top: 100%; } }`}</style>
                  </div>
                  {detectionEvent && (
                    <div 
                      className={`absolute w-6 h-12 blur-[2px] rounded-md ${detectionEvent.isRock ? 'bg-sky-400/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]' : detectionEvent.isUnknown ? 'bg-yellow-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]' : 'bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'} animate-pulse`}
                      style={{ top: `${detectionEvent.yOff}%`, left: `${detectionEvent.xOff}%`, transform: 'translate(-50%, -50%)' }}
                    ></div>
                  )}
                </div>
              </div>

              
              {/* Bottom Right: Edge AI Terminal Logs */}
              <div className="absolute bottom-16 right-4 w-72 h-36 bg-black/90 border border-steel-700 rounded overflow-hidden flex flex-col shadow-md z-30 pointer-events-none">
                <div className="bg-steel-900 text-[8px] font-mono font-bold text-emerald-400 px-2 py-1 border-b border-steel-700">
                  EDGE_AI_INFERENCE_STDOUT
                </div>
                <div className="flex-1 p-2 font-mono text-[9px] text-steel-400 flex flex-col justify-end gap-0.5 overflow-hidden">
                  {terminalLogs.map((log, i) => (
                    <div key={i} className={`${log.includes('HUMAN_VERIFICATION') ? 'text-zinc-400 font-bold' : log.includes('CRITICAL') ? 'text-red-400 font-bold' : log.includes('[AI]') ? 'text-zinc-300' : ''}`}>
                      {log}
                    </div>
                  ))}
                </div>
              </div>

              {/* Center Action Alert */}

              {detectionEvent ? (
                <div className={`absolute top-16 left-1/2 -translate-x-1/2 bg-abyss-950/95 border-2 ${detectionEvent.isRock ? 'border-sky-500/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]' : detectionEvent.isUnknown ? 'border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]' : 'border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'} px-6 py-3 rounded-md flex flex-col items-center pointer-events-none z-30 transition-colors`}>
                  <div className="flex items-center gap-3 mb-1">
                    <Crosshair className={`w-5 h-5 ${detectionEvent.isRock ? 'text-zinc-300' : detectionEvent.isUnknown ? 'text-zinc-400' : 'text-red-400'}`} />
                    <span className={`${detectionEvent.isRock ? 'text-zinc-300' : detectionEvent.isUnknown ? 'text-zinc-400' : 'text-red-100'} font-mono font-bold text-sm tracking-wider`}>
                      {detectionEvent.type} (CONF: {detectionEvent.confidence}%)
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono ${detectionEvent.isRock ? 'text-zinc-300' : detectionEvent.isUnknown ? 'text-zinc-400' : 'text-red-400'}`}>
                    {detectionEvent.isRock ? 'ACTION: FILTERED (ORGANIC SHAPE)' : detectionEvent.isUnknown ? 'ACTION: FLAGGED FOR HUMAN REVIEW' : 'ACTION: LOGGED AS HIGH THREAT'}
                  </span>
                </div>
              ) : (
                <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-abyss-950/80 border border-ice-500/30 px-6 py-2 rounded-md flex items-center gap-3 pointer-events-none z-30">
                  <div className="w-2 h-2 rounded-full bg-ice-400 animate-pulse" />
                  <span className="text-ice-300 font-mono font-bold text-xs tracking-widest">SCANNING SEABED...</span>
                </div>
              )}
            </>
          )}

          {/* Top 3D Control Bar Overlay */}
          <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
            
            {/* View Presets */}
            <div className="flex items-center gap-1 bg-abyss-900/90 p-1 rounded-lg border border-steel-800 pointer-events-auto backdrop-blur-md">
              {(['ISO', 'BOW', 'BELLY', 'STERN', 'TOP', 'POV'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => handleSetPreset(p)}
                  className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-all ${
                    viewPreset === p ? 'bg-ice-500 text-abyss-950 shadow-md' : 'text-steel-400 hover:text-steel-200 hover:bg-steel-800'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Visual Shader Toggles */}
            <div className="flex items-center gap-2 bg-abyss-900/90 p-1 rounded-lg border border-steel-800 pointer-events-auto backdrop-blur-md">
              <button
                onClick={() => setXrayMode(!xrayMode)}
                className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-all flex items-center gap-1 ${
                  xrayMode ? 'bg-amber-400 text-abyss-950' : 'text-steel-400 hover:text-amber-300 hover:bg-steel-800'
                }`}
                title="Toggle Internal Pressure Vessel X-Ray View"
              >
                <Layers className="w-3 h-3" />
                X-RAY
              </button>

              <button
                onClick={() => setWireframeMode(!wireframeMode)}
                className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-all flex items-center gap-1 ${
                  wireframeMode ? 'bg-cyan-400 text-abyss-950' : 'text-steel-400 hover:text-zinc-300 hover:bg-steel-800'
                }`}
                title="Toggle Topological Wireframe Mesh"
              >
                <Maximize2 className="w-3 h-3" />
                WIREFRAME
              </button>

              <button
                onClick={() => setBeamVisible(!beamVisible)}
                className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-all flex items-center gap-1 ${
                  beamVisible ? 'bg-emerald-400 text-abyss-950' : 'text-steel-400 hover:text-emerald-300 hover:bg-steel-800'
                }`}
                title="Toggle Sonar Swath Fan Beams"
              >
                <Eye className="w-3 h-3" />
                BEAMS
              </button>

              <button
                onClick={() => { autoRotateRef.current = !autoRotate; setAutoRotate(!autoRotate); }}
                className={`p-1.5 rounded transition-all ${
                  autoRotate ? 'text-ice-400 bg-steel-800' : 'text-steel-500 hover:text-steel-300'
                }`}
                title="Toggle 360 Auto-Rotation Orbit"
              >
                <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }} />
              </button>
            </div>

          </div>

          {/* WebGL Canvas Mounting Point */}
          <div ref={mountRef} className="w-full h-full min-h-[460px] cursor-grab active:cursor-grabbing relative z-10" />

          {/* Bottom 3D Guidance Bar */}
          <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between font-mono text-[9px] text-steel-500 bg-abyss-900/80 px-3 py-1.5 rounded-lg border border-steel-800/80 backdrop-blur-sm pointer-events-none">
            <span className="flex items-center gap-2">
              <Crosshair className="w-3 h-3 text-ice-400" />
              DRAG TO ROTATE 360° · SCROLL WHEEL TO ZOOM · CLICK ANY GLOWING NODE TO INSPECT
            </span>
            <span className="text-ice-400 font-semibold">SELECTED: {selectedSensor.name.split('(')[0]}</span>
          </div>

        </div>

        {/* Right (4 Cols): Deep Technical Sensor & Indigenous Cost Inspector Panel */}
        <div className="lg:col-span-4 bg-abyss-900/90 border border-steel-800/80 rounded-lg p-4 shadow-md flex flex-col justify-between overflow-hidden">
          
          <div className="space-y-2.5">
            {/* Sensor Tier Badge */}
            <div className="flex items-center justify-between pb-2 border-b border-steel-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-md" style={{ backgroundColor: selectedSensor.color }} />
                <span className="text-[10px] font-mono font-bold tracking-widest text-steel-400 uppercase">
                  {selectedSensor.tier === 'DL_VIRTUAL_REPLICATED' ? 'PHYSICS-DERIVED (UNESCO EOS-80 / TEOS-10)' : selectedSensor.tier.replace(/_/g, ' ')}
                </span>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                selectedSensor.tier === 'INDIGENOUS_PHYSICAL' 
                  ? 'bg-zinc-900/50 text-emerald-300 border-white/10' 
                  : selectedSensor.tier === 'DL_VIRTUAL_REPLICATED'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-zinc-900/50 text-zinc-300 border-white/10'
              }`}>
                {selectedSensor.status}
              </span>
            </div>

            {/* Title & Hardware Specifications */}
            <div>
              <h2 className="text-sm font-mono font-bold text-steel-50 leading-snug" style={{ color: selectedSensor.color }}>
                {selectedSensor.name}
              </h2>
              <p className="text-[11px] font-mono text-steel-400 mt-0.5">
                BOM: <span className="text-ice-300 font-semibold">{selectedSensor.hardwareBOM}</span>
              </p>
            </div>

            {/* ── INDIGENOUS COST DEFENSE COMPARISON CARD ── */}
            <div className="bg-abyss-950 p-3 rounded-lg border border-white/10 shadow-inner">
              <div className="flex items-center justify-between text-[10px] font-mono text-steel-400 mb-1.5 border-b border-steel-800 pb-1">
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> ATMANIRBHAR COST ROADMAP
                </span>
                <span className="text-amber-400 font-bold">
                  {selectedSensor.componentCostINR === 0 ? '100% AI SAVING' : `${Math.round((1 - selectedSensor.componentCostINR / selectedSensor.importedCostINR) * 100)}% SAVING`}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px]">
                <div className="bg-zinc-900/50 p-1.5 rounded border border-white/10">
                  <span className="text-[8px] text-emerald-300 block">DEMO BOM</span>
                  <span className="text-[11px] font-bold text-emerald-400">
                    {selectedSensor.componentCostINR === 0 ? '₹0 (AI)' : `₹${selectedSensor.componentCostINR.toLocaleString('en-IN')}`}
                  </span>
                </div>

                <div className="bg-zinc-900/50 p-1.5 rounded border border-white/10">
                  <span className="text-[8px] text-zinc-300 block">SUBSEA PROD</span>
                  <span className="text-[11px] font-bold text-zinc-300 truncate block">
                    {selectedSensor.tier === 'DL_VIRTUAL_REPLICATED' 
                      ? '₹0 (AI Model)' 
                      : selectedSensor.tier === 'INDIGENOUS_PHYSICAL' 
                      ? `₹${Math.round(selectedSensor.componentCostINR * 12 + 15000).toLocaleString('en-IN')}`
                      : `₹${selectedSensor.componentCostINR.toLocaleString('en-IN')}`}
                  </span>
                </div>

                <div className="bg-red-950/30 p-1.5 rounded border border-white/10">
                  <span className="text-[8px] text-red-300 block">GOVT IMPORT</span>
                  <span className="text-[11px] font-bold text-red-400 truncate block">
                    ₹{(selectedSensor.importedCostINR / 100000).toFixed(1)}L
                  </span>
                </div>
              </div>

              <div className="mt-1.5 text-[9px] font-mono text-steel-400 truncate">
                Replaces: <span className="text-steel-200">{selectedSensor.importedEquivalent}</span>
              </div>
            </div>

            {/* Live Streaming Numerical Readout */}
            <div className="bg-abyss-950 p-2.5 rounded-lg border border-steel-800 shadow-inner">
              <div className="flex items-center justify-between text-[9px] font-mono text-steel-500 mb-0.5">
                <span>IN-SITU READING / PREDICTION</span>
                <span className="text-emerald-400">{selectedSensor.samplingRate}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-mono font-bold text-steel-50">
                  {liveMetric}
                </span>
                <span className="text-xs font-mono font-semibold" style={{ color: selectedSensor.color }}>
                  {selectedSensor.unit}
                </span>
              </div>

              {/* Real-time Mini Sparkline */}
              <div 
                role="img" 
                aria-label={`Real-time telemetry trend sparkline for ${selectedSensor.name}, current value ${liveMetric} ${selectedSensor.unit}`}
                className="h-6 w-full mt-0.5"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparklineData}>
                    <YAxis domain={['dataMin - 2', 'dataMax + 2']} hide />
                    <Line type="monotone" dataKey="v" stroke={selectedSensor.color} strokeWidth={2} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Indigenous Value Defense Summary */}
            <div className="bg-abyss-950/90 border border-steel-800 p-2 rounded-lg font-mono text-[9px] space-y-0.5">
              <span className="text-ice-400 font-bold block flex items-center gap-1">
                <Zap className="w-3 h-3" /> ATMANIRBHAR BHARAT DEFENSE
              </span>
              <p className="text-steel-300 leading-tight font-sans text-[11px]">
                {selectedSensor.indigenousAdvantage}
              </p>
            </div>

          </div>

          {/* Node Selector Carousel Grid */}
          <div className="pt-2.5 border-t border-steel-800 mt-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] font-mono text-steel-400 font-bold uppercase">
                SELECT SUBSYSTEM NODE ({filteredSensors.length}):
              </span>
              <span className="text-[8px] font-mono text-steel-500">CLICK TO INSPECT</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-1.5 max-h-24 overflow-y-auto pr-1">
              {filteredSensors.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSensor(s)}
                  className={`px-2 py-1 rounded text-[9px] font-mono font-bold transition-all truncate text-center ${
                    selectedSensor.id === s.id
                      ? 'bg-steel-700 text-white border border-ice-400 shadow-md scale-[1.02]'
                      : 'bg-abyss-950 text-steel-400 border border-steel-800/80 hover:text-steel-200 hover:border-steel-700'
                  }`}
                  title={s.name}
                >
                  {s.id.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

      
      {/* ── AUTONOMOUS EDGE PROCESSING PIPELINE EXPLAINER ── */}
      <div className="mt-8 mb-4 border-t border-steel-800/60 pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Cpu className="w-5 h-5 text-ice-400" />
          <h2 className="text-sm font-mono font-bold tracking-widest text-steel-100 uppercase">
            Autonomous Edge Processing Architecture (No Cloud Dependency)
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <div className="bg-abyss-950/80 border border-steel-800/80 rounded-lg p-4 shadow-sm hover:border-ice-500/50 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-ice-500/20 text-ice-400 text-[10px] font-bold border border-ice-500/40">1</span>
              <h3 className="text-xs font-mono font-bold text-ice-300">Acoustic Insonification</h3>
            </div>
            <p className="text-[11px] text-steel-400 font-sans leading-relaxed">
              The Side-Scan Sonar (SSS) emits high-frequency acoustic pulses (chirps) forming a swath across the ocean floor. 
              Because light cannot penetrate deep ocean turbidity, sound is used to map the seabed topography.
            </p>
          </div>

          <div className="bg-abyss-950/80 border border-steel-800/80 rounded-lg p-4 shadow-sm hover:border-ice-500/50 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-ice-500/20 text-ice-400 text-[10px] font-bold border border-ice-500/40">2</span>
              <h3 className="text-xs font-mono font-bold text-ice-300">Geometric Shadow Analysis</h3>
            </div>
            <p className="text-[11px] text-steel-400 font-sans leading-relaxed">
              Return echoes (backscatter) create 2D intensity maps. The AI does not just look at the object; it looks at the <strong>Acoustic Shadow</strong> behind it. 
              Natural rocks cast irregular, tapered shadows. Man-made UXOs and pipes cast sharp, geometric, symmetrical shadows.
            </p>
          </div>

          <div className="bg-abyss-950/80 border border-steel-800/80 rounded-lg p-4 shadow-sm hover:border-white/10 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold border border-white/10">3</span>
              <h3 className="text-xs font-mono font-bold text-red-400">Edge AI Threat Classification</h3>
            </div>
            <p className="text-[11px] text-steel-400 font-sans leading-relaxed">
              The onboard edge compute node runs the fine-tuned YOLOv8s model against the sonar waterfall. 
              It leverages localized CNN inductive bias to isolate marine debris (Ghost Nets, Shipwrecks, Cylinders) with an 88.0% mAP50 edge validation accuracy.
            </p>
          </div>

          <div className="bg-abyss-950/80 border border-steel-800/80 rounded-lg p-4 shadow-sm hover:border-white/10 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-md bg-zinc-900/50 text-emerald-400 text-[10px] font-bold border border-white/10">4</span>
              <h3 className="text-xs font-mono font-bold text-emerald-400">Priority Flagging & Geotagging</h3>
            </div>
            <p className="text-[11px] text-steel-400 font-sans leading-relaxed">
              If a UXO (Unexploded Ordnance) is detected, it is immediately flagged with <code className="text-red-400 bg-red-900/30 px-1 rounded">PRIORITY=CRITICAL</code>. 
              The system merges the detection with the Dead Reckoning/IMU localization module to calculate the exact Latitude/Longitude of the debris.
            </p>
          </div>

          <div className="bg-abyss-950/80 border border-steel-800/80 rounded-lg p-4 shadow-sm hover:border-white/10 transition-colors md:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-md bg-zinc-900/50 text-zinc-300 text-[10px] font-bold border border-white/10">5</span>
              <h3 className="text-xs font-mono font-bold text-zinc-300">Local SQLite DB -&gt; Surface Transmission</h3>
            </div>
            <p className="text-[11px] text-steel-400 font-sans leading-relaxed">
              Because radio waves (WiFi/4G) cannot travel through water, the AUV stores the geotagged detections in an embedded <strong>SQLite Database</strong> inside its pressure hull. 
              Once the mission ends, the AUV ascends to the surface and uses its dorsal antenna to burst-transmit the JSON data packets back to the Mothership Mission Control over LoRa/Iridium.
            </p>
          </div>

        </div>
      </div>

      {/* ── ROW 3: LIVE C2 MISSION TERMINAL ── */}
      <div className="mt-6">
        <div className="flex items-center justify-between px-1 mb-2">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-ice-400" />
            <h2 className="text-xs font-mono font-bold tracking-widest text-steel-200 uppercase">
              ESP32 SENSOR HUB · RASPBERRY PI 4 EDGE COMPUTE · ACOUSTIC TELEMETRY BUS
            </h2>
          </div>
          <span className="text-[10px] font-mono text-emerald-400">HARDWARE TOTAL: ₹6,100 INR · NOMINAL</span>
        </div>
        <div className="bg-abyss-950 rounded-lg border border-steel-800/80 shadow-md overflow-hidden">
          <MissionTerminal height={200} />
        </div>
      </div>

    </div>
  );
}
