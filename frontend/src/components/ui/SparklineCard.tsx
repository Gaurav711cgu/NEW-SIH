import { LineChart, Line, ResponsiveContainer, YAxis, ReferenceLine } from 'recharts';
import { SourceBadge } from './SourceBadge';
import type { TelemetryReading } from '../../types/telemetry';

type SparklineData = Record<string, number>;

interface SparklineCardProps extends TelemetryReading {
  data: SparklineData[];
  dataKey: string;
  color: string;
  icon?: React.ReactNode;
  trendValue?: string;
}

export const SparklineCard: React.FC<SparklineCardProps> = ({ 
  label, value, unit, source, status = 'nominal', data, dataKey, color, trendValue
}) => {
  const isDropout = status === 'dropout';
  const numericValue = parseFloat(value);
  
  const baseClass = isDropout 
    ? 'bg-ocean-800/40 backdrop-blur-[8px] border border-steel-400/15 rounded-lg p-5 relative overflow-hidden'
    : 'bg-ocean-800/60 backdrop-blur-md border border-white/[0.07] rounded-lg p-5 relative overflow-hidden transition-all duration-200 hover:bg-ocean-700/65 hover:border-ice-500/25';

  return (
    <div className={baseClass}>
      {isDropout && (
        <div className="absolute inset-0 rounded-lg pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(148, 163, 184, 0.04) 8px, rgba(148, 163, 184, 0.04) 16px)' }} aria-hidden="true" />
      )}
      
      <div className="flex items-start justify-between mb-2 relative z-10">
        <SourceBadge source={source} />
      </div>
      
      <p className="text-xs font-semibold uppercase tracking-wider text-steel-400 mb-4 font-sans relative z-10">
        {label}
      </p>

      <div 
        role="img" 
        aria-label={`Telemetry trend line for ${label}, current value ${isDropout ? 'signal lost' : `${value} ${unit}`}`}
        className="h-12 w-full mb-4 relative z-10"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <YAxis domain={['auto', 'auto']} hide />
            {!isDropout ? (
              <Line 
                type="monotone" 
                dataKey={dataKey} 
                stroke={color} 
                strokeWidth={1.5} 
                dot={false} 
                isAnimationActive={false} 
              />
            ) : (
              <ReferenceLine 
                y={numericValue} 
                stroke="#64748b" 
                strokeDasharray="4 4" 
                strokeWidth={1} 
              />
            )}
          </LineChart>
        </ResponsiveContainer>
        {isDropout && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-steel-900/80 px-2 py-1 rounded text-xs font-mono text-steel-400 uppercase tracking-widest border border-steel-800">
              Signal Lost
            </span>
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between relative z-10">
        <div className="flex items-baseline gap-2" aria-live="polite">
          <span className={`text-2xl font-bold tracking-tight font-mono ${isDropout ? 'text-steel-400' : 'text-ice-100'}`}>
            {isDropout ? '———' : value}
          </span>
          <span className="text-xs font-mono text-steel-400">{unit}</span>
        </div>
        {trendValue && !isDropout && (
          <span className="text-xs font-mono text-steel-400">{trendValue}</span>
        )}
      </div>
    </div>
  );
};
