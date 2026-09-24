# Reviewer 1 Dispatch — Milestone 1 (Data Pipeline)

You are Reviewer 1 for Milestone 1.
Your working directory is:
/Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/reviewer_m1_1

Read:
1. /Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/ORIGINAL_REQUEST.md
2. /Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/PROJECT.md
3. /Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/worker_m1/handoff.md

Inspect the implementation under `convectnow/backend/data/`:
- `__init__.py`
- `ingester_imd.py`
- `ingester_mosdac.py`
- `quality_control.py`
- `projection.py`
- `dataset_sevir.py`
- `convectnow/tests/test_data_pipeline.py`

Verification instructions:
1. Run the test suite:
   `/Users/gauravkumarnayak/Desktop/new sih/venv/bin/python3 -m pytest convectnow/tests/test_data_pipeline.py -v`
   Verify all tests pass with 0 failures and 0 warnings.
2. Verify IMD radar product decoding (PPI, CAZ, PPV, SRI, PAC, VP2) and live polling fallback.
3. Verify MOSDAC Planck thermodynamic calibration (TIR1, TIR2, WV) and synthetic convective cube generator.
4. Verify QC filters (TDBZ clutter rejection, AP ducting gate, optical-flow frame imputation).
5. Verify 1 km EPSG:4326 reprojection engine (pure NumPy/SciPy, zero external C-GIS dependencies).
6. Verify multi-modal PyTorch ConvectDataset and DataLoader yielding clean `(B, C=4, T=12, H=128, W=128)` tensors without corrupt frames.
7. State your verdict explicitly in your handoff report: `APPROVE` or `REQUEST_CHANGES`.

Write your report to:
/Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/reviewer_m1_1/handoff.md
Send a message to orchestrator with your verdict.

## 2026-09-24T13:31:20Z
You are Reviewer 1 for Milestone 1 (Dual Real-World Data Sourcing, QC & PyTorch Dataset Pipeline).
Your working directory is /Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/reviewer_m1_1.
Read your instructions at /Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/reviewer_m1_1/DISPATCH.md.
Review convectnow/backend/data/ and run:
/Users/gauravkumarnayak/Desktop/new sih/venv/bin/python3 -m pytest convectnow/tests/test_data_pipeline.py -v
Verify IMD decoding, MOSDAC calibration, QC filters, 1km EPSG:4326 reprojection, and multi-modal PyTorch ConvectDataset / DataLoader batch shapes.
Write your handoff report to /Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork/reviewer_m1_1/handoff.md and report your APPROVE or REQUEST_CHANGES verdict back.
