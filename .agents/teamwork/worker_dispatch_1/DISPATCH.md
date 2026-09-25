## 2026-09-25T15:32:40Z
You are worker_dispatch_1.
Your working directory is: /Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/worker_dispatch_1

Read the authoritative user request at:
/Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/ORIGINAL_REQUEST.md
Pay special attention to the section under timestamp ## 2026-09-25T15:24:45Z.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A reviewer will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Context and Architecture:
Read the survey handoff reports prepared by the explorers:
- /Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/explorer_survey_1/handoff.md (Frontend architecture, routing, App.tsx)
- /Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/explorer_survey_2/handoff.md (Design system, Blizzard tokens, Tailwind classes, components)
- /Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/explorer_survey_3/handoff.md (Data models, population risk formulas, BMTPC structural vulnerability, 16 NDRF battalions registry, Mausam alert schema)
- /Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/orchestrator_3/PROJECT.md

Your exclusive file ownership:
1. /Users/gauravkumarnayak/Desktop/new sih/convectnow/frontend/src/types/dispatch.ts (create new)
2. /Users/gauravkumarnayak/Desktop/new sih/convectnow/frontend/src/components/AdminIntelligencePanel.tsx (create new)
3. /Users/gauravkumarnayak/Desktop/new sih/convectnow/frontend/src/components/CitizenWarningInterface.tsx (create new)
4. /Users/gauravkumarnayak/Desktop/new sih/convectnow/frontend/src/App.tsx (modify to wire components and state)

Implementation Requirements:
1. `src/types/dispatch.ts`:
   - Full TypeScript types: `NDRFBattalion`, `DemographicRisk`, `BuildingVulnerability`, `DispatchedAlert`, `NDMASopRule`.
   - Grounded registry of real NDRF battalions across India (8th BN Ghaziabad, 10th BN Vijayawada, 3rd BN Cuttack, 1st BN Guwahati, 4th BN Arakkonam, 15th BN Haldwani, etc.) with coordinates and personnel strength.
   - Helper functions: Haversine distance, road circuity factor (1.25–1.4), mobilization ETA calculation, impacted population corridor model ($A_{impact}$), and building damage vulnerability calculation.
   - Pre-populated realistic fallback alerts so the app works seamlessly even without backend running.

2. `src/components/AdminIntelligencePanel.tsx`:
   - Follow Blizzard/Glassmorphism design tokens (`card-blizzard`, `ocean-900`, `ice-500`, `health.critical`, etc.).
   - Storm cell selection with core telemetry (Reflectivity dBZ, Velocity km/h, Heading deg, Rain rate mm/h).
   - Demographic Risk metrics: Impacted Population in storm corridor, Critical Jeopardy population, and Urgent Evacuation count with settlement classification.
   - Building Structural Vulnerability: BMTPC/NDMA 4-tier cards: Type A (Kutcha / Slums ~85-95% failure risk), Type B (Semi-pucca ~55%), Type C (Pucca RCC ~15%), Type D (Lifeline infrastructure).
   - Real-world NDRF/SDRF Battalions Proximity Table: Sorted by proximity with road distance (km), mobilization ETA (min), QRT teams, and radio call button.
   - Broadcast radius selector (5km to 50km).
   - "Dispatch Alert & Broadcast to Mausam App" action button:
     * Generates alert payload, calls `onDispatchAlert`.
     * Shows confirmation banner: "ALERT BROADCAST ACTIVE — Pushed to SDMA Emergency Network & Mausam App".
     * Includes one-click action to switch to Citizen View ("Preview in Mausam App →").

3. `src/components/CitizenWarningInterface.tsx`:
   - Realistic smartphone chassis simulation (iPhone 16 Pro styling with rounded bezel, Dynamic Island, mobile status bar with Jio 5G, Wi-Fi, battery) + Fullscreen / Phone toggle.
   - Simulated incoming push notification banner from "IMD Mausam • MoES Government of India" with emergency audio/visual pulse, timestamp, and tap-to-expand.
   - Live Storm ETA Countdown: Large high-contrast countdown clock (e.g. 18m 42s remaining) with flashing RED WARNING severity badge.
   - Scannable NDMA Standard Operating Procedures (SOPs):
     * Clear, scannable visual cards with icons (NO dense text paragraphs):
       - 🏢 "Seek Pucca Shelter": Relocate immediately into a concrete structure. Avoid tin sheds and temporary roofs.
       - ⚡ "Unplug Electronics": Disconnect heavy appliances and stay off corded lines to prevent lightning surge damage.
       - 🌊 "Avoid Waterlogged Corridors": Stay clear of underpasses and low-lying flood drains.
       - 🌳 "Avoid Tall Trees & Poles": Never seek shelter under isolated trees, light poles, or towers.
   - Nearest Safe Shelter GPS Navigation Card:
     * Shelter name (e.g. "Padmapur Multipurpose Cyclone Shelter", distance: 1.2 km, walk ETA: 6 min).
     * Turn-by-turn route advice ("Head west on NH-16 bypass; avoid canal road underpass").
     * One-tap Emergency Dial buttons: 112 (National Emergency), 1077 (District Disaster Room), 1070 (State Relief Commissioner).
   - Interactive test bench controls next to the chassis to trigger test broadcasts, cycle storm cells, and toggle languages (English / Hindi).
   - Button to return to Tactical Command.

4. `src/App.tsx`:
   - Import and integrate `AdminIntelligencePanel` and `CitizenWarningInterface`.
   - Add `dispatchedAlert` state with a sensible default and setter.
   - In Tactical Command view right sidebar: add a segmented tab switcher between `[ ⚡ Physics Hazards | 🛡️ SDMA Disaster Intel ]` so administrators can toggle between raw convective physics and the new Admin Intelligence Panel.
   - In Public View (`viewMode === 'public'`), replace the existing placeholder card with `<CitizenWarningInterface alert={dispatchedAlert} onBackToAdmin={() => setViewMode('tactical')} onSimulateDispatch={...} />`.
   - Show a floating alert banner at the top of the dashboard when an alert is active, with a quick button "Preview Citizen View (Mausam App) →".

5. Build & Verification:
   - Run `npm run build` in `/Users/gauravkumarnayak/Desktop/new sih/convectnow/frontend` and confirm 0 TypeScript / compilation errors.
   - Write your handoff report to `/Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/worker_dispatch_1/handoff.md` and send a message to parent when completed.
