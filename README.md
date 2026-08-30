# AQUILA: Autonomous Marine Intelligence & Seafloor Debris Detection OS

Ministry of Earth Sciences (MoES) | National Institute of Ocean Technology (NIOT)  
Smart India Hackathon 2026 | Problem Statements: PS-26057 & PS-1  
Target Platform: MATSYA 6000 Deep Ocean AUV  

---

## Executive Summary

AQUILA is an indigenous, defense-grade Autonomous Underwater Vehicle (AUV) Command, Control, and Oceanographic Artificial Intelligence Operating System developed for the Ministry of Earth Sciences (MoES) and the National Institute of Ocean Technology (NIOT) under the Deep Ocean Mission framework.

The platform addresses two operational mandates:
1. **PS-26057 (Seafloor Intelligence):** Real-time Side-Scan Sonar (SSS) automated target recognition for marine debris, sunken ordnance (UXO/Mines), lost shipping containers, pipelines, and ghost fishing gear using Slicing Aided Hyper Inference (SAHI) coupled with Urick Acoustic Shadow Geometric Ray-Tracing.
2. **PS-1 (Ocean State Observation):** In-situ ocean state telemetry processing with UNESCO EOS-80 / TEOS-10 thermodynamic formulations and bio-optical biogeochemical synthesis.

---

## Quickstart Guide

### Windows (1-Click Deployment)
1. Execute `start_windows.bat`.
2. The batch script verifies Python 3.9+ and Node.js 18+, establishes the virtual environment, installs backend and frontend dependencies, launches the FastAPI service (Port 8000), starts the React interface (Port 5173), and opens the default web browser.

### macOS and Linux (1-Click Deployment)
1. Make the launcher executable and run:
```bash
chmod +x start_mac_linux.sh
./start_mac_linux.sh
```

---

## Manual Installation and Build

### Backend Installation (FastAPI, Ultralytics YOLO, Scikit-Learn)
```bash
python3 -m venv venv
source venv/bin/activate       # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```
* API Health Check: `http://localhost:8000/api/health`
* OpenAPI / Swagger Documentation: `http://localhost:8000/docs`

### Frontend Installation (React 19, TypeScript, Vite, Tailwind CSS)
```bash
cd frontend
npm install
npm run dev
```
* Dashboard URL: `http://localhost:5173`

---

## Pre-Loaded Sonar Evaluation Suite

The repository includes a curated test suite of 25 standardized high-resolution Side-Scan Sonar waterfall recordings in:
* `testing_images/`
* `frontend/public/testing_images/`

Key Test Scenarios:
* `01_shipwreck_large_waterfall.jpg` - Structural wreckage with acoustic shadow envelope.
* `03_cylinder_mine_specular_highlight.jpg` - Cylindrical metallic ordnance with high-intensity specular highlight.
* `05_subsea_pipeline_track.jpg` - Linear critical infrastructure tracking across consecutive pings.
* `10_entangled_debris_cluster.jpg` - Synthetic monofilament polymer debris with diffuse acoustic signature.
* `19_rock_formation_natural_shadow.jpg` - Geological seabed boulder demonstrating soft organic shadow decay.
* `22_natural_rock_outcrop_zero_shadow_trap.jpg` - Natural rock outcrop for false-positive validation.
* `23_sunken_iso_cargo_container_40ft.jpg` - 40ft ISO container exhibiting orthogonal 90-degree corner returns.
* `25_entangled_synthetic_fad_trawl_mesh.jpg` - Derelict fishing gear mesh exhibiting high spatial entropy.

---

## System Architecture

```
+----------------------------------------------------------------------------------+
|                            AQUILA CORE MODULES                                   |
+----------------------+-----------------------------------------------------------+
| 1. Ocean State       | In-situ physical oceanography (UNESCO EOS-80 / TEOS-10),  |
|    (PS-1)            | thermocline depth transects, and dynamic AUV attitude.    |
+----------------------+-----------------------------------------------------------+
| 2. Strategic Intel   | Bathymetric survey heatmap (Sector 7G) with 14-day        |
|                      | debris density analysis and classified report export.     |
+----------------------+-----------------------------------------------------------+
| 3. Biogeochemistry   | 0 to 1000m depth profiles for Dissolved Oxygen,           |
|                      | Chlorophyll-a, pH, and Nitrate carbon flux quantification.|
+----------------------+-----------------------------------------------------------+
| 4. Seafloor Intel    | Contrast-Limited Adaptive Histogram Equalization (CLAHE), |
|    (PS-26057)        | SAHI slicing detector, and Side-by-Side Acoustic          |
|                      | Signature and Shadow Ray-Tracing Profiler.                |
+----------------------+-----------------------------------------------------------+
| 5. Mission Control   | USBL acoustic modem link simulation (8.5 kHz),            |
|                      | Lawnmower, Contour Follow, and Hover Station modes.       |
+----------------------+-----------------------------------------------------------+
| 6. AUV Digital Twin  | Interactive MATSYA 6000 hull schematic with 12 clickable  |
|                      | sensor nodes and real-time engineering telemetry feed.    |
+----------------------+-----------------------------------------------------------+
| 7. Research Dossier  | Mathematical formulations (Urick ray-tracing, Garcia-    |
|                      | Gordon DO models) and hydrographic standards.             |
+----------------------+-----------------------------------------------------------+
```

---

## Demonstration Script for Evaluators

1. **Ocean State Dashboard (`/ocean-state`):**
   * Review MATSYA 6000 navigation telemetry (Southern Ocean Indian Sector coordinates).
   * Demonstrate in-situ thermodynamic profiles and water column stratification.

2. **AUV Subsystem Digital Twin (`/auv-twin`):**
   * Inspect the 12 sensor nodes across the vehicle hull (Side-Scan Sonar, USBL, CTD, Optical Optode) to review telemetry feeds.

3. **Seafloor Intelligence Pipeline (`/seafloor`):**
   * Select a mission scenario or upload a sonar image from `testing_images/`.
   * Trigger the detection pipeline to observe CLAHE noise filtering, SAHI slicing inference, and acoustic shadow calibration.
   * Pan and zoom using the interface controls (+, -, RESET).
   * Review the Acoustic Signature & Shadow Profiler to inspect waveform differences between natural seabed geology and man-made debris.

4. **Strategic Intelligence & Reporting (`/intel`):**
   * Review the Sector 7G bathymetric heatmap.
   * Generate structured JSON/CSV reports for inter-agency coordination.

5. **Scientific Dossier (`/research`):**
   * Review the underlying physical principles, ray-tracing equations, and peer-reviewed research citations.

---

## Technical Specifications

* **Backend Framework:** FastAPI / Python 3.9+
* **Inference Engine:** Ultralytics YOLOv8 / YOLOv9 with Slicing Aided Hyper Inference (SAHI)
* **Image Processing:** OpenCV (CLAHE contrast enhancement, median filter, shadow mask segmentation)
* **Confidence Calibration:** Physics-based Acoustic Shadow verification (Urick Shadow Height Law)
* **Frontend Architecture:** React 19, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons
* **Data Standards:** Compatible with standard raster exports (.jpg, .png, .tiff) and hydrographic metadata formats (.xtf, .csv, .json)

---

## License and Compliance
Developed for Smart India Hackathon 2026 by Team DEBUG THUGS. Aligned with standards established by the Ministry of Earth Sciences (MoES) and the National Institute of Ocean Technology (NIOT), Government of India.
