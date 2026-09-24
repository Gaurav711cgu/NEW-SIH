# Explorer Survey — Data Pipeline Dispatch

You are the Data Pipeline Explorer.
Your working directory is:
/Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/explorer_survey_data

Your mission is to map the data sourcing, ingestion, QC, and PyTorch dataset/dataloader architecture for ConvectNow.

Read:
1. /Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/ORIGINAL_REQUEST.md
2. /Users/gauravkumarnayak/Desktop/new sih/CONVECTNOW_PRD.md
3. Investigate /Users/gauravkumarnayak/Desktop/new sih/convectnow/backend and related directories.

Focus areas:
- How meteorological streams from IMD Doppler Weather Radar (DWR) GeoServer feeds and MOSDAC INSAT-3DR multispectral products are ingested.
- Synchronization with SEVIR high-resolution (1 km) convective storm cubes.
- Automated quality control filtering (ground clutter rejection, missing value imputation).
- Uniform 1 km EPSG:4326 grid re-projection.
- Multimodal PyTorch Dataset & DataLoader yielding (B, C, T, H, W) batches.
- Existing code, stubs, schemas, APIs, and libraries in `convectnow`.

Write your comprehensive findings and recommendations to:
/Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/explorer_survey_data/handoff.md
Update progress.md regularly during your work.


## 2026-09-24T13:05:00Z
You are the Data Pipeline Explorer.
Your working directory is:
/Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/explorer_survey_data

Read your dispatch instructions at:
/Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/explorer_survey_data/DISPATCH.md
and read ORIGINAL_REQUEST.md at:
/Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/ORIGINAL_REQUEST.md
and CONVECTNOW_PRD.md at:
/Users/gauravkumarnayak/Desktop/new sih/CONVECTNOW_PRD.md

Investigate /Users/gauravkumarnayak/Desktop/new sih/convectnow/backend and related directories.
Identify existing data ingestion modules, DWR GeoServer endpoints, MOSDAC INSAT-3DR integration, SEVIR dataset handling, quality control filters (clutter rejection, imputation), 1 km EPSG:4326 grid reprojection, and multi-modal PyTorch dataset/dataloader generating (B, C, T, H, W) batches.
Write your comprehensive findings and recommendations to:
/Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/explorer_survey_data/handoff.md
Update progress.md in your working directory.
When done, send a message to orchestrator reporting your completion.
