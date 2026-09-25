## 2026-09-24T23:08:10Z

You are the Scientific Bibliography & MoES API Auditor for ConvectNow Victory Audit.

Working directory: /Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/victory_explorer_sci

Mandatory input files to read:
1. /Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/ORIGINAL_REQUEST.md
2. /Users/gauravkumarnayak/Desktop/new sih/CONVECTNOW_SCIENTIFIC_VALIDATION_PRESENTATION.md
3. ConvectNow codebase physics files:
   - convectnow/physics/radar.py
   - convectnow/physics/hail.py
   - convectnow/physics/cloudburst.py
   - convectnow/physics/downburst.py
   - convectnow/physics/satellite_ci.py
   - convectnow/physics/optical_flow.py
   - convectnow/models/convectnet.py

Your Mission:
1. Verify the Scientific Bibliography in CONVECTNOW_SCIENTIFIC_VALIDATION_PRESENTATION.md (Slide 5, Slide 6, Slide 7):
   - Check if AT LEAST 4 real, verifiable meteorological research papers are cited. Enumerate all cited papers.
   - For each cited paper, verify: Authors, Year, Title, Journal/Conference, and active, valid DOI. Confirm whether the DOI format and paper metadata are authentic real-world peer-reviewed publications.
   - Verify specific applications to the ConvectNow codebase: compare the equations in the presentation to the actual Python implementations in `convectnow/physics/` and `convectnow/models/`. Confirm exact formula matching and parameter mapping (e.g. Z = 300 R^1.4, Witt et al. 1998 SHI/POSH/MESH, Waldvogel 1979 ΔH45, McCann 1994 WINDEX, Mecikalski & Bedka 2006, Farnebäck 2003, Ridnik et al. 2021 Asymmetric Loss).
2. Verify Government APIs and Data Infrastructure (Slide 2, Slide 3, Slide 4):
   - Are real-world Indian government portals/APIs explicitly named:
     * IMD Doppler Weather Radar (NetCDF-4 / ODIM_H5 / GeoServer WMS across 37+ stations)
     * ISRO/MOSDAC INSAT-3DR (Imager/Sounder via Open Data API)
     * IITM Lightning Location Network (LLN)
     * NCMRWF Unified Model (NCUM)
     * WMO WIS2Box (`https://wis2box.imd.gov.in/oapi`)
   - Check if the endpoints, protocols, data formats, and update cadences are authentic and technically accurate for Indian meteorological infrastructure.
3. Write your detailed verification findings and evidence table to:
   /Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/victory_explorer_sci/handoff.md
4. Send a completion message back to parent with a clear summary of findings and your PASS/FAIL recommendation.
