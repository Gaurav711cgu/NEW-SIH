import sys
with open('frontend/src/pages/GovernmentIntel.tsx', 'r') as f:
    content = f.read()

old_block = """          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 rounded-lg font-mono text-xs font-bold flex flex-col items-end">
            <span>COST: ₹75,000 – ₹1,00,000</span>
            <span className="text-[9px] text-emerald-500/70">VS ₹30 LAKH COMMERCIAL ARGO (OURS: ₹75,000)</span>
          </span>"""

new_block = """          <span className="px-4 py-1.5 bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 rounded-lg font-mono text-xs font-bold flex flex-col items-end">
            <span className="text-sm">AQUILA OS COST: ₹75,000</span>
            <span className="text-[9px] text-emerald-500/80">VS ₹30 LAKH COMMERCIAL ARGO FLOAT</span>
          </span>"""

if old_block in content:
    content = content.replace(old_block, new_block)
    with open('frontend/src/pages/GovernmentIntel.tsx', 'w') as f:
        f.write(content)
    print("Fixed cost text")
else:
    print("Could not find the exact block to replace")
