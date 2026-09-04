"""
Automated Test Suite for Milestone 2 AI Pipeline & MLOps Remediation
=====================================================================
Tests:
1. PyTorch 1D-CNN Autoencoder architecture and tensor dimensions.
2. Anomaly detection sensitivity on synthetic hydrographic telemetry.
3. Genuine binary ONNX model export and Protobuf integrity.
4. CLI argument parsing, dry-run mode, and weight protection in train.py.
5. Scientific dataset documentation transparency in validator.py.
"""
import os
import sys
import subprocess
from pathlib import Path

import numpy as np
import torch

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))

from ai_pipeline.telemetry_edge_model import (
    Telemetry1DCNNAutoencoder,
    EdgeTelemetryAutoencoder,
    generate_baseline_telemetry,
    DEFAULT_EXPORT_PATH,
    NUM_CHANNELS,
    SEQUENCE_LENGTH
)
from ai_pipeline.train import parse_args, copy_best_weights, set_seed
from virtual_sensors.validator import validate_interpolation_accuracy


def test_1dcnn_architecture():
    """Verify 1D-CNN Autoencoder reconstructs inputs with matching dimensions."""
    model = Telemetry1DCNNAutoencoder(in_channels=NUM_CHANNELS)
    model.eval()

    batch_sizes = [1, 4, 16]
    seq_lens = [16, 32]

    for b in batch_sizes:
        for seq_l in seq_lens:
            x = torch.randn(b, NUM_CHANNELS, seq_l)
            out = model(x)
            assert out.shape == x.shape, f"Shape mismatch: {out.shape} != {x.shape}"
    print("[PASS] 1D-CNN Autoencoder architecture and tensor dimensions")


def test_telemetry_training_and_anomaly_detection():
    """Verify genuine model convergence and anomaly detection sensitivity."""
    detector = EdgeTelemetryAutoencoder()
    train_data, specs = generate_baseline_telemetry(num_sequences=128, seq_len=16, seed=42)
    
    loss = detector.train_model(train_data, epochs=10, batch_size=16, lr=0.01)
    assert detector.is_trained, "Model was not marked as trained"
    assert loss < 0.25, f"Training failed to minimize loss: {loss}"
    assert detector.anomaly_threshold > 0.0, "Anomaly threshold was not calibrated"

    # Evaluate normal vs anomalous sequence
    normal_seq, _ = generate_baseline_telemetry(num_sequences=1, seq_len=16, seed=101)
    anom_seq = normal_seq.clone()
    anom_seq[0, 0, 5:8] += 10.0  # +10°C thermal plume spike anomaly

    with torch.no_grad():
        detector.model.eval()
        err_norm = float(torch.mean((detector.model(normal_seq) - normal_seq) ** 2))
        err_anom = float(torch.mean((detector.model(anom_seq) - anom_seq) ** 2))

    assert err_anom > detector.anomaly_threshold, f"Anomaly not flagged: {err_anom} <= {detector.anomaly_threshold}"
    assert err_norm < err_anom, f"Normal error >= anomalous error: {err_norm} vs {err_anom}"
    print("[PASS] Model convergence and anomaly detection sensitivity")


def test_onnx_export_and_binary_integrity():
    """Verify genuine binary ONNX export with valid Protobuf headers."""
    assert DEFAULT_EXPORT_PATH.exists(), f"ONNX file not found at {DEFAULT_EXPORT_PATH}"
    file_size = DEFAULT_EXPORT_PATH.stat().st_size
    assert file_size > 1000, f"ONNX file suspiciously small: {file_size} bytes (not binary)"

    with open(DEFAULT_EXPORT_PATH, "rb") as f:
        header = f.read(64)

    assert header.startswith(b"\x08") or b"pytorch" in header, "Invalid ONNX binary protobuf header"
    print(f"[PASS] ONNX binary model export verified ({file_size:,} bytes)")


def test_train_argparse_and_protection():
    """Verify train.py CLI argument parsing, dry-run mode, and weight safety."""
    # Test default args
    args = parse_args([])
    assert args.epochs == 80
    assert args.batch_size == 16
    assert args.device == "auto"
    assert not args.dry_run
    assert not args.save

    # Test custom args
    custom_args = parse_args(["--epochs", "20", "--batch-size", "8", "--device", "cpu", "--dry-run", "--save"])
    assert custom_args.epochs == 20
    assert custom_args.batch_size == 8
    assert custom_args.device == "cpu"
    assert custom_args.dry_run
    assert custom_args.save

    # Test CLI dry-run execution
    res = subprocess.run(
        [sys.executable, str(ROOT / "ai_pipeline" / "train.py"), "--dry-run"],
        capture_output=True,
        text=True
    )
    combined = res.stdout + res.stderr
    assert res.returncode == 0, f"train.py --dry-run failed with code {res.returncode}: {combined}"
    assert "[DRY-RUN]" in combined, "Dry run output missing [DRY-RUN] marker"
    assert "PROTECTED" in combined, "Weight protection notice missing from dry-run"
    print("[PASS] train.py CLI argument parsing, --dry-run execution, and weight protection")


def test_validator_documentation():
    """Verify validator.py docstrings and output reflect Calibrated Physical Reference Model."""
    import virtual_sensors.validator as val
    assert "Calibrated Physical Reference Model based on TEOS-10 and Southern Ocean climatology" in val.__doc__
    assert "Calibrated Physical Reference Model based on TEOS-10 and Southern Ocean climatology" in val.validate_interpolation_accuracy.__doc__
    print("[PASS] validator.py dataset documentation transparency")


if __name__ == "__main__":
    print("=" * 60)
    print("RUNNING REMEDIATION TEST SUITE (Milestone 2)")
    print("=" * 60)
    test_1dcnn_architecture()
    test_telemetry_training_and_anomaly_detection()
    test_onnx_export_and_binary_integrity()
    test_train_argparse_and_protection()
    test_validator_documentation()
    print("=" * 60)
    print("ALL 5 REMEDIATION TESTS PASSED WITH EXIT CODE 0")
    print("=" * 60)
