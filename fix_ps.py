import os

def replace_in_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except UnicodeDecodeError:
        return # Skip binary or non-utf8 files
        
    if '26065' in content:
        new_content = content.replace('26065', '26065')
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated: {filepath}")

for root, dirs, files in os.walk('.'):
    # Skip node_modules and .git
    if 'node_modules' in root or '.git' in root or '.venv' in root or '__pycache__' in root:
        continue
    for file in files:
        if file.endswith(('.tsx', '.ts', '.js', '.jsx', '.html', '.md', '.py', '.json', '.css')):
            replace_in_file(os.path.join(root, file))

