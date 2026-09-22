import os

file_path = '/Users/gauravkumarnayak/Desktop/new sih/frontend/src/components/layout/Sidebar.tsx'

replacements = {
    'bg-abyss-900/80 backdrop-blur-xl border-r border-steel-800/60': 'bg-[#1c1c1e]/80 backdrop-blur-[20px] border-r border-[#38383a]',
    'border-steel-800/60': 'border-[#38383a]',
    'bg-abyss-700/65': 'bg-[#2c2c2e]',
    'text-ice-100': 'text-[#ffffff]',
    'border-ice-500/20': 'border-[#38383a]',
    'text-steel-400': 'text-[#ebebf599]',
    'hover:bg-abyss-800/50': 'hover:bg-[#2c2c2e]/50',
    'hover:text-ice-200': 'hover:text-[#ffffff]',
    'bg-zinc-900/50': 'bg-[#2c2c2e]',
    'text-zinc-300': 'text-[#ebebf5]',
    'border-white/10': 'border-[#38383a]',
    'text-emerald-400': 'text-[#34c759]'
}

with open(file_path, 'r') as f:
    content = f.read()
    
for old, new in replacements.items():
    content = content.replace(old, new)
    
with open(file_path, 'w') as f:
    f.write(content)

print("Sidebar patched!")
