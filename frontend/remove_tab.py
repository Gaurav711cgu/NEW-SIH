import re

with open('./src/pages/AUVTwin.tsx', 'r') as f:
    content = f.read()

# Remove the second button
pattern = r"<button\s+onClick=\{\(\) => setSelectedTier\('DL_EDGE INFERENCE_REPLICATED'\)\}[\s\S]*?<\/button>"
content = re.sub(pattern, "", content)

# Rename Tab 3 to Tab 2
content = content.replace("3. POST-SELECTION MODULAR BAYS", "2. POST-SELECTION MODULAR BAYS")

# Also, since I changed the tier of those three sensors from DL_EDGE INFERENCE_REPLICATED to INDIGENOUS_PHYSICAL, I need to make sure ALL SUBSYSTEMS is 8, but PHYSICAL SENSORS will now show 8 instead of 5, so the "(₹19.5k BOM)" might need to be adjusted.
# Let's write the content back
with open('./src/pages/AUVTwin.tsx', 'w') as f:
    f.write(content)
