import os

files_to_patch = [
    'frontend/src/pages/DigitalTwin.tsx',
    'frontend/src/pages/AUVTwin.tsx',
    'frontend/src/pages/OceanState.tsx',
    'frontend/src/pages/GovernmentIntel.tsx',
    'frontend/src/pages/SeafloorIntelligence.tsx',
    'frontend/src/pages/Biogeochemistry.tsx',
    'frontend/src/pages/MissionControl.tsx',
]

replacements = {
    'bg-black/40 backdrop-blur-md border border-cyan-500/20': 'bg-[#1c1c1e] border border-[#38383a]',
    'bg-[#050f1a]': 'bg-[#1c1c1e]',
    'bg-[#0a1628]': 'bg-[#1c1c1e]',
    'bg-black/30': 'bg-[#2c2c2e]',
    'bg-black/80': 'bg-[#2c2c2e]',
    'border-cyan-500/10': 'border-[#38383a]',
    'border-cyan-500/20': 'border-[#38383a]',
    'border-cyan-500/30': 'border-[#38383a]',
    'border-white/5': 'border-[#38383a]',
    'text-cyan-500/50': 'text-[#ebebf599]',
    'text-cyan-500/60': 'text-[#ebebf599]',
    'text-cyan-500/80': 'text-[#ebebf5]',
    'text-cyan-500': 'text-[#ebebf599]',
    'text-cyan-400': 'text-[#ffffff]',
    'text-cyan-100': 'text-[#ffffff]',
    'text-cyan-200/60': 'text-[#ebebf599]',
    'text-cyan-200/80': 'text-[#ebebf599]',
    'text-green-400': 'text-[#34c759]',
    'text-red-400': 'text-[#ff453a]',
    'text-yellow-400': 'text-[#ff9f0a]',
    'text-red-200': 'text-[#ff453a]',
    'text-yellow-200': 'text-[#ff9f0a]',
    '#00e5ff1a': '#38383a',
    '#00e5ff40': '#38383a',
    '#00e5ff80': '#ebebf599',
    '#00e5ff': '#ffffff',
    '#0a1628': '#1c1c1e',
    '#050f1a': '#1c1c1e'
}

base_dir = '/Users/gauravkumarnayak/Desktop/new sih/'

for rel_path in files_to_patch:
    file_path = os.path.join(base_dir, rel_path)
    if not os.path.exists(file_path):
        continue
        
    with open(file_path, 'r') as f:
        content = f.read()
        
    for old, new in replacements.items():
        content = content.replace(old, new)
        
    with open(file_path, 'w') as f:
        f.write(content)
        
print("Theme patched across all pages!")
