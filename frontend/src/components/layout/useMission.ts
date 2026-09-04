import { useContext } from 'react';
import { MissionContext } from './missionContextDef';

export const useMission = () => {
  const ctx = useContext(MissionContext);
  if (!ctx) throw new Error("useMission must be used within MissionProvider");
  return ctx;
};
