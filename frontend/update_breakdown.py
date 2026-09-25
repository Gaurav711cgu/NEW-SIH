import re

with open('./src/pages/AUVTwin.tsx', 'r') as f:
    content = f.read()

# Replace the math equation line with the breakdown
# Actually, let's keep the math equation, but add the breakdown div right after the flex container of the 3 metrics

pattern = r"(\s*)(</div>\n\s*</div>\n\s*\{\/\* ── 3-TIER ARCHITECTURAL FILTER TABS ── \*\/})"

new_breakdown = r"""\1</div>

\1{/* Cost Breakdown Justification */}
\1<div className="mt-4 p-4 bg-[#0a0d15]/80 border border-white/5 rounded-xl text-xs font-mono shadow-inner">
\1  <div className="text-steel-400 mb-3 font-bold uppercase tracking-wider flex items-center gap-2">
\1    <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
\1    Apples-to-Apples Fully Loaded Cost Breakdown
\1  </div>
\1  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[10px] text-steel-500">
\1    <div className="bg-emerald-950/20 p-3 rounded-lg border border-emerald-900/30">
\1      <span className="text-emerald-400 font-bold block mb-2 text-[11px]">AQUILA FULLY LOADED (~₹4.5 LAKHS)</span>
\1      <ul className="space-y-1.5 list-none">
\1        <li className="flex justify-between"><span>Base AUV Hull, Propulsion & Battery:</span><span className="text-emerald-300">₹1,00,000</span></li>
\1        <li className="flex justify-between"><span>Indigenous CTD, DO & Chl Sensors:</span><span className="text-emerald-300">₹20,500</span></li>
\1        <li className="flex justify-between"><span>Modular Side-Scan Sonar Bay:</span><span className="text-emerald-300">₹1,50,000</span></li>
\1        <li className="flex justify-between"><span>Micro-USBL Acoustic Positioning:</span><span className="text-emerald-300">₹95,000</span></li>
\1        <li className="flex justify-between"><span>NVIDIA Orin Edge AI Pod:</span><span className="text-emerald-300">₹48,000</span></li>
\1        <li className="flex justify-between"><span>Iridium Satcom Modem:</span><span className="text-emerald-300">₹25,000</span></li>
\1        <li className="flex justify-between pt-1 border-t border-white/5 mt-1 font-bold text-ice-300"><span>TOTAL AT SCALE:</span><span>~₹4.38 LAKHS</span></li>
\1      </ul>
\1    </div>
\1    <div className="bg-red-950/20 p-3 rounded-lg border border-red-900/30">
\1      <span className="text-red-400 font-bold block mb-2 text-[11px]">IMPORTED EQUIVALENTS (~₹30L - ₹1.4 Cr)</span>
\1      <ul className="space-y-1.5 list-none">
\1        <li className="flex justify-between"><span>Base Glider (Kongsberg/Slocum):</span><span className="text-red-300">₹25,00,000+</span></li>
\1        <li className="flex justify-between"><span>Sea-Bird CTD & Optical Sensors:</span><span className="text-red-300">₹39,00,000+</span></li>
\1        <li className="flex justify-between"><span>EdgeTech SSS System:</span><span className="text-red-300">₹45,00,000+</span></li>
\1        <li className="flex justify-between"><span>Sonardyne USBL Positioning:</span><span className="text-red-300">₹35,00,000+</span></li>
\1        <li className="flex justify-between"><span>Subsea Compute & Satcom:</span><span className="text-red-300">₹36,50,000+</span></li>
\1      </ul>
\1    </div>
\1  </div>
\1</div>\n\1</div>\n\1{/* ── 3-TIER ARCHITECTURAL FILTER TABS ── */}"""

content = re.sub(pattern, new_breakdown, content)

with open('./src/pages/AUVTwin.tsx', 'w') as f:
    f.write(content)
