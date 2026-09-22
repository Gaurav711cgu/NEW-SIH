import re

with open("frontend/src/pages/AUVTwin.tsx", "r") as f:
    content = f.read()

# 1. Limit the log array to 5 items so it doesn't grow huge
content = content.replace(
    "if (newLogs.length > 12) return newLogs.slice(newLogs.length - 12);",
    "if (newLogs.length > 6) return newLogs.slice(newLogs.length - 6);"
)

# 2. Fix the terminal container: explicitly set height and make it smaller
content = content.replace(
    'className="absolute bottom-10 right-24 w-[22rem] bg-black/90 border border-steel-700/50 rounded flex flex-col pointer-events-auto"',
    'className="absolute bottom-10 right-24 w-72 h-44 bg-black/90 border border-steel-700/50 rounded flex flex-col pointer-events-auto"'
)

# 3. Change text size and overflow handling
content = content.replace(
    '<div className="flex-1 p-2 font-mono text-[9px] flex flex-col justify-end gap-1 overflow-hidden h-36">',
    '<div className="flex-1 p-2 font-mono text-[8px] flex flex-col justify-end gap-1 overflow-hidden">'
)

with open("frontend/src/pages/AUVTwin.tsx", "w") as f:
    f.write(content)

