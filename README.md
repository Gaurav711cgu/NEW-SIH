# 🌊 AQUILA — Autonomous Marine Intelligence & Seafloor Debris Detection OS

[![Ministry of Earth Sciences](https://img.shields.io/badge/MoES-Govt._of_India-0284c7?style=flat-square)](https://moes.gov.in/)
[![NIOT Aligned](https://img.shields.io/badge/NIOT-Deep_Ocean_Mission-059669?style=flat-square)](https://www.niot.res.in/)
[![Problem Statement](https://img.shields.io/badge/SIH_2026-PS--26057_%26_PS--1-f59e0b?style=flat-square)]()
[![Platform](https://img.shields.io/badge/Edge_AI-AUV_Matsya_6000-6366f1?style=flat-square)]()

**AQUILA** is an indigenous, defense-grade Autonomous Underwater Vehicle (AUV) Command, Control, and AI Intelligence Operating System engineered for the **Ministry of Earth Sciences (MoES)** and the **National Institute of Ocean Technology (NIOT)**. 

It solves both major national oceanographic mandates under India's **Deep Ocean Mission**:
1. **PS-26057:** AI-powered Side-Scan Sonar (SSS) Marine Debris Detection with SAHI (Slicing Aided Hyper Inference) and Urick Acoustic Shadow Calibration.
2. **PS-1:** Real-time In-Situ Ocean State Observation and Physics-Derived Thermodynamic Synthesis (UNESCO EOS-80 / TEOS-10).

---

## ⚡ 1-Minute Quickstart (Run on Any PC)

### 🪟 On Windows (1-Click)
1. Double-click **`start_windows.bat`**.
2. It automatically sets up Python dependencies, installs frontend packages, starts the FastAPI backend (`http://localhost:8000`), launches the React frontend (`http://localhost:5173`), and opens your browser.

### 🍎 On macOS / 🐧 Linux (1-Click)
```bash
./start_mac_linux.sh
```

---

## 🛠️ Manual Installation (If Preferred)

### 1. Backend Setup (FastAPI + YOLOv8/v9 + Scikit-Learn)
```bash
# From project root
python3 -m venv venv
source venv/bin/activate       # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```
* Backend Health: `http://localhost:8000/api/health`
* Swagger API Docs: `http://localhost:8000/docs`

### 2. Frontend Setup (React 19 + TypeScript + Vite + Tailwind)
```bash
# In another terminal
cd frontend
npm install
npm run dev
```
* Frontend Dashboard: `http://localhost:5173`

---

## 📸 Testing Sonar Images Suite (Included in Repository)

The repository comes pre-loaded with **25 curated, high-difficulty side-scan sonar waterfall images** located in:
* `/testing_images/`
* `/frontend/public/testing_images/`

You can drag and drop any of these directly into the **Seafloor Intelligence** dashboard:
* `01_shipwreck_large_waterfall.jpg` — Massive shipwreck structure with broken hull.
* `03_cylinder_mine_specular_highlight.jpg` — Subsea cylindrical mine with high-contrast specular return.
* `05_subsea_pipeline_track.jpg` — Continuous linear pipeline track across 500+ pings.
* `10_entangled_debris_cluster.jpg` — Entangled synthetic ghost gear cluster.
* `19_rock_formation_natural_shadow.jpg` — Natural seabed boulder with soft organic shadow.
* `22_natural_rock_outcrop_zero_shadow_trap.jpg` — Zero-shadow rock outcrop trap for triage testing.
* `23_sunken_iso_cargo_container_40ft.jpg` — 40ft ISO container with orthogonal 90° corners.
* `25_entangled_synthetic_fad_trawl_mesh.jpg` — Synthetic FAD net with chaotic texture entropy.

---

## 🖥️ System Architecture & Visual Modules

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                         AQUILA SYSTEM CAPABILITIES                               │
├──────────────────────┬───────────────────────────────────────────────────────────┤
│ 1. Ocean State (PS-1)│ 6 in-situ sensor cards (EOS-80 / TEOS-10), thermocline    │
│                      │ profile, and AUV dynamic attitude roll/pitch visualizer.  │
├──────────────────────┼───────────────────────────────────────────────────────────┤
│ 2. Strategic Intel   │ High-resolution Sector 7G bathymetric heatmap with        │
│                      │ 14-day detection rate analytics and classified reporting. │
├──────────────────────┼───────────────────────────────────────────────────────────┤
│ 3. Biogeochemistry   │ 0–1000m depth series for Oxygen, Chlorophyll-a, pH, and   │
│                      │ Nitrate carbon pump sink quantification.                  │
├──────────────────────┼───────────────────────────────────────────────────────────┤
│ 4. Seafloor (PS26057)│ Pan/zoom sonar waterfall viewer, CLAHE contrast filter,   │
│                      │ SAHI slicing YOLO detector, uncertainty triage queue,     │
│                      │ and visual Natural vs Man-Made Acoustic Shadow Profiler. │
├──────────────────────┼───────────────────────────────────────────────────────────┤
│ 5. Mission Control   │ USBL acoustic modem telemetry link (8.5 kHz), Lawnmower,  │
│                      │ Contour Follow, and Hover Station autopilot modes.        │
├──────────────────────┼───────────────────────────────────────────────────────────┤
│ 6. AUV Twin          │ Interactive MATSYA 6000 wireframe with 12 clickable       │
│                      │ sensor nodes and live serial stream telemetry console.    │
├──────────────────────┼───────────────────────────────────────────────────────────┤
│ 7. Research Dossier  │ Peer-reviewed citations, Urick shadow equations, Garcia-  │
│                      │ Gordon DO models, and Indian Navy hydrographic standards. │
└──────────────────────┴───────────────────────────────────────────────────────────┘
```

---

## 🎥 Video Recording Script & Demo Flow (For Presenter)

1. **Mission Header & Ocean State (`/ocean-state`):**
   * Show MATSYA 6000 telemetry synced in the Southern Ocean Indian Sector.
   * Point out the in-situ oceanographic sensors and thermocline depth transect.

2. **MATSYA 6000 Digital Twin (`/auv-twin`):**
   * Hover and click sensor attachment nodes (Side-Scan Sonar, USBL Acoustic Transponder, CTD, Optical Optode) to inspect live engineering telemetry.

3. **Seafloor Intelligence AI Detection (`/seafloor`):**
   * Click one of the 1-click **Govt Mission Scenarios** (e.g. `1. GHOST NET (94.2%)` or `2. SUBSEA UXO / MINE (91.4%)`).
   * Drop `01_shipwreck_large_waterfall.jpg` or `03_cylinder_mine_specular_highlight.jpg` from `testing_images/`.
   * Click **`RUN AQUILA AI DETECTION`** and watch the automated pipeline:
     `PREPROCESSING (CLAHE)` $\rightarrow$ `INFERENCING (SAHI)` $\rightarrow$ `CALCULATING ACOUSTIC SHADOWS` $\rightarrow$ `DONE`.
   * Use the **`+` / `-` / `RESET`** zoom controls to inspect the bounding box.
   * Scroll down to demonstrate the **Acoustic Signature & Shadow Profiler (Natural vs Man-Made)** with real side-by-side sonar crops and cross-sectional waveforms!

4. **Strategic Intelligence & Export (`/intel`):**
   * Show the classified Sector 7G bathymetric heatmap.
   * Click `Export Intelligence Report` (JSON/CSV) to show automated hydrographic report generation.

---

## 🛡️ License & Acknowledgments
Developed for **Smart India Hackathon 2026** by Team **DEBUG THUGS**.
Data references aligned with **NIOT (National Institute of Ocean Technology)** and **Ministry of Earth Sciences (MoES)**.
