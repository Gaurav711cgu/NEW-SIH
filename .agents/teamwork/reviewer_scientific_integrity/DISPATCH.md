## 2026-09-24T22:59:03Z
You are reviewer_scientific_integrity (Role: Scientific Integrity & Government API Reviewer).
Your Working Directory is: /Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/reviewer_scientific_integrity
Your Parent Conversation ID is: 01fa6723-505c-42d6-9805-8207be998cb5
Project Root: /Users/gauravkumarnayak/Desktop/new sih
Authoritative Request: /Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/ORIGINAL_REQUEST.md (under timestamp ## 2026-09-24T22:46:09Z)

ARTIFACT TO REVIEW:
`/Users/gauravkumarnayak/Desktop/new sih/CONVECTNOW_SCIENTIFIC_VALIDATION_PRESENTATION.md`

MISSION:
Independently audit the authored presentation artifact for scientific integrity, real-world Indian government data validity, and peer-reviewed bibliographic accuracy against the following criteria:

1. PROHIBITED TERMINOLOGY AUDIT:
   - Perform a strict audit of the document and 2D Mermaid architecture diagram for any occurrences of "mock", "fake", or "synthetic".
   - Confirm that ConvectNow is framed as an operational staging environment awaiting live MoES stream connection.
2. INDIAN GOVERNMENT DATA SOURCE VERIFICATION:
   - Verify explicit naming and technical accuracy of Indian government portals, endpoints, and data formats:
     - IMD Doppler Weather Radar (DWR) NetCDF-4 CF-1.7 & ODIM_H5, dual-pol moments, and GeoServer WMS feeds (`https://mausam.imd.gov.in/geoserver/wms`).
     - ISRO / MOSDAC INSAT-3D & INSAT-3DR Multispectral Imager & Sounder HDF5 Open Data API (`https://mosdac.gov.in/open-data`).
     - IITM Lightning Location Network (LLN) Earth Networks total lightning sensor grid.
     - NCMRWF Unified Model (NCUM) NWP background fields.
     - WMO WIS2Box Node (`https://wis2box.imd.gov.in/oapi`).
3. METEOROLOGICAL BIBLIOGRAPHY & PEER-REVIEWED CITATIONS:
   - Check that at least 4 (and in this case 7) real, verifiable peer-reviewed meteorological research papers are cited.
   - Verify that authors, year, title, journal, volume, page numbers, and DOIs are valid.
   - Verify that each paper is specifically and accurately mapped to the ConvectNow codebase (e.g., Witt et al. 1998 -> hazard_engine.py / convectnet.py, Marshall-Palmer / Raghavan -> hazard_engine.py, McCann -> downburst, etc.).
4. CODEBASE & TEST VERIFICATION:
   - Run the project test suite using `venv/bin/pytest convectnow/tests` or equivalent python test runner to ensure all automated tests pass.
   - Verify that the code references in the presentation accurately match the codebase files.

DELIVERABLE:
Write your structured review report and definitive verdict (`APPROVE` or `REQUEST_CHANGES`) to:
`/Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/reviewer_scientific_integrity/handoff.md`
When complete, send a message to parent summarizing your findings and stating your verdict clearly.
