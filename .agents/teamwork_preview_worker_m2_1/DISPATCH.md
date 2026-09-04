# Assignment: AI Pipeline & MLOps Script Integrity Remediation

## Objective
Remediate the integrity and safety issues identified in Reviewer 2's audit report for `ai_pipeline/` and `virtual_sensors/`:

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Detailed Tasks
1. **Genuine PyTorch 1D-CNN Autoencoder & Real ONNX Export (`ai_pipeline/telemetry_edge_model.py`)**:
   - Replace the dummy ASCII text stub with a genuine PyTorch 1D Convolutional Autoencoder (`Conv1d`, `ReLU`, `ConvTranspose1d`).
   - Initialize and train/fit the model on sensor baselines (or normal telemetry distribution).
   - Export a real, valid binary ONNX model using `torch.onnx.export()` with proper input shapes (`[batch_size, num_features, sequence_length]`) and dynamic axes to `models/telemetry_anomaly_edge.onnx`.
   - Verify that the resulting `.onnx` file is a valid binary model file.

2. **CLI Argument Parsing & State Protection (`ai_pipeline/train.py`)**:
   - Add `argparse` with flags: `--epochs` (default: 80), `--batch-size` (default: 16), `--device` (default: auto), `--dry-run` (action="store_true"), `--save` (action="store_true", required to copy weights to production).
   - Add reproducibility controls: `torch.manual_seed(42)`, `np.random.seed(42)`.
   - In `--dry-run` mode: verify dataset existence, inspect device capabilities, and exit cleanly without starting 80-epoch training.
   - Prevent accidental overwriting of `models/sss_detector_v1/weights/best.pt` unless `--save` is explicitly passed.

3. **Truthful Dataset Documentation (`virtual_sensors/validator.py`)**:
   - Clarify the dataset description in `virtual_sensors/validator.py` docstrings and console output: identify `data/argo_southern_ocean.nc` as a "Calibrated Physical Reference Model based on TEOS-10 and Southern Ocean Indian sector climatological baselines", ensuring academic transparency.

4. **Verification**:
   - Run `./venv/bin/python ai_pipeline/telemetry_edge_model.py` and verify genuine ONNX export.
   - Run `./venv/bin/python ai_pipeline/train.py --dry-run` and verify safe exit 0.
   - Run `./venv/bin/python ai_pipeline/validate_ablation.py --mode verify` and verify exit 0.
   - Run `./venv/bin/python test_backend_api.py` and verify all 9 test suites pass.

## Output Requirements
Write your handoff report to `/Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork_preview_worker_m2_1/handoff.md`. Include execution logs and verification evidence.

## 2026-09-04T06:24:15Z
You are teamwork_preview_worker_m2_1.
Your working directory is: /Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork_preview_worker_m2_1

MANDATORY FIRST STEP: Read the authoritative user request at:
/Users/gauravkumarnayak/Desktop/new sih/.agents/ORIGINAL_REQUEST.md
(Refer to section ## 2026-09-04T05:57:43Z)
Also read your assignment in:
/Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork_preview_worker_m2_1/DISPATCH.md
And review the audit findings in:
/Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork_preview_reviewer_m1_2/handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your mission:
Implement the fixes documented in DISPATCH.md:
1. `ai_pipeline/telemetry_edge_model.py`: Build a genuine PyTorch 1D-CNN autoencoder (`nn.Module`), train/fit it on baseline telemetry, and export a genuine binary ONNX model using `torch.onnx.export` to `models/telemetry_anomaly_edge.onnx`. Verify it is a valid binary model.
2. `ai_pipeline/train.py`: Add `argparse` with `--epochs`, `--batch-size`, `--device`, `--dry-run`, `--save`. Add reproducibility seeds (`torch.manual_seed(42)`). Protect against un-gated overwriting of `best.pt`.
3. `virtual_sensors/validator.py`: Update dataset documentation and prints to clearly reflect that `data/argo_southern_ocean.nc` is a "Calibrated Physical Reference Model based on TEOS-10 and Southern Ocean climatology".
4. Run all verification scripts (`telemetry_edge_model.py`, `train.py --dry-run`, `validate_ablation.py --mode verify`, `test_backend_api.py`) and confirm exit code 0.

Write your completion report to `/Users/gauravkumarnayak/Desktop/new sih/.agents/teamwork_preview_worker_m2_1/handoff.md`.
When finished, send a message to orchestrator parent stating that your implementation is complete and verified.

