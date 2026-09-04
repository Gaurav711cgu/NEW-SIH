## 2026-09-03T18:07:40Z

You are Worker 2 on the AQUILA OS Frontend Remediation team.
Working directory: /Users/gauravkumarnayak/Desktop/new sih/.agents/worker_2
Authoritative User Request: /Users/gauravkumarnayak/Desktop/new sih/.agents/ORIGINAL_REQUEST.md (Read this file FIRST).
Project Scope: /Users/gauravkumarnayak/Desktop/new sih/PROJECT.md
Explorer 2 Detailed Analysis & Replacement Tables: /Users/gauravkumarnayak/Desktop/new sih/.agents/explorer_2/analysis.md
Target Codebase: /Users/gauravkumarnayak/Desktop/new sih/frontend

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A reviewer will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your Assigned Scope (Milestone 2: Strict Claim & Citation Verification & Hallucination Removal):
Follow the exhaustive, line-by-line replacement specifications in `/Users/gauravkumarnayak/Desktop/new sih/.agents/explorer_2/analysis.md` across the following files:
1. `src/pages/ResearchCitations.tsx`:
   - Replace Franken-citation (Urick 1983 / Blondel 2009) with authentic individual citations.
   - Correct CLAHE (Zuiderveld 1994) and CBAM (Woo 2018) citations.
   - Replace YOLOv9 claim (line 75) with YOLOv8s (88.0% mAP50).
   - Replace fake SAHI sliding window claim with CLAHE tile enhancement for acoustic sonar waterfalls.
   - Replace fake UNESCO EOS-80 Random Forest claim with cubic spline BGC-Argo profile replay (SOCCOM WMO 5904859, QC flag = 1) with Gradient Boosting DOXY regression.
   - Fix AI4Shipwrecks claim (line 176): correctly state it is an acoustic shipwreck benchmark without hallucinated ghost net precision.
   - Replace all residual "DeepScan" strings with "AQUILA".
   - Remove Indian Monsoon rainfall LPA prediction (98.4%) and RV Bharati resupply claims.
   - Consolidate all problem statement badges to Smart India Hackathon Problem Statement `PS-26057`.
2. `src/pages/AUVTwin.tsx`:
   - Replace RT-DETR-L subsea inference claim (lines 1422–1424) with YOLOv8s edge CNN inference (88.0% mAP50).
   - Replace YOLOv9 mentions (lines 256, 278) with YOLOv8s.
   - Harmonize hardware architecture (lines 243, 1458) to `ESP32 Sensor Hub + Raspberry Pi 4 Edge Compute Node` for the current prototype (BOM ₹6,100), explicitly noting Jetson Orin NX as the post-selection production SOM upgrade target.
   - Unify economics (lines 970, 983): Highlight headline production unit cost of ₹75,000 – ₹1,00,000 INR at scale vs ₹25–30 Lakh commercial BGC-Argo float. Correct component comparisons (SBE 3 is ₹1.5L, not ₹4.5L).
3. `src/pages/GovernmentIntel.tsx`:
   - Consolidate mandate badge to Smart India Hackathon Problem Statement PS-26057 (replace `PS-26065`).
   - Remove "Infinite Energy Integration" / OTEC claim (lines 578–582) and replace with polar-rated LiFePO4 battery management system specifications.
   - In line 372: RT-DETR baseline 35.4% mAP50 (not 61.2%).
4. `src/pages/ModelValidation.tsx`:
   - Ensure the metrics table matches authoritative project numbers: YOLOv8s (88.0% mAP50, 11.1M params, 28.6 GFLOPs) vs RT-DETR-L baseline (35.4% mAP50, 31.9M params, 105.4 GFLOPs).
   - Fix edge inference speed claim (line 48) to realistic edge CPU latency (~180ms on Pi 4 CPU, ~5.5 FPS).
5. `src/pages/OceanState.tsx`:
   - Fix "Raspberry Pi 5" typo to "Raspberry Pi 4" (line 498).
   - Consolidate PS badges to PS-26057.
6. `src/pages/Biogeochemistry.tsx`:
   - Remove monsoon LPA prediction claims, focus on real BGC-Argo ocean chemistry (dissolved oxygen, chlorophyll-a, pH, salinity, temperature).
7. `src/pages/SeafloorIntelligence.tsx`:
   - Replace residual "DeepScan" reference (line 285) with "AQUILA".
8. Verification:
   - Run `npx tsc --noEmit` and `npm run build` in `/Users/gauravkumarnayak/Desktop/new sih/frontend`. Ensure code 0.
   - Verify via grep: `grep -rn "YOLOv9" src/`, `grep -rn "DeepScan" src/`, `grep -rn "PS-[12]" src/` return 0 results.
