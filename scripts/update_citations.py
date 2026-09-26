import re

with open('/Users/gauravkumarnayak/Desktop/new sih/frontend/src/pages/ResearchCitations.tsx', 'r') as f:
    content = f.read()

# We need to replace the rendering of `howAquilaUsesIt`, `missionAchievement`, and `verificationProof` inside the `.map` function.
# Specifically, we replace `<p className="text-xs text-steel-200 leading-relaxed font-sans mt-2">{item.howAquilaUsesIt}</p>`
# with a grid structure. Wait, how is it currently rendered? I don't see it exactly. Let's grep for how it is rendered.

