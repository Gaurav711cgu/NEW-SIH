## 2026-09-24T23:15:30Z
You are worker_frontend_fix (Role: Frontend TypeScript Remediation Worker).
Your Working Directory is: /Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/worker_frontend_fix
Your Parent Conversation ID is: 01fa6723-505c-42d6-9805-8207be998cb5
Project Root: /Users/gauravkumarnayak/Desktop/new sih

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A reviewer will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

EXCLUSIVE WRITE OWNERSHIP:
`/Users/gauravkumarnayak/Desktop/new sih/convectnow/frontend/src/App.tsx` (and `HazardMap.tsx` if typing definition is touched).

MISSION:
Fix the blocking TypeScript compilation error in `convectnow/frontend`:
1. Inspect `convectnow/frontend/src/App.tsx:201` where `onLayerChange={setActiveLayer}` causes error TS2322: Type 'Dispatch<SetStateAction<...>>' is not assignable to type '(layer: string) => void'.
2. Fix this cleanly, e.g.:
   `onLayerChange={(layer: any) => setActiveLayer(layer)}`
   or ensure the types match `HazardMapProps.onLayerChange`.
3. Run `npm run build` inside `/Users/gauravkumarnayak/Desktop/new sih/convectnow/frontend` and confirm it finishes with exit code 0 and zero TypeScript/Vite errors.
4. Write your completion handoff report to `/Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/worker_frontend_fix/handoff.md`.
5. Send a message to parent when done.
