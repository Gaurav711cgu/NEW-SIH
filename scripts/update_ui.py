import re

# 1. Update GovernmentIntel.tsx
with open('/Users/gauravkumarnayak/Desktop/new sih/frontend/src/pages/GovernmentIntel.tsx', 'r') as f:
    content = f.read()

# Replace Finding 1 paragraph with a grid
finding1_old = r'<p className="text-sm text-slate-300 leading-relaxed mb-4">Anomalous debris concentration detected across 2.3km² sector. Sonar signature consistent with derelict fishing gear entanglement.</p>'
finding1_new = '''<div className="grid grid-cols-2 gap-2 mb-4 bg-slate-950/50 p-2 rounded-lg border border-slate-700/30">
              <div className="text-[10px] text-slate-500 font-mono">SECTOR COVERAGE</div>
              <div className="text-[11px] text-slate-300 font-bold text-right">2.3 km² (BHARATI ZONE)</div>
              <div className="text-[10px] text-slate-500 font-mono">SIGNATURE MATCH</div>
              <div className="text-[11px] text-cyan-400 font-bold text-right">DERELICT FISHING GEAR</div>
              <div className="text-[10px] text-slate-500 font-mono">THREAT LEVEL</div>
              <div className="text-[11px] text-[#ff453a] font-bold text-right">CRITICAL ENTANGLEMENT</div>
            </div>'''
content = content.replace(finding1_old, finding1_new)

# Replace Finding 2 paragraph with a grid
finding2_old = r'<p className="text-sm text-slate-300 leading-relaxed mb-4">Large acoustic shadow consistent with 40-80m vessel wreck. Preliminary classification: merchant vessel, circa 1970-1990.</p>'
finding2_new = '''<div className="grid grid-cols-2 gap-2 mb-4 bg-slate-950/50 p-2 rounded-lg border border-slate-700/30">
              <div className="text-[10px] text-slate-500 font-mono">ACOUSTIC SHADOW</div>
              <div className="text-[11px] text-slate-300 font-bold text-right">65m LENGTH (VESSEL)</div>
              <div className="text-[10px] text-slate-500 font-mono">CLASSIFICATION</div>
              <div className="text-[11px] text-amber-400 font-bold text-right">MERCHANT VESSEL</div>
              <div className="text-[10px] text-slate-500 font-mono">EST. ERA</div>
              <div className="text-[11px] text-slate-300 font-bold text-right">1970-1990</div>
            </div>'''
content = content.replace(finding2_old, finding2_new)

# Replace Finding 3 paragraph with a grid
finding3_old = r'<p className="text-sm text-slate-300 leading-relaxed mb-4">Localised temperature deviation of +2.1°C above baseline. Possible hydrothermal vent or industrial discharge source.</p>'
finding3_new = '''<div className="grid grid-cols-2 gap-2 mb-4 bg-slate-950/50 p-2 rounded-lg border border-slate-700/30">
              <div className="text-[10px] text-slate-500 font-mono">THERMAL DEVIATION</div>
              <div className="text-[11px] text-[#ff453a] font-bold text-right">+2.1°C (ABOVE BASELINE)</div>
              <div className="text-[10px] text-slate-500 font-mono">PRIMARY HYPOTHESIS</div>
              <div className="text-[11px] text-amber-400 font-bold text-right">HYDROTHERMAL VENT</div>
              <div className="text-[10px] text-slate-500 font-mono">VALIDATION</div>
              <div className="text-[11px] text-emerald-400 font-bold text-right">SATELLITE SST SYNCED</div>
            </div>'''
content = content.replace(finding3_old, finding3_new)

with open('/Users/gauravkumarnayak/Desktop/new sih/frontend/src/pages/GovernmentIntel.tsx', 'w') as f:
    f.write(content)

