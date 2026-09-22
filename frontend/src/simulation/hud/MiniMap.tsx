import { useRef, useEffect } from 'react';
import { useSimulationStore } from '../store/simulationStore';

export default function MiniMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lat = useSimulationStore((state) => state.gpsLat);
  const lng = useSimulationStore((state) => state.gpsLng);

  // Simplified waypoints for demo
  const waypoints = [
    { lat: -65.2, lng: 48.7 },
    { lat: -65.3, lng: 48.8 },
    { lat: -65.4, lng: 48.6 },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#0a1628';
    ctx.fillRect(0, 0, width, height);

    // Draw rough ice shelf coastline at top
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width, 0);
    ctx.lineTo(width, 40);
    ctx.lineTo(150, 60);
    ctx.lineTo(80, 50);
    ctx.lineTo(0, 70);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Grid lines
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 40) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke();
    }

    // Map geo coords to canvas coords (simplified scaling for demo)
    const mapGeoToCanvas = (gLat: number, gLng: number) => {
      // Assuming center of map is approx -65.3, 48.7
      const x = (gLng - 48.6) * 1000 + 50; // arbitrary scale
      const y = (gLat - -65.1) * -1000 + 50;
      return { x, y };
    };

    // Draw waypoints and path
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    
    waypoints.forEach((wp, i) => {
      const pos = mapGeoToCanvas(wp.lat, wp.lng);
      if (i === 0) ctx.moveTo(pos.x, pos.y);
      else ctx.lineTo(pos.x, pos.y);
      
      // Draw waypoint dot
      ctx.fillStyle = '#0055ff';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw AUV position
    const auvPos = mapGeoToCanvas(lat, lng);
    
    // Ping ring
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(auvPos.x, auvPos.y, 10 + Math.sin(Date.now() / 200) * 4, 0, Math.PI * 2);
    ctx.stroke();

    // Core dot
    ctx.fillStyle = '#00e5ff';
    ctx.beginPath();
    ctx.arc(auvPos.x, auvPos.y, 4, 0, Math.PI * 2);
    ctx.fill();

  }, [lat, lng]);

  return (
    <div className="bg-black/60 p-2 border border-cyan-500/20 rounded-lg backdrop-blur-sm flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-2 px-1">
        <span className="text-xs text-cyan-200">TACTICAL MAP</span>
        <span className="text-[10px] text-cyan-600">GPS OK</span>
      </div>
      <canvas 
        ref={canvasRef} 
        width={200} 
        height={200} 
        className="rounded border border-cyan-500/30"
      />
      <div className="mt-2 text-[10px] text-cyan-400 flex gap-4">
        <span>LAT: {lat.toFixed(4)}</span>
        <span>LNG: {lng.toFixed(4)}</span>
      </div>
    </div>
  );
}
