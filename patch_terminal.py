import sys
with open('frontend/src/pages/AUVTwin.tsx', 'r') as f:
    content = f.read()

terminal_html = """
              {/* Bottom Right: Edge AI Terminal Logs */}
              <div className="absolute bottom-16 right-4 w-72 h-36 bg-black/90 border border-steel-700 rounded overflow-hidden flex flex-col shadow-2xl z-30 pointer-events-none">
                <div className="bg-steel-900 text-[8px] font-mono font-bold text-emerald-400 px-2 py-1 border-b border-steel-700">
                  EDGE_AI_INFERENCE_STDOUT
                </div>
                <div className="flex-1 p-2 font-mono text-[9px] text-steel-400 flex flex-col justify-end gap-0.5 overflow-hidden">
                  {terminalLogs.map((log, i) => (
                    <div key={i} className={`${log.includes('HUMAN_VERIFICATION') ? 'text-yellow-400 font-bold' : log.includes('CRITICAL') ? 'text-red-400 font-bold' : log.includes('[AI]') ? 'text-purple-300' : ''}`}>
                      {log}
                    </div>
                  ))}
                </div>
              </div>

              {/* Center Action Alert */}
"""

content = content.replace("{/* Center Action Alert */}", terminal_html)

with open('frontend/src/pages/AUVTwin.tsx', 'w') as f:
    f.write(content)
print("Terminal restored")
