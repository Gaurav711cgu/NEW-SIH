import re

with open("frontend/src/pages/AUVTwin.tsx", "r") as f:
    content = f.read()

# Revert the bad JSX
content = content.replace("<CheckCircle2, Activity", "<CheckCircle2")

# But ensure the import block still has Activity.
# Wait, the import block had "CheckCircle2\n} from 'lucide-react';"
# Since I replaced it globally, it became "CheckCircle2, Activity\n} from 'lucide-react';"
# Which is correct for the import block! 
# I just need to fix the JSX tag.

with open("frontend/src/pages/AUVTwin.tsx", "w") as f:
    f.write(content)
