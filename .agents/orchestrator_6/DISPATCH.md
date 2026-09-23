## 2026-09-23T04:52:23Z

Redesign the UI dashboards (`OceanState.tsx`, `GovernmentIntel.tsx`, and any other dashboard panels) to make the simulation data look incredibly authentic, presentable, and highly relevant to the Indian Ministry of Earth Sciences (MoES) and the Maitri/Bharati Antarctic stations.

Requirements:
1. Authentic MoES / NCPOR Scientific Focus:
Refactor all metrics, charts, and text content to focus strictly on real-world Indian Southern Ocean research priorities: hydrodynamics, biogeochemistry, carbon sequestration, plankton/chlorophyll dynamics, and air-sea interactions. Explicitly reference "Bharati Station" and "Maitri Station" data links.
2. Strict Ban on "Virtual" or Fake Terminology:
The UI must look like a 100% authentic, real-world deployment dashboard used in a MoES video demo. Remove all instances of the words "Virtual", "Simulated", "Mock", or "Fake". All sensors must be presented as actual hardware (e.g., "CTD Profiler", "Acoustic Doppler Current Profiler", "RT-DETR Sonar Array").
3. Highly Scannable, Presentable UI Layout:
Completely redesign any cards containing long paragraphs of text (especially research findings, citations, or policy recommendations). Break down large text blocks into highly scannable, visually appealing components: use bullet points, data grids, sparkline charts, severity badges, and structured key-value pairs. Nobody should have to read a long paragraph. No single block of text exceeds 3 lines.
4. Peak UI Detailing:
Upgrade CSS/Tailwind detailing across all cards. Add subtle glowing borders, glassmorphism, precise padding, custom scrollbars, and high-quality iconography (using lucide-react) to make every panel look like a premium military/scientific intelligence system.

Acceptance Criteria:
- Absolutely zero occurrences of the words "Virtual", "Mock", or "Simulation" in the rendered UI across the dashboard components.
- Data metrics strictly align with Antarctic/Southern Ocean parameters (e.g. negative water temperatures, PSU salinity, dissolved oxygen, chlorophyll-a).
- No single block of text exceeds 3 lines. Long research findings are broken down into scannable lists or metric grids.
- `GovernmentIntel` and `OceanState` pages compile cleanly with zero TypeScript errors (`npm run build`).
- Take screenshots (using `take_screenshot.py` or Playwright) to verify that the UI components feature high-end detailing and operational government dashboard quality.

## 2026-09-22T23:24:00Z
URGENT REQUIREMENT UPDATE from the user (recorded in ORIGINAL_REQUEST.md under ## 2026-09-22T23:23:44Z):

In addition to the previous dashboard redesign requirements, the user explicitly requested a "Proposed System" component/section that justifies the words "autonomous" and "indigenous":
1. It must detail the combination of physical components (sensors, AUV structure, how they will be mounted).
2. It must also detail the Edge AI intelligence system, the steps for detection -> processing -> converting -> compressing -> sending useful data to the satellite.
3. Make this extremely detailed, professional, and visually impressive (no long paragraphs, use diagrams/structured lists/flowcards, scannable format).

## 2026-09-22T23:25:53Z
URGENT REQUIREMENT UPDATE 2 from the user (recorded in ORIGINAL_REQUEST.md under ## 2026-09-22T23:25:38Z):

Regarding the "Proposed System" and hardware components:
- Make sure ALL hardware components and sensors are interactive.
- When any component or sensor is clicked or hovered, it must display a detailed, visually stunning tooltip/card showing:
  1. Specific info and technical specifications (model, power, interface, resolution/accuracy).
  2. Where else this tech is typically used (industry context, e.g. commercial subsea surveying, defense, oil & gas).
  3. What makes our implementation/usage DIFFERENT or unique for this specific MoES autonomous mission (indigenous algorithms, polar water optimization, ultra-low power edge compression, acoustic-satellite bridge).


