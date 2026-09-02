import { useEffect, useRef } from 'react';
import { useMission } from './layout/MissionContext';

export default function MissionTerminal({ height = 300 }: { height?: number | string }) {
  const { logs } = useMission();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div 
      className="bg-black font-mono p-4 overflow-y-auto relative border border-cyan-900/50 rounded"
      style={{ height, fontFamily: '"JetBrains Mono", monospace' }}
      ref={scrollRef}
    >
      {logs.map(log => {
        let colorClass = 'text-[#00ff41]'; // normal
        if (log.type === 'WARN') colorClass = 'text-yellow-400';
        if (log.type === 'ERROR') colorClass = 'text-red-500';
        if (log.type === 'DATA') colorClass = 'text-cyan-400';
        
        return (
          <div key={log.id} className={`${colorClass} text-sm mb-1 break-words`}>
            [{log.time}] {log.message}
          </div>
        );
      })}
      <div className="text-[#00ff41] text-sm animate-pulse mt-1">▋</div>
    </div>
  );
}
