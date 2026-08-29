import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export type MissionPhase = 'SURFACE' | 'DESCENDING' | 'SURVEY' | 'ASCENDING';

export interface LogEntry {
  id: number;
  time: string;
  message: string;
  type: 'INFO' | 'WARN' | 'ERROR' | 'DATA';
}

interface MissionState {
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

const MissionContext = createContext<MissionState | null>(null);

export const useMission = () => {
  const ctx = useContext(MissionContext);
  if (!ctx) throw new Error("useMission must be used within MissionProvider");
  return ctx;
};

export const MissionProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<MissionState>({
    depth: 0,
    phase: 'DESCENDING',
    battery: 100,
    uptime: 0,
    internalTemp: 22.0,
    hullPressure: 1.01,
    powerDraw: 15.0,
    cpuLoad: 12,
    commsOnline: true,
    logs: [],
    cacheSize: 0,
  });

  useEffect(() => {
    let logId = 0;
    
    const tick = setInterval(() => {
      setState(prev => {
        let { depth, phase, battery, uptime, internalTemp, hullPressure, powerDraw, cpuLoad, commsOnline, logs, cacheSize } = prev;
        
        uptime += 1;
        
        // Phase logic
        if (phase === 'SURFACE') {
          depth = 0;
          powerDraw = 45; 
          cpuLoad = 15;
          if (uptime % 10 === 0) phase = 'DESCENDING'; 
        } 
        else if (phase === 'DESCENDING') {
          depth += 4.5; 
          powerDraw = 25; 
          cpuLoad = 20;
          if (depth >= 1000) {
            depth = 1000;
            phase = 'SURVEY';
          }
        }
        else if (phase === 'SURVEY') {
          depth = 1000 + (Math.random() - 0.5) * 2; 
          powerDraw = 120 + Math.random() * 20; 
          cpuLoad = 85 + Math.random() * 10; 
          if (uptime % 100 === 0) phase = 'ASCENDING'; // Survey duration
        }
        else if (phase === 'ASCENDING') {
          depth -= 5.5; 
          powerDraw = 40; 
          cpuLoad = 20;
          if (depth <= 0) {
            depth = 0;
            phase = 'SURFACE';
          }
        }

        const externalTemp = Math.max(1.5, 20 - (depth / 100)); 
        const targetInternalTemp = externalTemp + (cpuLoad / 5);
        internalTemp += (targetInternalTemp - internalTemp) * 0.05;
        
        hullPressure = 1.01 + (depth / 10000); 

        battery = Math.max(0, battery - (powerDraw / 3600)); 

        const inThermocline = depth > 50 && depth < 100;
        if (inThermocline || Math.random() > 0.95) {
          commsOnline = false;
        } else if (Math.random() > 0.3) {
          commsOnline = true;
        }

        if (!commsOnline) {
          cacheSize += Math.floor(Math.random() * 3) + 1;
        } else if (cacheSize > 0) {
          cacheSize = Math.max(0, cacheSize - 15);
        }

        const newLogs = [...logs];
        if (commsOnline) {
          if (Math.random() > 0.6) {
            const hex = Array.from({length: 4}, () => Math.floor(Math.random()*256).toString(16).padStart(2, '0')).join(' ');
            newLogs.push({
              id: logId++,
              time: new Date().toISOString().substring(11,19),
              message: `RECV [${hex.toUpperCase()}] HULL_TELEM OK`,
              type: 'DATA'
            });
          }
          if (cacheSize > 0 && Math.random() > 0.5) {
            newLogs.push({
              id: logId++,
              time: new Date().toISOString().substring(11,19),
              message: `SYNC FLUSH - BATCH 15 RECORDS`,
              type: 'INFO'
            });
          }
          if (phase === 'SURVEY' && Math.random() > 0.7) {
            newLogs.push({
              id: logId++,
              time: new Date().toISOString().substring(11,19),
              message: `AI_DETECT_CONF: ${(85 + Math.random()*10).toFixed(1)}%`,
              type: 'INFO'
            });
          }
        } else {
          if (Math.random() > 0.8) {
             newLogs.push({
              id: logId++,
              time: new Date().toISOString().substring(11,19),
              message: `ACOUSTIC_TIMEOUT - AWAITING SYNC...`,
              type: 'WARN'
            });
          }
        }
        
        if (newLogs.length > 50) newLogs.shift();

        return { depth, phase, battery, uptime, internalTemp, hullPressure, powerDraw, cpuLoad, commsOnline, logs: newLogs, cacheSize };
      });
    }, 1000);

    return () => clearInterval(tick);
  }, []);

  return (
    <MissionContext.Provider value={state}>
      {children}
    </MissionContext.Provider>
  );
};
