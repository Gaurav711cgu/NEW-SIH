import re
with open("/Users/gauravkumarnayak/Desktop/new sih/api/main.py", "r") as f:
    content = f.read()

# I will just revert it and do it properly.
content = re.sub(r'\n@app\.get\("/"\)\ndef read_root\(\):\n    return \{"status": "online", "service": "DeepScan API", "version": "1.0", "message": "Backend is active and receiving telemetry."\}\n', '', content)

# Now inject it AFTER the app = FastAPI(...) is completely closed.
# It ends with:
#    version="1.0.0"
# )

patch = """

@app.get("/")
def read_root():
    return {"status": "online", "service": "DeepScan API", "version": "1.0", "message": "Backend is active and receiving telemetry."}
"""

content = content.replace('    version="1.0.0"\n)', '    version="1.0.0"\n)' + patch)

with open("/Users/gauravkumarnayak/Desktop/new sih/api/main.py", "w") as f:
    f.write(content)

with open("/tmp/hf_space/api/main.py", "w") as f:
    f.write(content)

