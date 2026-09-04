import { useEffect, useRef } from 'react';
import { useMission } from './layout/useMission';

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
      role="log"
      aria-label="Mission terminal datastream log"
      tabIndex={0}
      className="bg-black font-mono p-4 overflow-y-auto relative border border-white/10 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
      style={{ height, fontFamily: '"JetBrains Mono", monospace' }}
      ref={scrollRef}
    >
      {logs.map(log => {
        let colorClass = 'text-[#00ff41]'; // normal
        if (log.type === 'WARN') colorClass = 'text-zinc-400';
        if (log.type === 'ERROR') colorClass = 'text-red-500';
        if (log.type === 'DATA') colorClass = 'text-zinc-300';
        
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
