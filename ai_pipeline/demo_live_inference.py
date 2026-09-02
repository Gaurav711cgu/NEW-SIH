import os
import time
import sqlite3
import json
from detector import AnomalyDetector
from reporter import write_report

def setup_offline_db():
    conn = sqlite3.connect('offline_cache.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS pending_sync
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, 
                  timestamp TEXT, 
                  payload TEXT)''')
    conn.commit()
    return conn

def run_live_demo(image_path: str, model_path: str = "../models/best.pt"):
    print("\n" + "="*50)
    print("🌊 AQUILA OS: EDGE INFERENCE DEMO")
    print("="*50)
    
    # 1. Initialization
    print(f"\n[1] Initializing Edge AI Engine with {model_path}...")
    detector = AnomalyDetector(model_path)
    db_conn = setup_offline_db()
    
    # 2. Simulate Disconnect
    print("\n" + "!"*50)
    print("📡 WARNING: SATCOM / WIFI DISCONNECTED")
    print("🔌 SWITCHING TO OFFLINE EDGE INFERENCE MODE")
    print("!"*50 + "\n")
    time.sleep(2)
    
    # 3. Offline Inference
    print(f"[2] AUV scanning image: {image_path}...")
    time.sleep(1)
    
    # In a real run, you'd pass a real image path here. 
    # If the image doesn't exist, detector.py falls back to a simulated detection.
    detections = detector.process_frame(image_path)
    
    print(f"\n✅ DETECTION COMPLETE: Found {len(detections)} anomalies.")
    for d in detections:
        shadow_alert = " (SHADOW PENALTY APPLIED)" if d['shadow_penalty'] else ""
        print(f"   -> {d['object_class'].upper()} | Conf: {d['confidence_cal']*100:.1f}% {shadow_alert}")
    
    # 4. Offline Storage
    print("\n[3] Network unavailable. Caching detections to local SQLite database...")
    payload_str = json.dumps(detections)
    db_conn.execute("INSERT INTO pending_sync (timestamp, payload) VALUES (?, ?)", 
                    (time.strftime("%Y-%m-%dT%H:%M:%SZ"), payload_str))
    db_conn.commit()
    print("   -> 💾 Cached securely to offline_cache.db")
    
    # 5. The Reveal
    print("\n" + "="*50)
    input("🎤 STAGE CUE: Explain the offline caching to judges, then press ENTER to simulate WiFi Reconnection...")
    print("="*50 + "\n")
    
    # 6. Reconnect and Sync
    print("📡 SATCOM CONNECTION RESTORED. Initiating uplink...")
    time.sleep(1.5)
    
    cursor = db_conn.execute("SELECT id, payload FROM pending_sync ORDER BY id ASC")
    rows = cursor.fetchall()
    
    if rows:
        print(f"[4] Found {len(rows)} offline records. Syncing to MoES Cloud...")
        # Take the most recent one for the report
        latest_payload = json.loads(rows[-1][1])
        
        # Write the JSON/CSV Reports using your reporter module
        write_report(latest_payload, output_prefix="demo_uplink_report")
        
        # Clear the cache
        db_conn.execute("DELETE FROM pending_sync")
        db_conn.commit()
        
        print("\n✅ SYNC SUCCESSFUL!")
        print("   -> demo_uplink_report.json generated")
        print("   -> demo_uplink_report.csv generated")
        print("   -> Map coordinates populated.")
    
    db_conn.close()
    print("\n🏁 DEMO SEQUENCE COMPLETE.\n")

if __name__ == "__main__":
    # Ensure you have a sample sonar image in your folder named 'sample_sonar.png'
    # Otherwise, the detector will safely fall back to simulation mode to prevent demo crashes.
    run_live_demo(image_path="sample_sonar.png")
