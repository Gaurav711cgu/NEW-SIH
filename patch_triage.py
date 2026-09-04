with open("frontend/src/pages/SeafloorIntelligence.tsx", "r") as f:
    content = f.read()

# Check if we already patched it
if "AmbiguityTriagePanel" not in content:
    # 1. Add some imports
    content = content.replace(
        "import { Upload, Cpu, Save, FileJson, AlertTriangle, ShieldCheck, CheckCircle, Crosshair, MapPin, Database, Activity, Target, Zap } from 'lucide-react';",
        "import { Upload, Cpu, Save, FileJson, AlertTriangle, ShieldCheck, CheckCircle, Crosshair, MapPin, Database, Activity, Target, Zap, ZoomIn, Eye, RotateCcw, XCircle } from 'lucide-react';"
    )

    # 2. Add the AmbiguityTriagePanel component definition before the main function
    triage_component = """
const AmbiguityTriagePanel = ({ det, onAction }: { det: any, onAction: (action: string) => void }) => {
  return (
    <div className="bg-amber-950/20 border-2 border-amber-600/40 rounded-xl p-6 mt-6 shadow-[0_0_20px_rgba(245,158,11,0.1)] relative overflow-hidden animate-fade-in">
      {/* Background warning stripes */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #f59e0b 0, #f59e0b 2px, transparent 2px, transparent 10px)' }}></div>
      
      <div className="flex flex-col xl:flex-row gap-6 relative z-10">
        {/* Left: Synthetic Crop of the anomaly */}
        <div className="w-full xl:w-1/3 flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="text-amber-500 w-5 h-5 animate-pulse" />
            <h3 className="text-amber-500 font-bold font-mono tracking-wider">HUMAN-IN-THE-LOOP TRIAGE QUEUE</h3>
          </div>
          <div className="bg-black/50 border border-amber-900/50 rounded-lg h-48 relative overflow-hidden flex items-center justify-center group cursor-crosshair">
            {/* Mock Sonar Crop */}
            <div className="absolute inset-0 bg-slate-900"></div>
            {/* Noise */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
            {/* The anomaly blob */}
            <div className="w-24 h-16 bg-slate-400/80 rounded-[40%] blur-[2px] absolute top-12 left-20"></div>
            {/* The missing shadow */}
            <div className="w-10 h-8 bg-black/60 rounded-[30%] blur-[4px] absolute top-16 left-44"></div>
            
            {/* Bounding Box overlay */}
            <div className="absolute top-8 left-16 w-36 h-24 border-2 border-dashed border-amber-500 bg-amber-500/10"></div>
            
            <div className="absolute bottom-2 right-2 flex gap-2">
              <span className="bg-black/80 text-white text-[9px] font-mono px-2 py-1 rounded flex items-center gap-1">
                <ZoomIn size={10} /> RAW SONAR CROP
              </span>
            </div>
          </div>
        </div>

        {/* Middle: AI Context */}
        <div className="w-full xl:w-1/3 flex flex-col justify-center">
          <h4 className="text-slate-300 font-bold font-sans text-sm mb-3 flex items-center gap-2">
            <Cpu size={14} className="text-amber-400" />
            AI DIAGNOSTIC CONTEXT
          </h4>
          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between border-b border-steel-800/50 pb-1">
              <span className="text-slate-400">NEURAL PREDICTION</span>
              <span className="text-amber-400 font-bold">UNKNOWN_ANOMALY</span>
            </div>
            <div className="flex justify-between border-b border-steel-800/50 pb-1">
              <span className="text-slate-400">RAW YOLOv8 CONFIDENCE</span>
              <span className="text-emerald-400 font-bold">72.0%</span>
            </div>
            <div className="flex justify-between border-b border-steel-800/50 pb-1">
              <span className="text-slate-400">ACOUSTIC SHADOW CHECK</span>
              <span className="text-red-400 font-bold">FAIL (NO 3D RELIEF)</span>
            </div>
            <div className="flex justify-between border-b border-steel-800/50 pb-1">
              <span className="text-slate-400">CALIBRATED CONFIDENCE</span>
              <span className="text-amber-500 font-bold">58.4% (&lt; 70% THRESHOLD)</span>
            </div>
            <div className="flex justify-between pb-1">
              <span className="text-slate-400">LOCATION</span>
              <span className="text-ice-300">{det.lat}, {det.lon}</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 font-sans mt-3 italic leading-relaxed">
            SYSTEM NOTE: High acoustic reflectivity detected, but lack of geometrical shadow implies zero vertical height. Likely flat seabed geology or discoloration. Awaiting operator confirmation.
          </p>
        </div>

        {/* Right: Operator Actions */}
        <div className="w-full xl:w-1/3 flex flex-col justify-center gap-3">
          <h4 className="text-slate-300 font-bold font-sans text-sm mb-1 flex items-center gap-2">
            <Eye size={14} className="text-amber-400" />
            OPERATOR ACTION REQUIRED
          </h4>
          
          <button onClick={() => onAction('confirm')} className="w-full bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700/50 text-emerald-400 py-2.5 rounded-lg text-xs font-bold font-mono transition-colors flex items-center justify-center gap-2">
            <CheckCircle size={14} />
            CONFIRM AS TARGET (FORCE LOG)
          </button>
          
          <button onClick={() => onAction('rescan')} className="w-full bg-blue-950/60 hover:bg-blue-900 border border-blue-700/50 text-blue-400 py-2.5 rounded-lg text-xs font-bold font-mono transition-colors flex items-center justify-center gap-2">
            <RotateCcw size={14} />
            QUEUE FOR AUV RE-SCAN
          </button>
          
          <button onClick={() => onAction('dismiss')} className="w-full bg-red-950/60 hover:bg-red-900 border border-red-700/50 text-red-400 py-2.5 rounded-lg text-xs font-bold font-mono transition-colors flex items-center justify-center gap-2">
            <XCircle size={14} />
            DISMISS AS GEOLOGY (FALSE POSITIVE)
          </button>
        </div>
      </div>
    </div>
  );
};
"""
    content = content.replace("export default function SeafloorIntelligence() {", triage_component + "\nexport default function SeafloorIntelligence() {")

    # 3. Handle the logic in the main component to render the panel
    # Find a good place to insert it. Below the main grid.
    insert_marker = "{/* ── BOTTOM: Advanced Matrix (Full width) ─────────────────── */}"
    
    triage_logic = """
      {/* ── HUMAN-IN-THE-LOOP TRIAGE PANEL ────────────────────────────── */}
      {detections.some(d => d.object_class === 'anomaly' || d.confidence_cal < 0.70) && (
        <AmbiguityTriagePanel 
          det={detections.find(d => d.object_class === 'anomaly' || d.confidence_cal < 0.70)} 
          onAction={(action) => {
            if (action === 'dismiss') {
              setDetections(prev => prev.filter(d => d.object_class !== 'anomaly' && d.confidence_cal >= 0.70));
            } else if (action === 'confirm' || action === 'rescan') {
              alert(`Action: ${action.toUpperCase()} recorded. Model weights adjusted and logs updated.`);
              setDetections(prev => prev.filter(d => d.object_class !== 'anomaly' && d.confidence_cal >= 0.70));
            }
          }} 
        />
      )}

      """
    
    content = content.replace(insert_marker, triage_logic + insert_marker)

    with open("frontend/src/pages/SeafloorIntelligence.tsx", "w") as f:
        f.write(content)
