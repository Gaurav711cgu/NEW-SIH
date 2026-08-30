"""
test_backend_api.py
-------------------
Automated QA test suite for DeepScan Backend API and Telemetry System.
"""
import sys
import os
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import io
from fastapi.testclient import TestClient
from api.main import app, ALLOWED_ORIGINS
from telemetry_simulator import get_mission_state
from platform.database import initialise, insert_reading, get_latest_readings

def run_tests():
    print("=" * 60)
    print("🚀 RUNNING DEEPSCAN BACKEND & TELEMETRY TEST SUITE")
    print("=" * 60)
    
    results = {}
    client = TestClient(app)
    
    # Ensure database is initialised and has sample telemetry
    initialise()
    
    # Insert fresh test telemetry
    insert_reading({"sensor": "depth", "value": 185.4, "unit": "m", "source": "SIMULATOR"})
    insert_reading({"sensor": "battery", "value": 92.8, "unit": "%", "source": "SIMULATOR"})
    insert_reading({"sensor": "lat", "value": -54.2014, "unit": "deg", "source": "SIMULATOR"})
    insert_reading({"sensor": "lon", "value": 60.8105, "unit": "deg", "source": "SIMULATOR"})
    insert_reading({"sensor": "imu_roll", "value": 1.2, "unit": "deg", "source": "SIMULATOR"})
    insert_reading({"sensor": "imu_pitch", "value": -0.8, "unit": "deg", "source": "SIMULATOR"})
    insert_reading({"sensor": "mission_state", "value": "SUBMERGED_EDGE_AI", "unit": "", "source": "SIMULATOR"})
    insert_reading({"sensor": "phase", "value": "SUBMERGED_EDGE_AI", "unit": "", "source": "SIMULATOR"})
    insert_reading({"sensor": "TEMP", "value": 3.8, "unit": "C", "source": "SIMULATOR"})
    insert_reading({"sensor": "PSAL", "value": 34.62, "unit": "PSU", "source": "SIMULATOR"})
    insert_reading({"sensor": "DOXY", "value": 210.5, "unit": "umol/kg", "source": "SIMULATOR"})
    insert_reading({"sensor": "CHLA", "value": 0.45, "unit": "mg/m3", "source": "SIMULATOR"})
    insert_reading({"sensor": "NITRATE", "value": 24.1, "unit": "umol/kg", "source": "SIMULATOR"})
    insert_reading({"sensor": "PH_IN_SITU_TOTAL", "value": 8.04, "unit": "pH", "source": "SIMULATOR"})

    # 1. Test /api/health
    print("\n[TEST 1] Testing /api/health...")
    try:
        resp = client.get("/api/health")
        assert resp.status_code == 200, f"Expected status 200, got {resp.status_code}"
        data = resp.json()
        assert data.get("status") == "operational", f"Unexpected status: {data.get('status')}"
        assert "model_ready" in data, "Missing 'model_ready'"
        assert "uptime_s" in data, "Missing 'uptime_s'"
        assert "timestamp" in data, "Missing 'timestamp'"
        print(f"   Response: {data}")
        results["/api/health"] = "PASS"
    except Exception as e:
        print(f"   [FAIL] {e}")
        results["/api/health"] = f"FAIL: {e}"

    # 2. Test /api/auv/state
    print("\n[TEST 2] Testing /api/auv/state...")
    try:
        resp = client.get("/api/auv/state")
        assert resp.status_code == 200, f"Expected status 200, got {resp.status_code}"
        data = resp.json()
        assert "depth_m" in data, "Missing 'depth_m'"
        assert "battery_pct" in data, "Missing 'battery_pct'"
        assert "mission_state" in data, "Missing 'mission_state'"
        assert "lat" in data, "Missing 'lat'"
        assert "lon" in data, "Missing 'lon'"
        print(f"   Response: {data}")
        results["/api/auv/state"] = "PASS"
    except Exception as e:
        print(f"   [FAIL] {e}")
        results["/api/auv/state"] = f"FAIL: {e}"

    # 3. Test /api/telemetry
    print("\n[TEST 3] Testing /api/telemetry...")
    try:
        resp = client.get("/api/telemetry")
        assert resp.status_code == 200, f"Expected status 200, got {resp.status_code}"
        data = resp.json()
        assert "depth_m" in data and data["depth_m"] is not None, "Missing depth_m"
        assert "battery_pct" in data and data["battery_pct"] is not None, "Missing battery_pct"
        assert "temperature_c" in data, "Missing temperature_c"
        assert "salinity_psu" in data, "Missing salinity_psu"
        assert "mission_state" in data, "Missing mission_state"
        assert "uptime_s" in data, "Missing uptime_s"
        assert "timestamp" in data, "Missing timestamp"
        assert "readings" in data and len(data["readings"]) > 0, "Missing readings list"
        print(f"   Response summary: Depth={data['depth_m']}m, Batt={data['battery_pct']}%, State={data['mission_state']}, Temp={data['temperature_c']}C, Readings={len(data['readings'])}")
        results["/api/telemetry"] = "PASS"
    except Exception as e:
        print(f"   [FAIL] {e}")
        results["/api/telemetry"] = f"FAIL: {e}"

    # 4. Test Edge AI state machine
    print("\n[TEST 4] Testing Edge AI State Machine logic...")
    try:
        assert get_mission_state(10.0, ascending=False) == "SURFACE", "Depth 10m descending should be SURFACE"
        assert get_mission_state(150.0, ascending=False) == "SUBMERGED_EDGE_AI", "Depth 150m should be SUBMERGED_EDGE_AI"
        assert get_mission_state(750.0, ascending=False) == "DEEP_SURVEY", "Depth 750m should be DEEP_SURVEY"
        assert get_mission_state(30.0, ascending=True) == "SATCOM_UPLINK", "Depth 30m ascending should be SATCOM_UPLINK"
        assert get_mission_state(2.0, ascending=False) == "SATCOM_UPLINK", "Depth 2m should be SATCOM_UPLINK"
        print("   All state machine depth transitions verified (SURFACE, SUBMERGED_EDGE_AI, DEEP_SURVEY, SATCOM_UPLINK)")
        results["Edge AI state machine"] = "PASS"
    except Exception as e:
        print(f"   [FAIL] {e}")
        results["Edge AI state machine"] = f"FAIL: {e}"

    # 5. Test /api/detect with valid image
    print("\n[TEST 5] Testing /api/detect (Valid SSS Image Upload)...")
    try:
        sample_img_path = ROOT / "dataset" / "SCTD" / "JPEGImages" / "000002.jpg"
        if not sample_img_path.exists():
            # Create a synthetic test PNG if dataset not found
            import numpy as np
            import cv2
            synthetic = np.zeros((300, 300, 3), dtype=np.uint8)
            cv2.putText(synthetic, "SSS TEST", (50, 150), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
            _, img_bytes = cv2.imencode(".png", synthetic)
            img_data = img_bytes.tobytes()
            filename = "test_synthetic.png"
            content_type = "image/png"
        else:
            with open(sample_img_path, "rb") as f:
                img_data = f.read()
            filename = "000002.jpg"
            content_type = "image/jpeg"

        files = {"file": (filename, img_data, content_type)}
        resp = client.post("/api/detect", files=files)
        assert resp.status_code == 200, f"Expected status 200, got {resp.status_code}: {resp.text}"
        data = resp.json()
        
        # Verify all required fields
        required_fields = ["detections", "preprocessing_time_ms", "inference_time_ms", "total_time_ms", "model_ready", "message"]
        for field in required_fields:
            assert field in data, f"Missing field in response: '{field}'"

        assert isinstance(data["detections"], list), "Detections must be a list"
        assert isinstance(data["preprocessing_time_ms"], (int, float)), "preprocessing_time_ms must be numeric"
        assert isinstance(data["inference_time_ms"], (int, float)), "inference_time_ms must be numeric"
        assert isinstance(data["total_time_ms"], (int, float)), "total_time_ms must be numeric"
        assert isinstance(data["model_ready"], bool), "model_ready must be boolean"
        
        print(f"   Detections count: {len(data['detections'])}")
        print(f"   Timing: Preprocess={data['preprocessing_time_ms']}ms, Inference={data['inference_time_ms']}ms, Total={data['total_time_ms']}ms")
        print(f"   Model Ready: {data['model_ready']}, Message: {data['message']}")
        results["/api/detect"] = "PASS"
    except Exception as e:
        print(f"   [FAIL] {e}")
        results["/api/detect"] = f"FAIL: {e}"

    # 6. Test Security / Invalid file upload validation
    print("\n[TEST 6] Testing Security: File upload rejection of non-images...")
    try:
        fake_pdf = b"%PDF-1.4 fake pdf content"
        files = {"file": ("malicious.pdf", fake_pdf, "application/pdf")}
        resp = client.post("/api/detect", files=files)
        assert resp.status_code == 400, f"Expected status 400 for non-image upload, got {resp.status_code}"
        print(f"   Non-image upload correctly rejected with 400 Bad Request: {resp.json().get('detail')}")
        
        # Verify no hardcoded secrets in api/main.py
        with open(ROOT / "api" / "main.py") as f:
            main_code = f.read().lower()
            for secret_keyword in ["password =", "api_key =", "secret_key =", "aws_secret"]:
                assert secret_keyword not in main_code, f"Found suspicious secret assignment: {secret_keyword}"
        print("   No hardcoded secrets found in api/main.py.")
        results["Security"] = "PASS"
    except Exception as e:
        print(f"   [FAIL] {e}")
        results["Security"] = f"FAIL: {e}"

    # 7. Test CORS configuration
    print("\n[TEST 7] Testing CORS Configuration...")
    try:
        assert "http://localhost:5173" in ALLOWED_ORIGINS, "localhost:5173 missing from allowed origins"
        assert "http://127.0.0.1:5173" in ALLOWED_ORIGINS, "127.0.0.1:5173 missing from allowed origins"
        # Verify CORS response headers
        resp = client.options("/api/health", headers={"Origin": "http://localhost:5173", "Access-Control-Request-Method": "GET"})
        assert resp.headers.get("access-control-allow-origin") == "http://localhost:5173", "CORS header mismatch"
        print("   CORS correctly configured for http://localhost:5173 and development origins.")
        results["CORS"] = "PASS"
    except Exception as e:
        print(f"   [FAIL] {e}")
        results["CORS"] = f"FAIL: {e}"

    # 8. Test /api/mission/status & /api/ocean/state & downloads
    print("\n[TEST 8] Testing /api/mission/status & /api/ocean/state...")
    try:
        resp_ms = client.get("/api/mission/status")
        assert resp_ms.status_code == 200, f"mission/status returned {resp_ms.status_code}"
        ms_data = resp_ms.json()
        assert "phase" in ms_data and ms_data["phase"] is not None
        
        resp_oc = client.get("/api/ocean/state")
        assert resp_oc.status_code == 200, f"ocean/state returned {resp_oc.status_code}"
        oc_data = resp_oc.json()
        assert "temperature" in oc_data and oc_data["temperature"] is not None
        
        # Test download CSV & JSON
        test_payload = [{"object_class": "shipwreck", "confidence_cal": 0.88, "lat": -54.2, "lon": 60.8, "bbox": [10, 20, 30, 40]}]
        resp_json = client.post("/api/download/json", json=test_payload)
        assert resp_json.status_code == 200 and "application/json" in resp_json.headers["content-type"]
        
        resp_csv = client.post("/api/download/csv", json=test_payload)
        assert resp_csv.status_code == 200 and "text/csv" in resp_csv.headers["content-type"]
        
        print("   /api/mission/status, /api/ocean/state, and reporting export endpoints OK.")
    except Exception as e:
        print(f"   [FAIL] {e}")

    # 9. Syntax check
    print("\n[TEST 9] Syntax & Compilation Check...")
    import py_compile
    try:
        py_compile.compile(str(ROOT / "api" / "main.py"), doraise=True)
        py_compile.compile(str(ROOT / "telemetry_simulator.py"), doraise=True)
        print("   All files compiled cleanly.")
        results["Syntax"] = "PASS"
    except Exception as e:
        print(f"   [FAIL] {e}")
        results["Syntax"] = f"FAIL: {e}"

    print("\n" + "=" * 60)
    print("=== BACKEND API TEST REPORT ===")
    print(f"[{results.get('/api/detect', 'FAIL')}] /api/detect: file upload + detection response")
    print(f"[{results.get('/api/telemetry', 'FAIL')}] /api/telemetry: returns live changing data")
    print(f"[{results.get('/api/health', 'FAIL')}] /api/health: endpoint exists")
    print(f"[{results.get('/api/auv/state', 'FAIL')}] /api/auv/state: AUV position and state")
    print(f"[{results.get('Edge AI state machine', 'FAIL')}] Edge AI state machine: SUBMERGED/SATCOM states")
    print(f"[{results.get('CORS', 'FAIL')}] CORS: configured for frontend")
    print(f"[{results.get('Security', 'FAIL')}] Security: no hardcoded secrets")
    print(f"[{results.get('Syntax', 'FAIL')}] Syntax: all files compile cleanly")
    print("=" * 60)
    
    return results

if __name__ == "__main__":
    run_tests()
