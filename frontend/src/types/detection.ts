// detection.ts — All types for the AQUILA detection pipeline

export interface BBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Detection {
  object_class: string;
  confidence_cal: number;
  confidence_raw: number;
  shadow_penalty: boolean | number;
  lat: number | null;
  lon: number | null;
  depth_m: number | null;
  bbox: [number, number, number, number] | BBox;
  heading_deg: number | null;
  ping_number: number | null;
  timestamp: string | null;
}

export interface DetectResponse {
  model_ready: boolean;
  detections: Detection[];
  message?: string;
  preprocessing_time_ms: number;
  inference_time_ms: number;
  total_time_ms: number;
  image_size: [number, number];
  detection_count?: number;
}

export interface HealthResponse {
  status: string;
  model_ready: boolean;
  timestamp: string;
}

export type ProcessingStage =
  | 'idle'
  | 'uploading'
  | 'preprocessing'
  | 'inferencing'
  | 'calibrating'
  | 'done'
  | 'error';

export const CLASS_COLORS: Record<string, string> = {
  shipwreck:      '#00e5ff', // Cyan
  ghost_net:      '#ff80c8', // Pink
  uxo_mine:       '#ef4444', // Red Alert
  pipeline_cable: '#ffd700', // Gold
  lost_container: '#f97316', // Orange
  toxic_drum:     '#a855f7', // Purple
  pmn_nodule:     '#34d399', // Emerald
  gas_seep:       '#38bdf8', // Sky Blue
  subsea_sensor:  '#f43f5e', // Rose
  anomaly:        '#94a3b8', // Slate
};

export const CLASS_LABELS: Record<string, string> = {
  shipwreck:      'Shipwreck / Hull',
  ghost_net:      'Derelict Ghost Net',
  uxo_mine:       'Subsea UXO / Mine',
  pipeline_cable: 'Subsea Cable / Pipeline',
  lost_container: 'Sunken Cargo Container',
  toxic_drum:     'Hazardous Chemical Drum',
  pmn_nodule:     'Polymetallic Nodule Field',
  gas_seep:       'Methane Hydrate Seep',
  subsea_sensor:  'Foreign Sonar Transponder',
  anomaly:        'Unclassified Anomaly',
};
