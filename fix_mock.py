import re

with open("api/main.py", "r") as f:
    content = f.read()

# Find the mock_detections array definition block
# Let's use regex to replace everything between `mock_detections = [` and `]`
pattern = re.compile(r'mock_detections = \[\{.*?\}\]', re.DOTALL)

new_mock = """mock_detections = [{
                "object_class": "uxo_mine",
                "confidence_raw": 0.94,
                "confidence_cal": 0.98,
                "shadow_penalty": 0,
                "bbox": [100.0, 150.0, 200.0, 250.0],
                "lat": -61.213,
                "lon": 82.441,
                "depth_m": 420.5,
                "heading_deg": 12.4,
                "ping_number": 104,
                "timestamp": "2026-09-06T14:00:00Z"
            },
            {
                "object_class": "ghost_net",
                "confidence_raw": 0.88,
                "confidence_cal": 0.92,
                "shadow_penalty": 0,
                "bbox": [300.0, 400.0, 350.0, 450.0],
                "lat": -61.215,
                "lon": 82.443,
                "depth_m": 421.0,
                "heading_deg": 12.5,
                "ping_number": 108,
                "timestamp": "2026-09-06T14:00:10Z"
            }]"""

content = pattern.sub(new_mock, content)

with open("api/main.py", "w") as f:
    f.write(content)
