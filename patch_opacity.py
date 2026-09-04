with open("frontend/src/App.tsx", "r") as f:
    content = f.read()

# Increase background image opacity
content = content.replace(
    'opacity-20 pointer-events-none',
    'opacity-50 pointer-events-none'
)

# Decrease foreground background opacity so the image shows through
content = content.replace(
    'bg-abyss-950/90 text-steel-100',
    'bg-abyss-950/60 text-steel-100'
)
content = content.replace(
    'bg-abyss-900/50',
    'bg-abyss-900/30'
)

with open("frontend/src/App.tsx", "w") as f:
    f.write(content)
