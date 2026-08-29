import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ProfileData {
  depth: number;
  [key: string]: number;
}

interface Props {
  data: ProfileData[];
  dataKey: string;
  color: string;
  title?: string;
  unit?: string;
}

const chartDefaults = {
  axisStroke: '#475569',
  tickFill: '#94a3b8',
  gridStroke: 'rgba(30, 41, 59, 0.4)',
};

export const DepthProfileChart: React.FC<Props> = ({ data, dataKey, color, title, unit }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart 
        data={data} 
        layout="vertical" 
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      >
        <defs>
          <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        
        <CartesianGrid strokeDasharray="3 3" stroke={chartDefaults.gridStroke} />
        
        {/* XAxis should be the metric value (temp, DO, etc) */}
        <XAxis 
          type="number" 
          stroke={chartDefaults.axisStroke} 
          tick={{ fill: chartDefaults.tickFill, fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}
          domain={['auto', 'auto']}
        />
        
        {/* YAxis is depth (inverted) */}
        <YAxis 
          dataKey="depth" 
          type="number" 
          reversed 
          stroke={chartDefaults.axisStroke} 
          tick={{ fill: chartDefaults.tickFill, fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}
        />
        
        <Tooltip 
          contentStyle={{ 
            background: 'rgba(15, 23, 42, 0.95)', 
            border: '1px solid #1e293b', 
            borderRadius: '8px', 
            fontFamily: 'JetBrains Mono, monospace', 
            fontSize: '12px', 
            color: '#e0f7fa' 
          }}
          formatter={(value: any) => [value.toFixed(2) + (unit ? ` ${unit}` : ''), title || dataKey]}
          labelFormatter={(label) => `Depth: ${label}m`}
        />
        
        <Area 
          type="monotone" 
          dataKey={dataKey} 
          fill={`url(#gradient-${dataKey})`} 
          stroke={color} 
          strokeWidth={2} 
          dot={false} 
          animationDuration={400} 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
