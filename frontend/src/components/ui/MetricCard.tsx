
import { WifiOff } from 'lucide-react';
import { SourceBadge } from './SourceBadge';
import type { TelemetryReading } from '../../types/telemetry';

interface MetricCardProps extends TelemetryReading {
  icon?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({ 
  label, value, unit, source, depth, timestamp, status = 'nominal', icon 
}) => {
  const isDropout = status === 'dropout';
  const isDegraded = status === 'degraded';
  
  let baseClass = 'bg-ocean-800/60 backdrop-blur-md border border-white/[0.07] rounded-lg transition-all duration-200 hover:bg-ocean-700/65 hover:border-ice-500/25 p-5 relative overflow-hidden group';
  
  if (isDegraded) {
    baseClass = 'bg-ocean-800/60 backdrop-blur-md border border-health-degraded/40 rounded-lg p-5 relative overflow-hidden group';
  } else if (isDropout) {
    baseClass = 'bg-ocean-800/40 backdrop-blur-[8px] border border-steel-400/15 rounded-lg p-5 relative overflow-hidden';
  }

  return (
    <div className={baseClass}>
      {!isDropout && (
        <div className="absolute top-0 right-0 w-20 h-20 bg-ice-500/5 rounded-md blur-2xl group-hover:bg-ice-500/10 transition-all duration-500 pointer-events-none" aria-hidden="true" />
      )}
      
      {isDropout && (
        <div className="absolute inset-0 rounded-lg pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(148, 163, 184, 0.04) 8px, rgba(148, 163, 184, 0.04) 16px)' }} aria-hidden="true" />
      )}

      <div className="flex items-center justify-between mb-3 relative z-10">
        <SourceBadge source={source} />
        {icon && !isDropout && (
          <div className={`p-1.5 rounded-lg bg-steel-800/80 border border-steel-800 ${isDegraded ? 'text-health-degraded' : 'text-ice-500'}`} aria-hidden="true">
            {icon}
          </div>
        )}
      </div>

      <p className="text-xs font-semibold uppercase tracking-wider text-steel-400 mb-2 font-sans relative z-10">
        {label}
      </p>

      <div className="flex items-baseline gap-2 mb-3 relative z-10" aria-live="polite">
        {isDropout ? (
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-steel-400" aria-hidden="true" />
            <span className="text-sm font-mono text-steel-400 uppercase tracking-wider">
              Signal Lost
            </span>
          </div>
        ) : (
          <>
            <span className={`text-4xl font-bold tracking-tight font-mono ${isDegraded ? 'text-health-degraded' : 'text-ice-100'}`}>
              {value}
            </span>
            <span className="text-sm font-mono text-steel-400">{unit}</span>
          </>
        )}
      </div>

      {(depth || timestamp) && (
        <p className={`text-xs font-mono relative z-10 ${isDropout ? 'text-steel-400/60 mt-1' : 'text-steel-400'}`}>
          {isDropout && 'Last: '}
          {depth && `Depth: ${depth} · `}
          {timestamp && `Updated ${timestamp} UTC`}
        </p>
      )}
    </div>
  );
};
