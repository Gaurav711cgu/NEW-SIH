# DISPATCH: MoES / NCPOR Antarctic Dashboard & Proposed System Overhaul

## Mission
Resume and complete the comprehensive UI overhaul of the AQUILA OS frontend dashboards (`OceanState.tsx`, `GovernmentIntel.tsx`, and `ResearchCitations.tsx`), ensuring absolute authenticity for MoES and Bharati/Maitri Antarctic stations, and presenting all data in highly scannable, premium military/scientific UI layouts.

## Authority & Inputs
- **Authoritative Request**: `/Users/gauravkumarnayak/Desktop/new sih/.agents/ORIGINAL_REQUEST.md`
- **Project Directory**: `/Users/gauravkumarnayak/Desktop/new sih`
- **Frontend Directory**: `/Users/gauravkumarnayak/Desktop/new sih/frontend`
- **Orchestrator Workspace**: `/Users/gauravkumarnayak/Desktop/new sih/.agents/orchestrator_7`

## Strict Requirements
1. **R1. Dashboard Audits (OceanState & GovernmentIntel)**:
   - Verify telemetry parameters and MoES/NCPOR policies fit Indian Southern Ocean research priorities.
   - Telemetry must reflect authentic Antarctic metrics: negative water temperatures (-1.8°C to -0.5°C), PSU salinity (33.8 - 34.7 PSU), dissolved oxygen, chlorophyll-a, Bharati & Maitri station links.
2. **R2. Strict Terminology Ban**:
   - Zero occurrences of "Virtual", "Mock", "Fake", or "Simulated" across all rendered UI components in `src/`.
   - Replace with authentic hardware terminology (e.g., CTD Profiler, Acoustic Doppler Current Profiler, SBE 37 MicroCAT, etc.).
3. **R3. Eradicate Long Paragraphs (Scannability)**:
   - Target `ResearchCitations.tsx`, `GovernmentIntel.tsx`, and `OceanState.tsx`.
   - No single text block > 3 lines.
   - Convert long text into scannable lists, metric grids, sparkline charts, severity badges, and key-value specs.
4. **R4. Peak UI Detailing & Interactive Proposed System**:
   - Interactive physical architecture and 5-stage Edge AI pipeline (Detection -> Processing -> Conversion -> Compression -> Satellite Telemetry).
   - Dynamic hover/click states with:
     a. Technical specifications
     b. Industry context / where else used
     c. Unique MoES differentiation / innovation
   - Glassmorphism, glowing borders, precise padding, and `lucide-react` iconography.
5. **Quality Gates**:
   - Zero TypeScript compile errors (`npm run build` or `npx tsc --noEmit`).
   - Automated scan verifying 0 banned words in `frontend/src`.
   - Visual verification (screenshot tool/script) confirming layout aesthetics and interactive components.

## Coordination & File-Based Planning
- Maintain `task_plan.md`, `findings.md`, and `progress.md` in `.agents/orchestrator_7/`.
- Update `progress.md` frequently with clear checkboxes and timestamps.
- When all criteria are met, report completion back with full verification evidence.
