import React from 'react';
import { 
  Layers, 
  Eye, 
  EyeOff, 
  Filter, 
  Compass, 
  RotateCcw, 
  MapPin, 
  Flame, 
  ShieldAlert, 
  Grid 
} from 'lucide-react';
import { LayerVisibility, ThreatFilter, CameraPreset } from '../types';

interface ControlToolbarProps {
  layers: LayerVisibility;
  onToggleLayer: (key: keyof LayerVisibility) => void;
  threatFilter: ThreatFilter;
  onSetThreatFilter: (filter: ThreatFilter) => void;
  cameraPreset: CameraPreset;
  onSetCameraPreset: (preset: CameraPreset) => void;
  totalCounts: {
    all: number;
    critical: number;
    high: number;
    elevated: number;
    wildfire: number;
  };
}

export const ControlToolbar: React.FC<ControlToolbarProps> = ({
  layers,
  onToggleLayer,
  threatFilter,
  onSetThreatFilter,
  cameraPreset,
  onSetCameraPreset,
  totalCounts,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-[#080d18]/90 border-b border-slate-800/80 backdrop-blur-sm text-xs font-mono select-none">
      {/* 1. Threat Filters */}
      <div className="flex items-center gap-1 overflow-x-auto py-0.5">
        <div className="flex items-center gap-1.5 px-2 py-1 text-slate-400 border-r border-slate-800 mr-1">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="uppercase text-[10px] tracking-wider">Threat Filter:</span>
        </div>

        <button
          onClick={() => onSetThreatFilter('ALL')}
          className={`px-2 py-1 rounded transition flex items-center gap-1 ${
            threatFilter === 'ALL'
              ? 'bg-slate-700 text-white font-semibold shadow'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <span>ALL</span>
          <span className="text-[10px] px-1 rounded bg-slate-800 text-slate-300">
            {totalCounts.all}
          </span>
        </button>

        <button
          onClick={() => onSetThreatFilter('CRITICAL')}
          className={`px-2 py-1 rounded transition flex items-center gap-1 ${
            threatFilter === 'CRITICAL'
              ? 'bg-red-600 text-white font-bold shadow-lg shadow-red-950'
              : 'bg-slate-900/60 text-red-400 hover:text-red-300 border border-red-900/50'
          }`}
        >
          <ShieldAlert className="w-3 h-3" />
          <span>CRITICAL</span>
          <span className="text-[10px] px-1 rounded bg-red-950/80 text-red-300">
            {totalCounts.critical}
          </span>
        </button>

        <button
          onClick={() => onSetThreatFilter('HIGH')}
          className={`px-2 py-1 rounded transition flex items-center gap-1 ${
            threatFilter === 'HIGH'
              ? 'bg-orange-600 text-white font-bold shadow'
              : 'bg-slate-900/60 text-orange-400 hover:text-orange-300 border border-orange-900/50'
          }`}
        >
          <Flame className="w-3 h-3" />
          <span>HIGH</span>
          <span className="text-[10px] px-1 rounded bg-orange-950/80 text-orange-300">
            {totalCounts.high}
          </span>
        </button>

        <button
          onClick={() => onSetThreatFilter('ELEVATED')}
          className={`px-2 py-1 rounded transition flex items-center gap-1 ${
            threatFilter === 'ELEVATED'
              ? 'bg-amber-600 text-white font-bold shadow'
              : 'bg-slate-900/60 text-amber-400 hover:text-amber-300 border border-amber-900/50'
          }`}
        >
          <span>ELEVATED</span>
          <span className="text-[10px] px-1 rounded bg-amber-950/80 text-amber-300">
            {totalCounts.elevated}
          </span>
        </button>

        <button
          onClick={() => onSetThreatFilter('WILDFIRE')}
          className={`px-2 py-1 rounded transition flex items-center gap-1 ${
            threatFilter === 'WILDFIRE'
              ? 'bg-emerald-700 text-white font-semibold shadow'
              : 'bg-slate-900/60 text-emerald-400 hover:text-emerald-300 border border-emerald-900/50'
          }`}
        >
          <span>RURAL/WILD</span>
          <span className="text-[10px] px-1 rounded bg-emerald-950/80 text-emerald-300">
            {totalCounts.wildfire}
          </span>
        </button>
      </div>

      {/* 2. Layer Visibility Toggles */}
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-1 px-2 py-1 text-slate-400 border-r border-slate-800 mr-1">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <span className="uppercase text-[10px] tracking-wider hidden sm:inline">Layers:</span>
        </div>

        <button
          onClick={() => onToggleLayer('thermalPillars')}
          className={`px-2 py-1 rounded border transition flex items-center gap-1.5 ${
            layers.thermalPillars
              ? 'bg-red-500/20 border-red-500/50 text-red-300'
              : 'bg-slate-900/40 border-slate-800 text-slate-500'
          }`}
          title="Toggle 3D Thermal Heat Pillars"
        >
          {layers.thermalPillars ? <Eye className="w-3 h-3 text-red-400" /> : <EyeOff className="w-3 h-3" />}
          <span>FRP Pillars</span>
        </button>

        <button
          onClick={() => onToggleLayer('industrialZones')}
          className={`px-2 py-1 rounded border transition flex items-center gap-1.5 ${
            layers.industrialZones
              ? 'bg-sky-500/20 border-sky-500/50 text-sky-300'
              : 'bg-slate-900/40 border-slate-800 text-slate-500'
          }`}
          title="Toggle 2km Industrial Danger Zones"
        >
          {layers.industrialZones ? <Eye className="w-3 h-3 text-sky-400" /> : <EyeOff className="w-3 h-3" />}
          <span>2km Zones</span>
        </button>

        <button
          onClick={() => onToggleLayer('coordinateGrid')}
          className={`px-2 py-1 rounded border transition flex items-center gap-1.5 ${
            layers.coordinateGrid
              ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
              : 'bg-slate-900/40 border-slate-800 text-slate-500'
          }`}
          title="Toggle Subcontinent Coordinate Grid"
        >
          {layers.coordinateGrid ? <Grid className="w-3 h-3 text-blue-400" /> : <EyeOff className="w-3 h-3" />}
          <span className="hidden md:inline">Geo Grid</span>
        </button>
      </div>

      {/* 3. Camera View Presets */}
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-1 px-2 py-1 text-slate-400 border-r border-slate-800 mr-1">
          <Compass className="w-3.5 h-3.5 text-slate-400" />
          <span className="uppercase text-[10px] tracking-wider hidden sm:inline">Camera:</span>
        </div>

        <button
          onClick={() => onSetCameraPreset('ISOMETRIC')}
          className={`px-2 py-1 rounded border transition ${
            cameraPreset === 'ISOMETRIC'
              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-semibold'
              : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          3D
        </button>

        <button
          onClick={() => onSetCameraPreset('ORTHO')}
          className={`px-2 py-1 rounded border transition ${
            cameraPreset === 'ORTHO'
              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-semibold'
              : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          2D Nadir
        </button>

        <button
          onClick={() => onSetCameraPreset('WEST')}
          className={`px-2 py-1 rounded border transition hidden lg:inline ${
            cameraPreset === 'WEST'
              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-semibold'
              : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title="Focus on Hazira, Dahej & Trombay"
        >
          West Belt
        </button>

        <button
          onClick={() => onSetCameraPreset('EAST')}
          className={`px-2 py-1 rounded border transition hidden lg:inline ${
            cameraPreset === 'EAST'
              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-semibold'
              : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title="Focus on Haldia, Korba & Angul"
        >
          East Belt
        </button>

        <button
          onClick={() => onSetCameraPreset('RESET')}
          className="px-2 py-1 rounded bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-700 transition flex items-center gap-1"
          title="Reset Camera View"
        >
          <RotateCcw className="w-3 h-3" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>
    </div>
  );
};
