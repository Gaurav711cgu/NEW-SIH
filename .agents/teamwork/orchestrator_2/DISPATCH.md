## 2026-09-24T22:47:50Z

Conduct deep scientific research and generate presentation-ready artifacts (architecture diagrams, bibliographies) for SIH PS 26084 (MoES Convective Nowcaster). The output must scientifically validate the MVP by perfectly mapping its inputs to real Indian government data sources (IMD DWR, INSAT-3D) and citing credible meteorological papers, proving the system is fully capable of handling live, real-world data.

Integrity mode: benchmark

Requirements:
R1. Real-World Data Pipeline Architecture:
Design a highly detailed 2D Data Flow Architecture (using Mermaid.js) that maps exactly how the MVP ingests, processes, and outputs data. It must explicitly state the real-world sources (e.g., IMD Doppler Weather Radar NetCDF files, INSAT-3DR Imager/Sounder data via MOSDAC API, IITM Lightning Location Network). No "virtual" or "simulated" terminology is allowed; frame the MVP as a production-ready staging environment waiting for live MoES streams.

R2. Scientific Bibliography & Reference Documentation:
Compile a heavily researched documentation artifact detailing the exact physics and equations used in the MVP. This must include credible, real-world research papers (e.g., Z-R relationships for rainfall, Hail detection algorithms, optical flow for nowcasting). This document will be directly copy-pasted into the team's SIH presentation slides to establish absolute credibility with the judges.

R3. PS 26084 Alignment Audit:
Review the exact wording of Smart India Hackathon Problem Statement 26084 (NCMRWF / MoES). Generate a mapping matrix showing how every single requirement of the PS (lead times, resolution, convective hazard types) is satisfied by the current MVP architecture.

Acceptance Criteria:
- The architecture diagram contains zero references to "mock", "fake", or "synthetic" data.
- At least 4 real, verifiable meteorological research papers are cited with their specific application to the MVP's codebase (e.g., citing the specific algorithm used for cloudburst prediction).
- The data sources explicitly name actual Indian government portals/APIs (IMD, MOSDAC, NCMRWF).
- The output is formatted cleanly in a markdown artifact that the user can immediately use for their PowerPoint presentation.
