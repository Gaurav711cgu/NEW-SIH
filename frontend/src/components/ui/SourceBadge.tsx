
import type { DataSource } from '../../types/telemetry';

const badgeConfig: Record<DataSource, { bg: string; border: string; text: string; dot: boolean }> = {
  LIVE: {
    bg: 'bg-ice-500/10',
    border: 'border-ice-500/40',
    text: 'text-ice-500',
    dot: true,
  },
  VIRTUAL: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-400/40',
    text: 'text-purple-400',
    dot: false,
  },
  DATASET: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-400/40',
    text: 'text-emerald-400',
    dot: false,
  },
  PLANNED: {
    bg: 'bg-orange-500/10',
    border: 'border-orange-400/40',
    text: 'text-orange-400',
    dot: false,
  },
};

interface Props {
  source: DataSource;
}

export const SourceBadge: React.FC<Props> = ({ source }) => {
  const cfg = badgeConfig[source];
  
  return (
    <span 
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider border ${cfg.bg} ${cfg.border} ${cfg.text}`}
      aria-label={`Data source: ${source}`}
    >
      {cfg.dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" aria-hidden="true" />
      )}
      {source}
    </span>
  );
};
