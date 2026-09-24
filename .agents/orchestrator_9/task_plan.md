# Task Plan: AUV Digital Twin Simulation Fixes (Milestone 9)

## Goal
Deliver a clean, verified set of fixes addressing UI data hallucinations, Side-Scan Sonar object placement, interactive 3D camera controls, and sonar strike highlighting.

## Scope Breakdown
### R1. UI Data Integrity (Remove "UXO/MINE")
- Audit all frontend components (specifically Decision Matrix, terminal/status windows, telemetry/logs, and JSON payloads).
- Replace all occurrences/references of "UXO / MINE", "UXO", "MINE" (in the context of detected targets/threats) with "GHOST NET".
- Ensure JSON payload displayed in UI accurately reflects "GHOST NET" as the detected object class.

### R2. Side-Scan Sonar Object Placement
- Inspect `DebrisField.tsx` and related target spawning/placement logic.
- Ensure ghost nets and hydrothermal chimneys/objects spawn on the sides (port and starboard) of the AUV trajectory rather than directly in front of the vehicle.
- Mathematically offset X/Z coordinates to represent port/starboard SSS detection swaths.

### R3. Interactive 3D Camera Controls
- Implement `OrbitControls` in the React Three Fiber scene, anchored to the AUV.
- Enable full 360-degree rotation, pan, and zoom around the AUV.
- Ensure camera controls do not break existing post-processing or selection/interaction features.

### R4. Sonar Strike Highlighting
- When the animated sonar ping expands and reaches a 3D object on the port/starboard sides, visually highlight the object (e.g. increase material emissive intensity, color flash, or brightness pulse).

### Acceptance Criteria & Verification
1. Automated Playwright/Puppeteer script tests the running frontend and asserts that "UXO" or "MINE" does not exist anywhere in the DOM.
2. Independent code review confirms OrbitControls anchor and port/starboard math offsets.
3. Clean build: `npm run build` in `/Users/gauravkumarnayak/Desktop/new sih/frontend` passes with 0 TypeScript errors.

## Execution Sequence
1. **Explorer**: Conduct comprehensive audit of frontend files for UXO/MINE, examine `DebrisField.tsx`, `OceanScene.tsx`/R3F setup, `AUVModel.tsx`, camera controls, sonar ping animation & strike detection.
2. **Worker**: Implement changes across all identified files, build & test, write and execute Playwright test script.
3. **Reviewer**: Review code diffs against requirements, verify build & automated test results, gate check.
4. **Handoff**: Final synthesis & report to Sentinel.
