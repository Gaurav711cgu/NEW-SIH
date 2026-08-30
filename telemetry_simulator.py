"""
telemetry_simulator.py
----------------------
Autonomous underwater vehicle (AUV) telemetry and sensor simulator.
Simulates realistic dive cycles, depth profiles, biogeochemical ocean sensors,
and Edge AI state machine (SURFACE -> SUBMERGED_EDGE_AI -> DEEP_SURVEY -> SATCOM_UPLINK).
"""
import time
import random
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from platform.database import get_connection, initialise

def get_mission_state(depth_m: float, ascending: bool = False) -> str:
    """Determine Edge AI mission state based on depth and dive phase."""
    if depth_m < 50:
        if ascending or depth_m <= 5.0:
            return "SATCOM_UPLINK"
        return "SURFACE"
    elif depth_m < 500:
        return "SUBMERGED_EDGE_AI"  # Edge AI inference active, radio silence
    else:
        return "DEEP_SURVEY"        # Side-scan sonar seabed survey


def main():
    initialise()
    
    start_time = time.time()
    depth = 0.0
    lat = -54.201
    lon = 60.810
    battery = 100.0
    
    # 0 = Initial Surface, 1 = Diving, 2 = Deep Survey dwell, 3 = Ascending, 4 = Satcom Uplink
    cycle_phase = 0
    phase_timer = 0
    
    print("🚀 DeepScan Telemetry Simulator Started")
    print("   Simulating Edge AI Dive Cycles & Ocean Sensors...\n")
    
    while True:
        uptime = int(time.time() - start_time)
        phase_timer += 2
        ascending = False
        
        # State Machine for Dive/Surface cycle
        if cycle_phase == 0:  # Surface Pre-Dive Check
            depth = max(0.0, random.uniform(0.0, 2.0))
            mission_state = "SURFACE"
            if phase_timer >= 10:
                cycle_phase = 1
                phase_timer = 0
                print("\n🔻 Initiating Dive: Transitioning to SUBMERGED_EDGE_AI...")

        elif cycle_phase == 1:  # Diving
            depth += random.uniform(25.0, 45.0)
            mission_state = get_mission_state(depth, ascending=False)
            if depth >= 900:
                cycle_phase = 2
                phase_timer = 0
                print("\n🌊 Reached Abyss: Entering DEEP_SURVEY phase...")

        elif cycle_phase == 2:  # Deep Survey dwell
            depth = 1000.0 + random.uniform(-10.0, 10.0)
            mission_state = "DEEP_SURVEY"
            if phase_timer >= 24:
                cycle_phase = 3
                phase_timer = 0
                print("\n🔺 Survey Complete: Ascending to Surface...")

        elif cycle_phase == 3:  # Ascending
            ascending = True
            depth -= random.uniform(25.0, 45.0)
            if depth <= 2.0:
                depth = max(0.0, depth)
                cycle_phase = 4
                phase_timer = 0
                mission_state = "SATCOM_UPLINK"
                print("\n📡 Surfaced: Establishing SATCOM_UPLINK burst...")
            else:
                mission_state = get_mission_state(depth, ascending=True)

        elif cycle_phase == 4:  # Satcom Uplink on surface
            depth = max(0.0, random.uniform(0.0, 2.0))
            mission_state = "SATCOM_UPLINK"
            if phase_timer >= 16:
                cycle_phase = 1
                phase_timer = 0
                print("\n🔻 Telemetry Uplink Finished: Starting next dive cycle...")

        lat += random.uniform(-0.00005, 0.00005)
        lon += random.uniform(-0.00005, 0.00005)
        battery = max(5.0, battery - random.uniform(0.005, 0.02))
        
        roll = random.uniform(-5.0, 5.0)
        pitch = random.uniform(-2.0, 2.0)
        
        # Realistic Ocean Biogeochemistry sensor models
        temp = max(1.5, 12.0 - (depth / 100.0)) + random.uniform(-0.1, 0.1)
        psal = 34.5 + random.uniform(-0.05, 0.05)
        doxy = max(150.0, 250.0 - (depth / 20.0)) + random.uniform(-2.0, 2.0)
        chla = max(0.01, 1.5 - (depth / 50.0)) + random.uniform(-0.01, 0.01)
        nitrate = max(1.0, 30.0 - (depth / 40.0)) + random.uniform(-0.5, 0.5)
        ph = 8.1 - (depth / 2000.0) + random.uniform(-0.02, 0.02)
        
        now = time.time()
        conn = get_connection()
        try:
            with conn:
                def write_sensor(sensor_name, val, unit=""):
                    conn.execute("""
                        INSERT INTO sensor_readings 
                        (sensor, value, unit, source, uncertainty, depth_m, status, qc_flag, platform, timestamp, synced) 
                        VALUES (?, ?, ?, 'SIMULATOR', 0.0, ?, 'ONLINE', 1, '001', ?, 0)
                    """, (sensor_name, val, unit, depth, now))
                
                # Navigation & Vehicle Health Telemetry
                write_sensor("depth", depth, "m")
                write_sensor("lat", lat, "deg")
                write_sensor("lon", lon, "deg")
                write_sensor("battery", battery, "%")
                write_sensor("imu_roll", roll, "deg")
                write_sensor("imu_pitch", pitch, "deg")
                write_sensor("uptime", uptime, "s")
                write_sensor("mission_state", mission_state, "")
                write_sensor("phase", mission_state, "")
                
                # Ocean Biogeochemistry Sensors
                write_sensor("TEMP", temp, "C")
                write_sensor("PSAL", psal, "PSU")
                write_sensor("DOXY", doxy, "umol/kg")
                write_sensor("CHLA", chla, "mg/m3")
                write_sensor("NITRATE", nitrate, "umol/kg")
                write_sensor("PH_IN_SITU_TOTAL", ph, "pH")

                # Mission Log Entry
                conn.execute("""
                    INSERT INTO mission_log (phase, depth_m, lat, lon, timestamp)
                    VALUES (?, ?, ?, ?, ?)
                """, (mission_state, depth, lat, lon, now))
        finally:
            conn.close()

        print(f"[{time.strftime('%H:%M:%S')}] State: {mission_state:<18} | Depth: {depth:6.1f}m | Batt: {battery:5.1f}% | Temp: {temp:4.2f}C | Up: {uptime}s")
        time.sleep(2)


if __name__ == "__main__":
    main()
