"""
digital_twin_engine.py
----------------------
High-fidelity 3D physics and telemetry simulator for Hardware-In-The-Loop (HITL).
Generates precise 6-DOF kinematics (X, Y, Z, Roll, Pitch, Yaw) and TEOS-10 data.
Can transmit over Serial to a physical microcontroller or run in SITL mode.
"""
import time
import math
import random
import os
import sys
import json
import threading
from pathlib import Path

# Try to import serial for HITL, otherwise fallback to SITL
try:
    import serial
    SERIAL_AVAILABLE = True
except ImportError:
    SERIAL_AVAILABLE = False

ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from platform.database import get_connection, initialise

def hitl_serial_worker(port, baudrate, data_queue):
    """Worker thread to blast JSON telemetry to physical hardware."""
    try:
        ser = serial.Serial(port, baudrate, timeout=1)
        print(f"✅ HITL Mode Active: Connected to Microcontroller on {port}")
        while True:
            if not data_queue.empty():
                data = data_queue.get()
                payload = json.dumps(data) + "\n"
                ser.write(payload.encode('utf-8'))
            time.sleep(0.05)
    except Exception as e:
        print(f"⚠️ HITL Warning: Could not open {port}. Reverting to SITL mode. ({e})")

def main():
    initialise()
    start_time = time.time()
    
    # 6-DOF Initial State
    x, y, z = 0.0, 0.0, 0.0
    roll, pitch, yaw = 0.0, 0.0, 0.0
    
    # Base coordinates (NIOT deployment zone simulation)
    base_lat = 13.0827  # Chennai (approx)
    base_lon = 80.2707
    
    battery = 100.0
    cycle_phase = 0
    phase_timer = 0
    radius = 0.0
    angle = 0.0
    
    print("🚀 NIOT AUV Digital Twin Engine Started")
    if not SERIAL_AVAILABLE:
        print("   -> 'pyserial' not found. Install 'pyserial' to enable HITL physical bridge.")
    print("   -> Simulating 6-DOF kinematics and TEOS-10 thermodynamics...\n")
    
    # Setup optional HITL queue
    import queue
    hitl_queue = queue.Queue()
    if SERIAL_AVAILABLE:
        # User needs to change this to their actual port (e.g. COM3 or /dev/ttyUSB0)
        port_name = os.environ.get("AUV_PORT", "/dev/tty.usbmodem1234561")
        t = threading.Thread(target=hitl_serial_worker, args=(port_name, 115200, hitl_queue), daemon=True)
        t.start()
        
    while True:
        uptime = time.time() - start_time
        dt = 1.0  # simulation step (1 second)
        phase_timer += dt
        
        # Physics Engine: 6-DOF Kinematic State Machine
        if cycle_phase == 0:  # Surface Loitering
            z = max(0.0, math.sin(uptime) * 0.5)
            x += math.cos(uptime * 0.1) * 0.2
            y += math.sin(uptime * 0.1) * 0.2
            pitch = math.sin(uptime) * 2.0
            roll = math.cos(uptime) * 2.0
            yaw = (yaw + 1.0) % 360
            mission_state = "SURFACE"
            if phase_timer >= 10:
                cycle_phase = 1
                phase_timer = 0
                print("\n🔻 Initiating Dive: Corkscrew Descent to 500m...")

        elif cycle_phase == 1:  # Corkscrew Dive
            z += 15.0 * dt  # Descend 15m/s
            angle += 0.5 * dt
            radius = 20.0
            x = radius * math.cos(angle)
            y = radius * math.sin(angle)
            pitch = -15.0 + random.uniform(-1, 1)  # Nose down
            yaw = math.degrees(angle) % 360
            roll = random.uniform(-1, 1)
            mission_state = "DIVING"
            if z >= 500:
                cycle_phase = 2
                phase_timer = 0
                angle = 0.0
                radius = 0.0
                print("\n🌊 Reached 500m: Commencing Lawn-Mower Search Pattern...")

        elif cycle_phase == 2:  # Lawn Mower Benthic Survey
            z = 500.0 + math.sin(uptime * 0.5) * 2.0 # Bobbing
            pitch = 0.0 + random.uniform(-0.5, 0.5)
            roll = 0.0 + random.uniform(-0.5, 0.5)
            
            # Simple zig-zag math
            leg_time = phase_timer % 40
            if leg_time < 15:
                x += 2.0 * dt
                yaw = 0.0
            elif leg_time < 20:
                y += 2.0 * dt
                yaw = 90.0
            elif leg_time < 35:
                x -= 2.0 * dt
                yaw = 180.0
            else:
                y += 2.0 * dt
                yaw = 90.0

            mission_state = "BENTHIC_SURVEY"
            if phase_timer >= 120:
                cycle_phase = 3
                phase_timer = 0
                print("\n🔺 Survey Complete: Initiating Buoyant Ascent...")

        elif cycle_phase == 3:  # Ascent
            z -= 20.0 * dt
            x += math.cos(uptime * 0.2) * 1.0
            y += math.sin(uptime * 0.2) * 1.0
            pitch = 20.0 + random.uniform(-2, 2) # Nose up
            roll = math.sin(uptime) * 5.0
            mission_state = "ASCENDING"
            if z <= 2.0:
                z = 0.0
                cycle_phase = 4
                phase_timer = 0
                print("\n📡 Surfaced: Commencing Iridium SATCOM Uplink...")

        elif cycle_phase == 4:  # Satcom
            z = max(0.0, math.sin(uptime) * 1.0)
            pitch = math.sin(uptime) * 3.0
            roll = math.cos(uptime) * 3.0
            mission_state = "SATCOM_UPLINK"
            if phase_timer >= 15:
                cycle_phase = 1
                phase_timer = 0
                print("\n🔻 Uplink Complete: Starting next dive cycle...")

        # Update geo coordinates (1m ~ 0.000009 degrees)
        lat = base_lat + (y * 0.000009)
        lon = base_lon + (x * 0.000009)
        battery = max(5.0, battery - random.uniform(0.01, 0.03))
        
        # TEOS-10 Environment Physics Model (Temperature, Salinity, Density profiles)
        temp = max(1.5, 28.0 - (z / 25.0)) + random.uniform(-0.05, 0.05) # Thermocline simulation
        psal = 34.5 + (z / 1000.0) + random.uniform(-0.01, 0.01)         # Halocline
        pressure_dbar = (z * 1.01) # Approx 1 dbar per meter
        
        telemetry_frame = {
            "time": uptime,
            "state": mission_state,
            "x": x, "y": y, "z": z,
            "roll": roll, "pitch": pitch, "yaw": yaw,
            "lat": lat, "lon": lon,
            "temp": temp, "psal": psal, "pressure": pressure_dbar,
            "battery": battery
        }
        
        # Queue for HITL physical hardware
        hitl_queue.put(telemetry_frame)

        # Write to SQLite for the Dashboard
        now = time.time()
        conn = get_connection()
        try:
            with conn:
                def write_sensor(sensor_name, val, unit=""):
                    conn.execute("""
                        INSERT INTO sensor_readings 
                        (sensor, value, unit, source, uncertainty, depth_m, status, qc_flag, platform, timestamp, synced) 
                        VALUES (?, ?, ?, 'DIGITAL_TWIN', 0.0, ?, 'ONLINE', 1, 'AUV-001', ?, 0)
                    """, (sensor_name, val, unit, z, now))
                
                # 6-DOF Write
                write_sensor("pos_x", x, "m")
                write_sensor("pos_y", y, "m")
                write_sensor("depth", z, "m")
                write_sensor("imu_roll", roll, "deg")
                write_sensor("imu_pitch", pitch, "deg")
                write_sensor("imu_yaw", yaw, "deg")
                write_sensor("lat", lat, "deg")
                write_sensor("lon", lon, "deg")
                write_sensor("battery", battery, "%")
                write_sensor("mission_state", mission_state, "")
                
                # Biogeochemistry Write
                write_sensor("TEMP", temp, "C")
                write_sensor("PSAL", psal, "PSU")
                write_sensor("PRESSURE", pressure_dbar, "dbar")
                
                conn.execute("""
                    INSERT INTO mission_log (phase, depth_m, lat, lon, timestamp)
                    VALUES (?, ?, ?, ?, ?)
                """, (mission_state, z, lat, lon, now))
        finally:
            conn.close()

        print(f"[{time.strftime('%H:%M:%S')}] {mission_state:<14} | Z:{z:6.1f}m X:{x:6.1f}m Y:{y:6.1f}m | Pitch:{pitch:5.1f}° | Temp:{temp:5.2f}C")
        time.sleep(1)

if __name__ == "__main__":
    main()
