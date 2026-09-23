# Subagent Task: Scientific Telemetry & Scannability Audit

## Working Directory
`/Users/gauravkumarnayak/Desktop/new sih/.agents/audit_explorer_scientific_and_scannability`

## Instructions
1. Inspect `/Users/gauravkumarnayak/Desktop/new sih/frontend/src/pages/OceanState.tsx`:
   - Seawater telemetry parameters: verify negative water temperature (-1.8°C to -0.5°C, or around -1.45°C), YAxis domain configuration (does it allow negative values like [-2.5, 2.0] without clipping?), practical salinity (33.8 - 34.7 PSU), dissolved oxygen (> 280 µmol/kg or polar levels), hypoxia alerting logic (does it alert only on actual hypoxia < 160 µmol/kg?), and chlorophyll-a depth attenuation.
   - Anchors to Antarctic stations: verify Bharati Station (69.4125°S, 76.1880°E) and Maitri Station (70.7667°S, 11.7333°E) data links and Prydz Bay.
   - Hardware sensor names: Sea-Bird SBE 37 CTD Profiler, Teledyne RDI Sentinel V ADCP, Sea-Bird SBE 43, etc.
2. Inspect `/Users/gauravkumarnayak/Desktop/new sih/frontend/src/pages/GovernmentIntel.tsx` and `ResearchCitations.tsx`:
   - Scannability: verify that NO single block of text or paragraph exceeds 3 lines.
   - Check structured layouts: bullet points, data grids, sparklines, severity badges, key-value pairs.
   - Verify absence of banned terms ("Virtual", "Mock", "Fake", "Simulated") in rendered UI text.
3. Write your comprehensive findings to `handoff.md` and send a message back.

## 2026-09-23T05:37:08Z
Execute the following adversarial audit steps:
1. Deep-dive into `/Users/gauravkumarnayak/Desktop/new sih/frontend/src/pages/OceanState.tsx`:
   - Inspect all telemetry state variables, initial values, ranges, and update functions:
     - Negative water temperatures: check that temperatures are strictly in Antarctic polar range (-1.8°C to -0.5°C, or around -1.45°C), YAxis domain covers negative values (e.g. `[-2.5, 2.0]`), no clipping at zero.
     - Practical salinity (PSU): verify authentic Southern Ocean salinity (33.8 to 34.7 PSU).
     - Dissolved oxygen: verify values (> 280 µmol/kg or realistic polar saturation), check hypoxia threshold logic (does it alert only on true hypoxia < 160 µmol/kg rather than erroneously flagging high polar DO as hypoxia?).
     - Chlorophyll-a: verify realistic values and depth stratification (e.g. aphotic zone attenuation at depths > 200m).
   - Check explicit anchors to Bharati Station (69.4125°S, 76.1880°E) and Maitri Station (70.7667°S, 11.7333°E) data links and Prydz Bay.
   - Check real oceanographic hardware names: Sea-Bird SBE 37 CTD Profiler, Teledyne RDI Sentinel V ADCP, Sea-Bird SBE 43 DO2, etc.
2. Deep-dive into `/Users/gauravkumarnayak/Desktop/new sih/frontend/src/pages/GovernmentIntel.tsx` and `ResearchCitations.tsx`:
   - Inspect scannability: confirm that all policies, directives, citations, and research dossiers are broken down into scannable grids, bullet triads (e.g. `Mechanism`, `Hardware Efficiency`, `Verified Outcome`), key-value pairs, sparklines, and severity badges.
   - Check that no single block of text or paragraph exceeds 3 lines.
   - Check that no banned words ("Virtual", "Mock", "Fake", "Simulated") are present in user-facing text.
3. Record your detailed findings, source code line citations, and audit verdict in `handoff.md` in your working directory. Send a completion message via send_message to your parent.
