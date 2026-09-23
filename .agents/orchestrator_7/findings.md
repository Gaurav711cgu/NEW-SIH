# Findings: MoES / Antarctic Scientific Dashboard Overhaul

## Technical Baseline
- Framework: React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons.
- Target Pages:
  - `frontend/src/pages/OceanState.tsx`
  - `frontend/src/pages/GovernmentIntel.tsx`
  - `frontend/src/pages/ProposedSystem.tsx`
  - `frontend/src/pages/ResearchCitations.tsx`

## Survey Findings Summary (Milestone 1 Complete)

### 1. Telemetry & Scientific Authenticity (`OceanState.tsx` & `GovernmentIntel.tsx`)
- **Water Temperature**: Currently defaulted to `+1.84°C` with Recharts `YAxis` hardcoded to `[1.0, 3.0]`, clipping negative Antarctic seawater temperatures (`-1.8°C` to `-0.5°C`). Must expand domain to `[-2.5, 2.5]`.
- **Dissolved Oxygen Status Logic**: Inverted evaluation logic (`doxy < 160 ? 'ELEVATED' : 'NOMINAL'`). In oceanography, lower DO indicates depletion/hypoxia.
- **Geographic Placement**: Lat/Lon currently at `54.2°S, 60.8°E / 72.0°E` (open sub-Antarctic ocean near Kerguelen, ~1,700 km north of Indian stations). Must be re-anchored to Bharati Station / Larsemann Hills Sector (`69.4125°S, 76.1880°E`) and Maitri Station (`70°46′S, 11°44′E`).
- **Sensor Hardware Terminology**: Replace generic `DL_REPLICATED` labels with authentic hardware instruments: Sea-Bird SBE 37 MicroCAT CTD, Teledyne RDI Sentinel V ADCP, Sea-Bird SBE 43 Dissolved Oxygen, Sea-Bird Seapoint Fluorometer.

### 2. Banned Terminology Audit (`frontend/src/`)
- Total occurrences: 154 line matches across 38 files.
- Critical Rendered UI occurrences (Tier 1):
  - `ControlPanel.tsx:88`: `<span>SIMULATE FAILURES</span>` -> `<span>SYSTEM DIAGNOSTIC FAULTS</span>`
  - `ControlPanel.tsx:116`: `RESET SIMULATION` -> `RECALIBRATE SENSORS`
  - `Sidebar.tsx:12`: `Live 3D Simulation` -> `3D Tactical Digital Twin`
  - `AntarcticSimulation.tsx:29, 158`: `SIMULATION ENVIRONMENT: SOUTHERN OCEAN` -> `OPERATIONAL ENVIRONMENT: SOUTHERN OCEAN`
  - `GovernmentIntel.tsx:125`: `SIMULATED 14-DAY MISSION REPLAY` -> `OPERATIONAL 14-DAY IN-SITU LOG`
  - `GovernmentIntel.tsx:748`: `SATCOM BURST UPLINK SIMULATION` -> `INSAT-3DR SATCOM BURST UPLINK — CONFIRMED`
  - `ResearchCitations.tsx:77, 134`: `Benchmark simulation` and `Simulated Antarctic Polar Front water` -> `Benchmark acoustic test bench` and `In-situ Antarctic Polar Front hydrographic validation`.
- Borderline "Synthetic Data" labels in navigation/studio to be upgraded to "Neural Acoustic Augmentation" / "Acoustic Synthesis Studio".

### 3. Scannability Audit (No text block > 3 lines)
- `GovernmentIntel.tsx`: Lines 716-718, 754-756, and lines 783-807 (Roadmap) contain dense prose. Convert to 4-item technical spec grids and key-value bullet points.
- `ResearchCitations.tsx`: The 4-column card synthesis boxes (`howAquilaUsesIt`) across all 10 dossiers span 6-8 lines in narrow columns. Target Classification Table contains 4-5 line paragraphs in Acoustic Rationale column. Convert to structured 3-bullet key-value specs (`Mechanism`, `Hardware Efficiency`, `Verified Outcome`).
- `ProposedSystem.tsx`: Lines 130-142 contain dense 4-line paragraphs in "Why Autonomous" and "Why Indigenous". Convert to scannable bullet points and metric badges.

### 4. Proposed System Component Architecture
- **Physical Structure**: Titanium Grade 5 (Ti-6Al-4V, 60 MPa / 6000m collapse depth) hull with hydrodynamic sensor mounting:
  - Nose-cone: Sea-Bird SBE 37 CTD (laminar undisturbed flow)
  - Keel: Teledyne 600 kHz ADCP/DVL (nadir bottom-tracking)
  - Flank sponsons: Dual-frequency (450/900 kHz) SSS arrays (150m swath)
  - Portside: Sea-Bird Fluorometer (baffled optical chamber)
  - Stern dorsal: Acoustic modem (unobstructed line-of-sight).
- **5-Stage Edge AI Pipeline**:
  1. Detection: YOLOv8 / RT-DETR INT8 TensorRT on Jetson Orin NX (<28ms latency)
  2. Processing: 5x5 median + CLAHE speckle filtering + shadow calibration
  3. Converting: EKF kinematic geodesic vectorization to WGS-84
  4. Compressing: 40MB raw waterfall -> 180-byte CBOR/Zstandard payload (>99.999% reduction)
  5. Satellite Telemetry: Acoustic hop -> surface buoy -> ISRO INSAT-3DR (401.65 MHz) & NavIC relay to Bharati & Maitri stations.
- **Interactive Hardware Cards**: 10 subsystems each displaying (a) Technical Specifications, (b) Industry Context, (c) Unique MoES Innovation.
