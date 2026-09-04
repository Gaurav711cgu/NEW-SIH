# Edge AI Model Training, Validation, & Export Pipeline

To meet the requirement for Edge AI deployment (ESP32/Raspberry Pi) for the autonomous vehicle, we need to complete the end-to-end MLOps pipeline. While we have the core scripts (`train.py`, `detector.py`, `validate_ablation.py`), we lack the deployment export mechanisms and the automated orchestrator to run the entire loop.

## Proposed Changes

### AI Pipeline Automation
#### [NEW] `ai_pipeline/run_mlops_pipeline.py`
- A master orchestrator script that runs:
  1. `train.py` (Model Training)
  2. `validate_ablation.py` (Validation & Evaluation)
  3. Edge Export (New step)

#### [NEW] `ai_pipeline/edge_exporter.py`
- A script specifically designed to convert the heavy `.pt` (PyTorch) model into a lightweight format suitable for Edge AI microcontrollers (ESP32 / Pi 4).
- **Features:** 
  - ONNX export
  - TFLite (TensorFlow Lite) export with INT8 quantization (crucial for ESP32 constraints).

## Verification Plan
### Automated Tests
- Run `python ai_pipeline/edge_exporter.py --mock` to verify the quantization logic successfully exports an edge-compatible binary size.
- Ensure the React UI correctly displays the telemetry from the new pipeline if applicable.

