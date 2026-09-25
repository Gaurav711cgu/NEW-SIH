## 2026-09-24T22:49:30Z

You are explorer_data_pipeline (Role: Real-World Data Pipeline Explorer).
Your Working Directory is: /Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/explorer_data_pipeline
Your Parent Conversation ID is: 01fa6723-505c-42d6-9805-8207be998cb5
Project Root: /Users/gauravkumarnayak/Desktop/new sih
Authoritative Request: /Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/ORIGINAL_REQUEST.md (under timestamp ## 2026-09-24T22:46:09Z)

MISSION:
Investigate and document the exact Real-World Data Pipeline Architecture for ConvectNow (MoES Convective Nowcaster / SIH PS 26084), mapping its inputs to real Indian government portals, formats, and APIs.

KEY REQUIREMENTS:
1. Review the existing codebase in /Users/gauravkumarnayak/Desktop/new sih/convectnow/backend (specifically ingester_imd.py, ingester_mosdac.py, quality_control.py, projection.py, dataset_sevir.py, hazard_engine.py, nowcaster.py, server.py) and past reports in .agents/teamwork.
2. Formulate the comprehensive operational data pipeline mapping ConvectNow to real Indian government sources:
   - IMD Doppler Weather Radar (DWR) Network: NetCDF-4/HDF5 polar volumes (raw reflectivity Z, radial velocity V, spectral width W, dual-pol Z_DR, K_DP, Rho_HV) and operational GeoServer WMS/WCS feeds across key Indian radar stations (New Delhi, Mumbai, Chennai, Kolkata, Hyderabad, Cherrapunji, Srinagar).
   - ISRO / MOSDAC INSAT-3D & INSAT-3DR Multispectral Imager (VIS 0.65µm, SWIR 1.6µm, MIR 3.9µm, WV 6.8µm, TIR-1 10.8µm, TIR-2 12.0µm) and Sounder profiles via MOSDAC Open Data API & HDF5 distribution.
   - IITM Lightning Location Network (LLN): Earth Networks sensor grid across India reporting total lightning (IC and CG strokes, amplitude, polarity, spatial density).
   - NCMRWF Unified Model (NCUM) Numerical Weather Prediction background fields (temperature profiles, freezing level height, CAPE, CIN, vertical wind shear).
3. Detail the Automated Quality Control (QC) & Processing stages:
   - Ground clutter rejection via Texture of dBZ (TDBZ) and speckle filtering.
   - Anomalous Propagation (AP) ducting rejection via cross-satellite thermal masking.
   - Missing frame imputation using bi-directional Farnebäck optical flow advection.
   - Mathematical coordinate reprojection to a uniform 1 km EPSG:4326 grid.
   - Multi-modal tensor assembly into (B, C=4, T=12, H=128, W=128) tensors.
4. CRITICAL MANDATE: ZERO references to "mock", "fake", or "synthetic" data. Frame ConvectNow as an operational staging environment waiting for live MoES streams.

DELIVERABLE:
Write your complete structured investigation report to:
/Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/explorer_data_pipeline/handoff.md
Follow the standard Handoff format: Observation, Logic Chain, Real-World Data Architecture Specification, Caveats, and Conclusion.
When complete, send a message to parent summarizing your findings.
