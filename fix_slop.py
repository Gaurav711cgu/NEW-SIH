import os
import re

directories = ['frontend/src/pages', 'frontend/src/components']

replacements = [
    # Nuking random text colors
    (r'text-cyan-\d+', 'text-zinc-300'),
    (r'text-blue-\d+', 'text-zinc-300'),
    (r'text-sky-\d+', 'text-zinc-300'),
    (r'text-purple-\d+', 'text-zinc-300'),
    (r'text-fuchsia-\d+', 'text-zinc-300'),
    (r'text-pink-\d+', 'text-zinc-300'),
    (r'text-yellow-\d+', 'text-zinc-400'),
    (r'text-orange-\d+', 'text-zinc-400'),
    (r'text-indigo-\d+', 'text-zinc-300'),

    # Nuking random borders
    (r'border-cyan-\d+/\d+', 'border-white/10'),
    (r'border-blue-\d+/\d+', 'border-white/10'),
    (r'border-purple-\d+/\d+', 'border-white/10'),
    (r'border-emerald-\d+/\d+', 'border-white/10'), # Keep emerald for text, but border should be neutral
    (r'border-yellow-\d+/\d+', 'border-white/10'),
    (r'border-red-\d+/\d+', 'border-white/10'),

    # Standardize border colors if no opacity is specified
    (r'border-cyan-\d+', 'border-zinc-800'),
    (r'border-blue-\d+', 'border-zinc-800'),
    (r'border-purple-\d+', 'border-zinc-800'),

    # Nuking random backgrounds
    (r'bg-cyan-\d+/\d+', 'bg-zinc-900/50'),
    (r'bg-blue-\d+/\d+', 'bg-zinc-900/50'),
    (r'bg-purple-\d+/\d+', 'bg-zinc-900/50'),
    (r'bg-emerald-\d+/\d+', 'bg-zinc-900/50'), # Emerald bg is usually ugly, text is better
    (r'bg-yellow-\d+/\d+', 'bg-zinc-900/50'),
    (r'bg-indigo-\d+/\d+', 'bg-zinc-900/50'),

    # Nuking generic glowing shadows
    (r'shadow-\[.*?\]', 'shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'),
    (r'shadow-cyan-\d+/\d+', 'shadow-none'),
    (r'shadow-blue-\d+/\d+', 'shadow-none'),
    (r'shadow-emerald-\d+/\d+', 'shadow-none'),
    (r'shadow-lg', 'shadow-sm'),
    (r'shadow-xl', 'shadow-md'),
    (r'shadow-2xl', 'shadow-md'),
    
    # Enforcing anti-cards
    (r'rounded-2xl', 'rounded-lg'),
    (r'rounded-xl', 'rounded-lg'),
    (r'rounded-full', 'rounded-md'), # A bit aggressive, let's keep rounded-full for pills maybe? actually tactical UI prefers slight rounds
]

for root_dir in directories:
    for dirpath, _, filenames in os.walk(root_dir):
        for filename in filenames:
            if filename.endswith('.tsx'):
                filepath = os.path.join(dirpath, filename)
                with open(filepath, 'r') as f:
                    content = f.read()
                
                new_content = content
                for pattern, replacement in replacements:
                    new_content = re.sub(pattern, replacement, new_content)
                
                # Manual tactical overrides for buttons and containers
                new_content = new_content.replace('bg-blue-900/20', 'bg-zinc-900/50')
                new_content = new_content.replace('bg-emerald-900/20', 'bg-zinc-900/50')
                
                if new_content != content:
                    with open(filepath, 'w') as f:
                        f.write(new_content)
                    print(f"Refactored: {filepath}")

print("Refactoring complete.")
