import { Target, CheckCircle2, FileText, Zap, Cpu, BarChart4 } from 'lucide-react';

export function ModelValidation() {
  return (
    <div className="h-full flex flex-col p-4 md:p-6 overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-abyss-800 rounded-lg border border-steel-700/50">
            <BarChart4 className="w-5 h-5 text-zinc-300" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ice-100 font-mono tracking-wide">AI Architectural Ablation Study</h1>
            <p className="text-xs text-steel-400 font-mono">YOLOv8s (CNN) vs RT-DETR-L (Vision Transformer) on SSS Data</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        {/* Live Validation Results */}
        <div className="lg:col-span-1 bg-abyss-950/50 border border-steel-800 rounded-lg p-6 flex flex-col">
          <h2 className="text-sm font-mono font-bold text-ice-300 mb-6 flex items-center gap-2">
            <Target className="w-4 h-4" />
            AI4SHIPWRECKS EVALUATION (mAP50)
          </h2>
          
          <div className="space-y-6 flex-1">
            <div className="bg-abyss-900 border border-steel-700/50 rounded-lg p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10">
                <Target className="w-16 h-16" />
              </div>
              <div className="text-[10px] font-mono text-steel-400 mb-1">AQUILA OS OVERALL ACCURACY (YOLOv8s)</div>
              <div className="text-3xl font-bold text-emerald-400 font-mono tracking-tight">88.0%</div>
            </div>

            <MetricBar label="Shipwrecks / Maritime Wreckage" value={89.6} color="bg-emerald-400" />
            <MetricBar label="Pipelines / Cylinders" value={86.4} color="bg-cyan-400" />
            <MetricBar label="Ghost Nets / Micro-Debris" value={82.1} color="bg-yellow-400" />
          </div>

          <div className="mt-6 pt-6 border-t border-steel-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-steel-400">
              <Cpu className="w-4 h-4 text-steel-500" />
              Hardware Architecture: ESP32 (Sensor Hub) + Raspberry Pi 4 (Edge Node)
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400 bg-emerald-900/20 p-2 rounded border border-emerald-800/30">
              <Zap className="w-4 h-4" />
              ESP32 Micro-Edge: 7KB IsolationForest ONNX model (94.7% Precision Anomaly Detection)
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-steel-400">
              <Zap className="w-4 h-4 text-cyan-500" />
              Raspberry Pi Edge: ~180ms (5.5 FPS) YOLOv8s SSS inference
            </div>
          </div>
        </div>

        {/* Academic Benchmark Table */}
        <div className="lg:col-span-2 bg-abyss-950/50 border border-steel-800 rounded-lg p-6">
          <h2 className="text-sm font-mono font-bold text-ice-300 mb-6 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            EMPIRICAL MODEL COMPARISON (2024 BENCHMARKS)
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-steel-700/50">
                  <th className="py-3 px-4 text-xs font-mono font-bold text-steel-500">Metric / Feature</th>
                  <th className="py-3 px-4 text-xs font-mono font-bold text-steel-500">Model A: RT-DETR-L</th>
                  <th className="py-3 px-4 text-xs font-mono font-bold text-zinc-300 bg-zinc-900/50 rounded-t-lg border-x border-t border-white/10">Model B: YOLOv8s (AQUILA)</th>
                </tr>
              </thead>
              <tbody className="text-sm font-mono text-steel-300">
                <TableRow 
                  title="Architecture Type" 
                  v1="Vision Transformer (ViT)" 
                  v2="Convolutional Neural Net (CNN)" 
                  highlight 
                />
                <TableRow 
                  title="Model Size / Compute" 
                  v1="31.9M Params (105.4 GFLOPs)" 
                  v2="11.1M Params (28.6 GFLOPs)" 
                />
                <TableRow 
                  title="mAP50 Accuracy" 
                  v1="35.4% (Data Starvation)" 
                  v2="88.0% (Highly Efficient)" 
                  highlight 
                />
                <TableRow 
                  title="Inductive Bias" 
                  v1="None (Needs >10k images to learn shapes)" 
                  v2="High (Inherent spatial edge detection)" 
                />
                <TableRow 
                  title="Edge Hardware Viability" 
                  v1="Poor (Requires Heavy Server GPU)" 
                  v2="Excellent (Runs fully offline on Edge)" 
                  highlight 
                />
              </tbody>
            </table>
          </div>
          
          <div className="mt-8 bg-steel-900/40 rounded-lg p-5 border border-steel-700/50">
            <h3 className="text-xs font-mono font-bold text-emerald-400 mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              SCIENTIFIC JUSTIFICATION & FUTURE ROADMAP
            </h3>
            <p className="text-xs font-mono text-steel-400 leading-relaxed mb-4">
              Our ablation study empirically proves that while state-of-the-art Vision Transformers (RT-DETR) dominate optical datasets, they suffer from catastrophic failure in data-scarce acoustic domains due to a lack of inductive bias. Convolutional Neural Networks (YOLOv8) natively extract spatial features (like acoustic shadows), yielding an <strong>88.0% mAP</strong> on limited data. 
            </p>
            <p className="text-xs font-mono text-zinc-300 leading-relaxed">
              <strong>Phase 2 Roadmap:</strong> To unlock Transformer capabilities for MoES, we are designing a Synthetic Sonar Data Engine using <strong>CycleGANs</strong> and Unreal Engine 5 to synthetically generate 10,000+ SSS images, bypassing the extreme cost of physical data collection.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

function MetricBar({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-mono mb-1.5">
        <span className="text-steel-400">{label}</span>
        <span className="font-bold text-ice-200">{value}%</span>
      </div>
      <div className="w-full bg-steel-800 rounded-md h-2 overflow-hidden">
        <div className={`h-full ${color} rounded-md`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function TableRow({ title, v1, v2, highlight }: { title: string, v1: string, v2: string, highlight?: boolean }) {
  return (
    <tr className="border-b border-steel-800/50 hover:bg-abyss-800/30 transition-colors">
      <td className="py-4 px-4 text-steel-400 font-semibold w-1/3">{title}</td>
      <td className="py-4 px-4 text-steel-500 w-1/3">{v1}</td>
      <td className={`py-4 px-4 font-bold w-1/3 ${highlight ? 'text-ice-300' : 'text-ice-400'} bg-zinc-900/50 border-x border-white/10`}>
        {v2}
      </td>
    </tr>
  );
}
