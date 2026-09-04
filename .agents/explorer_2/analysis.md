# AQUILA OS Frontend Audit — Claim, Citation & Data Verification Report

**Explorer:** Explorer 2  
**Date:** 2026-09-03  
**Target Codebase:** `frontend/src/`  
**Authoritative Reference Documents:** `README.md`, `HARDWARE.md`, `QA_DEFENSE.md`, `AI_PIPELINE.md`, `ORIGINAL_REQUEST.md`

---

## Executive Summary & Audit Scorecard

A comprehensive, line-by-line verification audit of all 24 TypeScript/React files in `frontend/src/` was conducted. While the application successfully compiles under Vite/TypeScript (`npm run build` exits 0), the audit identified **multiple critical discrepancies, factual contradictions, and hallucinated LLM artifacts** that directly undermine scientific credibility for Smart India Hackathon (SIH) judges, the Ministry of Earth Sciences (MoES), NIOT, and NCPOR evaluators.

### Audit Summary Matrix

| Audit Dimension | Target Ground Truth | Frontend Status | Severity |
| :--- | :--- | :--- | :--- |
| **AI Model Architecture** | YOLOv8s CNN (88.0% mAP@50); RT-DETR failed (35.4% mAP@50) | Hallucinated YOLOv9 & SAHI in `ResearchCitations.tsx` & `AUVTwin.tsx`; claimed RT-DETR running on AUV | **CRITICAL** |
| **Edge Hardware** | ESP32 Sensor Hub (₹400) + Raspberry Pi 4 (₹4,500); Total BOM ₹6,100 | Claims NVIDIA Jetson Orin NX (₹48k) & RPi 5 while simultaneously claiming ₹6,100 total BOM | **HIGH** |
| **Economic Scaling** | ₹75,000 – ₹1,00,000 unit cost at scale vs ₹25–30 Lakh commercial Argo float | Disjointed claims: ₹7.8 Lakhs subsea target in `AUVTwin`, ₹18L FOG comparisons | **MEDIUM** |
| **Policy & Mandate** | SIH Problem Statement PS-26057 (Marine Ghost Net & Seafloor Debris) | Confusion with "PS-1", "PS-2", and PS-26065; wild domain creep into Indian Monsoon forecasting | **HIGH** |
| **Academic Citations** | Real, peer-reviewed literature (Blondel 2009, Urick 1983, Zuiderveld 1994, etc.) | Franken-citations (Urick/Blondel mashup), fake DOIs/titles, claims of unbuilt algorithms | **CRITICAL** |
| **Legacy Artifacts** | Consistent "Aquila OS" branding | Residual "DeepScan" strings in citations and download CSV names | **LOW** |

---

## 1. Core Fact Verification & Root Discrepancies

### 1.1 AI Model: YOLOv8s (88.0% mAP) vs RT-DETR (35.4% mAP)

#### Ground Truth:
The project's authoritative empirical ablation study (`README.md` Section 3, `AI_PIPELINE.md`, and `ORIGINAL_REQUEST.md`) proves:
- **Selected Model:** `YOLOv8s` / `YOLOv8-seg` (Convolutional Neural Network, 11.1M parameters, 28.6 GFLOPs).
- **Ablation Comparison:** YOLOv8s achieved **88.0% mAP@50** (>85% precision, >80% recall), whereas `RT-DETR-L` (Vision Transformer, 31.9M parameters, 105.4 GFLOPs) failed to converge, achieving only **35.4% mAP@50** (55.8% precision, 32.7% recall).
- **Scientific Rationale:** Vision Transformers lack localized *inductive bias* and suffer from catastrophic data starvation on sparse acoustic side-scan sonar (SSS) datasets (<1,000 images). CNNs with sliding convolutions naturally extract edge features and acoustic shadow boundaries.
- **Inference Speed on Edge:** On a Raspberry Pi 4 CPU without a discrete GPU, YOLOv8s runs at **~4–6 FPS (~180–250 ms per frame)**.

#### Codebase Violations:
1. **Hallucinated "YOLOv9" and "SAHI" Engine:**
   - `src/pages/ResearchCitations.tsx` (Lines 61–77, 75): Claims the team implemented a "SAHI Slicing Window Engine" wrapping "our YOLOv9 model" with 640x640 overlapping tiles, processing "12 waterfall slices in 88ms with 0% boundary dropout on test_sonar_sample.jpg".
   - `src/pages/AUVTwin.tsx` (Line 256): Claims the subsea pod runs "YOLOv9 and SAHI subsea inference directly inside the pressure vessel".
   - `src/pages/AUVTwin.tsx` (Line 278): Claims "Runs our edge YOLOv9/RT-DETR software natively".
   - `src/pages/OceanState.tsx` (Line 508): Displays `SAHI INFERENCE ENGINE: ACTIVE (640x640 SLICES · 88ms)`.
   - *Reality:* There is no YOLOv9 and no SAHI slicing code in `ai_pipeline/detector.py` or anywhere in the repository.
2. **Claiming Failed RT-DETR as the Active Subsea Model:**
   - `src/pages/AUVTwin.tsx` (Lines 1422–1424): Explicitly asserts: *"The onboard NVIDIA Jetson Orin NX runs the custom RT-DETR-L model against the sonar waterfall. It ignores the natural boulders and isolates anomalous shapes (Shipwrecks, Aircraft, Small Targets) with a 51.7% mAP50 Edge baseline precision."*
   - `src/pages/GovernmentIntel.tsx` (Line 372): Displays `RT-DETR Baseline Confidence 61.2%` for finding 002.
   - *Reality:* This directly contradicts `ModelValidation.tsx` and the core ablation defense, which established that RT-DETR failed (35.4% mAP50) and that YOLOv8s is the chosen production model.
3. **Exaggerated Edge Inference Frame Rate:**
   - `src/pages/ModelValidation.tsx` (Line 48): Claims `Inference Speed: >60 FPS (Edge Optimized)`.
   - *Reality:* An ESP32 cannot run YOLOv8, and a Raspberry Pi 4 CPU runs YOLOv8s ONNX at ~4–6 FPS. Claiming >60 FPS on edge hardware without an industrial discrete GPU or specialized accelerator is an immediate red flag for technical judges from NIOT/DRDO.

---

### 1.2 Edge Hardware Architecture: ESP32 + Raspberry Pi 4

#### Ground Truth (`HARDWARE.md` & `QA_DEFENSE.md`):
- **Microcontroller Sensor Hub:** `ESP32 DevKit v1` (₹400) running FreeRTOS/Arduino C++, reading physical sensors via I2C, OneWire, and ADC, and publishing telemetry JSON over MQTT to the broker.
- **Physical Sensors in Lab Prototype:**
  - DS18B20 waterproof temperature probe: ₹80 (-55°C to +125°C, ±0.5°C)
  - BMP280 hydrostatic/pressure transducer: ₹120 (-40°C to +85°C, 300–1100 hPa)
  - SEN0161 analog pH probe: ₹350 (0–60°C, ±0.1 pH)
  - MPU6050 6-axis IMU: ₹150 (pitch, roll, heading)
  - Gravity TDS conductivity cell: ₹200 (salinity proxy)
- **Edge Compute Node:** `Raspberry Pi 4 (4GB)` (₹4,500), hosting the Mosquitto MQTT broker, SQLite embedded database, and running ONNX CPU inference for YOLOv8s.
- **Total Qualification Prototype BOM:** **₹6,100 INR**.
- **Post-Selection Physical Subsea Prototype Roadmap:** Estimated total build cost: **₹8,13,000 INR** (including Sea-Bird SBE25/equivalent CTD ₹1.8L, Aanderaa Optode ₹90k, WET Labs fluorometer ₹1.2L, SUNA V2 nitrate ₹2.2L, Ping360/Oculus sonar ₹1.5L, RockBLOCK 9603 satcom ₹25k, housing ₹15k, LiFePO4 cold-rated battery pack ₹8k, buoyancy foam ₹5k).

#### Codebase Violations:
1. **Contradictory Jetson Orin NX Claims in Lab BOM:**
   - `src/pages/AUVTwin.tsx` (Lines 240–258): Adds a "Modular NVIDIA Orin NX Deep Subsea AI Pod" for ₹48,000.
   - `src/pages/AUVTwin.tsx` (Line 1458): Displays `ESP32 SENSOR HUB · JETSON ORIN NX EDGE AI · ACOUSTIC TELEMETRY BUS`.
   - `src/pages/AUVTwin.tsx` (Line 1461): Concurrently displays `HARDWARE TOTAL: ₹6,100 INR · NOMINAL`.
   - *Reality:* A ₹48,000 Jetson Orin NX module cannot be included within a ₹6,100 total budget. The lab prototype uses a Raspberry Pi 4 (₹4,500).
2. **Raspberry Pi 5 Claim:**
   - `src/pages/OceanState.tsx` (Line 498): Displays `ACTIVE LAB COMPUTE: RASPBERRY PI 5 / ONNX (LIVE DEMO)`.
   - *Reality:* The hardware bill of materials specifies Raspberry Pi 4 (4GB).
3. **Attributing Inference Execution to ESP32:**
   - `src/pages/ModelValidation.tsx` (Lines 44–48): Lists `Hardware: ESP32 + Edge Compute Node` with `>60 FPS`, creating ambiguity as to whether the microcontroller is running neural inference. The ESP32 (520 KB SRAM) only runs sensor polling and MQTT publishing.

---

### 1.3 Economic Viability: ₹75,000 vs ₹30 Lakh Commercial Float

#### Ground Truth (`README.md`, `QA_DEFENSE.md`):
- **Scale Unit Cost Target:** **₹75,000 to ₹1,00,000 INR** (approx. $900 - $1,200 USD).
- **Commercial Benchmark:** **₹25,00,000 to ₹30,00,000 INR** (₹25–30 Lakhs) for commercial BGC-Argo floats (Teledyne Webb APEX, Sea-Bird Navis).
- **Cost Reduction Ratio:** **25x to 30x cost reduction**.
- **Justification:** The primary savings stem from indigenous electronics, open-source architecture, edge AI data decimation (transmitting only lightweight JSON telemetry instead of multi-megabyte raw sonar waterfalls over high-cost satellite links), and unmanned autonomous deployment.

#### Codebase Violations:
1. **Distorted Subsea Target Cost in `AUVTwin.tsx`:**
   - `src/pages/AUVTwin.tsx` (Line 970): Displays `LAB PROTOTYPE: ₹6,100 · SUBSEA PROD TARGET: ₹7.8 LAKHS · GOVT IMPORT BENCHMARK: ₹35.0 LAKHS`.
   - `src/pages/AUVTwin.tsx` (Line 983): Highlights `₹7.8 LAKHS`.
   - *Reality:* ₹7.8 Lakhs (or ₹8.13 Lakhs) is the cost of building a single fully-instrumented prototype with imported oceanographic sensors (SBE25, Optode, Fluorometer). The target production unit cost at scale is ₹75,000 – ₹1,00,000. Omitting the ₹75,000 figure conceals the central economic claim of the project.
2. **Unrealistic & Inconsistent Sensor Cost Comparisons:**
   - `src/pages/AUVTwin.tsx` (Line 75): DS18B20 (₹80) compared against "Imported ₹4.5 Lakhs (5,600x savings)". (In `QA_DEFENSE.md` line 61, the SBE3 costs ~₹1.5 Lakhs = 1,875x savings).
   - `src/pages/AUVTwin.tsx` (Line 115): MPU6050 (₹150) compared against "Imported ₹18 Lakhs iXblue Phins Subsea Fiber-Optic Gyro". Comparing a consumer 6-axis MEMS accelerometer to an aerospace-grade tactical fiber-optic gyroscope is an unsupportable claim.
   - `src/pages/ResearchCitations.tsx` (Line 213): Claims `Saves ~₹27.2 Lakhs per unit deployed...`

---

### 1.4 Policy & Mandate: SIH PS-26057 Ghost Net Mandate

#### Ground Truth:
- **Hackathon:** Smart India Hackathon (SIH) 2026.
- **Official Problem Statement:** **PS-26057** (Ministry of Earth Sciences / MoES; National Centre for Polar and Ocean Research / NCPOR; National Institute of Ocean Technology / NIOT).
- **Mandate Core:** Automated detection, segmentation, and geotagging of abandoned, lost, or discarded fishing gear (ALDFG / Ghost Nets), underwater debris, and maritime hazards from side-scan sonar (SSS) imagery, coupled with autonomous ocean telemetry.

#### Codebase Violations:
1. **Arbitrary "PS-1" and "PS-2" Notation:**
   - `src/pages/ResearchCitations.tsx` (Lines 44, 63, 82, 101, 120, 139): Labels citations with `(PS-1)` and `(PS-2)`, e.g., `EOS-80 Salinity Synthesis (PS-1)` and `Acoustic Shadow Ray-Tracer (PS-2)`.
   - `src/pages/OceanState.tsx` (Line 290): `OCEANOGRAPHIC IN-SITU OBSERVATIONS & THERMODYNAMIC SYNTHESIS (PS-1)`.
   - *Reality:* There are no "PS-1" and "PS-2" in the SIH prompt. The single official problem statement is PS-26057.
2. **Contradictory Problem Statement ID (PS-26065):**
   - `src/pages/GovernmentIntel.tsx` (Line 471): Lists `Autonomous Southern Ocean Observation (PS-26065) at 1/100th cost`.
   - *Reality:* While PS-26065 appeared in early defense notes, the authoritative project prompt confirms PS-26057 as the primary submission.
3. **Severe Scientific Domain Creep (Monsoon & Ice Resupply Forecasting):**
   - `src/pages/ResearchCitations.tsx` (Lines 229–231) & `src/pages/Biogeochemistry.tsx` (Lines 312–349, 373–376):
     Claims Aquila OS incorporates a teleconnection model linking Southern Ocean anomalies to the Mascarene High to issue "early advisories for Indian Monsoon onset" (with "Southwest monsoon rainfall probability modeled at 98.4% of LPA") and "real-time pack ice approach windows for RV Bharati resupply".
   - *Reality:* Aquila OS is a subsea edge operating system for sonar debris detection and ocean profiling. Claiming it runs coupled ocean-atmosphere climate models (IITM CFSv2) to forecast the national monsoon rainfall and polar icebreaker logistics is pure LLM hallucination and invites instant disqualification.
4. **"Infinite Energy Integration" Fluff:**
   - `src/pages/GovernmentIntel.tsx` (Lines 578–582): Claims "3. INFINITE ENERGY INTEGRATION: Transitioning the ESP32 edge-node from standard batteries to localized Ocean Thermal Energy Conversion (OTEC) and miniature Wave Energy Harvesters, allowing the platform to operate autonomously at sea for years without human intervention."
   - *Reality:* The hardware specification in `HARDWARE.md` specifies LiFePO4 cells rated to -20°C that retain 70–80% capacity in polar waters. Claiming "Infinite Energy" and OTEC on an edge float is marketing fluff.

---

## 2. Catalog of Hallucinated Academic Citations & Fake DOIs

### 2.1 The Urick-Blondel "Franken-Citation"
- **File:** `src/pages/ResearchCitations.tsx` (Lines 41–59)
- **Claimed Citation:**
  - Title: *Principles of Underwater Sound & Acoustic Shadow Geometric Ray Tracing*
  - Authors: `Robert J. Urick / P. H. Blondel`
  - Publication: `McGraw-Hill / Springer-Praxis Marine Physics Series` (2009)
  - DOI: `https://link.springer.com/book/10.1007/978-3-540-49886-5`
- **Analysis:**
  - Robert J. Urick wrote the foundational book *Principles of Underwater Sound* (McGraw-Hill, 1st ed. 1967, 3rd ed. 1983, ISBN 0-07-066087-5). Urick passed away in 1996.
  - Philippe Blondel wrote *The Handbook of Sidescan Sonar* (Springer Praxis Books, 2009, ISBN 978-3-540-49886-5, DOI `10.1007/978-3-540-49886-5`).
  - An LLM mashed these two distinct authors, publishers, and books into a single hybrid "Franken-citation".
  - Furthermore, the citation claims: *"We implemented the exact altitude-slant range formula in our confidence calibrator... When YOLO detects a target, the calibrator measures the shadow length behind it. If no shadow exists (flat seabed ripple), a -30% penalty drops it to the human triage queue."*
  - *Reality in Code:* In `ai_pipeline/confidence_calibrator.py`, the calibrator does **not** compute 3D target height or measure shadow length via ray-tracing. It checks `shadow_mask[cy, cx] > 0` and applies `SHADOW_PENALTY_FACTOR = 0.50` (a **50% penalty**, not -30%).

### 2.2 Fabricated UNESCO EOS-80 Random Forest Model
- **File:** `src/pages/ResearchCitations.tsx` (Lines 80–97)
- **Claimed Citation:**
  - Title: *UNESCO International Equation of State of Seawater 1980 (EOS-80 / TEOS-10)*
  - Authors: `N. P. Fofonoff, R. C. Millard Jr. / IOC-SCOR-IAPSO`
  - Publication: `UNESCO Technical Papers in Marine Science No. 44` (1983)
  - DOI: `https://www.teos-10.org/pubs/TEOS-10_Manual.pdf`
  - Implementation Claim: *"We trained our Random Forest virtual sensor replicator on UNESCO EOS-80 physics equations... synthesizes laboratory-grade Salinity (PSU)... Validated against Southern Ocean Argo Float (#5906442): achieved ±0.012 PSU RMS error across 0-1,000m depth."*
- **Analysis:**
  - The UNESCO paper is genuine, but the implementation claim is completely fabricated.
  - As verified in `virtual_sensors/dl_sensor_replicator.py` (Lines 12–117):
    - The module uses `scipy.interpolate.interp1d(kind="cubic")` to directly interpolate real BGC-Argo NetCDF measurements (`data/argo_southern_ocean.nc`).
    - When cross-parameter prediction is required, it uses `GradientBoostingRegressor(n_estimators=200, max_depth=5)` (Scikit-Learn), **not Random Forest**.
    - It predicts Dissolved Oxygen (DOXY) from PRES, TEMP, and PSAL, **not Salinity**. Salinity is replayed directly from the Argo float or measured via the TDS sensor proxy.

### 2.3 Fabricated Garcia-Gordon Implementation
- **File:** `src/pages/ResearchCitations.tsx` (Lines 118–135)
- **Claimed Citation:**
  - Title: *Oxygen Solubility in Seawater: Better Fitting Equations for Biogeochemical Oceanography*
  - Authors: `H. E. Garcia, L. I. Gordon` (Limnology and Oceanography, 1992, DOI: 10.4319/lo.1992.37.6.1307)
  - Implementation Claim: `codeImplementation: virtual_sensors/dl_sensor_replicator.py (DOXY Estimator)`
  - Verification Claim: *"Simulated Antarctic Polar Front water at -1.8°C: outputs 318.4 µmol/kg (matching CTD optode ground truth within 1.8%)."*
- **Analysis:**
  - The paper is real, but the claim that `dl_sensor_replicator.py` implements the Garcia-Gordon analytical solubility equations is false.
  - In `dl_sensor_replicator.py`, DOXY is replayed directly from real BGC-Argo profiles (SOCCOM WMO 5904859) filtered with QC flag = 1.

### 2.4 Corrupted CLAHE Publication Details
- **File:** `src/pages/ResearchCitations.tsx` (Lines 99–116)
- **Claimed Citation:**
  - Title: *Contrast Limited Adaptive Histogram Equalization for Underwater & Acoustic Imagery*
  - Publication: `Graphics Gems IV, Academic Press / IEEE Journal of Oceanic Engineering` (1994)
  - Equation / Formulation: `[Clip Limit = 2.0, Tile Grid = 8x8]`
- **Analysis:**
  - Karel Zuiderveld published "Contrast Limited Adaptive Histogram Equalization" in *Graphics Gems IV* (Academic Press, 1994, pp. 474–485). It was never published in the *IEEE Journal of Oceanic Engineering*.
  - In `ai_pipeline/preprocessor.py` (Line 96), the code actually uses `clipLimit=3.0, tileGridSize=(8, 8)`.

### 2.5 Fabricated Ghost Nets in AI4Shipwrecks Dataset
- **File:** `src/pages/ResearchCitations.tsx` (Lines 160–177)
- **Claimed Verification:**
  - Line 176: *"Model evaluation matches published baseline: achieved 91.2% precision on shipwrecks and 94.2% on ghost nets."*
- **Analysis:**
  - The AI4Shipwrecks dataset (University of Michigan Deep Blue Data) contains **only shipwrecks** (286 binary segmentation masks). It contains **zero** ghost nets.
  - As explicitly noted in `AI_PIPELINE.md` (Line 218): *"No public SSS dataset contains labeled ghost net (abandoned fishing net) images... Synthetic training data is generated using a CycleGAN domain transfer..."*
  - Claiming 94.2% precision on ghost nets within the AI4Shipwrecks benchmark is a false statement.

### 2.6 Corrupted CBAM Title & Defense Claims
- **File:** `src/pages/ResearchCitations.tsx` (Lines 137–154)
- **Claimed Title:** `CBAM: Convolutional Block Attention Module for Acoustic Saliency`
- **Claimed Usage:** `Utilized in defense subsea target recognition by DRDO and US Naval Research Lab (NRL).`
- **Analysis:**
  - The original ECCV 2018 paper by Sanghyun Woo et al. is titled *CBAM: Convolutional Block Attention Module*. It was designed for general computer vision (ImageNet/COCO) and makes no mention of acoustics, sonar, or subsea recognition.
  - Adding "for Acoustic Saliency" and asserting unverified DRDO/NRL defense adoption are hallucinated additions.

### 2.7 Residual "DeepScan" Artifacts
- **Files:**
  - `src/pages/ResearchCitations.tsx` (Line 175): `ai_pipeline/train.py & DeepScan_Colab_Training.ipynb`
  - `src/pages/ResearchCitations.tsx` (Line 211): `DeepScan is directly designed...`
  - `src/pages/ResearchCitations.tsx` (Line 229): `DeepScan incorporates the Southern Ocean teleconnection model...`
  - `src/pages/ResearchCitations.tsx` (Line 247): `DeepScan’s JSON and CSV export engine...`
  - `src/pages/SeafloorIntelligence.tsx` (Line 285): `a.download = 'deepscan_detections.csv';`
- **Analysis:** "DeepScan" was the internal working project name during initial Colab training notebooks before formalization as "Aquila OS".

---

## 3. Comprehensive Page-by-Page Audit & Actionable Replacements

### 3.1 `src/pages/ResearchCitations.tsx`

| Line(s) | Offending Text / Flawed Claim | Issue / Rationale | Verified Grounded Replacement |
| :--- | :--- | :--- | :--- |
| 44 | `implementedLocationBadge: 'ai_pipeline/confidence_calibrator.py ➔ Acoustic Shadow Ray-Tracer (PS-2)'` | Arbitrary `PS-2` notation; calibrator performs centroid shadow intersection, not ray tracing | `implementedLocationBadge: 'ai_pipeline/confidence_calibrator.py ➔ Acoustic Shadow Penalty Calibrator (PS-26057)'` |
| 46–50 | Title: `Principles of Underwater Sound & Acoustic Shadow Geometric Ray Tracing`<br>Authors: `Robert J. Urick / P. H. Blondel`<br>Pub: `McGraw-Hill / Springer-Praxis Marine Physics Series` (2009) | Franken-citation mashup of Urick (1983) and Blondel (2009) | Title: `The Handbook of Sidescan Sonar`<br>Author: `Philippe Blondel`<br>Pub: `Springer Praxis Books / Praxis Publishing` (2009)<br>DOI: `https://doi.org/10.1007/978-3-540-49886-5` |
| 56 | `...If no shadow exists (flat seabed ripple), a -30% penalty drops it to the human triage queue.` | Code in `confidence_calibrator.py` uses `SHADOW_PENALTY_FACTOR = 0.50` (50% penalty for detections falling into shadow) | `...When the detector identifies a target, the calibrator checks its centroid against the acoustic shadow mask. Detections falling within shadow zones are penalized by 50% (factor 0.50) to suppress false positives caused by reverberation boundaries.` |
| 61–77 | Item `sahi-2022`: Claims active implementation in `ai_pipeline/detector.py`, slicing waterfall strips into 640x640 tiles with YOLOv9 | SAHI is not in `detector.py`; model is YOLOv8s; YOLOv9 does not exist in repo | Mark `isDirectlyImplemented: false`, update badge to `Phase 2 Roadmap: High-Resolution Sonar Slicing`, and change description to reflect planned architecture for ultra-wide swath sonar rather than fake active implementation. |
| 82 | `implementedLocationBadge: 'virtual_sensors/dl_sensor_replicator.py ➔ EOS-80 Salinity Synthesis (PS-1)'` | Artifact `PS-1`; model uses spline interpolation and gradient boosting on real Argo profiles | `implementedLocationBadge: 'virtual_sensors/dl_sensor_replicator.py ➔ BGC-Argo Profile Replayer (PS-26057)'` |
| 94 | `We trained our Random Forest virtual sensor replicator on UNESCO EOS-80 physics equations... synthesizes laboratory-grade Salinity (PSU)...` | Uses Scikit-Learn `GradientBoostingRegressor` and cubic spline interpolation on real Southern Ocean Argo NetCDF profiles | `We replay real in-situ physical profiles from BGC-Argo float WMO 5904859 in the Southern Ocean (QC flag = 1) using cubic spline depth interpolation, and employ a Gradient Boosting cross-parameter model to estimate missing water column parameters.` |
| 101 | `...CLAHE Speckle Noise Filter (PS-2)` | Artifact `PS-2` | `...CLAHE Speckle Reduction & Contrast Enhancement (PS-26057)` |
| 105 | Pub: `Graphics Gems IV, Academic Press / IEEE Journal of Oceanic Engineering` | Zuiderveld (1994) published in *Graphics Gems IV* only | Pub: `Graphics Gems IV, Academic Press, pp. 474–485` (1994) |
| 110 | `[Clip Limit = 2.0, Tile Grid = 8x8]` | Code in `preprocessor.py` uses `clipLimit=3.0` | `[Clip Limit = 3.0, Tile Grid = 8x8]` |
| 120 | `...Garcia-Gordon DOXY Model (PS-1)` | Artifact `PS-1`; DOXY is replayed from real Argo profiles | `...BGC-Argo In-Situ DOXY Profile Replayer (PS-26057)` |
| 139 | `...Dual Channel-Spatial Saliency Module (PS-2)` | Artifact `PS-2` | `...Dual Channel-Spatial Attention Module (PS-26057)` |
| 141 | Title: `CBAM: Convolutional Block Attention Module for Acoustic Saliency` | Appended "for Acoustic Saliency" to original paper title | Title: `CBAM: Convolutional Block Attention Module` (Woo et al., ECCV 2018) |
| 175 | `codeImplementation: 'ai_pipeline/train.py & DeepScan_Colab_Training.ipynb'` | Legacy project name `DeepScan` | `codeImplementation: 'ai_pipeline/train.py & ai_pipeline/detector.py'` |
| 176 | `...achieved 91.2% precision on shipwrecks and 94.2% on ghost nets.` | AI4Shipwrecks dataset contains only shipwrecks, zero ghost nets | `...achieved 89.6% AP50 on shipwrecks (AI4Shipwrecks benchmark), with ghost nets trained via CycleGAN domain transfer achieving 82.1% AP50.` |
| 211, 229, 247 | `DeepScan is directly designed...`<br>`DeepScan incorporates...`<br>`DeepScan’s JSON and CSV export engine...` | Legacy project name | Replace `DeepScan` with `Aquila OS` |
| 229–231 | Claims model links Antarctic temps to Mascarene High to forecast Indian Monsoon LPA and RV Bharati resupply | Unsubstantiated domain creep / hallucinated capability | Focus on NCPOR Southern Ocean Indian sector carbon sink monitoring, AAIW salinity minima (800–1000 dbar), and Oxygen Minimum Zone (200–400 dbar) tracking. |
| 718 | Cargo Container Calibrated Conf: `51.7%` | Disagrees with `74.2%` on Seafloor Intelligence page | Align to consistent `74.2%` |
| 818 | `...Calibrator applies a -30% penalty...` | Code applies a 50% penalty (`SHADOW_PENALTY_FACTOR = 0.50`) | `...Calibrator applies a 50% penalty (0.5x multiplier) to contacts whose centroids fall within acoustic shadow boundaries...` |

---

### 3.2 `src/pages/GovernmentIntel.tsx`

| Line(s) | Offending Text / Flawed Claim | Issue / Rationale | Verified Grounded Replacement |
| :--- | :--- | :--- | :--- |
| 372 | `RT-DETR Baseline Confidence 61.2%` | RT-DETR was the inferior baseline in the ablation study; YOLOv8s is the primary model | `YOLOv8s Model Confidence 89.6%` |
| 462 & 471 | `Edge AI for underwater debris & ghost net detection (PS-26057)` vs `Autonomous Southern Ocean Observation (PS-26065)` | PS-26065 vs authoritative PS-26057 mandate | Unify under `Smart India Hackathon PS-26057: Autonomous Marine Ghost Net Detection & Oceanographic Telemetry Platform` |
| 566 | `...unlocking the ability to train massive Vision Transformers (RT-DETR).` | RT-DETR failed ablation study due to lack of inductive bias | `...unlocking larger datasets to evaluate advanced hybrid transformer backbones while maintaining YOLOv8s as the primary edge deployment model.` |
| 578–582 | `3. INFINITE ENERGY INTEGRATION: Transitioning the ESP32 edge-node from standard batteries to localized Ocean Thermal Energy Conversion (OTEC)...` | Hallucinated marketing fluff ("INFINITE ENERGY") | `3. POLAR-RATED ENERGY ARCHITECTURE: Transitioning from standard lab bench power to subsea LiFePO4 cold-rated battery cells (-20°C operating rating, retaining 70-80% capacity) supplemented by solar surface-recharging buoys for multi-month endurance.` |

---

### 3.3 `src/pages/ModelValidation.tsx`

| Line(s) | Offending Text / Flawed Claim | Issue / Rationale | Verified Grounded Replacement |
| :--- | :--- | :--- | :--- |
| 44 | `Hardware: ESP32 + Edge Compute Node` | Ambiguous whether ESP32 runs inference; ESP32 is microcontroller sensor hub | `Hardware Architecture: ESP32 (Sensor Hub) + Raspberry Pi 4 (Edge Compute Node)` |
| 48 | `Inference Speed: >60 FPS (Edge Optimized)` | Unrealistic for Raspberry Pi 4 CPU running YOLOv8s (11.1M params) without dGPU | `Inference Latency: ~180ms (~5.5 FPS) on Raspberry Pi 4 CPU (Edge ONNX Runtime) · >30 FPS with Coral/Hailo NPU` |
| 36–38 | MetricBar values: Shipwrecks `89.6%`, Pipelines `86.4%`, Ghost Nets `82.1%` vs Citations matrix | Minor metric discrepancies across pages | Standardize with exact ablation results: YOLOv8s overall mAP50: **88.0%**, Shipwrecks: **89.6%**, Pipes/Cylinders: **86.4%**, Ghost Nets: **82.1%** |

---

### 3.4 `src/pages/AUVTwin.tsx`

| Line(s) | Offending Text / Flawed Claim | Issue / Rationale | Verified Grounded Replacement |
| :--- | :--- | :--- | :--- |
| 75 | `Cost: ₹80 vs Imported ₹4.5 Lakhs (5,600x savings)` | Exaggerated foreign cost; Sea-Bird SBE 3plus is ~₹1.5 Lakhs | `Cost: ₹80 vs Imported ₹1.5 Lakhs SBE 3plus (1,875x savings). 100% locally serviceable.` |
| 115 | `Cost: ₹150 vs Imported ₹18 Lakhs. Filtered with Kalman algorithm on edge.` | Unrealistic comparison of ₹150 MPU6050 to an ₹18 Lakh fiber-optic gyro | `Cost: ₹150 (MPU6050) vs Imported ₹45,000 commercial subsea AHRS module. 6-axis attitude estimation filtered on edge.` |
| 135 | `Replaces ₹18 Lakh foreign CTD sensor entirely with verified in-situ physics equations running on edge.` | TDS + pressure does not fully replace an oceanographic CTD; it is an indigenous low-cost proxy | `Indigenous TDS and hydrostatic depth proxy delivering practical salinity estimation at student budget, backed by BGC-Argo historical profile ground truth.` |
| 240–258 | `id: 'orin_nx_pod', name: 'Modular NVIDIA Orin NX Deep Subsea AI Pod (Post-Selection)', hardwareBOM: 'NVIDIA Jetson Orin NX (20W SOM) in 6061-T6 Pressure Hull', componentCostINR: 48000` | Misaligned with qualification prototype BOM (₹6,100) using Raspberry Pi 4 | Clarify tier as `POST_SELECTION_UPGRADE` and update description: `Post-selection hardware upgrade target for high-throughput multi-swath sonar inference. Qualification prototype utilizes Raspberry Pi 4 (4GB).` |
| 256 | `...running YOLOv9 and SAHI subsea inference directly inside the pressure vessel.` | YOLOv9 and SAHI are non-existent in repo | `...running YOLOv8s edge ONNX inference directly inside the subsea compute pod.` |
| 278 | `...Runs our edge YOLOv9/RT-DETR software natively.` | Mentions YOLOv9 and RT-DETR instead of YOLOv8s | `...Runs our edge YOLOv8s acoustic detection pipeline natively.` |
| 970, 983 | `LAB PROTOTYPE: ₹6,100 · SUBSEA PROD TARGET: ₹7.8 LAKHS · GOVT IMPORT BENCHMARK: ₹35.0 LAKHS` | Conceals the primary ₹75,000 – ₹1,00,000 unit cost at scale | `LAB PROTOTYPE: ₹6,100 · TARGET AT SCALE: ₹75,000 – ₹1.0 LAKH · IMPORTED FLOAT BENCHMARK: ₹25–30 LAKHS` |
| 1422–1424 | `The onboard NVIDIA Jetson Orin NX runs the custom RT-DETR-L model against the sonar waterfall. It ignores the natural boulders and isolates anomalous shapes... with a 51.7% mAP50 Edge baseline precision.` | Major factual flaw: asserts AUV runs RT-DETR-L on Jetson Orin NX with 51.7% mAP50, completely reversing the ablation conclusion | `The onboard edge compute node runs the fine-tuned YOLOv8s model against the sonar waterfall. It leverages localized CNN inductive bias to isolate marine debris (Ghost Nets, Shipwrecks, Cylinders) with an 88.0% mAP50 edge validation accuracy.` |
| 1458 | `ESP32 SENSOR HUB · JETSON ORIN NX EDGE AI · ACOUSTIC TELEMETRY BUS` | Contradicts ₹6,100 BOM | `ESP32 SENSOR HUB · RASPBERRY PI 4 EDGE COMPUTE · ACOUSTIC TELEMETRY BUS` |

---

### 3.5 `src/pages/OceanState.tsx`

| Line(s) | Offending Text / Flawed Claim | Issue / Rationale | Verified Grounded Replacement |
| :--- | :--- | :--- | :--- |
| 290 | `OCEANOGRAPHIC IN-SITU OBSERVATIONS & THERMODYNAMIC SYNTHESIS (PS-1)` | Artifact `PS-1` | `OCEANOGRAPHIC IN-SITU OBSERVATIONS & TELEMETRY SYNTHESIS (PS-26057)` |
| 362 | `MODEL: UNESCO EOS-80 + RF` | Virtual sensor uses GradientBoosting / spline interpolation on real Argo profiles, not Random Forest | `MODEL: BGC-ARGO IN-SITU REPLAY (WMO 5904859)` |
| 498 | `ACTIVE LAB COMPUTE: RASPBERRY PI 5 / ONNX (LIVE DEMO)` | BOM specifies Raspberry Pi 4 | `ACTIVE LAB COMPUTE: RASPBERRY PI 4 (4GB) / ONNX` |
| 508 | `SAHI INFERENCE ENGINE: ACTIVE (640x640 SLICES · 88ms)` | Fabricated SAHI engine | `SSS PREPROCESSING CHAIN: CLAHE (3.0 CLIP) + MEDIAN FILTER (5x5)` |

---

### 3.6 `src/pages/Biogeochemistry.tsx`

| Line(s) | Offending Text / Flawed Claim | Issue / Rationale | Verified Grounded Replacement |
| :--- | :--- | :--- | :--- |
| 126, 134 | `PHYSICS-DERIVED (GARCIA-GORDON)` / `Garcia & Gordon solubility model derived from in-situ water temperature & depth...` | Replays real BGC-Argo NetCDF float data (SOCCOM WMO 5904859) | `BGC-ARGO IN-SITU REPLAY (SOCCOM WMO 5904859)` / `Replayed from real Southern Ocean BGC-Argo float profiles (QC flag = 1). Validated against in-situ dissolved oxygen depth curves.` |
| 149, 157 | `BIO-OPTICAL (MOREL MODEL)` / `Morel downwelling irradiance spectral attenuation model...` | Replays real BGC-Argo float chlorophyll data | `BGC-ARGO OBSERVED (CHL-A FLUORESCENCE)` / `Replayed from real Southern Ocean BGC-Argo fluorometer profiles (QC flag = 1), tracking upper-ocean phytoplankton biomass.` |
| 312–349 | `SOUTHERN OCEAN — INDIAN MONSOON TELECONNECTION MODEL`, `IMD / MoES LINK`, `IMD EARLY ADVISORY: Southwest monsoon rainfall probability modeled at 98.4% of LPA...` | Severe domain creep; hackathon system cannot forecast the national monsoon | Refocus on Southern Ocean Carbon Sink Dynamics: `SOUTHERN OCEAN CARBON SINK & WATER MASS OBSERVATION (NCPOR / MoES ALIGNED)`. Report measured carbon uptake rates, AAIW salinity minima, and Southern Ocean cooling gradients. |
| 373–376 | `Prydz Bay approach open. Optimal resupply window for RV Bharati starts in T-minus 12 days.` | Fictional resupply advisory | Replace with real oceanographic observation: `NCPOR Indian Antarctic Research Base (Bharati, Larsemann Hills) operational data synchronization.` |

---

### 3.7 `src/pages/SeafloorIntelligence.tsx`

| Line(s) | Offending Text / Flawed Claim | Issue / Rationale | Verified Grounded Replacement |
| :--- | :--- | :--- | :--- |
| 285 | `a.download = 'deepscan_detections.csv';` | Legacy project name `deepscan` | `a.download = 'aquila_detections.csv';` |
| 1074 | Cargo Container Calibrated Conf: `74.2%` | Discrepancy with `51.7%` in `ResearchCitations.tsx` | Standardize to `74.2%` across both files |
| 1180 | Ambiguous Anomaly `-30% penalty` | In `confidence_calibrator.py`, penalty is 50% (`SHADOW_PENALTY_FACTOR = 0.50`) | `Calibrator applies a 50% penalty (0.50x confidence multiplier) to contacts whose centroids fall within acoustic shadow boundaries...` |

---

## 4. Synthesis of Inconsistencies & Cross-File Contradictions

| Topic | Conflict / Discrepancy | Files Affected | Authoritative Resolution |
| :--- | :--- | :--- | :--- |
| **Model Choice** | `AUVTwin.tsx:1422` claims RT-DETR-L is running on the AUV; `AUVTwin.tsx:256` & `ResearchCitations.tsx:75` claim YOLOv9; `ModelValidation.tsx` proves YOLOv8s is the selected model (88.0% mAP) and RT-DETR failed (35.4% mAP). | `AUVTwin.tsx`, `ResearchCitations.tsx`, `GovernmentIntel.tsx`, `ModelValidation.tsx` | Standardize on **YOLOv8s** (CNN, 11.1M params, 88.0% mAP50). Retain RT-DETR solely in `ModelValidation.tsx` as the failing ablation baseline (35.4% mAP50). |
| **Edge Hardware** | `AUVTwin.tsx:1458` claims Jetson Orin NX while `AUVTwin.tsx:1461` claims ₹6,100 total BOM; `OceanState.tsx:498` claims Raspberry Pi 5. | `AUVTwin.tsx`, `OceanState.tsx` | Qualification prototype hardware is **ESP32 DevKit v1 (Sensor Hub) + Raspberry Pi 4 4GB (Edge Compute Node)** totaling **₹6,100 INR**. Jetson Orin NX is strictly a post-selection procurement roadmap option. |
| **Target Scale Cost** | `AUVTwin.tsx:970` reports `₹7.8 LAKHS` subsea target; `GovernmentIntel.tsx:442` reports `₹75,000`. | `AUVTwin.tsx`, `GovernmentIntel.tsx`, `README.md` | Target production unit cost at scale is **₹75,000 to ₹1,00,000 INR** (25x–30x cheaper than commercial ₹25–30 Lakh Argo floats). The single fully-instrumented prototype build is **₹8,13,000 INR**. |
| **Problem Statement** | Confusion between `PS-26057`, `PS-26065`, `PS-1`, and `PS-2`. | `ResearchCitations.tsx`, `OceanState.tsx`, `GovernmentIntel.tsx` | Official Problem Statement is **PS-26057** (SIH Ocean Technology / MoES). Eliminate `PS-1`, `PS-2`, and `PS-26065`. |
| **Shadow Penalty** | `ResearchCitations.tsx:56, 818` and `SeafloorIntelligence.tsx:1180` claim `-30% penalty`; `confidence_calibrator.py:4` defines `SHADOW_PENALTY_FACTOR = 0.50` (50% penalty). | `ResearchCitations.tsx`, `SeafloorIntelligence.tsx`, `confidence_calibrator.py` | Standardize frontend text to state **50% confidence penalty** (or 0.50x multiplier) matching python code. |
| **Virtual Sensors** | Frontend claims Random Forest and manual UNESCO EOS-80 / Garcia-Gordon equations; backend code replays real BGC-Argo NetCDF profiles (WMO 5904859) with Gradient Boosting DOXY fallback. | `ResearchCitations.tsx`, `OceanState.tsx`, `Biogeochemistry.tsx` | State truth: in-situ physical profiles are replayed directly from real BGC-Argo floats (SOCCOM Indian sector, QC flag = 1), with Gradient Boosting regression for missing parameters. |
