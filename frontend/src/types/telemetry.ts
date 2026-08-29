export type DataSource = 'LIVE' | 'VIRTUAL' | 'DATASET' | 'PLANNED';
export type MetricStatus = 'nominal' | 'degraded' | 'dropout' | 'offline';
export type TrendDir = 'up' | 'down' | 'stable';

export interface TelemetryReading {
  label: string;
  value: string;
  unit: string;
  source: DataSource;
  depth?: string;
  timestamp?: string;
  status?: MetricStatus;
  trend?: TrendDir;
}
