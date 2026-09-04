import sys
with open('frontend/src/pages/AUVTwin.tsx', 'r') as f:
    content = f.read()

content = content.replace('previousMousePosition.x', 'prevMouseX')
content = content.replace('previousMousePosition.y', 'prevMouseY')
content = content.replace('previousMousePosition = { x: e.clientX, y: e.clientY };', 'prevMouseX = e.clientX;\n      prevMouseY = e.clientY;')

with open('frontend/src/pages/AUVTwin.tsx', 'w') as f:
    f.write(content)
print("Mouse fixed")
