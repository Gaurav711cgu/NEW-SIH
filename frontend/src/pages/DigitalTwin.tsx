import { useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Activity, AlertTriangle, CheckCircle, ShieldAlert, Wrench, Anchor } from 'lucide-react';

// --- MOCK DATA ---
const FLEET_DATA = [
  { id: 'AQUILA-01', name: 'AQUILA-01', status: 'NOMINAL', health: 98, lat: 20, lng: 30, color: '#00ff88' },
  { id: 'AQUILA-02', name: 'AQUILA-02', status: 'WARNING', health: 65, lat: 45, lng: 70, color: '#ffd700' },
  { id: 'AQUILA-03', name: 'AQUILA-03', status: 'NOMINAL', health: 95, lat: 60, lng: 40, color: '#00ff88' },
  { id: 'AQUILA-04', name: 'AQUILA-04', status: 'CRITICAL', health: 25, lat: 35, lng: 80, color: '#ff4444' },
  { id: 'AQUILA-05', name: 'AQUILA-05', status: 'NOMINAL', health: 91, lat: 70, lng: 60, color: '#00ff88' },
  { id: 'AQUILA-06', name: 'AQUILA-06', status: 'NOMINAL', health: 88, lat: 30, lng: 50, color: '#00ff88' },
];

const HEALTH_TIMELINE = Array.from({ length: 30 }, (_, i) => ({
  day: `Day ${i + 1}`,
  score: Math.max(30, 100 - (i * (Math.random() * 2))),
})).reverse();

const COMPONENT_HEALTH = [
  { name: 'Hull', health: 98 },
  { name: 'CTD', health: 65 },
  { name: 'IMU', health: 95 },
  { name: 'Sonar', health: 92 },
  { name: 'Camera', health: 88 },
  { name: 'Battery', health: 25 },
  { name: 'Thrusters', health: 90 },
  { name: 'MCU', health: 99 },
  { name: 'Comms', health: 94 },
  { name: 'GPS', health: 100 },
  { name: 'Ballast', health: 85 },
  { name: 'Lights', health: 91 },
];

const MAINTENANCE_RECS = [
  { component: 'Battery Pack', action: 'Schedule replacement', urgency: 'CRITICAL', days: 2 },
  { component: 'CTD Sensor', action: 'Recalibration required', urgency: 'WARNING', days: 14 },
  { component: 'Thruster Props', action: 'Biofouling cleaning', urgency: 'ROUTINE', days: 30 },
];

const ALERTS = [
  { time: '14:32', unit: 'AQUILA-04', msg: 'Battery SoH dropped below 30%', type: 'CRITICAL' },
  { time: '14:28', unit: 'AQUILA-02', msg: 'Sensor drift detected on CTD (0.03°C)', type: 'WARNING' },
  { time: '14:15', unit: 'AQUILA-01', msg: 'All systems nominal', type: 'NOMINAL' },
  { time: '13:50', unit: 'AQUILA-06', msg: 'Completed survey sector 7G', type: 'NOMINAL' },
  { time: '12:10', unit: 'AQUILA-04', msg: 'Power draw anomalous during descent', type: 'WARNING' },
];

export default function DigitalTwin() {
  const [selectedBuoy, setSelectedBuoy] = useState(FLEET_DATA[0]);

  const activeCount = FLEET_DATA.filter(b => b.status !== 'OFFLINE').length;
  const criticalCount = FLEET_DATA.filter(b => b.status === 'CRITICAL').length;
  const avgHealth = Math.round(FLEET_DATA.reduce((acc, b) => acc + b.health, 0) / FLEET_DATA.length);

  const getHealthColor = (score: number) => {
    if (score >= 70) return '#00ff88';
    if (score >= 40) return '#ffd700';
    return '#ff4444';
  };

  return (
    <div className="min-h-screen bg-[#0a1628] text-white p-6 font-mono overflow-y-auto">
      {/* HEADER */}
      <header className="mb-6 flex items-center justify-between border-b border-cyan-500/30 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-cyan-400 tracking-wider flex items-center gap-3">
            <Activity className="w-6 h-6" />
            AQUILA DIGITAL TWIN — PREDICTIVE MAINTENANCE
          </h1>
          <p className="text-sm text-cyan-200/60 mt-1">Global Fleet Diagnostics & Prognostics</p>
        </div>
        <div className="flex gap-6 bg-black/40 px-6 py-3 rounded-lg border border-cyan-500/20 backdrop-blur-md">
          <div className="flex flex-col items-center">
            <span className="text-xs text-cyan-500/80">ACTIVE FLEET</span>
            <span className="text-xl font-bold">{activeCount}</span>
          </div>
          <div className="w-px bg-cyan-500/20" />
          <div className="flex flex-col items-center">
            <span className="text-xs text-red-400/80">CRITICAL</span>
            <span className="text-xl font-bold text-red-400">{criticalCount}</span>
          </div>
          <div className="w-px bg-cyan-500/20" />
          <div className="flex flex-col items-center">
            <span className="text-xs text-green-400/80">AVG HEALTH</span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-green-400">{avgHealth}%</span>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* MAP SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1 bg-black/40 backdrop-blur-md border border-cyan-500/20 rounded-xl p-4 flex flex-col h-[600px]"
        >
          <h2 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
            <Anchor className="w-5 h-5" />
            ANTARCTIC DEPLOYMENT
          </h2>
          
          <div className="flex-1 relative border border-cyan-500/20 rounded-lg bg-[#050f1a] overflow-hidden group">
            {/* Mock Antarctic Shape */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-20 pointer-events-none text-cyan-400 fill-current">
              <path d="M 50 10 C 70 10, 90 30, 85 60 C 80 80, 50 90, 30 85 C 10 75, 5 45, 15 25 C 25 15, 40 10, 50 10 Z" />
            </svg>
            
            {/* Grid lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#00e5ff1a_1px,transparent_1px),linear-gradient(to_bottom,#00e5ff1a_1px,transparent_1px)] bg-[size:20px_20px]" />

            {/* Buoy Markers */}
            {FLEET_DATA.map((buoy) => (
              <button
                key={buoy.id}
                onClick={() => setSelectedBuoy(buoy)}
                className={`absolute w-4 h-4 -ml-2 -mt-2 rounded-full border-2 transition-transform ${selectedBuoy.id === buoy.id ? 'scale-150 z-10' : 'hover:scale-125 z-0'}`}
                style={{
                  left: `${buoy.lng}%`,
                  top: `${buoy.lat}%`,
                  backgroundColor: buoy.color,
                  borderColor: selectedBuoy.id === buoy.id ? '#fff' : 'transparent',
                  boxShadow: `0 0 10px ${buoy.color}`
                }}
              >
                <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/80 px-2 py-1 rounded text-[10px] whitespace-nowrap border border-cyan-500/30 opacity-0 group-hover:opacity-100 transition-opacity">
                  {buoy.name}
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* DETAILS SECTION */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            key={selectedBuoy.id}
            className="bg-black/40 backdrop-blur-md border border-cyan-500/20 rounded-xl p-6"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-widest">{selectedBuoy.name}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold border" style={{ color: selectedBuoy.color, borderColor: selectedBuoy.color }}>
                    {selectedBuoy.status}
                  </span>
                  <span className="text-sm text-cyan-200/60">Lat: {selectedBuoy.lat.toFixed(2)}°S | Lng: {selectedBuoy.lng.toFixed(2)}°E</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold" style={{ color: selectedBuoy.color }}>
                  {selectedBuoy.health}%
                </div>
                <div className="text-xs text-cyan-500/60 mt-1">OVERALL HEALTH</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* HEALTH TIMELINE */}
              <div className="bg-[#050f1a] rounded-lg p-4 border border-cyan-500/10">
                <h3 className="text-sm text-cyan-500 mb-4 font-bold">30-DAY HEALTH TREND</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={HEALTH_TIMELINE}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#00e5ff1a" />
                      <XAxis dataKey="day" hide />
                      <YAxis domain={[0, 100]} stroke="#00e5ff40" fontSize={10} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#0a1628', borderColor: '#00e5ff40', color: '#fff' }}
                        itemStyle={{ color: '#00e5ff' }}
                      />
                      <Line type="monotone" dataKey="score" stroke={selectedBuoy.color} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* MAINTENANCE PREDICTIONS */}
              <div className="bg-[#050f1a] rounded-lg p-4 border border-cyan-500/10">
                <h3 className="text-sm text-cyan-500 mb-4 font-bold flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  PREDICTED FAILURES
                </h3>
                <div className="space-y-4">
                  {MAINTENANCE_RECS.map((rec, i) => (
                    <div key={i} className="flex justify-between items-center bg-black/30 p-2 rounded border border-white/5">
                      <div>
                        <div className="text-sm text-white">{rec.component}</div>
                        <div className="text-xs text-cyan-500/60">{rec.action}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-bold ${rec.urgency === 'CRITICAL' ? 'text-red-400' : rec.urgency === 'WARNING' ? 'text-yellow-400' : 'text-green-400'}`}>
                          {rec.days} Days
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* COMPONENT MATRIX */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-black/40 backdrop-blur-md border border-cyan-500/20 rounded-xl p-6"
          >
            <h3 className="text-sm text-cyan-500 mb-4 font-bold">SUBSYSTEM HEALTH MATRIX</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={COMPONENT_HEALTH} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#00e5ff1a" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis type="category" dataKey="name" stroke="#00e5ff80" fontSize={10} width={80} />
                  <RechartsTooltip 
                    cursor={{ fill: '#00e5ff1a' }}
                    contentStyle={{ backgroundColor: '#0a1628', borderColor: '#00e5ff40', color: '#fff' }}
                  />
                  <Bar dataKey="health" radius={[0, 4, 4, 0]}>
                    {COMPONENT_HEALTH.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getHealthColor(entry.health)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ALERT LOG */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-black/40 backdrop-blur-md border border-cyan-500/20 rounded-xl p-6"
      >
        <h3 className="text-sm text-cyan-500 mb-4 font-bold flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          FLEET ALERT LOG
        </h3>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
          {ALERTS.map((alert, i) => (
            <div key={i} className="flex gap-4 items-center p-3 rounded bg-[#050f1a] border border-cyan-500/10">
              <span className="text-xs text-cyan-500/50 w-12">{alert.time}</span>
              {alert.type === 'CRITICAL' && <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />}
              {alert.type === 'WARNING' && <Activity className="w-4 h-4 text-yellow-400 flex-shrink-0" />}
              {alert.type === 'NOMINAL' && <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />}
              <span className="text-sm font-bold text-cyan-100 w-24">{alert.unit}</span>
              <span className={`text-sm ${alert.type === 'CRITICAL' ? 'text-red-200' : alert.type === 'WARNING' ? 'text-yellow-200' : 'text-cyan-200/80'}`}>
                {alert.msg}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
