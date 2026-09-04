import sys
with open('frontend/src/pages/GovernmentIntel.tsx', 'r') as f:
    content = f.read()

# Find the last closing div (main container)
# We'll insert our new section right before it.
insertion = """
      {/* SECTION 4: PHASE 2 MISSION ROADMAP */}
      <div className="bg-[#0a1628] border border-cyan-800/50 rounded-xl p-6 mt-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <TrendingUp className="w-48 h-48 text-cyan-400" />
        </div>
        <h2 className="text-xl font-mono font-bold text-cyan-400 mb-6 flex items-center gap-3">
          <ShieldCheck className="w-6 h-6" />
          PHASE 2 STRATEGIC ROADMAP (MINISTRY OF EARTH SCIENCES)
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          <div className="bg-[#020617] border border-slate-800 p-5 rounded-lg">
            <h3 className="text-emerald-400 font-bold font-mono text-sm mb-2">1. SYNTHETIC SONAR DATA ENGINE</h3>
            <p className="text-slate-400 text-xs font-mono leading-relaxed">
              To overcome the global scarcity of SSS data, we are integrating <strong>CycleGANs</strong> and <strong>Unreal Engine 5</strong>. We will ray-trace acoustic waves off 3D shipwrecks to generate 10,000+ synthetic sonar images, unlocking the ability to train massive Vision Transformers (RT-DETR).
            </p>
          </div>
          
          <div className="bg-[#020617] border border-slate-800 p-5 rounded-lg">
            <h3 className="text-cyan-400 font-bold font-mono text-sm mb-2">2. AUTONOMOUS SWARM ARCHITECTURE</h3>
            <p className="text-slate-400 text-xs font-mono leading-relaxed">
              By reducing unit costs from ₹30 Lakhs to ₹75,000, we will deploy a <strong>Swarm of 40 ultra-cheap autonomous floats</strong> communicating via underwater acoustic modems to rapidly map massive sectors of the Indian Ocean simultaneously.
            </p>
          </div>
          
          <div className="bg-[#020617] border border-slate-800 p-5 rounded-lg">
            <h3 className="text-amber-400 font-bold font-mono text-sm mb-2">3. INFINITE ENERGY INTEGRATION</h3>
            <p className="text-slate-400 text-xs font-mono leading-relaxed">
              Transitioning the ESP32 edge-node from standard batteries to localized <strong>Ocean Thermal Energy Conversion (OTEC)</strong> and miniature Wave Energy Harvesters, allowing the platform to operate autonomously at sea for years without human intervention.
            </p>
          </div>
          
          <div className="bg-[#020617] border border-slate-800 p-5 rounded-lg">
            <h3 className="text-purple-400 font-bold font-mono text-sm mb-2">4. INCOIS & NAVY INTEGRATION</h3>
            <p className="text-slate-400 text-xs font-mono leading-relaxed">
              Operationalizing the platform for the Government of India by routing our MQTT AI detection streams directly into the <strong>INCOIS (Indian National Centre for Ocean Information Services)</strong> API for real-time Coast Guard intelligence.
            </p>
          </div>
        </div>
      </div>
"""

# Find the last </div>
last_div_idx = content.rfind('</div>')
if last_div_idx != -1:
    new_content = content[:last_div_idx] + insertion + content[last_div_idx:]
    with open('frontend/src/pages/GovernmentIntel.tsx', 'w') as f:
        f.write(new_content)
print("Patched successfully")
