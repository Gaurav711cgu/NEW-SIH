# Handoff Report — Explorer 2: Claim, Citation & Data Verification Audit

**Agent:** Explorer 2 (Frontend Claim, Citation & Data Verification)  
**Working Directory:** `/Users/gauravkumarnayak/Desktop/new sih/.agents/explorer_2`  
**Handoff Type:** Hard Handoff (Task Complete)  
**Target Codebase:** `frontend/src/`  
**Primary Deliverable:** `/Users/gauravkumarnayak/Desktop/new sih/.agents/explorer_2/analysis.md`

---

## 1. Observation

Direct code observations, file paths, line numbers, and exact verbatim quotes from the React frontend (`frontend/src/`) and authoritative project documents:

1. **Authoritative Project Facts (`README.md`, `HARDWARE.md`, `QA_DEFENSE.md`, `AI_PIPELINE.md`):**
   - AI Model: `README.md` (Lines 62–69) & `QA_DEFENSE.md` (Lines 83–87): YOLOv8s CNN model achieves **88.0% mAP@50**, while RT-DETR-L (Vision Transformer) failed to converge at **35.4% mAP@50** due to lack of inductive bias on acoustic datasets.
   - Edge Hardware: `HARDWARE.md` (Lines 7–18): Microcontroller sensor hub is ESP32 DevKit v1 (₹400); edge computer is Raspberry Pi 4, 4GB (₹4,500); sensors DS18B20 (₹80), BMP280 (₹120), SEN0161 pH (₹350), MPU6050 (₹150), Gravity TDS (₹200). Total qualification prototype BOM: **₹6,100 INR**.
   - Economics: `README.md` (Lines 11–17) & `QA_DEFENSE.md` (Lines 75–78): Scale production unit cost is **₹75,000 to ₹1,00,000 INR**, compared to **₹25,00,000 to ₹30,00,000 INR** (₹25–30 Lakhs) for commercial BGC-Argo floats (25x to 30x cost reduction).
   - Problem Statement: `README.md` (Lines 3–5): Smart India Hackathon **Problem Statement PS-26057**, Ocean Technology & Disaster Management (Ministry of Earth Sciences).

2. **AI Model Falsifications in Frontend:**
   - `src/pages/ResearchCitations.tsx` (Line 75): *"We wrapped our YOLOv9 model with a custom SAHI sliding window that slices 2048x512 raw side-scan sonar waterfall logs into 640x640 overlapping tiles..."*
   - `src/pages/AUVTwin.tsx` (Line 256): *"High-efficiency deep subsea embedded neural accelerator running YOLOv9 and SAHI subsea inference directly inside the pressure vessel."*
   - `src/pages/AUVTwin.tsx` (Line 278): *"Cost ₹1.5 Lakhs vs ₹45 Lakhs imported tow-fish. Runs our edge YOLOv9/RT-DETR software natively."*
   - `src/pages/AUVTwin.tsx` (Lines 1422–1424): *"The onboard NVIDIA Jetson Orin NX runs the custom RT-DETR-L model against the sonar waterfall. It ignores the natural boulders and isolates anomalous shapes (Shipwrecks, Aircraft, Small Targets) with a 51.7% mAP50 Edge baseline precision."*
   - `src/pages/GovernmentIntel.tsx` (Line 372): *"RT-DETR Baseline Confidence 61.2%"*
   - `src/pages/ModelValidation.tsx` (Line 48): *"Inference Speed: >60 FPS (Edge Optimized)"*
   - `src/pages/OceanState.tsx` (Line 508): *"SAHI INFERENCE ENGINE: ACTIVE (640x640 SLICES · 88ms)"*

3. **Edge Hardware Discrepancies in Frontend:**
   - `src/pages/AUVTwin.tsx` (Line 243): *"hardwareBOM: 'NVIDIA Jetson Orin NX (20W SOM) in 6061-T6 Pressure Hull', componentCostINR: 48000"*
   - `src/pages/AUVTwin.tsx` (Line 1458): *"ESP32 SENSOR HUB · JETSON ORIN NX EDGE AI · ACOUSTIC TELEMETRY BUS"*
   - `src/pages/AUVTwin.tsx` (Line 1461): *"HARDWARE TOTAL: ₹6,100 INR · NOMINAL"* (Contradiction: ₹48,000 Jetson Orin NX cannot be part of a ₹6,100 BOM).
   - `src/pages/OceanState.tsx` (Line 498): *"ACTIVE LAB COMPUTE: RASPBERRY PI 5 / ONNX (LIVE DEMO)"* (Should be Raspberry Pi 4).

4. **Economic Discrepancies in Frontend:**
   - `src/pages/AUVTwin.tsx` (Line 970): *"LAB PROTOTYPE: ₹6,100 · SUBSEA PROD TARGET: ₹7.8 LAKHS · GOVT IMPORT BENCHMARK: ₹35.0 LAKHS"* (Omits the ₹75,000 unit cost at scale).
   - `src/pages/AUVTwin.tsx` (Line 75): *"Cost: ₹80 vs Imported ₹4.5 Lakhs (5,600x savings)"* (In `QA_DEFENSE.md` line 61, SBE 3 is ~₹1.5 Lakhs = 1,875x savings).
   - `src/pages/AUVTwin.tsx` (Line 115): *"Cost: ₹150 vs Imported ₹18 Lakhs"* (MPU6050 vs ₹18 Lakh fiber-optic gyro).

5. **Mandate, Citation & Scientific Hallucinations:**
   - `src/pages/ResearchCitations.tsx` (Lines 46–50): Franken-citation combining Robert J. Urick and Philippe Blondel: Title: *"Principles of Underwater Sound & Acoustic Shadow Geometric Ray Tracing"*, Authors: *"Robert J. Urick / P. H. Blondel"*, Pub: *"McGraw-Hill / Springer-Praxis Marine Physics Series"* (2009).
   - `src/pages/ResearchCitations.tsx` (Line 176): *"Model evaluation matches published baseline: achieved 91.2% precision on shipwrecks and 94.2% on ghost nets."* (AI4Shipwrecks dataset contains only shipwrecks, 0 ghost nets).
   - `src/pages/ResearchCitations.tsx` (Lines 44, 63, 82, 101, 120, 139) & `src/pages/OceanState.tsx` (Line 290): Arbitrary `(PS-1)` and `(PS-2)` badges.
   - `src/pages/GovernmentIntel.tsx` (Line 471): *"Autonomous Southern Ocean Observation (PS-26065) at 1/100th cost."*
   - `src/pages/GovernmentIntel.tsx` (Lines 578–582): *"3. INFINITE ENERGY INTEGRATION: Transitioning the ESP32 edge-node from standard batteries to localized Ocean Thermal Energy Conversion (OTEC)..."*
   - `src/pages/ResearchCitations.tsx` (Lines 229–231) & `src/pages/Biogeochemistry.tsx` (Lines 312–349): Teleconnection model forecasting the Indian Monsoon rainfall probability (98.4% of LPA) and pack ice resupply windows for RV Bharati.
   - Residual "DeepScan" strings in `ResearchCitations.tsx` (lines 211, 229, 247) and `SeafloorIntelligence.tsx` (line 285).

---

## 2. Logic Chain

1. **Divergence of AI Model Claims:**
   - Observation 1 establishes that the core scientific proof of the project is the empirical ablation study: YOLOv8s succeeded with 88.0% mAP@50 while RT-DETR failed with 35.4% mAP@50 due to small dataset size and lack of CNN inductive bias.
   - Observation 2 reveals that `AUVTwin.tsx` (Lines 1422–1424) explicitly claims the vehicle runs RT-DETR-L subsea with 51.7% mAP50, while `ResearchCitations.tsx` (Line 75) and `AUVTwin.tsx` (Line 256) claim the model is YOLOv9 with a SAHI window slicing engine.
   - *Inference:* These conflicting assertions destroy the team's central technical narrative. If judges review `ModelValidation.tsx`, they see RT-DETR as a failure; if they click `AUVTwin.tsx`, they see RT-DETR claimed as the subsea detector; if they look at `ResearchCitations.tsx`, they see YOLOv9.
   - *Action Required:* Systematically replace all YOLOv9 and RT-DETR active execution claims with `YOLOv8s`, and clearly isolate RT-DETR to the `ModelValidation.tsx` ablation comparison table as the failing baseline.

2. **Divergence of Hardware Architecture Claims:**
   - Observation 1 establishes the physical prototype uses an ESP32 sensor hub (₹400) + Raspberry Pi 4 compute node (₹4,500), totaling ₹6,100 INR.
   - Observation 3 reveals `AUVTwin.tsx` (Line 1458) claims an NVIDIA Jetson Orin NX (₹48,000 SOM) is running edge AI in the current hardware, yet displays a total hardware cost of ₹6,100 INR on Line 1461.
   - *Inference:* Claiming a ₹48,000 Jetson Orin NX inside a ₹6,100 total budget is mathematically contradictory.
   - *Action Required:* Harmonize the hardware description to `ESP32 Sensor Hub + Raspberry Pi 4 Edge Compute Node` for the current qualification prototype, explicitly designating the Jetson Orin NX as a post-selection modular upgrade target.

3. **Divergence of Economic Claims:**
   - Observation 1 establishes the headline economic advantage: ₹75,000 unit cost at scale vs ₹30 Lakh commercial BGC-Argo float.
   - Observation 4 reveals `AUVTwin.tsx` displays "₹7.8 LAKHS" as the target subsea cost, while omitting the ₹75,000 production figure, and asserts absurd comparisons (e.g. ₹150 MPU6050 replacing an ₹18 Lakh tactical FOG).
   - *Inference:* This muddles the cost narrative and exposes the team to aggressive cross-examination.
   - *Action Required:* Clearly delineate the three cost tiers: (a) Qualification Prototype: ₹6,100; (b) Single Post-Selection Instrumented Prototype: ₹8,13,000; (c) Target Unit Cost at Scale: ₹75,000 – ₹1,00,000 (vs ₹25–30 Lakh commercial float).

4. **Scientific Credibility of Academic Citations & Problem Mandate:**
   - Observation 5 reveals Franken-citations (Urick/Blondel mashup), fabricated algorithm implementations (SAHI, Random Forest UNESCO EOS-80, Garcia-Gordon in Python), hallucinated ghost nets in AI4Shipwrecks, marketing hyperbole ("Infinite Energy Integration"), and domain creep into Indian Monsoon forecasting.
   - *Inference:* Technical judges from MoES/NIOT will immediately verify DOIs and citations. Citing fake co-authors, claiming to implement algorithms not present in the code, or claiming a debris detection float forecasts national rainfall will cause instant loss of credibility.
   - *Action Required:* Clean all citations to genuine publications (Blondel 2009 for sidescan sonar, Urick 1983 for underwater sound, Zuiderveld 1994 for CLAHE, Woo 2018 for CBAM); accurately state that virtual profiles are replayed from real BGC-Argo float profiles (SOCCOM WMO 5904859, QC flag = 1); eliminate "PS-1"/"PS-2" and standardize on PS-26057; strip out monsoon forecasting and "Infinite Energy" claims.

---

## 3. Caveats

1. **Backend Integration Boundary:**
   - This investigation was strictly read-only on `frontend/src/` and project documentation. The actual backend telemetry script (`api/main.py`) imports `SonarDetector` from `ai_pipeline/detector.py`, whereas `detector.py` defines `AnomalyDetector`. This backend discrepancy should be verified by the backend/fullstack agent.
2. **Dynamic Data Flow:**
   - In `Biogeochemistry.tsx` and `MissionControl.tsx`, fallback values are hardcoded when the backend API (`http://localhost:8000`) is offline. The verified replacements focus on aligning text, claims, and telemetry ranges with the real project context.
3. **No Caveats on Factual Scope:**
   - The authoritative ground truth documents (`README.md`, `HARDWARE.md`, `QA_DEFENSE.md`, `AI_PIPELINE.md`) provide complete and unambiguous specifications for all project claims.

---

## 4. Conclusion

The React frontend contains several high-risk claim contradictions and LLM-generated hallucinations that must be rewritten before judge presentation:
1. **Model Contradictions:** Replace all active references to `YOLOv9` and `RT-DETR-L` with `YOLOv8s` (88.0% mAP@50). Retain RT-DETR strictly as the failing baseline (35.4% mAP50) in `ModelValidation.tsx`.
2. **Hardware Alignment:** Ground the current hardware stack in `ESP32 (Sensor Hub) + Raspberry Pi 4 (Edge Compute Node)` (Total BOM ₹6,100). Clarify that Jetson Orin NX is a post-selection procurement roadmap option.
3. **Economic Grounding:** Highlight the `₹75,000` unit cost at scale vs `₹30 Lakh` commercial Argo float across all pages.
4. **Citation Purification:** Disentangle the Urick-Blondel hybrid book, correct the CLAHE and CBAM citations, eliminate the non-existent SAHI and Random Forest EOS-80 claims, and clarify that biogeochemical data is replayed from real BGC-Argo profiles (SOCCOM WMO 5904859, QC flag = 1).
5. **Mandate Consolidation:** Standardize all badges and headers on `Smart India Hackathon Problem Statement PS-26057`, eliminating `(PS-1)`, `(PS-2)`, and `PS-26065`, and removing the monsoon forecasting fluff.

Detailed replacement tables with exact line numbers and replacement snippets are fully cataloged in `/Users/gauravkumarnayak/Desktop/new sih/.agents/explorer_2/analysis.md`.

---

## 5. Verification Method

To independently verify these findings and confirm post-fix stability:
1. **Grep Pattern Verification:**
   - Search for `YOLOv9`: `grep -rn "YOLOv9" frontend/src/` (Must return 0 results after remediation).
   - Search for `DeepScan`: `grep -rn "DeepScan" frontend/src/` (Must return 0 results).
   - Search for `PS-1` / `PS-2`: `grep -rn "PS-[12]" frontend/src/` (Must return 0 results).
   - Search for `Infinite Energy`: `grep -rn "INFINITE ENERGY" frontend/src/` (Must return 0 results).
   - Search for `Urick / P. H. Blondel`: `grep -rn "Urick / P. H. Blondel" frontend/src/` (Must return 0 results).
2. **Authoritative Consistency Check:**
   - Inspect `frontend/src/pages/ModelValidation.tsx` and verify table values match `README.md` Section 3: YOLOv8s (88.0% mAP50, 11.1M params, 28.6 GFLOPs) vs RT-DETR-L (35.4% mAP50, 31.9M params, 105.4 GFLOPs).
   - Inspect `frontend/src/pages/AUVTwin.tsx` lines 1422–1424 to ensure it refers to YOLOv8s rather than RT-DETR-L.
3. **Build Command:**
   - Run: `cd "/Users/gauravkumarnayak/Desktop/new sih/frontend" && npm run build`
   - Expected Result: Code compiles cleanly with zero TypeScript errors.
