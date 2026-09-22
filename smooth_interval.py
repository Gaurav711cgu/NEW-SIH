import re

with open("frontend/src/pages/AUVTwin.tsx", "r") as f:
    content = f.read()

# Change depth step from 10 to 2
content = content.replace("currentDepth += 10;", "currentDepth += 2;")

# Change the probability of anomalies so they still happen at roughly the same rate per second
content = content.replace("if (rand < 0.08) {", "if (rand < 0.02) {")
content = content.replace("else if (rand > 0.90) {", "else if (rand > 0.97) {")

# Change interval time from 2500 to 500
content = content.replace("}, 2500);", "}, 500);")

# Also, let's fix the Terminal logs so we don't spam 4 logs every 500ms.
# If there is no anomaly, we can just log a single concise line.
# Wait, if we tick every 500ms, the logs will fly by very fast!
# That actually looks super cool and "hackery" for a terminal. 
# But let's increase the log limit to 10 so it fills the box nicely while flying by.
content = content.replace(
    "if (newLogs.length > 6) return newLogs.slice(newLogs.length - 6);",
    "if (newLogs.length > 10) return newLogs.slice(newLogs.length - 10);"
)


with open("frontend/src/pages/AUVTwin.tsx", "w") as f:
    f.write(content)

