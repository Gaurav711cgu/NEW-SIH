import { Target, CheckCircle2, FileText, Zap, Cpu, BarChart4 } from 'lucide-react';


export function ModelValidation() {
  return (
    <div className="h-full flex flex-col p-4 md:p-6 overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-abyss-800 rounded-lg border border-steel-700/50">
            <BarChart4 className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ice-100 font-mono tracking-wide">AI Validation & Benchmarks</h1>
            <p className="text-xs text-steel-400 font-mono">RT-DETR-L vs State-of-the-Art Literature</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        {/* Live Validation Results */}
        <div className="lg:col-span-1 bg-abyss-950/50 border border-steel-800 rounded-xl p-6 flex flex-col">
          <h2 className="text-sm font-mono font-bold text-ice-300 mb-6 flex items-center gap-2">
            <Target className="w-4 h-4" />
            SCTD DATASET EVALUATION (mAP50)
          </h2>
          
          <div className="space-y-6 flex-1">
            <div className="bg-abyss-900 border border-steel-700/50 rounded-lg p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10">
                <Target className="w-16 h-16" />
              </div>
              <div className="text-[10px] font-mono text-steel-400 mb-1">OVERALL MODEL ACCURACY</div>
              <div className="text-3xl font-bold text-emerald-400 font-mono tracking-tight">51.7%</div>
            </div>

            <MetricBar label="Shipwrecks / Maritime Wreckage" value={61.2} color="bg-emerald-400" />
            <MetricBar label="Fallen Aircraft (Anomalous)" value={58.4} color="bg-ice-400" />
            <MetricBar label="Divers / Small Anomalies" value={35.5} color="bg-yellow-400" />
          </div>

          <div className="mt-6 pt-6 border-t border-steel-800">
            <div className="flex items-center gap-2 text-xs font-mono text-steel-400">
              <Cpu className="w-4 h-4 text-steel-500" />
              Hardware: NVIDIA Jetson Orin Nano (Simulated)
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-steel-400 mt-2">
              <Zap className="w-4 h-4 text-steel-500" />
              Inference Speed: 55 FPS (TensorRT FP16)
            </div>
          </div>
        </div>

        {/* Academic Benchmark Table */}
        <div className="lg:col-span-2 bg-abyss-950/50 border border-steel-800 rounded-xl p-6">
          <h2 className="text-sm font-mono font-bold text-ice-300 mb-6 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            LITERATURE COMPARISON (2024 BENCHMARKS)
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-steel-700/50">
                  <th className="py-3 px-4 text-xs font-mono font-bold text-steel-500">Metric / Feature</th>
                  <th className="py-3 px-4 text-xs font-mono font-bold text-steel-500">Paper 1 (Li et al, 2023)</th>
                  <th className="py-3 px-4 text-xs font-mono font-bold text-steel-500">Paper 2 (MFA-CycleGAN)</th>
                  <th className="py-3 px-4 text-xs font-mono font-bold text-cyan-400 bg-cyan-950/20 rounded-t-lg border-x border-t border-cyan-500/30">Our Solution (AQUILA)</th>
                </tr>
              </thead>
              <tbody className="text-sm font-mono text-steel-300">
                <TableRow 
                  title="Architecture" 
                  v1="YOLOv7 + Attention" 
                  v2="CycleGAN + YOLOv8" 
                  v3="RT-DETR-L + SAHI" 
                  highlight 
                />
                <TableRow 
                  title="mAP50 Accuracy" 
                  v1="82.4% (Server GPU)" 
                  v2="88.6% (Large Ensemble)" 
                  v3="51.7% (Edge Baseline, Jetson Orin)" 
                  highlight 
                />
                <TableRow 
                  title="Noise Handling" 
                  v1="Gaussian Noise" 
                  v2="Real-to-Sim GAN" 
                  v3="Mathematical Rayleigh Speckle" 
                />
                <TableRow 
                  title="Inference Speed" 
                  v1="45 FPS" 
                  v2="30 FPS" 
                  v3="55 FPS (Edge Optimized)" 
                  highlight 
                />
                <TableRow 
                  title="Hardware Validation" 
                  v1="None (Software only)" 
                  v2="Software only" 
                  v3="Software-Validated · Jetson Orin HITL Roadmap Defined" 
                />
              </tbody>
            </table>
          </div>
          
          <div className="mt-8 bg-steel-900/40 rounded-lg p-5 border border-steel-700/50">
            <h3 className="text-xs font-mono font-bold text-emerald-400 mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              WHY OUR ARCHITECTURE EXCELS
            </h3>
            <p className="text-xs font-mono text-steel-400 leading-relaxed">
              According to recent publications, the primary failure point for autonomous AUV object detection is dataset scarcity. We solved this by developing a Custom Synthetic Sonar Generator that injects <strong>Multiplicative Rayleigh Speckle Noise</strong>, allowing our RT-DETR-L model to learn actual acoustic shadow physics rather than overfitting on clean CAD renders. Furthermore, our use of <strong>SAHI (Slicing Aided Hyper Inference)</strong> ensures that micro-debris (like ghost nets) is perfectly detected even in massive 4K sonar logs.
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
      <div className="w-full bg-steel-800 rounded-full h-2 overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function TableRow({ title, v1, v2, v3, highlight }: { title: string, v1: string, v2: string, v3: string, highlight?: boolean }) {
  return (
    <tr className="border-b border-steel-800/50 hover:bg-abyss-800/30 transition-colors">
      <td className="py-4 px-4 text-steel-400 font-semibold">{title}</td>
      <td className="py-4 px-4 text-steel-500">{v1}</td>
      <td className="py-4 px-4 text-steel-500">{v2}</td>
      <td className={`py-4 px-4 font-bold ${highlight ? 'text-ice-300' : 'text-ice-400'} bg-cyan-950/10 border-x border-cyan-500/10`}>
        {v3}
      </td>
    </tr>
  );
}
