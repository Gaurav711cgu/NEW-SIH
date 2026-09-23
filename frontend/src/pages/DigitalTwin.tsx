import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, YAxis, ResponsiveContainer } from 'recharts';
import { Activity, Wrench,  Radio, Terminal, Cpu, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// --- BHARATI STATION (LARSEMANN HILLS) COORDINATES ---
const BHARATI_LAT = -69.4000;
const BHARATI_LNG = 76.1950;

// --- FLEET DATA WITH REALISTIC SWARM COORDINATES ---
const FLEET_DATA = [
  { id: 'AQUILA-01', status: 'NOMINAL', health: 98, lat: BHARATI_LAT - 0.015, lng: BHARATI_LNG - 0.02, heading: 45, depth: 145 },
  { id: 'AQUILA-02', status: 'WARNING', health: 65, lat: BHARATI_LAT - 0.005, lng: BHARATI_LNG + 0.015, heading: 120, depth: 400 },
  { id: 'AQUILA-03', status: 'NOMINAL', health: 95, lat: BHARATI_LAT + 0.010, lng: BHARATI_LNG - 0.025, heading: 270, depth: 320 },
  { id: 'AQUILA-04', status: 'CRITICAL', health: 25, lat: BHARATI_LAT - 0.025, lng: BHARATI_LNG + 0.030, heading: 0, depth: 50 },
  { id: 'AQUILA-05', status: 'NOMINAL', health: 91, lat: BHARATI_LAT + 0.020, lng: BHARATI_LNG + 0.005, heading: 180, depth: 210 },
  { id: 'AQUILA-06', status: 'NOMINAL', health: 88, lat: BHARATI_LAT - 0.010, lng: BHARATI_LNG - 0.005, heading: 90, depth: 100 },
  { id: 'AQUILA-07', status: 'NOMINAL', health: 96, lat: BHARATI_LAT + 0.025, lng: BHARATI_LNG + 0.020, heading: 135, depth: 310 },
  { id: 'AQUILA-08', status: 'NOMINAL', health: 99, lat: BHARATI_LAT + 0.030, lng: BHARATI_LNG - 0.015, heading: 45, depth: 180 },
  { id: 'AQUILA-09', status: 'WARNING', health: 71, lat: BHARATI_LAT - 0.035, lng: BHARATI_LNG - 0.010, heading: 210, depth: 450 },
  { id: 'AQUILA-10', status: 'NOMINAL', health: 94, lat: BHARATI_LAT - 0.005, lng: BHARATI_LNG - 0.035, heading: 300, depth: 260 },
  { id: 'AQUILA-11', status: 'NOMINAL', health: 89, lat: BHARATI_LAT + 0.015, lng: BHARATI_LNG + 0.035, heading: 90, depth: 115 },
  { id: 'AQUILA-12', status: 'NOMINAL', health: 97, lat: BHARATI_LAT - 0.040, lng: BHARATI_LNG + 0.010, heading: 15, depth: 80 },
];

const HEALTH_TIMELINE = Array.from({ length: 30 }, (_, i) => ({
  day: `Day ${i + 1}`,
  score: Math.max(30, 100 - (i * (Math.random() * 2))),
})).reverse();

const COMPONENT_HEALTH = [
  { name: 'CTD (SBE-37)', health: 65, diag: 'Temp Drift: +0.02°C/hr' },
  { name: 'Sonar (EdgeTech)', health: 92, diag: 'Ping Rate: 10Hz (Nominal)' },
  { name: 'Battery (Li-Po)', health: 25, diag: 'Cell 3 Voltage Drop (3.2V)' },
  { name: 'MCU (Jetson Orin)', health: 99, diag: 'Temp: 45°C, Load: 82%' },
  { name: 'GPS (U-Blox)', health: 100, diag: '3D Fix, 12 Satellites' },
  { name: 'Lights (LED)', health: 91, diag: 'Draw: 2.1A (Normal)' },
  { name: 'Thrusters', health: 88, diag: 'RPM: 1200, Torque: 1.2Nm' },
  { name: 'Acoustic Modem', health: 95, diag: 'Tx/Rx: 14kbps, SNR: 12dB' },
];

const MAINTENANCE_RECS = [
  { component: 'Battery Pack', action: 'Schedule replacement', urgency: 'CRITICAL', days: 2 },
  { component: 'CTD Sensor', action: 'Recalibration required', urgency: 'WARNING', days: 14 },
  { component: 'Thruster Props', action: 'Biofouling cleaning', urgency: 'ROUTINE', days: 30 },
];

// Realistic ROS2 / Acoustic Modem Log Generator
const generateLog = () => {
  const events = [
    { type: 'INFO', msg: 'ROS2_DDS_SYNC: Topology match detected across swarm.' },
    { type: 'INFO', msg: 'ACST_MODEM: NMEA $PAMKX transmission success.' },
    { type: 'WARN', msg: 'NAV_EKF: High variance in DVL bottom-track. Switching to inertial.' },
    { type: 'CRITICAL', msg: 'BATT_BMS: Cell 3 voltage drop detected (3.2V). Triggering return protocol.' },
    { type: 'SWARM', msg: 'AQUILA-02 rerouting to relay acoustic packets for AQUILA-04.' },
    { type: 'SWARM', msg: 'Consensus reached: Sector 7G survey complete. Reallocating.' },
    { type: 'INFO', msg: 'CTD_PROFILER: Sampling rate adjusted to 24Hz.' },
    { type: 'WARN', msg: 'THRUSTER_0: Overcurrent detected (4.2A). Applying soft limit.' }
  ];
  const ev = events[Math.floor(Math.random() * events.length)];
  const timestamp = new Date().toISOString().substring(11, 23);
  return { id: Math.random().toString(), time: timestamp, ...ev };
};

export default function DigitalTwin() {
  const [selectedAUV, setSelectedAUV] = useState(FLEET_DATA[0]);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    // Initial logs
    const initialLogs = Array.from({ length: 8 }, generateLog);
    setLogs(initialLogs);

    // Stream logs
    const interval = setInterval(() => {
      setLogs(prev => [generateLog(), ...prev].slice(0, 50));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const createIcon = (color: string, heading: number) => {
    return L.divIcon({
      className: 'custom-auv-marker',
      html: `<div style="transform: rotate(${heading}deg);" class="flex items-center justify-center w-6 h-6 rounded-full bg-${color}-500/20 border-2 border-${color}-400 shadow-[0_0_10px_${color}]">
               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                 <path d="M12 2L2 22l10-4 10 4L12 2z"/>
               </svg>
             </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  const getStatusColor = (status: string) => {
    if (status === 'NOMINAL') return 'emerald';
    if (status === 'WARNING') return 'amber';
    return 'red';
  };
  
  const getStatusHex = (status: string) => {
    if (status === 'NOMINAL') return '#34d399';
    if (status === 'WARNING') return '#fbbf24';
    return '#f87171';
  };

  return (
    <div className="h-full p-4 md:p-6 overflow-y-auto flex flex-col gap-4 text-steel-100 bg-abyss-950">
      
      {/* HEADER */}
      <div className="flex items-center justify-between pb-4 border-b border-steel-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-ice-500/10 border border-ice-500/30 flex items-center justify-center text-ice-400">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-mono font-bold text-lg text-ice-100 tracking-wider">AQUILA DIGITAL TWIN - SWARM INTELLIGENCE</h1>
            <p className="text-xs font-mono text-steel-400">MoES Predictive Maintenance & Autonomous Swarm Fault Detection</p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-abyss-900 border border-steel-800 rounded px-4 py-2 text-center">
            <div className="text-[10px] text-steel-500 font-mono">ACTIVE FLEET</div>
            <div className="text-xl font-bold text-ice-300">{FLEET_DATA.length}</div>
          </div>
          <div className="bg-abyss-900 border border-steel-800 rounded px-4 py-2 text-center">
            <div className="text-[10px] text-steel-500 font-mono">CRITICAL NODES</div>
            <div className="text-xl font-bold text-red-400">{FLEET_DATA.filter(f => f.status === 'CRITICAL').length}</div>
          </div>
          <div className="bg-abyss-900 border border-steel-800 rounded px-4 py-2 text-center">
            <div className="text-[10px] text-steel-500 font-mono">SWARM COHESION</div>
            <div className="text-xl font-bold text-emerald-400">92%</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
        
        {/* LEFT COLUMN - MAP & SWARM ROUTING */}
        <div className="lg:col-span-5 flex flex-col gap-4 h-[600px] lg:h-auto">
          <div className="bg-abyss-900/50 border border-steel-800/50 rounded-lg flex flex-col flex-1 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 p-3 z-[1000] flex justify-between pointer-events-none">
              <div className="flex items-center gap-2 bg-abyss-950/80 backdrop-blur border border-steel-800 px-3 py-1.5 rounded pointer-events-auto">
                <MapPin className="w-3 h-3 text-ice-400" />
                <span className="text-[10px] font-mono text-steel-200">BHARATI STATION, LARSEMANN HILLS</span>
              </div>
              <div className="flex items-center gap-2 bg-abyss-950/80 backdrop-blur border border-steel-800 px-3 py-1.5 rounded pointer-events-auto">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span className="text-[10px] font-mono text-emerald-400">ACOUSTIC LINK ACTIVE</span>
              </div>
            </div>
            
            <MapContainer 
              center={[BHARATI_LAT, BHARATI_LNG]} 
              zoom={11} 
              className="w-full h-full bg-[#0a192f]"
              zoomControl={false}
              attributionControl={false}
            >
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='&copy; <a href="https://www.esri.com/">Esri</a>, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              />
              
              {/* Swarm Communication Relays (Lines) */}
              <Polyline 
                positions={[[FLEET_DATA[1].lat, FLEET_DATA[1].lng], [FLEET_DATA[3].lat, FLEET_DATA[3].lng]]}
                pathOptions={{ color: '#fbbf24', weight: 1, dashArray: '4 8' }} 
              />
              <Polyline 
                positions={[[FLEET_DATA[0].lat, FLEET_DATA[0].lng], [FLEET_DATA[1].lat, FLEET_DATA[1].lng]]}
                pathOptions={{ color: '#34d399', weight: 1, dashArray: '4 8' }} 
              />
              
              {FLEET_DATA.map(auv => (
                <Marker 
                  key={auv.id} 
                  position={[auv.lat, auv.lng]}
                  icon={createIcon(getStatusColor(auv.status), auv.heading)}
                  eventHandlers={{ click: () => setSelectedAUV(auv) }}
                >
                  <Popup className="custom-popup">
                    <div className="font-mono text-xs bg-abyss-950 p-2 text-steel-300">
                      <div className="font-bold text-ice-300 mb-1">{auv.id}</div>
                      <div>Depth: {auv.depth}m</div>
                      <div className={`text-${getStatusColor(auv.status)}-400 mt-1 font-bold`}>{auv.status}</div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* RIGHT COLUMN - PREDICTIVE MAINT & DIAGNOSTICS */}
        <div className="lg:col-span-7 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
          
          <div className="bg-abyss-900/50 border border-steel-800/50 rounded-lg p-5">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-xl font-mono font-bold text-ice-100 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-ice-400" />
                  {selectedAUV.id}
                </h2>
                <div className="flex items-center gap-2 mt-2 font-mono text-[10px]">
                  <span className={`px-2 py-0.5 rounded border border-${getStatusColor(selectedAUV.status)}-500/50 bg-${getStatusColor(selectedAUV.status)}-500/10 text-${getStatusColor(selectedAUV.status)}-400 font-bold`}>
                    {selectedAUV.status}
                  </span>
                  <span className="text-steel-500">|</span>
                  <span className="text-steel-400">LAT: {selectedAUV.lat.toFixed(4)}°S</span>
                  <span className="text-steel-400">LNG: {selectedAUV.lng.toFixed(4)}°E</span>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-4xl font-mono font-bold text-${getStatusColor(selectedAUV.status)}-400 leading-none`}>
                  {selectedAUV.health}%
                </div>
                <div className="text-[9px] font-mono text-steel-500 mt-1 uppercase">Overall Health</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-abyss-950 border border-steel-800/50 rounded p-4">
                <div className="text-[10px] font-mono text-steel-500 mb-3 flex items-center gap-2">
                  <Activity className="w-3 h-3" /> 30-DAY HEALTH DEGRADATION TREND
                </div>
                <div className="h-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={HEALTH_TIMELINE}>
                      <Line type="monotone" dataKey="score" stroke={getStatusHex(selectedAUV.status)} strokeWidth={2} dot={false} />
                      <YAxis domain={[0, 100]} hide />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-abyss-950 border border-steel-800/50 rounded p-4 flex flex-col gap-2">
                <div className="text-[10px] font-mono text-steel-500 mb-1 flex items-center gap-2">
                  <Wrench className="w-3 h-3" /> PROGNOSTICS (PREDICTED FAILURES)
                </div>
                {MAINTENANCE_RECS.map((rec, i) => (
                  <div key={i} className="flex justify-between items-center bg-abyss-900/50 px-3 py-2 rounded border border-steel-800">
                    <div>
                      <div className="text-[11px] font-bold text-steel-300">{rec.component}</div>
                      <div className="text-[9px] text-steel-500">{rec.action}</div>
                    </div>
                    <div className={`text-[10px] font-mono font-bold ${rec.urgency === 'CRITICAL' ? 'text-red-400' : rec.urgency === 'WARNING' ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {rec.days} Days
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-abyss-900/50 border border-steel-800/50 rounded-lg p-5">
            <div className="text-[10px] font-mono text-steel-500 mb-4 flex items-center gap-2 uppercase tracking-wider">
              <Cpu className="w-3 h-3" /> Subsystem Health Matrix
            </div>
            <div className="space-y-3">
              {COMPONENT_HEALTH.map((comp) => {
                let colorClass = 'bg-emerald-400';
                if (comp.health < 40) colorClass = 'bg-red-500';
                else if (comp.health < 75) colorClass = 'bg-amber-400';

                return (
                  <div key={comp.name} className="flex flex-col gap-1 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-steel-300 font-bold">
                        {comp.name}
                      </span>
                      <span className="text-[10px] font-mono text-steel-500">
                        {comp.diag}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-abyss-950 rounded overflow-hidden border border-steel-800/50">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${comp.health}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className={`h-full ${colorClass} shadow-[0_0_8px_${colorClass}]`}
                        />
                      </div>
                      <span className={`w-8 text-[11px] font-mono font-bold ${comp.health < 40 ? 'text-red-400' : comp.health < 75 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {comp.health}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* TERMINAL LOGS (ROS2 / ACOUSTIC) */}
      <div className="bg-[#0c0c0c] border border-steel-800/50 rounded-lg p-4 h-48 flex flex-col relative overflow-hidden">
        <div className="text-[10px] font-mono text-steel-500 mb-2 flex items-center gap-2 uppercase tracking-wider sticky top-0 bg-[#0c0c0c] pb-2 z-10">
          <Terminal className="w-3 h-3 text-ice-500" /> ACOUSTIC SWARM TELEMETRY & ROS2 LOGS
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-[11px] space-y-1">
          <AnimatePresence>
            {logs.map((log) => {
              let color = 'text-steel-400';
              if (log.type === 'WARN') color = 'text-amber-400';
              if (log.type === 'CRITICAL') color = 'text-red-400 font-bold bg-red-950/30';
              if (log.type === 'SWARM') color = 'text-purple-400';
              if (log.type === 'INFO') color = 'text-emerald-400';

              return (
                <motion.div 
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex gap-3 px-2 py-0.5 rounded ${color}`}
                >
                  <span className="text-steel-600">[{log.time}]</span>
                  <span className="w-16 flex-shrink-0">[{log.type}]</span>
                  <span className="truncate">{log.msg}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
