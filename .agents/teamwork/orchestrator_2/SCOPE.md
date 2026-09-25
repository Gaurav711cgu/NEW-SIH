# Scope: ConvectNow Scientific Validation & SIH PS 26084 Presentation Suite

## Architecture
This scope focuses on the scientific credibility, mathematical rigor, real-world Indian operational data alignment, and hackathon presentation delivery for ConvectNow.

```
Operational Indian MoES Infrastructure
├── IMD Doppler Weather Radar Network (DWR NetCDF / GeoServer WCS/WMS)
├── ISRO/MOSDAC INSAT-3DR Multispectral Imagery & Sounder Products (HDF5 API)
├── IITM Lightning Location Network (LLN Strike Vector Feeds)
└── NCMRWF Unified Model (NCUM) NWP Analysis & Background Fields
      │
      ▼
ConvectNow High-Throughput Staging & QC Engine
├── Dual Ingestion Workers (Async HTTP/FTP/S3 polling)
├── Quality Control: Texture of dBZ (TDBZ) Clutter Rejection, AP Gating, Optical Flow Imputation
└── 1 km EPSG:4326 Uniform Grid Reprojection Engine
      │
      ▼
Unified Multi-Task ConvectNet & Physics Attribution
├── 3D-CNN / Spatiotemporal ConvLSTM (Radar Z + Delta Z + IR Tb + Lightning)
├── Multi-Hazard Heads: Hail (SHI/POSH/MESH), Cloudburst (>100 mm/h), Downburst (V_db), CI (0-1)
└── Physics Explainer (VIL Density, Z_max Core, Updraft Dynamics, Freezing Level)
      │
      ▼
SIH Presentation & Operational Decisional Artifacts
├── Presentation-Ready Mermaid.js 2D Data Flow Architecture (Zero mock/fake references)
├── Formal Mathematical Physics & LaTeX Equations Documentation
├── Comprehensive Peer-Reviewed Meteorological Bibliography (IMD/WMO/AMS papers)
└── SIH PS-26084 Requirement-to-Architecture Traceability & Compliance Audit
```

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Real-World MoES Data Architecture | Detailed 2D Mermaid.js pipeline mapping IMD, MOSDAC, IITM, NCMRWF live streams to ConvectNow with zero synthetic references | R1 | ORIGINAL_REQUEST §R1 |
| 2 | Scientific Bibliography & Equations | Deep meteorological documentation with exact LaTeX equations, physical parameters, and >=4 peer-reviewed citations mapped to code | R2 | ORIGINAL_REQUEST §R2 |
| 3 | SIH PS 26084 Alignment Audit | Comprehensive matrix verifying compliance with lead times, spatial resolution, and hazard coverage against official problem statement | R3 | ORIGINAL_REQUEST §R3 |
| 4 | Slide-Ready Presentation Artifact | Master consolidated markdown formatted directly for inclusion in SIH pitch decks and evaluation rubrics | Synthesis | ORIGINAL_REQUEST §Acceptance |
| 5 | Dual-Reviewer Verification Gate | Independent validation verifying zero mock references, citation authenticity, mathematical accuracy, and PS alignment | Review | Acceptance Criteria |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Deep Survey & Technical Exploration | Comprehensive code and literature investigation across backend modules, Indian portals, meteorological papers, and PS 26084 | none | IN_PROGRESS |
| M2 | Real-World MoES Data Flow Architecture (R1) | Authoring production-ready staging architecture in Mermaid.js detailing real Indian data streams | M1 | PLANNED |
| M3 | Scientific Bibliography & Physics Reference (R2) | Authoring rigorous mathematical formulations and peer-reviewed literature citations mapped to code | M1 | PLANNED |
| M4 | SIH PS 26084 Alignment Audit Matrix (R3) | Authoring line-by-line compliance and capability mapping for NCMRWF/MoES PS 26084 | M1 | PLANNED |
| M5 | Presentation Artifact Synthesis & Packaging | Assembling presentation-ready master document for SIH presentation slides | M2, M3, M4 | PLANNED |
| M6 | Independent Technical Review & Acceptance Gate | Rigorous dual-reviewer audit against all acceptance criteria | M5 | PLANNED |
