# Operational Execution Plan — ConvectNow Scientific Validation & SIH Presentation Artifacts

## Objective
Scientifically validate ConvectNow (MoES Convective Nowcaster for SIH PS 26084) by mapping inputs to real Indian government data sources (IMD DWR, MOSDAC INSAT-3DR, IITM LLN, NCMRWF NWP), compiling rigorous meteorological equations and verifiable bibliographies, conducting a PS 26084 compliance audit, and packaging the outputs into a presentation-ready markdown artifact for SIH judges.

## Milestones & Phasing

### Phase 1: Deep Survey & Codebase/Spec Exploration
- **Target**: Map exact code implementations in `convectnow/backend` (`ingester_imd.py`, `ingester_mosdac.py`, `convectnet.py`, `physics_explainer.py`, `quality_control.py`, etc.) to meteorological algorithms and government APIs.
- **Agent Dispatch**: Spawn 3 Explorers:
  1. `explorer_data_pipeline`: Inspect real Indian Gov portals/APIs (MOSDAC open data portal, IMD DWR Radar NetCDF/GeoServer specs, IITM Lightning Location Network, NCMRWF Unified Model) and how ConvectNow's ingestion pipeline handles them.
  2. `explorer_physics_papers`: Investigate meteorological algorithms implemented in the code (Witt et al. 1998 MESH/POSH, Marshall-Palmer / Indian monsoon Z-R, Farnebäck optical flow, severe storm thermodynamics, cloudburst dynamic thresholding) and collect precise mathematical formulas and formal citations.
  3. `explorer_ps_audit`: Audit SIH Problem Statement 26084 requirements (lead times 0-3h/0-6h, 1 km resolution, convective hazards: hail, downburst, cloudburst, lightning, operational MoES deployment) against ConvectNow features.

### Phase 2: Authoring Presentation Artifacts (R1, R2, R3)
- **Target**: Author structured, authoritative markdown chapters.
- **Workers**:
  - `worker_r1_pipeline`: Author the 2D Data Flow Architecture in Mermaid.js with zero "virtual/synthetic/mock" references, detailing IMD DWR NetCDF, MOSDAC HDF5/API, IITM LLN, NCMRWF NWP, automated QC, reprojection, and tensor batching.
  - `worker_r2_bibliography`: Author the Scientific Bibliography & Physics Reference Documentation with explicit LaTeX equations, parameter definitions, and at least 4 real verifiable peer-reviewed citations mapped to the codebase.
  - `worker_r3_audit`: Author the PS 26084 Alignment Audit Matrix mapping every PS requirement to ConvectNow capabilities.

### Phase 3: Synthesis & Slide-Ready Packaging
- Synthesize all components into a presentation-ready master document (`CONVECTNOW_SCIENTIFIC_VALIDATION_SLIDES.md`) structured specifically for copy-pasting into SIH PowerPoint decks (Executive Summary, 2D Mermaid Architecture, Mathematical Formulation, Citation Cards, PS 26084 Compliance Matrix).

### Phase 4: Independent Review & Verification Gate
- Spawn 2 Reviewers to independently audit:
  - Zero "mock/fake/synthetic" phrasing in diagrams or data specs.
  - Exact correctness of meteorological equations and verifiable citations.
  - Indian government API accuracy (MOSDAC, IMD, NCMRWF, IITM).
  - SIH PS 26084 comprehensive requirement coverage.
- Final gate verification and victory report to Sentinel.
