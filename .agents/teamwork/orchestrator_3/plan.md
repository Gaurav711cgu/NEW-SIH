# Implementation Plan: Intelligence Dispatch System & Public Alert View (Mausam App)

## Overview
ConvectNow dashboard enhancement for MoES / SDMA administrators to route severe convective storm alerts to emergency response agencies (NDRF/SDRF) and the general public (Mausam App simulation).

## Architecture & Scope
1. **Admin Intelligence Panel (MoES / SDMA)**:
   - Storm cell selection / active cell context (`CELL-701`, `CELL-702`, `CELL-703`).
   - Impacted population calculation & building density / vulnerability risks across Census typologies.
   - Proximity & distance metrics to nearest NDRF/SDRF emergency rescue battalions/centers (16 official NDRF battalions + 3 SDRF hubs).
   - Dispatch Action: "Dispatch Alert" with custom broadcast radius (5–50 km) and emergency broadcast banner.
   - Glassmorphic / Blizzard theme compliance (`ocean-950`, `ice-500`, subtle borders, neon accents).

2. **Citizen Warning Interface (Mausam App POV)**:
   - High-fidelity simulated mobile/device alert screen reflecting the official IMD "Mausam" app experience (iPhone 16 Pro hardware chassis with Dynamic Island and status bar, plus Fullscreen mode).
   - Push notification preview banner + emergency Web Audio API chime.
   - Storm details: Estimated Time of Arrival (ETA) with live ticking countdown clock, intensity/hazard type.
   - NDMA-compliant SOPs in clear, scannable format (action icons, concise imperative points, no wall of text).
   - Nearest Safe Shelter / NDRF Rescue Center card with distance, route indicator, and emergency helplines (112, 1077, 1070, 108).
   - Bilingual support: instant English and Hindi localization.

3. **Visual Verification & Build Quality**:
   - Zero TypeScript / React build errors (`npm run build`).
   - Playwright headless screenshot verification capturing:
     * Admin Intelligence Panel with storm cell metrics & rescue centers.
     * Citizen Warning / Mausam App alert modal with NDMA SOPs and navigation info.
     * Active alert broadcast banner.
     * Fullscreen and Hindi localized views.

## Milestones
| # | Milestone | Scope | Dependencies | Status |
|---|-----------|-------|--------------|--------|
| M0 | Survey & Architecture Mapping | Inspect frontend structure, storm types, components, styling | None | DONE |
| M1 | Admin Intelligence Panel | Implement storm risk metrics, rescue battalion distances, dispatch button | M0 | DONE |
| M2 | Citizen Alert View (Mausam) | Implement push alert simulation, NDMA SOPs, rescue center navigation | M1 | DONE |
| M3 | Visual Verification & Review | Playwright screenshots & TypeScript build verification | M1, M2 | DONE |
