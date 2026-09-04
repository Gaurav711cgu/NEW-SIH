# AQUILA OS: Antarctic Hardware Architecture & Full Mission Workflow
**Designed for extreme-cold Southern Ocean deployments**

## 1. The "Polar-Safe" Bill of Materials (BOM)
To survive the brutal -2°C water and -40°C surface winds of Antarctica, standard electronics fail. We have engineered this BOM specifically avoiding known polar failures.

### A. The Compute & Telemetry Brain (Indigenous & COTS)
*   **Primary Controller:** ESP32-WROOM-32E (Operates flawlessly down to -40°C. Manages basic telemetry and power states).
*   **AI Edge Node:** Raspberry Pi 4 Compute Module (CM4) with an industrial heatsink. *Crucial:* CPUs generate their own heat, keeping the internal hull warm.
*   **Storage:** 32GB Industrial SLC (Single-Level Cell) MicroSD. *Why:* Standard consumer SD cards corrupt instantly in freezing temperatures. SLC memory guarantees data integrity in polar environments.

### B. The Power System (The Antarctic Trap)
*   **The Trap:** Standard Lithium-Ion/Li-Po batteries (like in laptops or standard drones) lose 80% of their capacity and freeze below -10°C.
*   **The Solution:** We specify **Lithium Thionyl Chloride (Li-SOCl2)** primary cell packs. This is the exact battery chemistry used by deep-sea Argo floats and space missions. They operate perfectly down to -55°C and provide massive energy density for long endurance.

### C. Sensors & Intelligence
*   **Physical Telemetry:** Keller Series 33X (Pressure/Depth) and PT100/PT1000 RTD Probes (Temperature). Extremely cheap, rugged, and highly accurate.
*   **Debris Detection (Sonar):** Low-cost, High-Frequency CHIRP Side-Scan Sonar module (e.g., Ping360 or custom Indian equivalent).
*   **Satellite Comms:** RockBLOCK 9603 Iridium SBD (Short Burst Data) Transceiver.

## 2. The Full Mission Workflow (Start to Finish)

### Phase 1: Deployment & Descent (The Baseline)
1.  Launched from an Indian research vessel (e.g., *Sagar Nidhi* or *S.A. Agulhas*) near the Bharati Research Station.
2.  The Raspberry Pi (high power draw) is put to SLEEP. 
3.  The tiny ESP32 manages the descent. It reads the PT100 temperature and Keller pressure sensors at 10Hz, running the 7KB IsolationForest model to ensure the hull isn't failing.

### Phase 2: Seafloor Intelligence (Debris Detection)
1.  At the target depth (e.g., 500 meters), the ESP32 wakes up the Raspberry Pi 4.
2.  The Side-Scan Sonar begins pinging the seafloor.
3.  The YOLOv8s CNN model runs locally on the Pi, scanning the acoustic images in real-time.
4.  If a Ghost Net or shipwreck is detected, the **Acoustic Shadow Calibrator** double-checks the geometry to ensure it isn't a rock (preventing false positives).
5.  A tiny 2-Kilobyte JSON report is generated: `{"type": "ghost_net", "confidence": 92%, "lat": -68.5, "lon": 77.9}`.
6.  The massive, heavy 10MB raw sonar images are immediately deleted to save storage and power.

### Phase 3: Ascent & Data Burst
1.  The AUV drops ballast or uses thrusters to ascend. 
2.  It breaks the surface of the freezing water. The RockBLOCK 9603 antenna connects to the Iridium Satellite constellation.
3.  Because it only has to transmit a 2KB JSON file (instead of 10MB images), the transmission takes 4 seconds and costs ₹12. 
4.  The AUV goes back to sleep and prepares for the next dive.

### Phase 4: Ministry Command (The Dashboard)
1.  The Iridium satellite relays the JSON to the Ministry's servers in Chennai.
2.  Our Python FastAPI backend catches the payload.
3.  The backend runs the **TEOS-10 Virtual Sensors**, taking the cheap temperature/pressure data and calculating the Southern Ocean's exact Salinity and Dissolved Oxygen.
4.  The React Dashboard updates live, showing the NCPOR directors both the climate data and the debris detection pin on the map.
