import re

with open("frontend/src/pages/GovernmentIntel.tsx", "r") as f:
    content = f.read()

old_badge = """          <span className="px-4 py-1.5 bg-slate-800/60 text-slate-300 border border-slate-700/50 rounded-lg font-mono text-xs font-bold flex flex-col items-end">
            <span className="text-sm">AQUILA OS COST: ₹75,000</span>
            <span className="text-[9px] text-slate-400/80">VS ₹30 LAKH COMMERCIAL ARGO FLOAT</span>
          </span>"""

new_badge = """          <div className="flex gap-3">
            <span className="px-4 py-1.5 bg-slate-800/60 text-slate-300 border border-slate-700/50 rounded-lg font-mono text-xs font-bold flex flex-col items-end">
              <span className="text-sm">AQUILA COST: ₹75,000</span>
              <span className="text-[9px] text-slate-400/80">VS ₹30 LAKH COMMERCIAL ARGO FLOAT</span>
            </span>
            <span className="px-4 py-1.5 bg-emerald-900/30 text-emerald-400 border border-emerald-800/50 rounded-lg font-mono text-xs font-bold flex flex-col items-end shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <span className="text-sm">SCALE: 54,360 UNITS</span>
              <span className="text-[9px] text-emerald-500/80">DEPLOYABLE PER DOM BUDGET</span>
            </span>
          </div>"""

if old_badge in content:
    content = content.replace(old_badge, new_badge)
    with open("frontend/src/pages/GovernmentIntel.tsx", "w") as f:
        f.write(content)
    print("Patched DOM scale badge successfully.")
else:
    print("Could not find the exact old badge.")
