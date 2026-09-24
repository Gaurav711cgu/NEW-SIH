# Original User Request

## 2026-09-03T17:50:58Z

# Teamwork Project Prompt — Draft

> Status: Step 9 — Assembled and ready for launch!
> Goal: Craft prompt → get user approval → delegate to teamwork_preview
> Requested team: Full multi-agent team (Backend Architects, ML Engineers, MLOps)

Develop the missing Machine Learning pipeline, MLOps backtesting framework, and dynamic backend telemetry for the AQUILA OS project. The goal is to replace all mocked/static data with a fully functional, production-ready edge AI inference engine and realistic virtual sensors.

Working directory: /Users/gauravkumarnayak/Desktop/new sih
Integrity mode: demo

## Requirements

### R1. Dynamic Backend Telemetry (Backend Architect)
The current SQLite database (`data/platform.db`) lacks `temperature_c` and `salinity_psu` data, causing the frontend charts to flatline. Wire up the `virtual_sensors` module (specifically `noise_engine.py` and `profile_interpolator.py`) to generate realistic water column data, persist it to the database, and serve it dynamically via the FastAPI `/api/telemetry` endpoint.

### R2. ML Inference Pipeline (ML Engineer)
The AI inference logic (`ai_pipeline/detector.py`) is missing. Build a structured ML pipeline script that accepts raw Side-Scan Sonar (SSS) imagery, applies CLAHE (Contrast Limited Adaptive Histogram Equalization) preprocessing, and runs YOLOv8 inference (mocked weights if necessary, but real pipeline architecture) to output bounding boxes, classifications, and confidence scores.

### R3. MLOps Backtesting & Validation (MLOps & Backtesting Frameworks)
Build an MLOps validation script (`ai_pipeline/validate_ablation.py`) that acts as our backtesting framework. It must programmatically evaluate a test set, calculate mAP50, and output a structured JSON report proving the 88.0% mAP (YOLOv8) vs 35.4% mAP (RT-DETR) ablation study claimed on the frontend.

## Acceptance Criteria

### Telemetry & Integration
- [ ] Running the backend continuously updates the SQLite database with fluctuating temperature (e.g., 1.5°C to 2.5°C) and salinity values.
- [ ] The React frontend charts dynamically graph this changing data without flatlining.

### ML & MLOps
- [ ] `ai_pipeline/detector.py` can be executed from the CLI to process an image and output detection coordinates.
- [ ] `ai_pipeline/validate_ablation.py` runs successfully and outputs a JSON metrics file that matches the frontend's statistical claims, providing a reproducible backtesting artifact for the judges.

## 2026-09-03T17:51:30Z

# Teamwork Project Prompt — Frontend Audit & Rewrite

> Status: Launched
> Goal: Audit the frontend UI, fix broken buttons, and rewrite to strip out fake claims.
> Requested team: Full multi-agent team (more thorough, absolute strictness)

Conduct a rigorous audit of the AQUILA OS React frontend codebase. Verify that all buttons and interactive elements work correctly and give exact, intended information. Critically review all text, data, and citations across the site to ensure absolute legitimacy—strip out and rewrite any fake claims, hallucinated data, or information that is not in the present/future scope of the project. Automatically rewrite the `.tsx` files to apply these fixes.

Working directory: /Users/gauravkumarnayak/Desktop/new sih/frontend
Integrity mode: development

## Requirements

### R1. Functional Button Audit
Crawl through the `.tsx` files in `src/pages/` and `src/components/`. Identify any broken buttons, dead links, or interactive elements that fail to trigger state changes. Rewrite the components to make them fully functional.

### R2. Strict Claim & Citation Verification
Review all written text, especially in `ResearchCitations.tsx`, `GovernmentIntel.tsx`, and `ModelValidation.tsx`. Ensure all claims match the established project facts (e.g., YOLOv8 88.0% mAP, ESP32 hardware, ₹75,000 cost vs ₹30 Lakh Argo, PS-26065 Ghost Net mandate). Remove anything that sounds like a hallucinated LLM artifact.

## Acceptance Criteria

### Functional
- [ ] No `onClick` handlers lead to undefined functions or dead states.
- [ ] Navigation buttons correctly route to existing pages.

### Data Integrity
- [ ] All citations and statistics reflect genuine claims, with zero placeholder text or nonsensical data.
- [ ] The codebase compiles successfully (`npm run build`) after the automated rewrites are complete.


## 2026-09-04T05:57:43Z

# Teamwork Project Prompt — Final Audit

> Status: Launched
> Goal: Run final app-wide audit
> Requested team: Full multi-agent team (Audit Specialists, Accessibility Experts)

Conduct a final pre-submission audit of the entire AQUILA OS application (Frontend and AI Pipeline) for the SIH 2026 Hackathon. The audit must rigorously evaluate accessibility compliance, agentic/MLOps action tracking, and verify that the UI and Deep Learning integration meet deployment standards.

Working directory: /Users/gauravkumarnayak/Desktop/new sih
Integrity mode: benchmark

## Requirements

### R1. Comprehensive Accessibility Audit
Scan the entire React frontend codebase (`frontend/src/`) for WCAG AA compliance. Ensure correct ARIA labels on dynamic intelligence charts, contrast ratios on the updated "slate/blue" theme, and semantic HTML structure.

### R2. Agentic Actions & ML Pipeline Audit
Audit the deep learning integration scripts (`ai_pipeline/train.py`, `validate_ablation.py`, `telemetry_edge_model.py`) and virtual sensors to ensure they operate deterministically. Validate that the edge inference engine properly catches edge cases (like extreme speckle noise).

### R3. Final Polish & Wrap-up
Flag any remaining console warnings, dead links, or placeholder "lorem ipsum" text across the application. 

## Acceptance Criteria

### Verification & Checkpoints
- [ ] Accessibility report generated confirming WCAG AA compliance or identifying critical actionable failures.
- [ ] Agentic / MLOps scripts are verified to execute without breaking the application state.
- [ ] A final "Audit Sign-off" summary is produced, clearing the project for the SIH Judges' review.

## 2026-09-06T17:09:34Z

# Geospatial Intelligence (GEOINT) Dispatcher for Industrial Fires (SIH PS-26162)

Build an autonomous Geospatial Intelligence (GEOINT) dispatcher for industrial fires (SIH PS-26162). The system ingests NASA FIRMS and ISRO INSAT thermal data, cross-references OpenStreetMap (OSM) infrastructure tags, trains and runs an XGBoost classification model to distinguish industrial fires from wildfires, and uses an LLM Agent to autonomously route SITREP alerts to local authorities.

Working directory: ~/teamwork_projects/ntro_fire_intel (mapped to /Users/gauravkumarnayak/Desktop/new sih/ntro_fire_intel due to workspace sandbox constraints)
Integrity mode: development

## Requirements

### R1. Multi-Modal Data Ingestion
Build a backend pipeline that polls NASA FIRMS (VIIRS/MODIS) APIs for active thermal anomalies over India.

### R2. Contextual Enrichment & Classification
For each anomaly, query OSM Overpass for nearby industrial infrastructure (2km radius). Use this metadata plus Fire Radiative Power (FRP) and train a real XGBoost classifier model to categorize the anomaly.

### R3. Autonomous Alert Dispatcher
Implement an LLM-based agent that receives high-risk classifications, determines the local jurisdiction, generates a situational report (SITREP) with Google Maps routing, and dispatches it via a Telegram Bot API.

### R4. 3D WebGIS Dashboard
Build a React/Next.js dashboard to visualize the thermal anomalies, infrastructure boundaries, and real-time alerts.

### R5. Strict File-Based Planning Protocol (Manus Pattern)
The implementing agents must strictly follow the `planning-with-files` and `plan-writing` protocols. Before touching any code, initialize `task_plan.md`, `findings.md`, and `progress.md` in the project root. Break the work down into a maximum of 10 independently verifiable tasks. The team must log all errors in the progress files, follow the 3-strike error protocol, and update the markdown files as their persistent memory after every phase. 

## Acceptance Criteria

### Verification & Testing
- [ ] R1: Running `python ingestion.py` successfully fetches at least 10 active thermal points from the public NASA FIRMS API and saves them to `data/firms_latest.json`.
- [ ] R2: Running `python train_model.py` queries OSM Overpass, trains an XGBoost classifier on the data, and successfully outputs a serialized `model.pkl` file with >75% accuracy on the validation set.
- [ ] R3: Running `python dispatcher.py --test` generates a valid JSON SITREP and successfully sends an HTTP POST request to a mocked Telegram Bot API endpoint.
- [ ] R4: Running `npm run build` in the `webgis_dashboard` directory succeeds without compilation errors.
- [ ] R5: The project root directory visibly contains up-to-date `task_plan.md`, `findings.md`, and `progress.md` files that accurately reflect the step-by-step development and debugging history of the project.

## 2026-09-22T21:24:15Z

# Teamwork Project Prompt — Draft

> Status: Ready for launch — awaiting user approval
> Goal: Craft prompt → get user approval → delegate to teamwork_preview
> Requested team: Full team

Fix the React Three Fiber 3D simulation environment (`AntarcticScene.tsx` and related components) so that it loads beautifully without visual glitches. Completely overhaul the environment by importing external AAA-quality 3D models (.glb/.gltf) for the seafloor and surroundings instead of relying on procedural geometry. 

Working directory: /Users/gauravkumarnayak/Desktop/new sih
Integrity mode: benchmark

## Requirements

### R1. External Asset Integration
Replace the existing procedural geometry (Seafloor, IceShelf, etc.) with high-quality external `.glb` or `.gltf` models. The assets must seamlessly fit the deep-sea Antarctic environment (e.g., rocky seabed, underwater ice structures).

### R2. Cinematic Lighting & Atmosphere
Overhaul the lighting, fog, and volumetric effects (God Rays, Marine Snow). The aesthetic must be a moody, immersive deep-sea environment. The light rays must not glitch into massive solid white polygons that blind the camera.

### R3. Performance and Integration
The external models must be properly loaded (e.g., using `useGLTF` or `Suspense`) so they do not crash the browser. The scene must continue to work perfectly with the existing `MissionDirector` dive sequence and telemetry UI.

## Verification Resources
The current project is located in `/Users/gauravkumarnayak/Desktop/new sih/frontend`. You may use Python Playwright scripts (like `take_screenshot.py` in the root) to spin up the local dev server and capture visual evidence of your changes.

## Acceptance Criteria

### Build & Execution
- [ ] The `frontend` project compiles successfully with `npm run build` with zero TypeScript or syntax errors.
- [ ] The React Three Fiber `Canvas` mounts and runs without crashing or throwing WebGL context errors.

### Visual Polish (Agent-as-Judge via Screenshot)
- [ ] The environment features distinct 3D models (GLB/GLTF) for the seafloor rather than mathematical sine-wave planes.
- [ ] The lighting is dark and atmospheric, with proper fog depth.
- [ ] There are no massive, flat, blocky polygons (glitched God Rays or clipping Grids) obstructing the camera view.

## 2026-09-22T22:20:51Z

# Teamwork Project Prompt — Draft

> Status: Ready for launch — awaiting user approval
> Goal: Craft prompt → get user approval → delegate to teamwork_preview
> Requested team: Full team

Drastically enhance the React Three Fiber 3D simulation environment (`AntarcticScene.tsx` and related components) to achieve photorealistic, highly detailed, real-life deep-sea scenarios. This includes advanced lighting, post-processing effects, high-fidelity textures, and dynamic organic elements.

Working directory: /Users/gauravkumarnayak/Desktop/new sih
Integrity mode: benchmark

## Requirements

### R1. Hyper-Realistic Environment Elements
Enhance the current 3D environment by adding highly detailed, authentic elements found in real-life deep-sea scenarios. This includes dynamic underwater caustics (moving light refractions on the seafloor), organic seabed clutter, and realistic material properties for the ice and rocks (e.g., normal maps, roughness, metalness).

### R2. Cinematic Post-Processing Pipeline
Implement `@react-three/postprocessing` to build a high-end cinematic render pipeline. The scene must include Depth of Field (to create camera focus on the AUV and targets), Bloom (to make the AUV's lights and LEDs physically glow), and Ambient Occlusion (to bake realistic deep shadows into the crevices of the 3D models).

### R3. Performance and Stability
Despite the heavy post-processing and detailed assets, the React Three Fiber scene must remain stable and not crash the browser. The integration must not break the existing `MissionDirector` dive sequence or the telemetry UI.

## Verification Resources
The current project is located in `/Users/gauravkumarnayak/Desktop/new sih/frontend`. You must use Python Playwright scripts (like `take_screenshot.py` in the root) to spin up the local dev server and capture visual evidence of your changes.

## Acceptance Criteria

### Build & Execution
- [ ] The `frontend` project compiles successfully with `npm run build` with zero TypeScript or syntax errors.
- [ ] The React Three Fiber `Canvas` mounts and renders the post-processing effects without crashing or throwing WebGL context errors.

### Visual Polish (Agent-as-Judge via Screenshot)
- [ ] Screenshots verify the presence of active Bloom (glowing lights) and Ambient Occlusion (dark shadows in crevices).
- [ ] Screenshots verify that underwater caustics or dynamic lighting patterns are visible on the seafloor.
- [ ] The overall visual fidelity looks distinctly more photorealistic and cinematic than a standard flat WebGL render.

## 2026-09-22T23:21:37Z

# Teamwork Project Prompt — Draft

> Status: Launched
> Goal: Craft prompt → get user approval → delegate to teamwork_preview
> Requested team: Full team

Redesign the UI dashboards (`OceanState.tsx`, `GovernmentIntel.tsx`, and any other dashboard panels) to make the simulation data look incredibly authentic, presentable, and highly relevant to the Indian Ministry of Earth Sciences (MoES) and the Maitri/Bharati Antarctic stations.

Working directory: /Users/gauravkumarnayak/Desktop/new sih
Integrity mode: benchmark

## Requirements

### R1. Authentic MoES / NCPOR Scientific Focus
Refactor all metrics, charts, and text content to focus strictly on real-world Indian Southern Ocean research priorities: hydrodynamics, biogeochemistry, carbon sequestration, plankton/chlorophyll dynamics, and air-sea interactions. Explicitly reference "Bharati Station" and "Maitri Station" data links.

### R2. Strict Ban on "Virtual" or Fake Terminology
The UI must look like a 100% authentic, real-world deployment dashboard used in a MoES video demo. Remove all instances of the words "Virtual", "Simulated", "Mock", or "Fake". All sensors must be presented as actual hardware (e.g., "CTD Profiler", "Acoustic Doppler Current Profiler", "RT-DETR Sonar Array").

### R3. Highly Scannable, Presentable UI Layout
Completely redesign any cards containing long paragraphs of text (especially research findings, citations, or policy recommendations). Break down large text blocks into highly scannable, visually appealing components: use bullet points, data grids, sparkline charts, severity badges, and structured key-value pairs. Nobody should have to read a long paragraph. 

### R4. Peak UI Detailing
Upgrade the CSS/Tailwind detailing across all cards. Add subtle glowing borders, glassmorphism, precise padding, custom scrollbars, and high-quality iconography (using `lucide-react`) to make every panel look like a premium military/scientific intelligence system.

## Acceptance Criteria

### Content Authenticity
- [ ] Absolutely zero occurrences of the words "Virtual", "Mock", or "Simulation" in the rendered UI.
- [ ] Data metrics strictly align with Antarctic/Southern Ocean parameters (e.g., negative water temperatures, PSU salinity, dissolved oxygen, chlorophyll-a).

### Layout and Presentability
- [ ] No single block of text exceeds 3 lines. Long research findings are broken down into scannable lists or metric grids.
- [ ] The `GovernmentIntel` and `OceanState` pages compile cleanly with zero TypeScript errors.

### Visual Quality (Agent-as-Judge)
- [ ] Screenshots verify that the UI components feature high-end detailing (badges, sparklines, clean typography, consistent spacing).
- [ ] Screenshots verify that the layout looks like a professional, operational government dashboard rather than an amateur mockup.

## 2026-09-22T23:23:44Z

### Follow-up / Requirement Update: Proposed System Component ("Autonomous" & "Indigenous")

In addition to the previous requirements, the user explicitly requested a "Proposed System" component/section that justifies the words "autonomous" and "indigenous".
- It must detail the combination of physical components (sensors, AUV structure, how they will be mounted).
- It must also detail the Edge AI intelligence system, the steps for detection -> processing -> converting -> compressing -> sending useful data to the satellite.
- Make this extremely detailed, professional, and visually impressive (no long paragraphs, use diagrams/structured lists).

## 2026-09-22T23:25:38Z

### Follow-up / Requirement Update 2: Interactive Hardware Components & Deep Contextual Cards

Regarding the "Proposed System" and hardware components:
- Make sure ALL hardware components and sensors are interactive.
- When a component is clicked or hovered, it must display a detailed tooltip/card showing:
  1. Its specific info and technical specifications.
  2. Where else this tech is typically used (industry context).
  3. What makes our implementation/usage DIFFERENT or unique for this specific MoES autonomous mission.

## 2026-09-23T04:48:35Z

# Teamwork Project Prompt — Draft

> Status: Launched
> Goal: Craft prompt → get user approval → delegate to teamwork_preview
> Requested team: Full team

Resume and complete the comprehensive UI overhaul of the AQUILA OS frontend dashboards (`OceanState.tsx`, `GovernmentIntel.tsx`, and `ResearchCitations.tsx`), ensuring absolute authenticity for the MoES and Bharati/Maitri stations, and presenting all data in highly scannable, premium military/scientific UI layouts.

Working directory: /Users/gauravkumarnayak/Desktop/new sih
Integrity mode: benchmark

## Requirements

### R1. Complete the Dashboard Audits (OceanState & GovernmentIntel)
Finish analyzing `OceanState.tsx` and `GovernmentIntel.tsx`. Ensure all telemetry parameters and MoES/NCPOR policies fit perfectly. All data must reflect authentic Southern Ocean metrics (e.g., negative water temperatures, PSU salinity). 

### R2. Strict Terminology Ban Verification
Conduct a final cross-dashboard scan to ruthlessly enforce the terminology ban. Ensure there are absolutely zero occurrences of the words "Virtual", "Mock", "Fake", or "Simulated" across all rendered UI components. Replace them with authentic hardware terminology (e.g., "CTD Profiler", "Acoustic Doppler").

### R3. Eradicate Long Paragraphs (Highly Scannable UI)
Target `ResearchCitations.tsx` and any remaining long paragraphs in `GovernmentIntel.tsx` or `OceanState.tsx`. Break down all large text blocks into highly scannable, visually appealing components: use bullet points, data grids, sparkline charts, severity badges, and structured key-value pairs. 

### R4. Peak UI Detailing & Interactive "Proposed System"
Ensure the "Proposed System" layout (physical architecture and 5-stage Edge AI pipeline) features highly scannable tech-spec grids and dynamic hover/click states that display technical specifications, industry context, and our unique innovation. Upgrade CSS detailing across all cards with glowing borders, glassmorphism, precise padding, and high-quality `lucide-react` iconography.

## Acceptance Criteria

### Content Authenticity
- [ ] Automated scan confirms zero instances of banned terminology ("Virtual", "Mock", etc.) in the `src/` directory.
- [ ] Data metrics strictly align with Antarctic/Southern Ocean parameters.

### Layout and Presentability
- [ ] No single block of text exceeds 3 lines. Long research findings and citations are broken down into scannable lists or metric grids.
- [ ] The `ProposedSystem`, `GovernmentIntel`, and `OceanState` pages compile cleanly with zero TypeScript errors.

### Visual Quality (Agent-as-Judge)
- [ ] Visual verification confirms that all interactive hardware components feature premium data cards on hover/click.
- [ ] Visual verification confirms the layout looks like a professional, operational government dashboard (glassmorphism, glowing borders) rather than an amateur mockup.

## 2026-09-23T06:25:24Z

# Teamwork Project Prompt — Draft

> Status: Ready for launch — awaiting user approval
> Goal: Craft prompt → get user approval → delegate to teamwork_preview
> Requested team: Full multi-agent team

Refactor the React Three Fiber 3D model (`AUVModel.tsx`) and the environment scene to fix missing textures, correct physics clipping, and implement premium interactive outlines.

Working directory: /Users/gauravkumarnayak/Desktop/new sih
Integrity mode: benchmark

## Requirements

### R1. Premium Interactive Outlines
Install `@react-three/postprocessing` and implement a global `Selection` and `Outline` pass. When the user hovers over specific AUV meshes (Main Hull, Optical Glass, Conning Tower, Propulsion Shroud), they must visually highlight with a distinct glowing outline, and the cursor must change to a pointer.

### R2. Click-to-Toggle Popups
The diagnostic `<Html>` cards should only appear when a user explicitly clicks on the corresponding 3D component. Clicking the component again, or clicking another component, should toggle the popup visibility. The initial state should have no popups open.

### R3. Physics & Clipping Fix
The 3D AUV currently clips underneath the seafloor terrain geometry. Fix the spatial positioning, depth calculation, or terrain height so that the submarine glides above the seafloor without clipping through the rocks/ground.

### R4. Missing Materials (Pink Balls)
There are magenta/pink untextured domes (likely jellyfish or similar environment geometry) rendering in the scene, which indicates a missing texture or broken material. Identify the source of these pink meshes in the environment files and apply proper, realistic materials.

## Acceptance Criteria

### Interaction & Visual Verification
- [ ] `npm install @react-three/postprocessing` is successfully executed.
- [ ] The `Outline` effect is explicitly implemented on hover for the 4 interactive components.
- [ ] Hovering over the components changes the mouse cursor to a pointer.
- [ ] No popups are visible when the component initially loads.
- [ ] The AUV stays strictly above the terrain and does not clip through the ground.
- [ ] The pink/magenta spheres are replaced with their intended materials (no missing textures in the scene).
- [ ] `npm run build` executes with zero TypeScript errors.

## 2026-09-23T16:11:54Z

# Teamwork Project Prompt — Draft

> Status: Launched
> Goal: Craft prompt → get user approval → delegate to teamwork_preview
> Requested team: Small, focused team

Fix UI data hallucinations, correct side-scan sonar (SSS) object placement, and implement interactive 3D camera controls for the AUV Digital Twin simulation. This is a single self-contained set of frontend fixes; keep it small and focused.

Working directory: /Users/gauravkumarnayak/Desktop/new sih/frontend
Integrity mode: development

## Requirements

### R1. UI Data Integrity (Remove "UXO/MINE")
Audit the frontend components (specifically the Decision Matrix and any terminal/status windows) to remove all hardcoded references to "UXO / MINE" and replace them with "GHOST NET". The JSON payload in the UI must reflect the correct object class.

### R2. Side-Scan Sonar Object Placement
Modify the `DebrisField.tsx` (or relevant target spawning logic) so that ghost nets and chimneys spawn on the **sides** (port and starboard) of the AUV's trajectory, rather than directly in front of it, to accurately reflect how Side-Scan Sonar (SSS) detects targets.

### R3. Interactive 3D Camera Controls
Implement `OrbitControls` in the React Three Fiber scene, anchored to the AUV. The user must be able to click, drag, rotate, and zoom around the AUV in 360 degrees to observe the environment and side-scan detections interactively.

### R4. Sonar Strike Highlighting
Ensure that when the animated sonar ping expands and touches a 3D object on the sides, the object visually highlights (e.g., changes color or material brightness) to indicate a successful acoustic strike.

## Acceptance Criteria

### Automated Verification
- [ ] A Playwright/Puppeteer script is written to load the frontend and assert that the text "UXO" or "MINE" does not exist anywhere in the DOM.

### Code Review (Agent-as-Judge)
- [ ] An independent agent reviews the PR/diff to confirm `OrbitControls` are present and attached to the correct camera/target.
- [ ] Code review confirms the math in the spawning logic offsets the X/Z coordinates to the port/starboard sides of the AUV.

### Manual Verification
- [ ] The user can load the app on `localhost:5173`, successfully pan/rotate the camera 360 degrees around the AUV, and visually confirm objects spawn on the sides and light up upon sonar contact.

## 2026-09-23T21:28:32Z

# Teamwork Project Prompt — ConvectNow (SIH PS-26084)

> Status: Launched
> Goal: Multi-source data fusion nowcasting system for Thunderstorms, Hail & Cloudbursts (0–6h, 1–2 km resolution)
> Requested team: Full multi-agent team (Ingestion Specialists, Nowcast ML Engineers, WebGIS Developers)

Build ConvectNow: an operational convective-scale nowcasting system (0–6h lead time, 1–2 km resolution) for the Ministry of Earth Sciences (MoES) / NCMRWF (SIH PS-26084). The system ingests multi-source data streams (radar reflectivity/velocity, satellite IR/WV, lightning strike density, and NWP background), runs dual-horizon nowcasting (0–2h PySTEPS Lagrangian advection + 2–6h ML/NWP fusion), predicts four discrete convective hazards (Lightning density, Hail POSH/SHI, Downburst velocity, and Cloudburst >100mm/hr), and renders them on an interactive WebGIS command dashboard with per-storm arrival countdown clocks (ETA) and NDMA-compliant CAP alerts.

Working directory: /Users/gauravkumarnayak/Desktop/new sih/convectnow
Integrity mode: development

## Requirements

### R1. Multi-Source Ingestion & Unified Analysis Cube
Build an asynchronous ingestion pipeline that ingests Doppler Weather Radar (NEXRAD L2 proxy + IMD NetCDF/UF adapter stub), Geostationary Satellite (GOES-16 ABI / MOSDAC INSAT-3DR TIR/WV proxy), Geostationary Lightning (SEVIR GLM flashes), and NWP environmental fields (HRRR CAPE, CIN, 0°C freezing level). Resample and synchronize all streams onto a standardized 1 km EPSG:4326 spatiotemporal xarray analysis cube at 5-minute cadences. Apply automated radar clutter filtering (`GateFilter`) and velocity dealiasing.

### R2. Dual-Horizon Spatio-Temporal Nowcasting Engine (0–6h)
Implement a hybrid nowcasting pipeline:
- **0–2h Near-Cast**: PySTEPS Lagrangian advection with Variational Echo Tracking (VET) and a 24-member ensemble perturbation producing mean precipitation and spread.
- **2–6h Mid-Cast**: Spatiotemporal deep learning model (EarthFormer / SimVP) fine-tuned on convective storm sequences blended with downscaled HRRR convective potential via lead-time-dependent Bayesian Model Averaging (BMA).
- **Storm Cell Tracking**: TINT cell identification and trajectory tracking to compute cell speed, heading, and projected corridor.

### R3. Four-Parameter Convective Hazard Physics Engine
Calculate four discrete hazard fields for every 5-minute nowcast step on the 1 km grid:
1. **Lightning Strike Density**: XGBoost regressor on fused storm features (VIL, max dBZ, IR brightness temp, CAPE) with SHAP feature attribution.
2. **Severe Hail Probability**: Severe Hail Index (SHI) and Probability of Severe Hail (POSH) via Witt et al. (1998) integration above the 0°C isotherm.
3. **Downburst Wind Velocity**: Wet-Bulb Zero & MDAP regression model predicting peak surface gust velocity ($V_{db}$).
4. **Cloudburst Threshold Detection**: Tropical Z-R precipitation ($R = (Z/300)^{1/1.5}\text{ mm/hr}$) with morphological filter flagging confirmed $>100\text{ mm/hr}$ extreme events.

### R4. Real-Time WebGIS Command Dashboard & ETA Dispatcher
Develop a responsive WebGIS command center (React / MapLibre GL / Leaflet):
- Dynamic 1–2 km animated raster overlays for all 4 hazard layers with standard meteorological color ramps.
- Tracked storm cells with centroid markers, motion vector arrows, and 4-tier severity tags (Advisory, Watch, Warning, Extreme).
- **Location-Specific ETA Countdown Clocks**: Interactive arrival time distributions ($ETA \pm \text{uncertainty}$) for vulnerable infrastructure, tehsils, and airports.
- Dual-role interface: Tactical Ministry/SDMA Command View vs Simplified Public Warning Card.
- NDMA Common Alerting Protocol (CAP v1.2 XML) automated export.

### R5. Scientific Verification & Replay Suite
Implement an automated validation suite computing meteorology benchmark metrics:
- Contingency table scores: Critical Success Index (CSI), Probability of Detection (POD), False Alarm Ratio (FAR).
- Spatial scores: Fractions Skill Score (FSS) at 5, 10, 20, and 40 km neighborhood radii.
- Calibration: Brier Score and reliability diagrams for probabilistic hazard fields.
- Include 3 replay event packets: Kolkata Kalbaisakhi, Delhi Severe Downburst, and Uttarakhand Cloudburst.

## Acceptance Criteria

### Functional & Algorithmic
- [ ] Ingestion engine successfully creates a synchronized 5-minute multi-channel analysis cube from raw inputs.
- [ ] PySTEPS generates a 12-step (60 min) ensemble nowcast from consecutive radar frames without crashing.
- [ ] All 4 hazard parameter functions (Lightning density, POSH/MESH, Downburst velocity, Cloudburst flag) return valid numerical arrays without NaN or infinite values.
- [ ] TINT storm tracker assigns unique persistent cell IDs and calculates valid $u, v$ motion vectors.
- [ ] ETA algorithm outputs valid arrival time windows with confidence intervals for target coordinates along the storm corridor.

### Verification & Performance
- [ ] Automated evaluation script runs on archived storm events and reports CSI $\ge 0.35$ at 1-hour lead times.
- [ ] WebGIS dashboard renders hazard layers, storm tracks, and ETA countdowns at 60 FPS without UI freezes.
- [ ] Production frontend compiles with zero TypeScript errors (`npm run build`).

## 2026-09-24T13:00:59Z

# Teamwork Project Prompt — ConvectNow Deep Learning & Scrollytelling Suite

> Status: Launched
> Goal: Multi-task PyTorch deep learning models for convective hazards, dual real-world data pipelines, physics-informed AI explainer, and interactive 4D storm anatomy scrollytelling experience (SIH PS-26084)
> Requested team: Full multi-agent team (Deep Learning Specialists, Data Engineers, Scroll Architects, Met Experts)

Build the Deep Learning Hazard Suite, End-to-End Data Pipeline, and Interactive Scrollytelling Experience for ConvectNow (MoES / NCMRWF · SIH PS-26084). The system ingests multi-source data (IMD DWR, MOSDAC INSAT-3DR, and SEVIR benchmarks), trains a unified Karpathy-grade PyTorch multi-task network (ConvectNet) for simultaneous prediction of Severe Hail, Cloudbursts, Downbursts, and Convective Initiation, provides physics-grounded AI feature attribution, and presents an interactive 4D scrollytelling experience exploring the physical lifecycle of severe convective storms.

Working directory: /Users/gauravkumarnayak/Desktop/new sih/convectnow
Integrity mode: development

## Requirements

### R1. Dual Real-World Data Sourcing & Ingestion Pipeline (/data-engineer, /data-scientist)
- Ingest real-world meteorological streams from live IMD Doppler Weather Radar (DWR) GeoServer feeds and MOSDAC INSAT-3DR multispectral products, synchronized with SEVIR high-resolution (1 km) convective storm cubes for reproducible evaluation.
- Implement robust asynchronous ingestion workers with automated quality-control filtering (ground clutter rejection, missing value imputation) and coordinate re-projection onto a uniform 1 km EPSG:4326 grid.

### R2. Unified Multi-Task PyTorch ConvectNet (/ml-engineer, /andrej-karpathy)
- Build a clean, zero-bloat, transparent PyTorch multi-task spatiotemporal neural network (`ConvectNet`):
  - 3D-CNN / Spatiotemporal ConvLSTM backbone processing 4D radar+satellite tensor sequences `(B, C, T, H, W)`.
  - Shared convective feature representation with 4 task-specific heads:
    1. **Hail Head**: Regression for Severe Hail Index (SHI), Probability of Severe Hail (POSH), and Maximum Estimated Size of Hail (MESH).
    2. **Cloudburst Head**: Binary classification and rainfall rate regression for $>100\text{ mm/hr}$ extreme events.
    3. **Downburst Head**: Peak surface wind gust velocity ($V_{db}$) regression.
    4. **Convective Initiation Head**: Probability score ($0.0 - 1.0$) for newly forming updraft cores.
  - Custom loss functions: Asymmetric Loss / Focal Loss to overcome severe class imbalance for rare high-impact events.
  - Self-contained training and ablation script (`train_convectnet.py`) with reproducible loss logging and checkpoint generation.

### R3. Physics-Grounded AI Explainer & Telemetry Tracking (/ai-analyzer, /analytics-tracking)
- Feature attribution module computing atmospheric contribution scores (e.g. VIL density, $Z_{max}$ core height, cloud-top cooling rate, freezing level proximity) for every detected storm cell.
- Operational telemetry and analytics tracking: inference latency, prediction confidence bands, and verification skill logs.

### R4. Full Interactive 4D Storm Anatomy Scrollytelling Experience (/scroll-experience)
- Build a cinematic, scroll-driven interactive narrative ("Anatomy of a Cloudburst: 60 Minutes to Catastrophe") integrated into the ConvectNow WebGIS dashboard:
  - Step-by-step physical phases with parallax reveals: (1) Convective Initiation $\to$ (2) Rapid Explosive Updraft $\to$ (3) Hail Core Suspended Aloft $\to$ (4) Downdraft Collapse & Extreme Cloudburst $\to$ (5) Ground Impact & Flash Flood.
  - Interactive vertical radar reflectivity cross-sections ($Z$ vs Height $0–18\text{ km}$), isotherm levels ($0^\circ\text{C}$, $-20^\circ\text{C}$), and live AI hazard telemetry updating dynamically as the user scrolls.
  - Full adherence to the "Ice and Ships" design tokens ([`DESIGN.md`](file:///Users/gauravkumarnayak/Desktop/new%20sih/DESIGN.md): `ocean-950` to `ocean-600`, `ice-500` `#00e5ff`, `steel-800`, `JetBrains Mono` for telemetry).

## Acceptance Criteria

### Deep Learning & Pipeline
- [ ] Automated data loader cleanly yields multi-modal batches `(B, C, T, H, W)` without corrupt frames.
- [ ] `ConvectNet` successfully runs forward pass, backpropagates gradients with custom asymmetric loss without NaN/Inf, and achieves training convergence.
- [ ] Inference engine returns all 4 hazard predictions for a storm frame in $<50\text{ ms}$.

### Scrollytelling & UI Integration
- [ ] The 4D Storm Anatomy scrollytelling panel renders smoothly at 60 FPS with sticky parallax visuals and fluid scroll progress tracking.
- [ ] The AI feature attribution panel highlights the top physical drivers for any selected storm cell.
- [ ] Frontend compiles cleanly with `npm run build` with zero TypeScript errors.

