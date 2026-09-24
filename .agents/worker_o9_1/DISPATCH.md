## 2026-09-23T16:23:18Z

You are teamwork_preview_worker executing Milestone 9 implementation and verification.
Your working directory is: /Users/gauravkumarnayak/Desktop/new sih/.agents/worker_o9_1
Your parent is orchestrator_9 (Conversation ID: 625ce918-580c-4772-a4fe-446033d18f64).

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

MANDATORY FIRST STEPS:
1. Read /Users/gauravkumarnayak/Desktop/new sih/.agents/ORIGINAL_REQUEST.md (specifically section ## 2026-09-23T16:11:54Z).
2. Read the Explorer's deep analysis and implementation roadmap:
   /Users/gauravkumarnayak/Desktop/new sih/.agents/explorer_o9_1/analysis.md
   /Users/gauravkumarnayak/Desktop/new sih/.agents/explorer_o9_1/handoff.md
3. Read /Users/gauravkumarnayak/Desktop/new sih/.agents/orchestrator_9/task_plan.md.

YOUR IMPLEMENTATION TASKS (in /Users/gauravkumarnayak/Desktop/new sih/frontend):

1. R1. UI Data Integrity (Remove "UXO/MINE"):
   Apply all cataloged replacements from analysis.md §1.1 across:
   - src/simulation/mission/MissionDirector.tsx
   - src/types/detection.ts
   - src/components/SonarProfiler.tsx
   - src/pages/SeafloorIntelligence.tsx
   - src/pages/GovernmentIntel.tsx
   - src/pages/ResearchCitations.tsx
   - src/pages/ProposedSystem.tsx
   - src/pages/AUVTwin.tsx
   - src/simulation/environment/SonarSweep.tsx
   Ensure the Decision Matrix JSON payload in the UI reflects "object_class": "ghost_net" and alert reads "ANOMALY DETECTED: GHOST NET".
   Check for any remaining occurrences of "UXO" or "MINE" across src/ to ensure complete eradication.

2. R2. Side-Scan Sonar Object Placement (DebrisField.tsx):
   Modify the target spawning logic in src/simulation/environment/DebrisField.tsx:
   - Ensure ghost nets and hydrothermal chimneys spawn strictly on the port (left, -Z) and starboard (right, +Z) sides of the AUV trajectory ($Z = 0$).
   - Enforce the nadir gap exclusion corridor: no targets where |Z| < 14m.
   - Use the mathematical formulas from analysis.md:
     Ghost nets: Z in [-46, -14] and [14, 46], X in [-45, 45].
     Chimneys: Z in [-60, -18] and [18, 60], X in [-60, 60].
     Y coordinates aligned to seabed elevation + height offset.

3. R3. Interactive 3D Camera Controls (CameraManager.tsx):
   Refactor src/simulation/cameras/CameraManager.tsx:
   - Import OrbitControls from '@react-three/drei'.
   - Add <OrbitControls ref={controlsRef} makeDefault /> into the camera rig.
   - Anchor the controls to the moving AUV: in useFrame, compute deltaAuv = currentAuvPos - prevAuvPos and shift both controlsRef.current.target and camera.position by deltaAuv.
   - When mode === 'TPP' or 'FREE', do not rigidly overwrite camera position every frame; let OrbitControls handle user 360-degree rotation, pitch, and zoom (minDistance ~2.5m, maxDistance ~60m).
   - Ensure mesh clicks in AUVModel.tsx (which use e.stopPropagation()) continue to toggle diagnostic cards without interference.

4. R4. Sonar Strike Highlighting (DebrisField.tsx):
   Synchronize acoustic wavefront arrival in DebrisField.tsx with SonarBeam.tsx's expanding ping pulse:
   - Calculate pingRadius = ((time % 1.5) / 1.5) * 50.0.
   - For each target instance, calculate slant range from AUV to target.
   - When |slantRange - pingRadius| < 2.5m, record an acoustic strike timestamp.
   - Flash the object's instance color via InstancedMesh.setColorAt with a bright specular acoustic return (e.g. bright cyan/amber) that decays over ~0.7 seconds.
   - Ensure instanceColor.needsUpdate = true is set.

5. VERIFICATION & TEST SCRIPT EXECUTION:
   - Run `npm run build` in `/Users/gauravkumarnayak/Desktop/new sih/frontend` and ensure exit code 0 with 0 TypeScript errors.
   - Write a standalone Playwright verification script (e.g. `verify_uxo_removal.py` in frontend or root).
   - Start the Vite dev server (or preview server) and run the Playwright script to verify:
     1) Across routes (/simulation, /ocean-state, /intel, /system-architecture, /biogeo, /seafloor, /research, /auv-twin), no DOM element contains "UXO" or "MINE".
     2) On /simulation, the Decision Matrix terminal and Alert Feed show GHOST NET and "object_class": "ghost_net".
   - Document the exact commands run, the console outputs, and the test results.

DELIVERABLES:
Write a comprehensive report to `/Users/gauravkumarnayak/Desktop/new sih/.agents/worker_o9_1/handoff.md` following the 5-component handoff structure:
1. Observation (what was changed, exact files modified, test logs)
2. Logic Chain (rationale and mathematical alignment)
3. Caveats (any edge cases or notes)
4. Conclusion (summary of results)
5. Verification Method (exact commands to replicate build and test passes)

When finished, send a message to orchestrator_9.
