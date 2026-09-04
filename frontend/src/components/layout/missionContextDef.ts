import { createContext } from 'react';

export type MissionPhase = 'SURFACE' | 'DESCENDING' | 'SURVEY' | 'ASCENDING';

export interface LogEntry {
  id: number;
  time: string;
  message: string;
  type: 'INFO' | 'WARN' | 'ERROR' | 'DATA';
}

export interface MissionState {
  depth: number;
  phase: MissionPhase;
  battery: number;
  uptime: number;
  internalTemp: number;
  hullPressure: number;
  powerDraw: number;
  cpuLoad: number;
  commsOnline: boolean;
  logs: LogEntry[];
  cacheSize: number;
}

export const MissionContext = createContext<MissionState | null>(null);
