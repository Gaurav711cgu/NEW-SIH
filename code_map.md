# AQUILA OS Codebase Map

This document explains every crucial component of your project. Read this to understand exactly how the system is wired together.

## 1. The Core Platform & API (`platform_pkg/` & `api/`)
This is the central nervous system. It handles incoming hardware data, saves it, and serves it to the frontend.
*   **`backend/main.py`**: The FastAPI server. This is the API that the React dashboard talks to. It opens endpoints like `GET /api/telemetry` which sends the latest sensor data to the UI.
*   **`platform_pkg/mqtt_subscriber.py`**: The listener. It connects to the MQTT broker (Mosquitto) and catches the JSON messages flying through the air from the ESP32.
*   **`platform_pkg/database.py`**: The local memory. It sets up an SQLite database (`telemetry.db`) to log all incoming telemetry permanently, ensuring no data is lost during a Wi-Fi blackout.
*   **`platform_pkg/mission_fsm.py`**: The brain of the AUV. Finite State Machine logic that controls the drone's behavior (e.g., if connection drops, switch to `COMMS_BLACKOUT` mode; if depth hits 500m, switch to `SURFACE`).
*   **`platform_pkg/sync_manager.py`**: The data rescuer. If the drone loses Wi-Fi and goes underwater, it queues data. When Wi-Fi reconnects, this script "burst syncs" all the missed data to the database.

## 2. The Artificial Intelligence Engine (`ai_pipeline/`)
This folder handles the processing of the Side-Scan Sonar (SSS) images for Problem Statement PS-26057.
*   **`ai_pipeline/detector.py`**: The core AI inference script. It takes a raw sonar image, loads the `yolov8s.pt` model weights, runs the image through the neural network, and outputs bounding boxes around debris/shipwrecks.
*   **`ai_pipeline/confidence_calibrator.py`**: The acoustic shadow penalizer (Blondel, 2009). It looks at where the AI drew a bounding box. If the box is drawn inside a dark acoustic shadow, it lowers the confidence score to prevent rocks from being classified as debris.
*   **`ai_pipeline/geotagger.py`**: Converts the pixel coordinates (X/Y) of a detection into real-world Lat/Lon coordinates on the Earth based on the AUV's current location.
*   **`ai_pipeline/reporter.py`**: Takes the bounding boxes and Lat/Lon coordinates and generates the downloadable JSON report that the judge clicks on in the UI.
*   **`ai_pipeline/train.py`**: The script used to train the YOLOv8 model on the AI4Shipwrecks dataset (the one that stopped at Epoch 27).

## 3. The React Dashboard (`frontend/src/pages/`)
The visual UI that the judges interact with.
*   **`OceanState.tsx`**: Displays the live telemetry graphs (Temperature, Pressure). It constantly pings `backend/main.py` for new data. This is where I just added the "SIMULATE ESP32 HANDSHAKE" button.
*   **`MissionControl.tsx`**: Displays the AUV's current state (e.g., `SUBMERGED`, `COMMS_BLACKOUT`), battery life, and the "Offline Queue" sync status.
*   **`SeafloorIntelligence.tsx`**: The image upload UI. You drop a raw sonar image here, it sends it to `ai_pipeline/detector.py`, gets the bounding boxes back, and draws them on the screen. It also contains the Human-in-the-loop Triage queue.
*   **`GovernmentIntel.tsx`**: The high-level pitch page outlining the ₹4,077 Cr DOM budget, your ₹75,000 unit cost, and the 54,360 scale calculation.
*   **`ModelValidation.tsx`**: The scientific proof page. Shows the YOLOv8s vs RT-DETR ablation study and the 7KB ESP32 IsolationForest model stats.

## 4. The Deep Ocean Simulators (`virtual_sensors/`)
Because you can't go to the Southern Ocean, these scripts simulate the extreme deep-water environment.
*   **`virtual_sensors/virtual_publisher.py`**: The mock hardware. If your physical ESP32 is turned off, this script acts like the ESP32. It generates fake telemetry and publishes it over MQTT so your dashboard still looks alive.
*   **`virtual_sensors/profile_interpolator.py`**: The TEOS-10 calculator. It ensures the fake data isn't just random garbage; it uses real thermodynamic equations so that at 800m depth, the salinity perfectly mimics the Antarctic Intermediate Water (AAIW).

## 5. The Physical Hardware (`hardware/firmware/`)
The actual C++ code running on the physical microcontroller.
*   **`hardware/firmware/esp32_publisher.ino`**: The code flashed onto the ESP32-WROOM-32. It reads the physical DS18B20 temperature sensor, the BMP280 pressure sensor, formats them into a JSON string, and pushes them out via Wi-Fi to the MQTT broker.

## How Data Flows from Ocean to Screen:
1. Physical Sensor -> `esp32_publisher.ino` reads voltage.
2. `esp32_publisher.ino` -> Sends JSON over Wi-Fi via MQTT.
3. `platform_pkg/mqtt_subscriber.py` -> Hears the MQTT message and saves it to SQLite.
4. `backend/main.py` -> Reads SQLite and sends it via HTTP to the React app.
5. `frontend/src/pages/OceanState.tsx` -> Graphs the temperature on your screen.
