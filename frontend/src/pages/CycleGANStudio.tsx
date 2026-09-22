import { useState, useEffect } from 'react';
import { RefreshCw, Cpu, Layers, FileCheck2, TerminalSquare } from 'lucide-react';
import { motion } from 'framer-motion';

export function CycleGANStudio() {
  const [epoch, setEpoch] = useState(0);
  const [lossG, setLossG] = useState(4.5);
  const [lossD, setLossD] = useState(1.2);
  const [isTraining, setIsTraining] = useState(true);

  // Simulate training progression
  useEffect(() => {
    if (!isTraining) return;
    const interval = setInterval(() => {
      setEpoch(prev => {
        if (prev > 10000) {
          setIsTraining(false);
          return prev;
        }
        return prev + 10;
      });
      setLossG(prev => Math.max(0.2, prev - Math.random() * 0.05));
      setLossD(prev => Math.min(0.8, prev + Math.random() * 0.02));
    }, 100);
    return () => clearInterval(interval);
  }, [isTraining]);

  return (
    <div className="h-full flex flex-col p-4 md:p-6 overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-abyss-800 rounded-lg border border-steel-700/50">
            <RefreshCw className={`w-5 h-5 text-cyan-400 ${isTraining ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ice-100 font-mono tracking-wide">Synthetic Sonar Data Engine</h1>
            <p className="text-xs text-steel-400 font-mono">Unpaired Image-to-Image Translation (CycleGAN) for SSS Generation</p>
          </div>
        </div>
        <div className="flex gap-4 text-xs font-mono">
          <div className="flex flex-col items-end">
            <span className="text-steel-500">EPOCH</span>
            <span className="text-emerald-400 font-bold">{epoch.toLocaleString()} / 10,000</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-steel-500">LOSS_G (Adversarial)</span>
            <span className="text-cyan-400 font-bold">{lossG.toFixed(4)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        
        {/* Visualizer Architecture */}
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-4">
          {/* Domain A to B */}
          <div className="bg-abyss-950/50 border border-steel-800 rounded-lg p-6 flex flex-col items-center justify-center relative overflow-hidden">
            <h2 className="absolute top-4 left-4 text-xs font-mono font-bold text-ice-300 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              FORWARD CYCLE: OPTICAL → SONAR
            </h2>
            
            <div className="flex items-center gap-4 mt-8 w-full px-8">
              {/* Domain A */}
              <div className="flex flex-col items-center gap-2 w-1/3">
                <div className="w-full aspect-square bg-steel-900 border border-steel-700 rounded overflow-hidden relative">
                  <div className="absolute inset-0 bg-blue-900/20 mix-blend-screen" />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-steel-500 font-mono text-[10px]">Unreal Engine Render</div>
                  {/* Fake geometry */}
                  <motion.div 
                    className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-steel-600 rounded-sm"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  />
                </div>
                <span className="text-[10px] font-mono text-steel-400">DOMAIN A (Optical)</span>
              </div>

              {/* Generator G */}
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="h-0.5 w-full bg-cyan-900 relative">
                  <motion.div 
                    className="absolute top-0 left-0 h-full bg-cyan-400 shadow-[0_0_8px_#00e5ff]"
                    animate={{ width: ["0%", "100%"] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </div>
                <div className="px-3 py-1 bg-cyan-950 border border-cyan-800 rounded text-[9px] font-mono text-cyan-400">
                  Generator G (ResNet-9)
                </div>
              </div>

              {/* Domain B */}
              <div className="flex flex-col items-center gap-2 w-1/3">
                <div className="w-full aspect-square bg-[#0a0a00] border border-yellow-900/50 rounded overflow-hidden relative">
                  <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 4px)', mixBlendMode: 'overlay' }} />
                  {/* Fake sonar return */}
                  <motion.div 
                    className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-yellow-500/80 rounded-sm blur-[2px]"
                    animate={{ rotate: 360, opacity: [0.5, 1, 0.5] }}
                    transition={{ rotate: { duration: 20, repeat: Infinity, ease: "linear" }, opacity: { duration: 2, repeat: Infinity } }}
                  />
                  {/* Acoustic shadow */}
                  <motion.div 
                    className="absolute top-1/4 left-[75%] w-1/4 h-1/2 bg-black blur-[4px]"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    style={{ transformOrigin: "left center" }}
                  />
                  <div className="absolute bottom-2 left-2 text-[#ffd700] font-mono text-[8px] opacity-70">SYNTHETIC SSS</div>
                </div>
                <span className="text-[10px] font-mono text-yellow-500/70">DOMAIN B (Sonar)</span>
              </div>
            </div>
            
            {/* Discriminator */}
            <div className="mt-8 flex flex-col items-center">
              <div className="h-6 w-0.5 bg-steel-700 relative">
                <motion.div 
                  className="absolute top-0 left-0 w-full bg-red-500 shadow-[0_0_8px_#ff0000]"
                  animate={{ height: ["0%", "100%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.75 }}
                />
              </div>
              <div className="px-4 py-2 bg-red-950/30 border border-red-900/50 rounded flex items-center gap-2">
                <Cpu className="w-4 h-4 text-red-500" />
                <span className="text-[10px] font-mono text-red-400">Discriminator D_Y (PatchGAN)</span>
              </div>
            </div>
          </div>
          
          {/* Explanation */}
          <div className="bg-abyss-950/50 border border-steel-800 rounded-lg p-6">
            <h3 className="text-sm font-mono font-bold text-ice-300 mb-4 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4" />
              Solving the Data Starvation Problem
            </h3>
            <p className="text-xs font-mono text-steel-400 leading-relaxed mb-4">
              Training high-accuracy YOLOv8 or Vision Transformer models for underwater anomaly detection requires massive amounts of data. However, collecting physical Side-Scan Sonar (SSS) data using actual AUVs is prohibitively expensive and time-consuming.
            </p>
            <p className="text-xs font-mono text-emerald-400/90 leading-relaxed">
              <strong>Solution:</strong> We leverage a Cycle-Consistent Generative Adversarial Network (CycleGAN). We build environments in Unreal Engine 5 to generate infinite <em>optical</em> ground-truth data (Domain A). The CycleGAN automatically learns the underlying statistical distribution of real sonar data and translates the optical images into highly realistic <em>acoustic</em> sonar images (Domain B), complete with noise, reverberation, and acoustic shadows.
            </p>
          </div>
        </div>

        {/* Console Log */}
        <div className="col-span-1 bg-black border border-steel-800 rounded-lg flex flex-col overflow-hidden">
          <div className="bg-steel-900/50 px-4 py-2 border-b border-steel-800 flex items-center gap-2">
            <TerminalSquare className="w-4 h-4 text-steel-400" />
            <span className="text-[10px] font-mono text-steel-300">train_cyclegan.py</span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto custom-scrollbar font-mono text-[9px] leading-relaxed text-steel-400 flex flex-col gap-1">
            <div className="text-cyan-400">[{new Date().toISOString()}] INITIALIZING CYCLEGAN...</div>
            <div>[SYS] Generator G (ResNet 9 blocks) loaded.</div>
            <div>[SYS] Generator F (ResNet 9 blocks) loaded.</div>
            <div>[SYS] Discriminator D_X (PatchGAN) loaded.</div>
            <div>[SYS] Discriminator D_Y (PatchGAN) loaded.</div>
            <div>[DATA] Dataset A: 50,000 Unreal Engine renders.</div>
            <div>[DATA] Dataset B: 1,420 Real Sonar images.</div>
            <br />
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="opacity-80">
                Epoch {Math.max(1, epoch - (15 - i) * 10)} 
                <span className="text-emerald-500 ml-2">loss_G: {(lossG + Math.random() * 0.1).toFixed(4)}</span> 
                <span className="text-red-500 ml-2">loss_D: {(lossD - Math.random() * 0.1).toFixed(4)}</span>
                <span className="text-yellow-500 ml-2">cycle_loss: {(Math.random() * 2 + 0.5).toFixed(4)}</span>
              </div>
            ))}
            {isTraining && (
              <motion.div 
                animate={{ opacity: [1, 0] }} 
                transition={{ duration: 0.8, repeat: Infinity }}
                className="w-2 h-3 bg-steel-400 mt-2"
              />
            )}
            {!isTraining && (
              <div className="text-emerald-400 mt-2 font-bold">[SUCCESS] Training Complete. Model saved to weights/latest_net_G.pth</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
