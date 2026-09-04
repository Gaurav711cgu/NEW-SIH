import os
import re

for dirpath, _, filenames in os.walk('frontend/src'):
    for filename in filenames:
        if filename.endswith('.tsx'):
            filepath = os.path.join(dirpath, filename)
            with open(filepath, 'r') as f:
                content = f.read()
            
            # The previous script did (r'rounded-full', 'rounded-md').
            # Let's revert specific usages of w-1.5 h-1.5 rounded-md bg-* to rounded-full
            new_content = re.sub(r'rounded-md (bg-[a-z]+-500)', r'rounded-full \1', content)
            new_content = re.sub(r'w-2 h-2 rounded-md', r'w-2 h-2 rounded-full', new_content)
            new_content = re.sub(r'w-1\.5 h-1\.5 rounded-md', r'w-1.5 h-1.5 rounded-full', new_content)
            new_content = re.sub(r'w-3 h-3 rounded-md', r'w-3 h-3 rounded-full', new_content)
            new_content = re.sub(r'w-4 h-4 rounded-md', r'w-4 h-4 rounded-full', new_content)

            # Let's fix the crosshair circle in AUVTwin
            new_content = new_content.replace('w-32 h-32 border border-white/10 rounded-md', 'w-32 h-32 border border-white/10 rounded-full')
            
            if new_content != content:
                with open(filepath, 'w') as f:
                    f.write(new_content)
                print(f"Fixed circles in: {filepath}")

