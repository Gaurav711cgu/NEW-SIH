import re

with open('./src/pages/AUVTwin.tsx', 'r') as f:
    content = f.read()

old_block = """          <div className="bg-abyss-950 px-3 py-1.5 rounded-lg border border-steel-800">
            <span className="text-steel-500 mr-2">REALISTIC SAVINGS:</span>
            <span className="text-amber-400 font-bold">~85% COST REDUCTION (6x)</span>
          </div>"""

new_block = """          <div className="bg-abyss-950 px-3 py-1.5 rounded-lg border border-steel-800 flex flex-col">
            <div>
              <span className="text-steel-500 mr-2">REALISTIC SAVINGS:</span>
              <span className="text-amber-400 font-bold">~85% COST REDUCTION (6x)</span>
            </div>
            <span className="text-[9px] text-steel-500/80 font-medium tracking-wide mt-0.5">
              MATH: (₹30L IMPORTED - ₹4.5L FULLY LOADED) / ₹30L = 85.0%
            </span>
          </div>"""

content = content.replace(old_block, new_block)

with open('./src/pages/AUVTwin.tsx', 'w') as f:
    f.write(content)
