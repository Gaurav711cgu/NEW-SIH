import { useState, useEffect } from 'react';
import type { ComponentType } from 'react';
import { Activity, Database, Cpu } from 'lucide-react';

interface StatusIndicatorProps {
  label: string;
  active: boolean;
  icon: ComponentType<{ size?: number; className?: string }>;
}

function StatusIndicator({ label, active, icon: Icon }: StatusIndicatorProps) {
  return (
    <div className="flex items-center justify-between px-1 group">
      <div className="flex items-center gap-2">
        <Icon size={12} className={
          active 
            ? "text-health-nominal group-hover:text-ice-400" 
            : "text-health-degraded animate-pulse glitch-text"
        } data-text={label} />
        <span className={`${active ? 'text-steel-400' : 'text-red-500 font-bold'}`}>{label}</span>
      </div>
      <div className={`w-1.5 h-1.5 rounded-full ${
        active 
          ? 'bg-health-nominal shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]' 
          : 'bg-red-500 animate-ping shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
      }`} />
    </div>
  );
}

export function SystemStatusRow() {
  const [modelReady, setModelReady] = useState<boolean | null>(null);
  
  useEffect(() => {
    let cancelled = false;
    const checkHealth = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/health');
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!cancelled) setModelReady(data.model_ready);
      } catch {
        if (!cancelled) setModelReady(false);
      }
    };
    
    checkHealth();
    const interval = setInterval(checkHealth, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="mt-auto p-4 border-t border-steel-800/60 hidden md:block relative overflow-hidden">
      {/* Background hazard stripes if critical */}
      {modelReady === false && (
        <div className="absolute inset-0 opacity-10"
             style={{ backgroundImage: 'repeating-linear-gradient(45deg, #ef4444, #ef4444 10px, transparent 10px, transparent 20px)' }} />
      )}
      
      <h3 className="text-[10px] font-mono font-bold text-steel-500 uppercase tracking-widest mb-3 px-1 relative z-10 flex justify-between">
        <span>System Core</span>
        {modelReady === false && <span className="text-red-500 animate-pulse">FAIL_DETECTED</span>}
      </h3>
      
      <div className="space-y-3 font-mono text-[10px] uppercase tracking-wider relative z-10">
        <StatusIndicator label="Telemetry" active={true} icon={Activity} />
        <StatusIndicator label="AI Engine" active={modelReady !== false} icon={Cpu} />
        <StatusIndicator label="Store Link" active={true} icon={Database} />
      </div>
    </div>
  );
}
