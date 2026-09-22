import re

with open("frontend/src/pages/AUVTwin.tsx", "r") as f:
    content = f.read()

# 1. Move Depth Gauge to extreme left
content = content.replace(
    'className="absolute top-16 left-6 h-64 w-14',
    'className="absolute top-16 left-2 h-64 w-14'
)

# 2. Move Telemetry box to left-20
content = content.replace(
    'className="absolute top-16 left-24 flex flex-col gap-2',
    'className="absolute top-16 left-20 flex flex-col gap-2'
)

# 3. Move TEOS-10 Terminal to left-20 (same vertical column as telemetry) and adjust width
content = content.replace(
    'className="absolute bottom-10 right-6 w-[28rem]',
    'className="absolute bottom-12 left-20 w-[26rem]'
)

with open("frontend/src/pages/AUVTwin.tsx", "w") as f:
    f.write(content)

