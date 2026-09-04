# Assignment: WCAG AA Accessibility & Codebase Polish Remediation

## Objective
Implement the high-priority accessibility fixes and polish recommendations identified in the audit reports to bring AQUILA OS to 100% WCAG 2.2 Level AA compliance and clean build hygiene.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Detailed Tasks
1. **Critical Upload Dropzone Accessibility (`frontend/src/pages/SeafloorIntelligence.tsx`)**:
   - Make the upload dropzone container keyboard-focusable (`tabIndex={0}`), add `role="button"`, `aria-label="Upload side-scan sonar waterfall image for neural analysis"`, and `onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click(); } }}`.
   - Change `<input ref={inputRef} type="file" className="hidden" ... />` from `hidden` (`display: none`) to `className="sr-only"` so it remains accessible to screen readers and assistive tech.
   - Add `role="img"` and `aria-label="Sonar waterfall scan canvas displaying acoustic backscatter and neural bounding boxes"` to the waterfall canvas element (line ~728).

2. **Skip Link & Main Navigation Semantics (`frontend/src/App.tsx` & `frontend/src/components/layout/Sidebar.tsx`)**:
   - In `App.tsx`: Add a high-visibility skip link at the top of the application container:
     `<a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-cyan-600 focus:text-white focus:rounded focus:outline-none focus:ring-2 focus:ring-cyan-300">Skip to main content</a>`
   - In `App.tsx`: Add `id="main-content"` and `tabIndex={-1}` to `<main>`.
   - In `Sidebar.tsx`: Add `aria-label="Main Navigation"` to `<nav>`.
   - In `Sidebar.tsx`: Change the logo `<h1 className="...">AQUILA</h1>` to a semantic `<span className="text-xl font-bold tracking-wider text-slate-100">AQUILA</span>` to prevent duplicate `<h1>` across pages.

3. **Motion Safety & Prefers-Reduced-Motion (`frontend/src/index.css`)**:
   - Add a `@media (prefers-reduced-motion: reduce)` block disabling animations on `.crt-flicker`, `.glitch-text`, and any intense pulsating keyframes for photosensitive and vestibular motion disorder accessibility.

4. **Color Contrast Enhancement (`frontend/tailwind.config.js` or theme)**:
   - Inspect `tailwind.config.js`. Update `steel.500` from `#71717a` (3.6:1 contrast) to `#9ca3af` or `#a1a1aa` (at least 5.5:1 contrast against `#09090b` and `#18181b`) to satisfy WCAG AA 4.5:1 text contrast minimum across all pages.
   - Ensure axis lines and labels in `DepthProfileChart.tsx` and `TSDiagram.tsx` have sufficient contrast (>3:1).

5. **Dynamic Charts and Canvas Accessibility Attributes**:
   - In `frontend/src/components/ui/SonarCanvas.tsx`: Add `role="img"` and `aria-label="Side-scan sonar acoustic waterfall visualization canvas"`.
   - In `frontend/src/components/charts/DepthProfileChart.tsx` and `TSDiagram.tsx`: Add `role="img"` and `aria-label` describing the hydrographic depth profile.

6. **Linter & Codebase Polish Cleanup**:
   - In `frontend/src/components/layout/SystemStatusRow.tsx`: Move the inner `StatusIndicator` function component outside of `SystemStatusRow` to avoid re-creating components inside render. Fix unused `err` variables by prefixing `_err` or omitting parameter.
   - In `frontend/src/components/layout/MissionContext.tsx` and `pages/Biogeochemistry.tsx`: Fix unused catch parameter `err` -> `_err`.
   - Delete orphaned file `frontend/src/components/layout/AppShell.tsx` if unreferenced.

7. **Verification**:
   - Run `npm run lint` in `frontend/` and confirm 0 errors and 0 warnings.
   - Run `npm run build` in `frontend/` and verify clean exit code 0.

## Output Requirements
Write your completion report to `/Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork_preview_worker_m1_1/handoff.md`. Include all build and lint command outputs.

## 2026-09-04T06:07:16Z
You are teamwork_preview_worker_m1_1.
Your working directory is: /Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork_preview_worker_m1_1

MANDATORY FIRST STEP: Read the authoritative user request at:
/Users/gauravkumarnayak/Desktop/new sih/.agents/ORIGINAL_REQUEST.md
(Refer to section ## 2026-09-04T05:57:43Z)
Also read your assignment in:
/Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork_preview_worker_m1_1/DISPATCH.md
Also review the explorer audit reports:
- /Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork_preview_explorer_m1_1/report.md
- /Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork_preview_explorer_m3_1/report.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your mission:
Implement the high-priority accessibility fixes and polish cleanup documented in DISPATCH.md:
1. Keyboard accessibility and screen reader support for the upload dropzone in `frontend/src/pages/SeafloorIntelligence.tsx` (tabIndex=0, role="button", onKeyDown for Enter/Space, aria-label, change file input to sr-only).
2. Skip-to-content link in `frontend/src/App.tsx` and main landmark id="main-content" tabIndex={-1}.
3. Sidebar navigation accessibility in `frontend/src/components/layout/Sidebar.tsx` (aria-label="Main Navigation", logo h1 -> span).
4. Prefers-reduced-motion media query in `frontend/src/index.css` for CRT flicker and animations.
5. Contrast ratio enhancement in `frontend/tailwind.config.js` (`steel.500` -> `#a1a1aa` or `#9ca3af` so contrast exceeds 4.5:1 on dark backgrounds).
6. Chart accessibility (role="img", aria-label) on Recharts and canvas components.
7. Linter warnings cleanup (StatusIndicator moved outside render, unused catch vars, delete orphaned AppShell.tsx).
8. Verify everything with `npm run lint` and `npm run build` in `frontend/`.

Write your completion report to `/Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork_preview_worker_m1_1/handoff.md`.
When finished, send a message to orchestrator parent stating that your implementation is complete and verified.

