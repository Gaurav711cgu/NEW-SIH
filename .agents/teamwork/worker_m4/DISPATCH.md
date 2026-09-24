# Worker M4 Dispatch: Interactive 4D Storm Anatomy Scrollytelling Experience

You are the Implementation Worker for Milestone 4.
Your working directory is:
/Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/worker_m4

Your exclusive write ownership:
- `convectnow/frontend/src/components/scrollytelling/StormAnatomyScrolly.tsx`
- `convectnow/frontend/src/components/scrollytelling/VerticalRadarCrossSection.tsx`
- `convectnow/frontend/src/components/scrollytelling/AITelemetryHUD.tsx`
- `convectnow/frontend/src/components/scrollytelling/FeatureAttributionPanel.tsx`
- `convectnow/frontend/src/components/scrollytelling/PhaseNavigationPill.tsx`
- `convectnow/frontend/src/App.tsx`
- `convectnow/frontend/src/components/HazardMeters.tsx`

DO NOT modify files outside your ownership.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Read:
1. /Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/ORIGINAL_REQUEST.md
2. /Users/gauravkumarnayak/Desktop/new sih/DESIGN.md ("Ice and Ships" design tokens: ocean-950 to ocean-600, ice-500 #00e5ff, steel-800, JetBrains Mono for telemetry, glassmorphism)
3. /Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/PROJECT.md
4. /Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/explorer_survey_ui/handoff.md

Tasks to execute:
1. Implement `convectnow/frontend/src/components/scrollytelling/VerticalRadarCrossSection.tsx`:
   - 60 FPS HTML5 Canvas cross-section engine displaying Range Height Indicator (Z vs Height 0–18 km AGL).
   - Horizontal range from -15 km to +15 km.
   - Distinct illuminated reference lines for:
     * 0°C Freezing Isotherm at 4.5 km AGL (`#00e5ff` cyan dashed line)
     * -20°C Mixed-Phase / Hail Growth Level at 7.5 km AGL (`#4dd0e1` ice-400 dashed line)
     * Tropopause / Equilibrium Level at 15.0 km AGL
   - Standard DWR reflectivity colormap (<15 dBZ transparent, 15-25 blue, 25-35 green, 35-45 yellow, 45-55 orange, 55-65 severe red, 65+ purple/magenta extreme core).
   - Animated updraft and downdraft velocity streamlines, convective turbulence, hydrometeor precipitation particles (rain streaks, suspended hail, falling hail), and ground splash during collapse.
   - Smooth continuous interpolation between the 5 storm phases.

2. Implement `convectnow/frontend/src/components/scrollytelling/AITelemetryHUD.tsx`:
   - Fixed top telemetry HUD styled in `font-mono` (`JetBrains Mono`) with `glass-card-elevated`.
   - Displays real-time interpolated physical parameters: Z_max (dBZ), Core Height (km), Vertical Velocity w (m/s), VIL (kg/m²), VIL Density (g/m³), POSH (%), MESH (mm), Rain Rate (mm/h), Cloud-Top Temp (°C), Lightning Flash Rate (fl/min).
   - Live provenance badges adhering to `DataProvenanceBadge`.

3. Implement `convectnow/frontend/src/components/scrollytelling/FeatureAttributionPanel.tsx`:
   - Visualizes ConvectNet top physical drivers:
     1. VIL Density Exceedance Aloft
     2. Z_max Core Height relative to -20°C isotherm
     3. INSAT-3DR Rapid Cloud-Top Cooling Rate
     4. Boundary-Layer CAPE / CIN Flux
   - Proportional animated attribution bars and physical explanation text.

4. Implement `convectnow/frontend/src/components/scrollytelling/PhaseNavigationPill.tsx`:
   - Vertical timeline pill allowing 1-click jumping between the 5 phases with tooltips.

5. Implement `convectnow/frontend/src/components/scrollytelling/StormAnatomyScrolly.tsx`:
   - Master split-track scrollytelling container:
     - Left/center sticky stage (60% width) holding canvas cross-section, HUD, and attribution.
     - Right narrative rail (40% width) with 5 narrative chapters:
       (1) Convective Initiation
       (2) Rapid Explosive Updraft
       (3) Hail Core Suspended Aloft
       (4) Downdraft Collapse & Extreme Cloudburst
       (5) Ground Impact & Flash Flood
     - Smooth passive scroll progress tracking with `requestAnimationFrame`.
     - Controls: Play/Pause simulation autoplay, reset, close/back to tactical GIS view.

6. Integrate into `convectnow/frontend/src/App.tsx` and `HazardMeters.tsx`:
   - Support `'anatomy'` in `viewMode` state.
   - Header navigation button "4D Storm Anatomy" with icon.
   - Shortcut CTA in `HazardMeters.tsx` ("Launch 4D Storm Anatomy").

7. Verify Build:
   - In `/Users/gauravkumarnayak/Desktop/new sih/convectnow/frontend`, run `npm run build`.
   - Ensure exit code 0 and ZERO TypeScript/PostCSS errors.
   - Document verification in `/Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/worker_m4/handoff.md`.


When done, write handoff.md and send a message to orchestrator.

## 2026-09-24T13:14:18Z
You are the Implementation Worker for Milestone 4: Interactive 4D Storm Anatomy Scrollytelling Experience.
Your working directory is /Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/worker_m4.
Read your instructions at /Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/worker_m4/DISPATCH.md and PROJECT.md at /Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/PROJECT.md.
Also read the detailed component blueprints in /Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/explorer_survey_ui/handoff.md and DESIGN.md at /Users/gauravkumarnayak/Desktop/new sih/DESIGN.md.

Implement:
1. convectnow/frontend/src/components/scrollytelling/VerticalRadarCrossSection.tsx
2. convectnow/frontend/src/components/scrollytelling/AITelemetryHUD.tsx
3. convectnow/frontend/src/components/scrollytelling/FeatureAttributionPanel.tsx
4. convectnow/frontend/src/components/scrollytelling/PhaseNavigationPill.tsx
5. convectnow/frontend/src/components/scrollytelling/StormAnatomyScrolly.tsx
6. Update convectnow/frontend/src/App.tsx (add 'anatomy' viewMode toggle & header nav)
7. Update convectnow/frontend/src/components/HazardMeters.tsx (add "Launch 4D Storm Anatomy" CTA button)

Verify your implementation with:
cd /Users/gauravkumarnayak/Desktop/new sih/convectnow/frontend && npm run build
Ensure exit code 0 and ZERO TypeScript errors.
