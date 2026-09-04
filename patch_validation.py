import re

with open("frontend/src/pages/ModelValidation.tsx", "r") as f:
    content = f.read()

old_metrics = """          <div className="mt-6 pt-6 border-t border-steel-800">
            <div className="flex items-center gap-2 text-xs font-mono text-steel-400">
              <Cpu className="w-4 h-4 text-steel-500" />
              Hardware Architecture: ESP32 (Sensor Hub) + Raspberry Pi 4 (Edge Compute Node)
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-steel-400 mt-2">
              <Zap className="w-4 h-4 text-steel-500" />
              Inference Latency: ~180ms (~5.5 FPS) on Raspberry Pi 4 CPU (Edge ONNX Runtime) · &gt;30 FPS with Coral/Hailo NPU
            </div>
          </div>"""

new_metrics = """          <div className="mt-6 pt-6 border-t border-steel-800 space-y-3">
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
          </div>"""

if old_metrics in content:
    content = content.replace(old_metrics, new_metrics)
    with open("frontend/src/pages/ModelValidation.tsx", "w") as f:
        f.write(content)
    print("Patched ModelValidation successfully.")
else:
    print("Could not find the exact old metrics.")
