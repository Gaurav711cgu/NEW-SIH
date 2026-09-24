# Worker M1 Dispatch: Dual Real-World Data Sourcing, QC & PyTorch Dataset Pipeline

You are the Implementation Worker for Milestone 1.
Your working directory is:
/Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/worker_m1

Your exclusive write ownership:
- `convectnow/backend/data/__init__.py`
- `convectnow/backend/data/ingester_imd.py`
- `convectnow/backend/data/ingester_mosdac.py`
- `convectnow/backend/data/quality_control.py`
- `convectnow/backend/data/projection.py`
- `convectnow/backend/data/dataset_sevir.py`
- `convectnow/tests/test_data_pipeline.py`

DO NOT modify files outside your ownership.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Read:
1. /Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/ORIGINAL_REQUEST.md
2. /Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/PROJECT.md
3. /Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/explorer_survey_data/handoff.md

Tasks to execute:
1. `ingester_imd.py`:
   - Implement `IMDGeoServerWorker` to ingest IMD Doppler Weather Radar (DWR) GeoServer feeds (WMS/WCS) and operational radar GIFs from `datasets/imd_radar/`.
   - Decode operational radar products (`ppi_delhi.gif`, `caz_delhi.gif`, `ppv_delhi.gif`, `sri_delhi.gif`, `pac_delhi.gif`, `vp2_delhi.gif`) into quantitative reflectivity (dBZ) and velocity grids.
   - Provide online live stream polling with graceful offline cached fallback.

2. `ingester_mosdac.py`:
   - Implement `MOSDACIngester` to ingest INSAT-3DR multispectral products (TIR1 10.8µm, TIR2 12.0µm, WV 6.9µm).
   - Implement authentic Planck calibration converting raw radiances/counts to brightness temperature (Tb in Kelvin and Celsius).
   - Provide offline synthetic/benchmark calibration generators for testing.

3. `quality_control.py`:
   - Implement `QualityControlFilter` with:
     a) Ground clutter rejection via Texture of Reflectivity (TDBZ): local spatial standard deviation thresholding (TDBZ > 18 dB flags non-meteorological clutter).
     b) Satellite AP (Anomalous Propagation) ducting gating: cross-sensor thermal check (warm cloud-top Tb > 280 K with high radar echo flagged as ducting clutter).
     c) Optical-flow missing frame imputation: Farnebäck bi-directional advection interpolation from t-1 and t+1 when frames drop.

4. `projection.py`:
   - Implement `GridReprojector` using closed-form pure NumPy/SciPy operations (no external C-libraries like GDAL/pyproj/rasterio required) to re-project polar radar and satellite grids onto a uniform 1 km EPSG:4326 grid.

5. `dataset_sevir.py`:
   - Implement `ConvectDataset` and `create_convect_dataloader`:
     - Load 193 SEVIR VIL storm events (`datasets/sevir/vil/SEVIR_VIL_STORMEVENTS_2017_0101_0630.h5`) and GLM lightning events (`datasets/sevir/lght/SEVIR_LGHT_ALLEVENTS_2018_0601_0701.h5`).
     - Dual-mode fusion: paired GLM mode when lightning match is available, and physics-proxy mode for 2017 VIL events.
     - Yield clean 4D/5D multi-modal batches `(B, C=4, T=12, H=128, W=128)` where:
       - Channel 0: Normalized Reflectivity / VIL [0, 1]
       - Channel 1: Temporal growth Delta Z [ -1, 1 ]
       - Channel 2: Satellite IR brightness temp / cooling [0, 1]
       - Channel 3: Normalized lightning strike density [0, 1]
     - Ground truth targets dictionary matching all 4 ConvectNet heads:
       - `'posh'`: float [0.0, 1.0]
       - `'mesh_mm'`: float [0.0, 100.0]
       - `'cloudburst_flag'`: float {0.0, 1.0}
       - `'rain_rate_mmh'`: float [0.0, 300.0]
       - `'gust_kmh'`: float [0.0, 200.0]
       - `'ci_prob'`: float [0.0, 1.0]

6. Verification:
   - Create unit/integration tests in `convectnow/tests/test_data_pipeline.py`.
   - Run tests using the environment `/Users/gauravkumarnayak/Desktop/new sih/venv/bin/python3 -m pytest convectnow/tests/test_data_pipeline.py -v`.
   - Ensure all tests pass with 0 failures and 0 warnings.
   - Document verification commands and output in `/Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/worker_m1/handoff.md`.

When done, write handoff.md and send a message to orchestrator.

## 2026-09-24T13:13:57Z
You are the Implementation Worker for Milestone 1: Dual Real-World Data Sourcing, QC & PyTorch Dataset Pipeline.
Your working directory is /Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/worker_m1.
Read your instructions at /Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/worker_m1/DISPATCH.md and PROJECT.md at /Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/PROJECT.md.
Also read the explorer handoff at /Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/explorer_survey_data/handoff.md.

Implement:
1. convectnow/backend/data/__init__.py
2. convectnow/backend/data/ingester_imd.py
3. convectnow/backend/data/ingester_mosdac.py
4. convectnow/backend/data/quality_control.py
5. convectnow/backend/data/projection.py
6. convectnow/backend/data/dataset_sevir.py
7. convectnow/tests/test_data_pipeline.py

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Verify your implementation with:
/Users/gauravkumarnayak/Desktop/new sih/venv/bin/python3 -m pytest convectnow/tests/test_data_pipeline.py -v

Document all verification commands and outputs in /Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/worker_m1/handoff.md and report back when finished.
