with open("README.md", "r") as f:
    content = f.read()

# 1. Remove the X-Factor PS line from the header
old_header = """**Primary Problem Statement:** PS-26065 (NCPOR) - Autonomous, low-cost ocean observation platform.  
**X-Factor Integration:** PS-26065 (NIOT) - Edge-AI underwater debris detection via Side-Scan Sonar."""

new_header = """**Problem Statement:** PS-26065 (NCPOR) - Autonomous, low-cost ocean observation platform."""

content = content.replace(old_header, new_header)

# 2. Reframe Section 3 heading
old_heading_3 = "## 3. The Differentiator: Edge-AI Debris Detection (PS-26065 Integration)"
new_heading_3 = "## 3. The Differentiator: Edge-AI Underwater Debris Detection"
content = content.replace(old_heading_3, new_heading_3)

# 3. Just in case there are any other rogue mentions of PS-26065, replace them
content = content.replace("PS-26065", "the Debris Detection Engine")

with open("README.md", "w") as f:
    f.write(content)

print("Removed all mentions of PS-26065.")
