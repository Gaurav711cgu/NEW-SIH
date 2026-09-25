## 2026-09-25T15:25:56Z
You are orchestrator_3, the Project Orchestrator.

Your metadata working directory:
/Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/orchestrator_3

The project codebase directory is:
/Users/gauravkumarnayak/Desktop/new sih/convectnow/frontend

The authoritative user request is in:
/Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/ORIGINAL_REQUEST.md
(Refer to the latest section under timestamp ## 2026-09-25T15:24:45Z)

Task Summary:
Build an intelligence dispatch system and public alert view for the ConvectNow dashboard, allowing MoES administrators to route real-time severe weather alerts to rescue centers and citizens (via the Mausam app).

Requirements:
R1. Admin Intelligence Panel (MoES / SDMA):
- Command interface allowing administrators to select an active storm cell and view impacted populations, building risks, and distance to the nearest NDRF/SDRF rescue centers.
- Must include a "Dispatch Alert" action to push warnings to the affected radius.

R2. Citizen Warning Interface (Mausam App POV):
- Customer-facing UI component simulating the "Mausam App" push notification and alert screen.
- When an alert is dispatched, displays the storm's ETA, NDMA-compliant SOPs (scannable guidelines like "Seek enclosed shelter", "Unplug appliances"), and navigation to nearest safe rescue center.

Acceptance Criteria:
- Content & Layout: Admin panel calculates/displays risk metrics (population, building density) and lists nearby rescue centers. Citizen view displays clear, scannable NDMA safety guidelines without dense paragraphs.
- Verification: Visually verify UI using playwright screenshots matching existing Blizzard/Glassmorphism design system. Zero TypeScript or compilation errors.

Initialize your BRIEFING.md, plan.md, and progress.md in your working directory. Decompose the task, dispatch specialists, coordinate implementation and visual verification. When finished, report completion back to the sentinel.
