## 2026-09-23T04:59:27Z
You are worker_m3.
Your working directory is: /Users/gauravkumarnayak/Desktop/new sih/.agents/worker_m3
Exclusive write ownership:
1. frontend/src/pages/GovernmentIntel.tsx
2. frontend/src/pages/ProposedSystem.tsx
Do NOT edit any other files.

MANDATORY FIRST STEP:
Read the authoritative user request at:
/Users/gauravkumarnayak/Desktop/new sih/.agents/ORIGINAL_REQUEST.md

Read the survey & design reports:
- /Users/gauravkumarnayak/Desktop/new sih/.agents/explorer_m1_1/analysis.md
- /Users/gauravkumarnayak/Desktop/new sih/.agents/explorer_m1_2/banned_terms_audit.md
- /Users/gauravkumarnayak/Desktop/new sih/.agents/explorer_m1_3/proposed_system_design.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

MISSION OBJECTIVES:
1. In GovernmentIntel.tsx:
   - Eliminate all banned terms:
     * Line 125: "SIMULATED 14-DAY MISSION REPLAY" -> "OPERATIONAL 14-DAY IN-SITU LOG"
     * Line 748: "SATCOM BURST UPLINK SIMULATION" -> "INSAT-3DR SATCOM BURST UPLINK — CONFIRMED"
     * Line 782: "SYNTHETIC SONAR DATA ENGINE" -> "NEURAL ACOUSTIC AUGMENTATION ENGINE"
   - Re-align waypoints and bathymetric mapping to Bharati Station / Prydz Bay Sector (69.4°S, 76.2°E) and Maitri Station link.
   - Break down all dense text paragraphs (lines 716-718, 754-756, 783-807) into scannable 4-item technical spec grids, bullet points, and severity badges (strictly <= 3 lines per block).
   - Ensure clear navigation or prominent link to the Proposed System.
2. In ProposedSystem.tsx (Autonomous & Indigenous Deep-Sea Architecture):
   - Fully implement the 10 flight-qualified interactive hardware cards per explorer_m1_3's blueprint:
     1. Sea-Bird SBE 37-SI MicroCAT CTD (Nose-cone laminar mounting)
     2. Teledyne RDI Workhorse Sentinel V 600 kHz ADCP / DVL (Keel nadir bottom-tracking)
     3. Klein Marine Systems 3900 Dual-Freq (450/900 kHz) SSS Array (Flank sponsons, 150m swath)
     4. Sea-Bird Seapoint Optical Chlorophyll Fluorometer (Portside baffled optical chamber)
     5. Evologics S2C R 18/34 Acoustic Burst Modem (Stern dorsal fairing)
     6. NVIDIA Jetson Orin NX 16GB Edge AI Computer (Internal pressure hull)
     7. Solid-State Lithium Iron Phosphate (LiFePO4) Polar Battery Pack (-20°C rated)
     8. Titanium Grade 5 (Ti-6Al-4V) Isogrid Pressure Vessel (60 MPa / 6000m collapse depth)
     9. Spar-Buoy Satellite Gateway & Surface Acoustic Modem Transponder (INSAT-3DR / NavIC relay)
     10. VectorNav VN-300 Dual-Antenna INS / DVL Kalman Filter Navigator
   - Interactive hover/click state: clicking or hovering any component must display:
     (a) Technical Specifications (key-value grid: Model, Power, Interface, Depth, Resolution/Accuracy)
     (b) Industry Context (bullet points, <= 2 lines each)
     (c) Unique MoES Innovation (high-contrast cyan callouts, <= 2 lines each)
   - 5-Stage Edge AI Pipeline:
     * Stage 1: Detection (YOLOv8s-Sonar / RT-DETR INT8 TensorRT on Orin NX, <28ms latency)
     * Stage 2: Processing (5x5 median blur + CLAHE speckle filter + acoustic shadow height calibration)
     * Stage 3: Converting (EKF kinematics fusing AHRS/DVL, geodesic projection to WGS-84 lat/lon)
     * Stage 4: Compressing (Purge 40MB raw waterfall, bit-pack vital telemetry into 180-byte Zstandard/CBOR frame, >99.999% bandwidth reduction)
     * Stage 5: Satellite Telemetry (Acoustic hop to surface gateway -> ISRO INSAT-3DR @ 401.65 MHz & NavIC relay -> simultaneous downlink to Bharati Station 69°24'S and Maitri Station 70°46'S).
   - Scannability: Eradicate long paragraphs in "Why Autonomous" and "Why Indigenous" (lines 130-142). Replace with scannable metric badges and bullet points (strictly <= 3 lines per block).
   - Styling: Military/scientific glassmorphism, glowing borders (border-cyan-500/30), lucide-react iconography.
3. Verification:
   - Run `npm run build` or `npx tsc --noEmit` in `/Users/gauravkumarnayak/Desktop/new sih/frontend` to verify 0 errors.

OUTPUT REQUIREMENTS:
Document your exact changes in /Users/gauravkumarnayak/Desktop/new sih/.agents/worker_m3/changes.md
Write your formal handoff to /Users/gauravkumarnayak/Desktop/new sih/.agents/worker_m3/handoff.md
Send a completion message back using send_message.
