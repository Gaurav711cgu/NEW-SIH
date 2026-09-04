import re

with open('frontend/src/pages/GovernmentIntel.tsx', 'r') as f:
    content = f.read()

# Remove gradients
content = re.sub(r'bg-gradient-to-r from-[a-z]+-\d+/[0-9]+ via-[a-z]+-\d+ to-[a-z]+-\d+', 'bg-slate-900/60 backdrop-blur-sm', content)

# Normalize highly colored backgrounds
content = re.sub(r'bg-\[#0a1628\]', 'bg-slate-900/60 backdrop-blur-sm', content)
content = re.sub(r'bg-slate-900(/90)?', 'bg-slate-900/60 backdrop-blur-sm', content)
content = re.sub(r'bg-zinc-900/50', 'bg-slate-800/60', content)

# Normalize finding box colors
content = re.sub(r'bg-red-900/30', 'bg-slate-800/60', content)
content = re.sub(r'bg-red-900/50', 'bg-red-500/20', content)
content = re.sub(r'bg-red-950/20', 'bg-slate-800/60', content)
content = re.sub(r'border-red-900/30', 'border-slate-700', content)

content = re.sub(r'bg-amber-900/30', 'bg-slate-800/60', content)
content = re.sub(r'bg-amber-900/50', 'bg-amber-500/20', content)
content = re.sub(r'bg-amber-950/20', 'bg-slate-800/60', content)
content = re.sub(r'border-amber-900/30', 'border-slate-700', content)

content = re.sub(r'bg-sky-900/30', 'bg-slate-800/60', content)
content = re.sub(r'bg-sky-900/50', 'bg-blue-500/20', content)
content = re.sub(r'bg-sky-950/20', 'bg-slate-800/60', content)
content = re.sub(r'border-sky-900/30', 'border-slate-700', content)

# Make SVG map less rainbow
content = content.replace('rgba(244, 114, 182, 0.15)', 'rgba(239, 68, 68, 0.15)') # pink -> red
content = content.replace('rgba(244, 114, 182, 0.25)', 'rgba(239, 68, 68, 0.25)')
content = content.replace('#f472b6', '#ef4444') # pink -> red

content = content.replace('rgba(168, 85, 247, 0.15)', 'rgba(245, 158, 11, 0.15)') # purple -> amber
content = content.replace('#a855f7', '#f59e0b') # purple -> amber

content = content.replace('rgba(0, 229, 255, 0.15)', 'rgba(148, 163, 184, 0.15)') # cyan -> slate
content = content.replace('#00e5ff', '#94a3b8') # cyan -> slate (except maybe for the AUV path, but it's okay)

content = content.replace('#facc15', '#94a3b8') # yellow -> slate

# Change animate-ping to be less intrusive or remove it
content = content.replace('className="animate-ping"', '')

with open('frontend/src/pages/GovernmentIntel.tsx', 'w') as f:
    f.write(content)
