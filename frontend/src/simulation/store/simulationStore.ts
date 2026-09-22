import { create } from 'zustand';

export type MissionPhase = 
  | 'IDLE'
  | 'STAGE_0_SURFACE'
  | 'STAGE_1_ENTRY'
  | 'STAGE_2_DESCENT'
  | 'STAGE_3_MIDWATER'
  | 'STAGE_4_SEAFLOOR'
  | 'STAGE_5_SONAR'
  | 'STAGE_6_ANOMALY'
  | 'STAGE_7_ASCENT'
  | 'STAGE_8_RECOVERY'
  | 'EMERGENCY';

export type CameraMode = 'CINEMATIC' | 'FREE' | 'COMPONENT' | 'TPP' | 'FPP';

export interface ThrusterState {
  id: string;
  name: string;
  online: boolean;
  rpm: number;
  maxRpm: number;
}

export interface ComponentState {
  id: string;
  name: string;
  category: 'Sensors' | 'Compute' | 'Power' | 'Propulsion' | 'Navigation' | 'Communications' | 'Buoyancy';
  hardware: string;
  costINR: number;
  importedEquiv: string;
  importedCostINR: number;
  health: number;
  status: 'NOMINAL' | 'WARNING' | 'CRITICAL' | 'OFFLINE';
  specs: Record<string, string>;
}

export interface DetectionEvent {
  id: string;
  timestamp: number;
  type: string;
  confidence: number;
  position: [number, number, number];
  lat: number;
  lng: number;
  depth: number;
}

export interface SimulationState {
  missionPhase: MissionPhase;
  missionTimer: number;
  diveStepIndex: number;
  diveStepProgress: number;

  auvPosition: [number, number, number];
  auvRotation: [number, number, number];
  auvVelocity: [number, number, number];
  depth: number;
  targetDepth: number;
  speed: number;
  heading: number;
  ballastLevel: number;

  thrusters: ThrusterState[];

  temperature: number;
  salinity: number;
  pressure: number;
  dissolvedOxygen: number;
  currentSpeed: number;
  currentDirection: number;
  visibility: number;

  batteryPercent: number;
  batteryVoltage: number;
  estimatedEndurance: number;
  powerDraw: number;

  iridiumLink: boolean;
  lastTransmit: number;
  signalStrength: number;

  components: ComponentState[];
  alerts: string[];
  aiLogs: string[];
  sensorDrift: Record<string, number>;

  detections: DetectionEvent[];
  gpsLat: number;
  gpsLng: number;
  gpsSatellites: number;

  cameraMode: CameraMode;
  currentAssist: number;
  powerMode: "ACTIVE_THRUST" | "ECO_GLIDE";
  selectedComponent: string | null;

  sonarActive: boolean;
  sonarSweepAngle: number;
  sonarRange: number;

  setMissionPhase: (phase: MissionPhase) => void;
  setDiveStep: (step: number, progress: number) => void;
  setAUVPosition: (pos: [number, number, number]) => void;
  setAUVRotation: (rot: [number, number, number]) => void;
  setDepth: (depth: number) => void;
  setBallast: (level: number) => void;
  setThrusterRPM: (id: string, rpm: number) => void;
  setThrusterOnline: (id: string, online: boolean) => void;
  setCameraMode: (mode: CameraMode) => void;
  setSelectedComponent: (id: string | null) => void;
  setBattery: (percent: number) => void;
  setSonarActive: (active: boolean) => void;
  setSonarSweep: (angle: number) => void;
  addDetection: (det: DetectionEvent) => void;
  addAlert: (msg: string) => void;
  addAILog: (msg: string) => void;
  clearAlerts: () => void;
  updateTelemetry: (data: Partial<SimulationState>) => void;
  triggerFailure: (componentId: string) => void;
  initiateDive: () => void;
  emergencyAscent: () => void;
  reset: () => void;
}

const DEFAULT_THRUSTERS: ThrusterState[] = [
  { id: 'T_FL', name: 'Front-Left', online: true, rpm: 0, maxRpm: 3200 },
  { id: 'T_FR', name: 'Front-Right', online: true, rpm: 0, maxRpm: 3200 },
  { id: 'T_RL', name: 'Rear-Left', online: true, rpm: 0, maxRpm: 3200 },
  { id: 'T_RR', name: 'Rear-Right', online: true, rpm: 0, maxRpm: 3200 },
  { id: 'T_VL', name: 'Vert-Left', online: true, rpm: 0, maxRpm: 3200 },
  { id: 'T_VR', name: 'Vert-Right', online: true, rpm: 0, maxRpm: 3200 },
];

const DEFAULT_COMPONENTS: ComponentState[] = [
  {
    id: 'ctd', name: 'CTD Sensor Pod', category: 'Sensors',
    hardware: 'MS5837-30BA + DS18B20 + TDS Probe', costINR: 580,
    importedEquiv: 'Sea-Bird SBE 49 FastCAT', importedCostINR: 850000,
    health: 96, status: 'NOMINAL',
    specs: { 'Temp Accuracy': '±0.05°C', 'Pressure Range': '0-300m' }
  },
  {
    id: 'sonar', name: 'Sonar Array', category: 'Sensors',
    hardware: 'Ping Sonar', costINR: 2200,
    importedEquiv: 'Ping360 Scanning Sonar', importedCostINR: 425000,
    health: 100, status: 'NOMINAL',
    specs: { 'Range': '0.5-50m', 'Beam Width': '30°' }
  },
];

export const useSimulationStore = create<SimulationState>((set, get) => ({
  missionPhase: 'IDLE',
  missionTimer: 0,
  diveStepIndex: -1,
  diveStepProgress: 0,

  auvPosition: [0, 2, 0],
  auvRotation: [0, 0, 0],
  auvVelocity: [0, 0, 0],
  depth: 0,
  targetDepth: 142,
  speed: 0,
  heading: 45,
  ballastLevel: 0,

  thrusters: DEFAULT_THRUSTERS,

  temperature: 1.84,
  salinity: 34.5,
  pressure: 0,
  dissolvedOxygen: 7.2,
  currentSpeed: 0.3,
  currentDirection: 90,
  visibility: 25,

  batteryPercent: 100,
  batteryVoltage: 16.8,
  estimatedEndurance: 8.0,
  powerDraw: 33,

  iridiumLink: true,
  lastTransmit: Date.now(),
  signalStrength: 92,

  components: DEFAULT_COMPONENTS,
  alerts: [],
  aiLogs: ['[SATCOM] GPS Lock Acquired. Lat: -65.20, Lon: 48.71', '[ENV] Surface state: Sea State 4, Winds 25kts', '[SYS] Pre-dive checklist complete. Awaiting command.'],
  sensorDrift: {},

  detections: [],

  cameraMode: 'CINEMATIC',
  selectedComponent: null,
  currentAssist: 0,
  powerMode: "ACTIVE_THRUST",

  sonarActive: false,
  sonarSweepAngle: 0,
  sonarRange: 50,

  gpsLat: -65.2,
  gpsLng: 48.7,
  gpsSatellites: 12,

  setMissionPhase: (phase) => set({ missionPhase: phase }),
  setDiveStep: (step, progress) => set({ diveStepIndex: step, diveStepProgress: progress }),
  setAUVPosition: (pos) => set({ auvPosition: pos, depth: Math.max(0, -pos[1]) }),
  setAUVRotation: (rot) => set({ auvRotation: rot }),
  setDepth: (d) => set({ depth: d, pressure: d * 0.1 + 1.013 }),
  setBallast: (level) => set({ ballastLevel: Math.max(0, Math.min(1, level)) }),
  setThrusterRPM: (id, rpm) => set((s) => ({
    thrusters: s.thrusters.map(t => t.id === id ? { ...t, rpm } : t)
  })),
  setThrusterOnline: (id, online) => set((s) => ({
    thrusters: s.thrusters.map(t => t.id === id ? { ...t, online, rpm: online ? t.rpm : 0 } : t)
  })),
  setCameraMode: (mode) => set({ cameraMode: mode }),
  setSelectedComponent: (id) => set({ selectedComponent: id }),
  setBattery: (percent) => set({
    batteryPercent: percent,
    batteryVoltage: 12.0 + (percent / 100) * 4.8,
    estimatedEndurance: (percent / 100) * 8.0
  }),
  setSonarActive: (active) => set({ sonarActive: active }),
  setSonarSweep: (angle) => set({ sonarSweepAngle: angle }),
  addDetection: (det) => set((s) => ({ detections: [...s.detections, det] })),
  addAlert: (msg) => set((s) => ({ alerts: [...s.alerts.slice(-9), msg] })),
  addAILog: (msg) => set((s) => ({ aiLogs: [...s.aiLogs.slice(-19), msg] })),
  clearAlerts: () => set({ alerts: [] }),
  updateTelemetry: (data) => set(data as Partial<SimulationState>),
  triggerFailure: (componentId) => set((s) => ({
    components: s.components.map(c =>
      c.id === componentId
        ? { ...c, health: Math.max(0, c.health - 40), status: c.health - 40 <= 30 ? 'CRITICAL' : 'WARNING' }
        : c
    ),
    alerts: [...s.alerts, `FAILURE: ${s.components.find(c => c.id === componentId)?.name} degraded`]
  })),
  initiateDive: () => set({
    missionPhase: 'STAGE_0_SURFACE',
    diveStepIndex: 0,
    diveStepProgress: 0,
    cameraMode: 'TPP',
    alerts: ['DIVE SEQUENCE INITIATED'],
    aiLogs: ['[SYS] Booting mission control...'],
  }),
  emergencyAscent: () => {
    const s = get();
    set({
      missionPhase: 'EMERGENCY',
      ballastLevel: 0,
      targetDepth: 0,
      alerts: [...s.alerts, 'EMERGENCY ASCENT — ALL BALLAST PURGED'],
    });
  },
  reset: () => set({
    missionPhase: 'IDLE',
    missionTimer: 0,
    diveStepIndex: -1,
    diveStepProgress: 0,
    auvPosition: [0, 2, 0],
    auvRotation: [0, 0, 0],
    auvVelocity: [0, 0, 0],
    depth: 0,
    speed: 0,
    heading: 45,
    ballastLevel: 0,
    thrusters: DEFAULT_THRUSTERS,
    batteryPercent: 100,
    batteryVoltage: 16.8,
    estimatedEndurance: 8.0,
    components: DEFAULT_COMPONENTS,
    alerts: [],
    aiLogs: ['[SATCOM] GPS Lock Acquired. Lat: -65.20, Lon: 48.71', '[ENV] Surface state: Sea State 4, Winds 25kts', '[SYS] Pre-dive checklist complete. Awaiting command.'],
    detections: [],
    cameraMode: 'CINEMATIC',
    selectedComponent: null,
  currentAssist: 0,
  powerMode: "ACTIVE_THRUST",
    sonarActive: false,
    sonarSweepAngle: 0,
  }),
}));
