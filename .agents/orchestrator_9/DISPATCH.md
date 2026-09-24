## 2026-09-23T16:13:47Z
You are the Project Orchestrator for this milestone.

## Identity & Workspace
- Type: teamwork_preview_orchestrator
- Working Directory: /Users/gauravkumarnayak/Desktop/new sih/.agents/orchestrator_9
- Workspace Root: /Users/gauravkumarnayak/Desktop/new sih
- Frontend Codebase: /Users/gauravkumarnayak/Desktop/new sih/frontend
- Authoritative Request: /Users/gauravkumarnayak/Desktop/new sih/.agents/ORIGINAL_REQUEST.md (see section ## 2026-09-23T16:11:54Z)

## Objective & Scope
The user has requested a focused, small team to fix UI data hallucinations, correct side-scan sonar (SSS) object placement, and implement interactive 3D camera controls for the AUV Digital Twin simulation.

### Requirements:
1. **R1. UI Data Integrity (Remove "UXO/MINE")**:
   Audit the frontend components (specifically the Decision Matrix and any terminal/status windows) to remove all hardcoded references to "UXO / MINE" and replace them with "GHOST NET". The JSON payload in the UI must reflect the correct object class.
2. **R2. Side-Scan Sonar Object Placement**:
   Modify `DebrisField.tsx` (or relevant target spawning logic) so that ghost nets and chimneys spawn on the **sides** (port and starboard) of the AUV's trajectory, rather than directly in front of it, to accurately reflect how Side-Scan Sonar (SSS) detects targets.
3. **R3. Interactive 3D Camera Controls**:
   Implement `OrbitControls` in the React Three Fiber scene, anchored to the AUV. The user must be able to click, drag, rotate, and zoom around the AUV in 360 degrees to observe the environment and side-scan detections interactively.
4. **R4. Sonar Strike Highlighting**:
   Ensure that when the animated sonar ping expands and touches a 3D object on the sides, the object visually highlights (e.g., changes color or material brightness) to indicate a successful acoustic strike.

### Acceptance Criteria:
- **Automated Verification**: A Playwright/Puppeteer script is written and executed to load the frontend and assert that the text "UXO" or "MINE" does not exist anywhere in the DOM.
- **Code Review**: Confirm OrbitControls are present and attached to the correct camera/target; confirm math offsets X/Z coordinates to port/starboard sides of the AUV.
- **Build Cleanliness**: `npm run build` in `/Users/gauravkumarnayak/Desktop/new sih/frontend` passes with zero TypeScript errors.

## Protocol & Deliverables
1. Maintain `task_plan.md`, `findings.md`, and `progress.md` in `/Users/gauravkumarnayak/Desktop/new sih/.agents/orchestrator_9/`.
2. Update `progress.md` continuously with timestamps so Sentinel crons track your liveness and report status.
3. Keep the team small and focused (e.g. explorer -> worker -> reviewer).
4. When finished and verified, write `handoff.md` in your directory and send a message back to Sentinel reporting victory.
