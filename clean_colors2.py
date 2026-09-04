import re

with open('frontend/src/pages/GovernmentIntel.tsx', 'r') as f:
    content = f.read()

# Fix DOM ALIGNMENT section remaining emerald colors
content = re.sub(r'bg-emerald-950/40', 'bg-slate-900/60 backdrop-blur-sm', content)
content = re.sub(r'text-emerald-300', 'text-slate-300', content)
content = re.sub(r'text-emerald-400', 'text-slate-300', content)
content = re.sub(r'text-emerald-500', 'text-slate-400', content)
content = re.sub(r'bg-emerald-500', 'bg-slate-500', content)

# Remove shadow insets
content = re.sub(r'shadow-\[inset_[^\]]+\]', '', content)

# Simplify the card borders
content = re.sub(r'border-white/10', 'border-slate-700/50', content)
content = re.sub(r'border-slate-800', 'border-slate-700/50', content)
content = re.sub(r'border-slate-800/80', 'border-slate-700/50', content)

# Remove the red/amber/green text classes in cards
content = re.sub(r'text-amber-400', 'text-slate-300', content)
content = re.sub(r'text-amber-300', 'text-slate-400', content)
content = re.sub(r'bg-amber-500/10', 'bg-slate-800/60', content)
content = re.sub(r'border-amber-500/30', 'border-slate-700/50', content)

content = re.sub(r'text-blue-400', 'text-slate-300', content)
content = re.sub(r'text-sky-400', 'text-slate-300', content)

# Remove ping/pulse animations entirely
content = content.replace('animate-pulse', '')

# Replace Recharts neon colors
content = content.replace('stroke="#00ff88"', 'stroke="#64748b"')
content = content.replace('stroke="#f59e0b"', 'stroke="#94a3b8"')
content = content.replace('stroke="#00e5ff"', 'stroke="#cbd5e1"')

# In the SVG, reset the AUV glow to a soft blue
content = content.replace('rgba(0, 229, 255,', 'rgba(148, 163, 184,')

with open('frontend/src/pages/GovernmentIntel.tsx', 'w') as f:
    f.write(content)
