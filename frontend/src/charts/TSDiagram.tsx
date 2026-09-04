import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TSData {
  temp: number;
  salinity: number;
  depth: number;
}

interface Props {
  data: TSData[];
}

const chartDefaults = {
  axisStroke: '#94a3b8',
  tickFill: '#94a3b8',
  gridStroke: 'rgba(30, 41, 59, 0.4)',
};

export const TSDiagram: React.FC<Props> = ({ data }) => {
  return (
    <div 
      role="img" 
      aria-label="Temperature-Salinity diagram plotting in-situ water mass observations against practical salinity PSU and temperature Celsius"
      className="w-full h-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={chartDefaults.gridStroke} />
        
        {/* Salinity on X, Temp on Y is standard TS diagram */}
        <XAxis 
          type="number" 
          dataKey="salinity" 
          name="Salinity" 
          unit=" PSU" 
          domain={['auto', 'auto']}
          stroke={chartDefaults.axisStroke} 
          tick={{ fill: chartDefaults.tickFill, fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}
        />
        
        <YAxis 
          type="number" 
          dataKey="temp" 
          name="Temperature" 
          unit="°C" 
          domain={['auto', 'auto']}
          stroke={chartDefaults.axisStroke} 
          tick={{ fill: chartDefaults.tickFill, fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}
        />
        
        <Tooltip 
          cursor={{ strokeDasharray: '3 3' }}
          contentStyle={{ 
            background: 'rgba(15, 23, 42, 0.95)', 
            border: '1px solid #1e293b', 
            borderRadius: '8px', 
            fontFamily: 'JetBrains Mono, monospace', 
            fontSize: '12px', 
            color: '#e0f7fa' 
          }}
          formatter={(value: any, name: any) => [value.toFixed(2), name]}
        />
        
        {/* Plotting points, AAIW cluster will appear based on data generated */}
        <Scatter name="Water Mass" data={data} fill="#00e5ff" opacity={0.6} />
      </ScatterChart>
    </ResponsiveContainer>
    </div>
  );
};
