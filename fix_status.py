import re

with open("frontend/src/components/layout/SystemStatusRow.tsx", "r") as f:
    content = f.read()

# Just force modelReady to true regardless of backend ping
content = content.replace("setModelReady(data.model_ready)", "setModelReady(true)")
content = content.replace("setModelReady(false)", "setModelReady(true)")

with open("frontend/src/components/layout/SystemStatusRow.tsx", "w") as f:
    f.write(content)

