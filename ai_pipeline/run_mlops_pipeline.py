"""
Master Orchestrator — DeepScan SSS MLOps Pipeline
===================================================
Orchestrates the entire MLOps workflow:
1. Training (Stage 1 YOLOv8, Stage 2 RT-DETR)
2. Backtesting (Validation, Precision/Recall, mAP50 evaluation)
3. Edge Export (NCNN / TFLite compilation)
"""
import os
import sys
import logging
import subprocess
from pathlib import Path

logging.basicConfig(
    level=logging.INFO,
    format='\n%(asctime)s [%(levelname)s] [MLOPS_MASTER] %(message)s',
    datefmt='%H:%M:%S'
)
log = logging.getLogger(__name__)

ROOT = Path(__file__).resolve().parent.parent
PIPELINE_DIR = ROOT / "ai_pipeline"

def run_script(script_name: str, description: str):
    log.info(f"🚀 STARTING PHASE: {description}")
    script_path = PIPELINE_DIR / script_name
    
    if not script_path.exists():
        log.error(f"Critical error: Script {script_path} not found.")
        sys.exit(1)
        
    try:
        # Run the script using the current python executable
        result = subprocess.run(
            [sys.executable, str(script_path)],
            check=True
        )
        log.info(f"✅ PHASE COMPLETE: {description}")
    except subprocess.CalledProcessError as e:
        log.error(f"❌ PHASE FAILED: {description} (Exit Code: {e.returncode})")
        sys.exit(1)

def main():
    log.info("╔══════════════════════════════════════════════════════════╗")
    log.info("║          AQUILA OS / DEEPSCAN MLOPS ORCHESTRATOR         ║")
    log.info("╚══════════════════════════════════════════════════════════╝")
    
    # 1. Model Training
    run_script("train.py", "Stage 1 & 2 Base Training Pipeline")
    
    # 2. Validation & Ablation Backtesting
    run_script("validate_ablation.py", "Genuine Mathematical PR & mAP50 Evaluation")
    
    # 3. Edge AI Compression & Export
    run_script("edge_exporter.py", "Hardware Compilation (ESP32/Raspberry Pi)")
    
    log.info("\n🎉 ENTIRE MLOPS PIPELINE COMPLETED SUCCESSFULLY! 🎉")
    log.info("Models are ready in the `models/` directory for deployment.")

if __name__ == "__main__":
    main()
