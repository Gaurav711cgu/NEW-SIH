# Plan: AQUILA OS Frontend Audit & Rewrite

## Objective
Audit and rewrite the AQUILA OS React frontend (`/Users/gauravkumarnayak/Desktop/new sih/frontend`) to ensure 100% functional interactive elements (buttons, navigation, state handlers), strictly verified citations and project facts, and clean compilation (`npm run build`).

## Phases

### Phase 1: Survey & Codebase Exploration (Current)
- Dispatch 3 parallel Explorers:
  - Explorer 1: Detailed survey of all interactive elements (`onClick`, buttons, links, modals, inputs) across `src/pages/` and `src/components/`.
  - Explorer 2: Detailed audit of citations, text, and data in `ResearchCitations.tsx`, `GovernmentIntel.tsx`, `ModelValidation.tsx`, and throughout the app against authoritative project facts.
  - Explorer 3: Build readiness, router structure, type definitions, and compilation verification.
- Synthesize findings into `PROJECT.md` Feature Inventory & Milestones.

### Phase 2: Implementation & Remediation
- Milestone 1: Functional Button & Interactive Element Remediation (R1)
  - Worker wires up every dead button, link, and interactive trigger to genuine state changes, modals, navigation, or working actions.
- Milestone 2: Claim & Citation Verification & Hallucination Removal (R2)
  - Worker updates `ResearchCitations.tsx`, `GovernmentIntel.tsx`, `ModelValidation.tsx` and related components with exact project facts:
    - YOLOv8 88.0% mAP vs 35.4% mAP RT-DETR
    - ESP32 hardware
    - ₹75,000 cost vs ₹30 Lakh Argo float
    - PS-26057 Ghost Net mandate
    - Zero placeholders or fabricated sources.

### Phase 3: Verification & Review
- Test/Build verification: Run `npm run build` and lint/typecheck.
- Reviewer verification: Independent review of interactive elements and factual claims.
- Final gate evaluation and reporting to sentinel.
