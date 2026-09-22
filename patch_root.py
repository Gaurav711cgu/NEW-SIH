import sys

filepath = sys.argv[1]
with open(filepath, 'r') as f:
    content = f.read()

if '@app.get("/")' not in content:
    patch = """
@app.get("/")
def read_root():
    return {"status": "online", "service": "DeepScan API", "version": "1.0", "message": "Backend is active and receiving telemetry."}
"""
    # Insert it right after app = FastAPI(...)
    if "app = FastAPI" in content:
        parts = content.split("app = FastAPI")
        # find the next newline after app = FastAPI
        newline_idx = parts[1].find("\n")
        new_content = parts[0] + "app = FastAPI" + parts[1][:newline_idx+1] + patch + parts[1][newline_idx+1:]
        with open(filepath, 'w') as f:
            f.write(new_content)
        print("Patched " + filepath)
    else:
        print("Could not find app = FastAPI")
else:
    print("Already patched")
