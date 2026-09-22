import React, { useState, useMemo } from 'react';
import { TelemetryHeader } from './components/TelemetryHeader';
import { ControlToolbar } from './components/ControlToolbar';
import { AlertFeed } from './components/AlertFeed';
import { GeoIntCanvas3D } from './components/ThreeCanvas/GeoIntCanvas3D';
import { HotspotTooltip } from './components/HotspotTooltip';
import { SitrepModal } from './components/SitrepModal';
import { 
  EnrichedAnomaly, 
  OSMCluster, 
  SitrepAlert, 
  LayerVisibility, 
  ThreatFilter, 
  CameraPreset 
} from './types';

// Import authentic offline datasets
import rawAnomalies from './data/enriched_anomalies.json';
import rawClusters from './data/osm_cache.json';
import rawSitreps from './data/sitreps_dispatched.json';

export const App: React.FC = () => {
  // Cast imported data
  const anomalies: EnrichedAnomaly[] = (rawAnomalies as unknown) as EnrichedAnomaly[];
  const clusters: OSMCluster[] = (rawClusters as unknown) as OSMCluster[];
  const sitreps: SitrepAlert[] = (rawSitreps as unknown) as SitrepAlert[];

  // App states
  const [layers, setLayers] = useState<LayerVisibility>({
    thermalPillars: true,
    industrialZones: true,
    coordinateGrid: true,
    radarRings: true,
    labels: true,
  });

  const [threatFilter, setThreatFilter] = useState<ThreatFilter>('ALL');
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('ISOMETRIC');
  const [selectedAnomaly, setSelectedAnomaly] = useState<EnrichedAnomaly | null>(null);
  const [hoveredAnomaly, setHoveredAnomaly] = useState<EnrichedAnomaly | null>(null);
  const [hoverCoords, setHoverCoords] = useState<{ x: number; y: number } | undefined>(undefined);
  const [activeSitrep, setActiveSitrep] = useState<SitrepAlert | null>(null);

  // Compute total counts
  const totalCounts = useMemo(() => {
    let critical = 0;
    let high = 0;
    let elevated = 0;
    let wildfire = 0;

    anomalies.forEach(a => {
      const threat = a.prediction?.threat_level;
      const isIndustrial = a.prediction?.class_label === 'INDUSTRIAL_FIRE';
      if (threat === 'CRITICAL') critical++;
      else if (threat === 'HIGH') high++;
      else if (threat === 'ELEVATED') elevated++;
      if (!isIndustrial) wildfire++;
    });

    return {
      all: anomalies.length,
      critical,
      high,
      elevated,
      wildfire,
    };
  }, [anomalies]);

  // Handlers
  const handleToggleLayer = (key: keyof LayerVisibility) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectAnomaly = (anomaly: EnrichedAnomaly) => {
    setSelectedAnomaly(anomaly);
    // Find corresponding SITREP
    const foundSitrep = sitreps.find(s => 
      (s.coordinates && Math.abs(s.coordinates.latitude - anomaly.latitude) < 0.05 && 
       Math.abs(s.coordinates.longitude - anomaly.longitude) < 0.05) ||
      (s.sitrep_id && s.sitrep_id.includes(anomaly.anomaly_id))
    );

    if (foundSitrep) {
      setActiveSitrep(foundSitrep);
    } else {
      // Synthesize fallback sitrep object from enriched anomaly
      const synthSitrep: SitrepAlert = {
        sitrep_id: `SITREP-${anomaly.anomaly_id}`,
        timestamp: new Date().toISOString(),
        incident_type: anomaly.prediction?.class_label || 'INDUSTRIAL_FIRE',
        coordinates: { latitude: anomaly.latitude, longitude: anomaly.longitude },
        fire_radiative_power_mw: anomaly.frp || anomaly.features?.frp || 45.0,
        threat_level: anomaly.prediction?.threat_level || 'CRITICAL',
        classification: {
          category: anomaly.prediction?.class_label || 'INDUSTRIAL_FIRE',
          confidence: anomaly.prediction?.industrial_probability || 0.98,
          model_version: 'XGBoost-GEOINT-v1.0',
          is_industrial: anomaly.prediction?.class_label === 'INDUSTRIAL_FIRE',
        },
        affected_facility: {
          name: anomaly.cluster_name || 'Industrial Facility',
          osm_tag: 'industrial=petrochemical',
          distance_km: 0.2
        },
        jurisdiction: {
          state: anomaly.state || 'Gujarat',
          district: anomaly.district || 'Surat',
          primary_responder: anomaly.osm_enrichment?.jurisdiction?.fire_station || 'District Emergency Response Center',
          emergency_phone: anomaly.osm_enrichment?.jurisdiction?.contact || '+91-261-2423400',
        },
        navigation: {
          google_maps_url: `https://www.google.com/maps/dir/?api=1&destination=${anomaly.latitude.toFixed(6)},${anomaly.longitude.toFixed(6)}`,
          coordinates_dms: `${anomaly.latitude}°N, ${anomaly.longitude}°E`,
          destination_query: `${anomaly.latitude},${anomaly.longitude}`
        },
        tactical_assessment: {
          threat_level: anomaly.prediction?.threat_level || 'CRITICAL',
          evacuation_radius_m: anomaly.osm_enrichment?.jurisdiction?.evacuation_radius_m || 2000,
          hazmat_classification: anomaly.osm_enrichment?.primary_hazard || 'Level 4 Critical Petrochemical Hazard'
        }
      };
      setActiveSitrep(synthSitrep);
    }
  };

  const handleHoverAnomaly = (
    anomaly: EnrichedAnomaly | null, 
    coords?: { x: number; y: number }
  ) => {
    setHoveredAnomaly(anomaly);
    setHoverCoords(coords);
  };

  const handleOpenSitrep = (sitrep: SitrepAlert) => {
    setActiveSitrep(sitrep);
  };

  return (
    <div className="relative w-screen h-screen flex flex-col bg-[#06090e] text-slate-100 overflow-hidden tactical-grid-bg">
      {/* 1. Header & KPI Cards */}
      <TelemetryHeader 
        anomalies={anomalies} 
        sitreps={sitreps} 
      />

      {/* 2. Controls Toolbar */}
      <ControlToolbar
        layers={layers}
        onToggleLayer={handleToggleLayer}
        threatFilter={threatFilter}
        onSetThreatFilter={setThreatFilter}
        cameraPreset={cameraPreset}
        onSetCameraPreset={setCameraPreset}
        totalCounts={totalCounts}
      />

      {/* 3. Main Workspace: Alert Feed + 3D WebGIS Canvas */}
      <div className="relative flex-1 flex w-full h-full overflow-hidden">
        {/* Left: Real-time SITREP feed */}
        <AlertFeed
          sitreps={sitreps}
          anomalies={anomalies}
          selectedAnomalyId={selectedAnomaly?.anomaly_id}
          onSelectAnomaly={handleSelectAnomaly}
          onOpenSitrep={handleOpenSitrep}
          threatFilter={threatFilter}
        />

        {/* Center / Right: Hardware-Accelerated Three.js 3D WebGIS Canvas */}
        <main className="relative flex-1 h-full w-full bg-[#06090e] overflow-hidden">
          <GeoIntCanvas3D
            anomalies={anomalies}
            clusters={clusters}
            layers={layers}
            threatFilter={threatFilter}
            cameraPreset={cameraPreset}
            selectedAnomalyId={selectedAnomaly?.anomaly_id}
            onSelectAnomaly={handleSelectAnomaly}
            onHoverAnomaly={handleHoverAnomaly}
          />

          {/* Tactical Overlay HUD Compass / Status in bottom right */}
          <div className="absolute bottom-3 right-3 z-10 pointer-events-none flex flex-col items-end gap-1 font-mono text-[10px] text-slate-400">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#080d18]/85 border border-slate-800 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>3D WEBGL ENGINE: THREE.JS v0.185.1</span>
              <span className="text-slate-400">•</span>
              <span className="text-emerald-400 font-semibold">60 FPS</span>
            </div>
            <div className="text-[9px] text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800/60">
              L-CLICK: ROTATE ORBIT • R-CLICK: PAN • SCROLL: ZOOM • CLICK HOTSPOT: SITREP
            </div>
          </div>
        </main>
      </div>

      {/* 4. Hover Tooltip */}
      <HotspotTooltip 
        anomaly={hoveredAnomaly} 
        coords={hoverCoords} 
      />

      {/* 5. SITREP Modal / Drawer */}
      {activeSitrep && (
        <SitrepModal
          sitrep={activeSitrep}
          anomaly={selectedAnomaly}
          onClose={() => setActiveSitrep(null)}
        />
      )}
    </div>
  );
};
