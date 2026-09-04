import re

with open("frontend/src/pages/GovernmentIntel.tsx", "r") as f:
    content = f.read()

# Replace the outer container to have a gradient
content = content.replace(
    'className="bg-slate-900/60 backdrop-blur-sm/60 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6 shadow-md relative overflow-hidden group"',
    'className="bg-gradient-to-br from-slate-900/80 via-blue-900/20 to-cyan-900/20 backdrop-blur-md border border-cyan-700/30 rounded-lg p-6 shadow-[0_0_15px_rgba(8,145,178,0.15)] relative overflow-hidden group"'
)

# Fix the title color
content = content.replace(
    '<h2 className="text-xl font-mono font-bold text-slate-200 mb-2 flex items-center gap-3">',
    '<h2 className="text-xl font-mono font-bold text-cyan-400 mb-2 flex items-center gap-3 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">'
)
content = content.replace(
    '<h2 className="text-xl font-mono font-bold text-slate-300 mb-2 flex items-center gap-3">',
    '<h2 className="text-xl font-mono font-bold text-cyan-400 mb-2 flex items-center gap-3 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">'
)

# Fix the SVG background icon
content = content.replace(
    '<Network className="w-64 h-64 text-slate-700 opacity-20 group-hover:opacity-30 transition-opacity duration-700" />',
    '<Network className="w-64 h-64 text-cyan-500 opacity-10 group-hover:opacity-20 group-hover:scale-105 transition-all duration-700" />'
)
content = content.replace(
    '<div className="absolute -top-10 -right-10 opacity-30 pointer-events-none">',
    '<div className="absolute -top-10 -right-10 pointer-events-none">'
)

# Update stat boxes
content = content.replace(
    '<div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 p-4 rounded-lg flex flex-col items-center text-center justify-center relative overflow-hidden">',
    '<div className="bg-slate-900/40 backdrop-blur-sm border border-cyan-800/40 p-4 rounded-lg flex flex-col items-center text-center justify-center relative overflow-hidden hover:border-cyan-500/50 transition-colors shadow-inner">'
)
content = content.replace(
    '<div className="text-2xl font-bold text-slate-100 mb-1">',
    '<div className="text-2xl font-bold text-cyan-300 mb-1 drop-shadow-md">'
)
content = content.replace(
    '<div className="text-[10px] text-slate-400 font-mono tracking-wider">',
    '<div className="text-[10px] text-cyan-100/70 font-mono tracking-wider">'
)

# Highlight some text
content = content.replace(
    '<span className="text-slate-200">',
    '<span className="text-cyan-300 font-semibold">'
)

# Fix badges
content = content.replace(
    'bg-slate-800/60 text-slate-300 border-slate-600',
    'bg-cyan-900/30 text-cyan-300 border-cyan-700/50'
)

content = content.replace(
    'bg-slate-800 text-slate-200 border-slate-600',
    'bg-cyan-900/40 text-cyan-200 border-cyan-700 hover:bg-cyan-800/60'
)

content = content.replace(
    'bg-slate-500/20 text-slate-300 text-[10px]',
    'bg-emerald-900/40 text-emerald-400 text-[10px]'
)

# Icons
content = content.replace(
    '<ShieldCheck className="w-5 h-5" />',
    '<ShieldCheck className="w-5 h-5 text-emerald-400" />'
)
content = content.replace(
    '<Share2 className="w-5 h-5 " />',
    '<Share2 className="w-5 h-5 text-blue-400" />'
)

with open("frontend/src/pages/GovernmentIntel.tsx", "w") as f:
    f.write(content)

print("Colors restored.")
