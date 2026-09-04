import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { MissionContext } from './missionContextDef';
import type { MissionState, MissionPhase } from './missionContextDef';

export const MissionProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<MissionState>({
    depth: 0,
    phase: 'SURFACE',
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
    
    const fetchTelemetry = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/telemetry', { signal: AbortSignal.timeout(2000) });
        if (res.ok) {
          const json = await res.json();
          
          setState(prev => {
            const newLogs = [...prev.logs];
            // Periodically log telemetry data
            if (prev.uptime % 5 === 0) {
              newLogs.push({
                id: logId++,
                time: new Date().toISOString().substring(11,19),
                message: `TELEM: DPTH ${json.depth_m.toFixed(1)}m | BATT ${json.battery_pct.toFixed(1)}% | STATE ${json.mission_state}`,
                type: 'DATA'
              });
              if (newLogs.length > 50) newLogs.shift();
            }

            return {
              ...prev,
              depth: json.depth_m,
              phase: json.mission_state as MissionPhase,
              battery: json.battery_pct,
              uptime: json.uptime_s,
              internalTemp: json.temperature_c + 2.5, // Derived from ambient
              hullPressure: 1.01 + (json.depth_m / 10000), 
              powerDraw: json.mission_state === 'SURVEY' ? 120.5 : 45.2,
              cpuLoad: json.mission_state === 'SURVEY' ? 88 : 15,
              commsOnline: true,
              logs: newLogs,
              cacheSize: json.mission_state === 'SURFACE' ? 0 : prev.cacheSize + 1
            };
          });
        }
      } catch {
        setState(prev => {
          const newLogs = [...prev.logs];
          newLogs.push({
            id: logId++,
            time: new Date().toISOString().substring(11,19),
            message: `ACOUSTIC_TIMEOUT - AWAITING SYNC...`,
            type: 'WARN'
          });
          if (newLogs.length > 50) newLogs.shift();
          return { ...prev, commsOnline: false, logs: newLogs };
        });
      }
    };

    fetchTelemetry();
    const tick = setInterval(fetchTelemetry, 1000);

    return () => clearInterval(tick);
  }, []);

  return (
    <MissionContext.Provider value={state}>
      {children}
    </MissionContext.Provider>
  );
};
