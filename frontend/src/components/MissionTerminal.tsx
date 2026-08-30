import { useEffect, useState, useRef } from 'react';

const MESSAGES = [
  '[{TIME}] RECV PING {NUM}: DEPTH {NUM}m | TEMP -{TEMP}°C | STATUS: NOMINAL',
  '[{TIME}] SAHI INFERENCE: Slice {N}/{TOTAL} — {PCT}% complete',
  '[{TIME}] DETECTION: Ghost Net | Conf: {CONF} | Lat: -54.{N} | Lon: 72.{N}',
  '[{TIME}] SATCOM UPLINK: Transmitting {SIZE}KB payload to MoES-DASH',
  '[{TIME}] AUV BATTERY: {PCT}% | ETA SURFACE: {MIN}min',
  '[{TIME}] WARNING: Acoustic shadow penalty applied — confidence adjusted',
  '[{TIME}] ALERT: New debris field detected at -54.231°S 72.018°E',
  '[{TIME}] SYSTEM: Edge AI mode active — SATCOM radio silence'
];

interface LogLine {
  id: number;
  text: string;
  type: 'normal' | 'warning' | 'alert' | 'system' | 'detection';
}

export default function MissionTerminal({ height = 300 }: { height?: number | string }) {
  const [logs, setLogs] = useState<LogLine[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    let idCounter = 0;
    
    const interval = setInterval(() => {
      const template = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
      const now = new Date();
      const timeStr = now.toISOString().split('T')[1].substring(0, 8);
      
      let text = template
        .replace('{TIME}', timeStr)
        .replace(/{NUM}/g, () => Math.floor(Math.random() * 900 + 100).toString())
        .replace('{TEMP}', (Math.random() * 2 + 1).toFixed(1))
        .replace('{N}', Math.floor(Math.random() * 10 + 1).toString())
        .replace('{TOTAL}', '10')
        .replace(/{PCT}/g, Math.floor(Math.random() * 100).toString())
        .replace('{CONF}', (Math.random() * 0.5 + 0.5).toFixed(2))
        .replace('{SIZE}', Math.floor(Math.random() * 5000 + 1000).toString())
        .replace('{MIN}', Math.floor(Math.random() * 60 + 10).toString());
        
      let type: LogLine['type'] = 'normal';
      if (text.includes('WARNING')) type = 'warning';
      else if (text.includes('ALERT')) type = 'alert';
      else if (text.includes('SYSTEM') || text.includes('DETECTION')) type = 'system';
      
      if (text.includes('DETECTION')) type = 'detection';

      setLogs(prev => {
        const newLogs = [...prev, { id: idCounter++, text, type }];
        if (newLogs.length > 50) return newLogs.slice(-50);
        return newLogs;
      });
    }, 1500);
    
    return () => clearInterval(interval);
  }, []);

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
        if (log.type === 'warning') colorClass = 'text-yellow-400';
        if (log.type === 'alert') colorClass = 'text-red-500';
        if (log.type === 'system' || log.type === 'detection') colorClass = 'text-cyan-400';
        
        return (
          <div key={log.id} className={`${colorClass} text-sm mb-1 break-words`}>
            {log.text}
          </div>
        );
      })}
      <div className="text-[#00ff41] text-sm animate-pulse mt-1">▋</div>
    </div>
  );
}
