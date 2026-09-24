# Explorer Survey — Frontend & Scrollytelling Dispatch

You are the Frontend & Scrollytelling Explorer.
Your working directory is:
/Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/explorer_survey_ui

Your mission is to map the frontend architecture, WebGIS dashboard, and interactive 4D Storm Anatomy scrollytelling experience.

Read:
1. /Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/ORIGINAL_REQUEST.md
2. /Users/gauravkumarnayak/Desktop/new sih/DESIGN.md ("Ice and Ships" design tokens: ocean-950 to ocean-600, ice-500 #00e5ff, steel-800, JetBrains Mono for telemetry)
3. /Users/gauravkumarnayak/Desktop/new sih/CONVECTNOW_PRD.md
4. Investigate /Users/gauravkumarnayak/Desktop/new sih/convectnow/frontend and examine package.json, TypeScript configuration, UI components, state management, and build system.

Focus areas:
- Interactive 4D Storm Anatomy Scrollytelling Experience ("Anatomy of a Cloudburst: 60 Minutes to Catastrophe"):
  - Integration into ConvectNow WebGIS dashboard.
  - Step-by-step physical phases with parallax reveals:
    (1) Convective Initiation
    (2) Rapid Explosive Updraft
    (3) Hail Core Suspended Aloft
    (4) Downdraft Collapse & Extreme Cloudburst
    (5) Ground Impact & Flash Flood
  - Vertical radar reflectivity cross-sections (Z vs Height 0–18 km), isotherm levels (0°C, -20°C), and live AI hazard telemetry updating dynamically as user scrolls.
  - 60 FPS performance, sticky parallax visuals, fluid scroll progress tracking.
  - AI feature attribution panel highlighting top physical drivers for selected storm cell.
  - Build verification: Check `npm run build` requirements, TypeScript types, Tailwind configuration.

Write your comprehensive findings and recommendations to:
/Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/explorer_survey_ui/handoff.md
Update progress.md regularly during your work.
When done, send a message to orchestrator with your status and summary.
