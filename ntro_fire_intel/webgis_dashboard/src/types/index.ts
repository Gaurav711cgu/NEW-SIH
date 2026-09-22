export interface ThermalAnomaly {
  anomaly_id: string;
  latitude: number;
  longitude: number;
  bright_ti4: number;
  brightness: number;
  scan?: number;
  track?: number;
  acq_date: string;
  acq_time: string;
  satellite: string;
  confidence: string;
  version?: string;
  bright_ti5?: number;
  bright_t31: number;
  frp: number;
  daynight: string;
  cluster_name?: string;
  cluster_id?: string;
  district?: string;
  state?: string;
}

export interface EnrichedAnomaly extends ThermalAnomaly {
  features?: {
    frp: number;
    brightness: number;
    bright_t31: number;
    temp_delta: number;
    osm_industrial_count: number;
    osm_min_dist_m: number;
    has_chemical_refinery: number;
    has_power_infrastructure: number;
    is_night: number;
  };
  osm_enrichment?: {
    osm_industrial_count: number;
    osm_min_dist_m: number;
    has_chemical_refinery: number;
    has_power_infrastructure: number;
    dist_to_industrial_km: number;
    industrial_density_2km: number;
    matched_cluster: string;
    cluster_id: string;
    jurisdiction?: {
      agency: string;
      fire_station: string;
      regulatory_body: string;
      contact: string;
      evacuation_radius_m: number;
    };
    primary_hazard?: string;
    facilities?: string[];
    source?: string;
  };
  prediction?: {
    class_id: number;
    class_label: string;
    industrial_probability: number;
    threat_level: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'MODERATE' | 'LOW';
    model_version: string;
  };
}

export interface OSMCluster {
  cluster_id: string;
  name: string;
  state: string;
  district: string;
  center: {
    lat: number;
    lon: number;
  };
  bounds: {
    min_lat: number;
    max_lat: number;
    min_lon: number;
    max_lon: number;
  };
  tags: Record<string, any>;
  facilities: string[];
  primary_hazard: string;
  jurisdiction: {
    agency: string;
    fire_station: string;
    regulatory_body: string;
    contact: string;
    evacuation_radius_m: number;
  };
}

export interface SitrepAlert {
  sitrep_id: string;
  timestamp: string;
  incident_type: string;
  confidence_score?: number;
  confidence?: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  thermal_anomaly?: {
    latitude: number;
    longitude: number;
    frp_mw: number;
    brightness_k: number;
    satellite_source: string;
    confidence_raw: string;
  };
  classification: {
    category: string;
    confidence: number;
    model_version: string;
    is_industrial: boolean;
    threat_level?: string;
  };
  fire_radiative_power_mw: number;
  frp?: number;
  threat_level: string;
  spatial_enrichment?: {
    nearest_facility: string;
    distance_to_facility_m: number;
    industrial_zone: boolean;
    infrastructure_tags: Record<string, any>;
  };
  affected_facility?: {
    name: string;
    osm_tag: string;
    distance_km: number;
  };
  jurisdiction: {
    state: string;
    district: string;
    subdivision_taluk?: string;
    primary_responder?: string;
    primary_agency?: string;
    fire_station?: string;
    emergency_phone?: string;
    contact?: string;
    nodal_authority?: string;
    regulatory_body?: string;
  };
  navigation: {
    google_maps_url: string;
    coordinates_dms: string;
    destination_query: string;
  };
  google_maps_url?: string;
  tactical_assessment: {
    threat_level: string;
    evacuation_radius_m: number;
    evacuation_radius_meters?: number;
    hazmat_classification: string;
    containment_actions?: string[];
  };
  dispatch_metadata?: {
    channel: string;
    dispatch_time: string;
    status: string;
    http_status_code: number;
    telegram_message_id: number;
  };
}

export interface LayerVisibility {
  thermalPillars: boolean;
  industrialZones: boolean;
  coordinateGrid: boolean;
  radarRings: boolean;
  labels: boolean;
}

export type ThreatFilter = 'ALL' | 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'WILDFIRE';
export type CameraPreset = 'ISOMETRIC' | 'ORTHO' | 'WEST' | 'EAST' | 'SOUTH' | 'DEFAULT' | 'RESET';
