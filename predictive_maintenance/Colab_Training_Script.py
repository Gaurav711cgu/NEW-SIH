import os
import sys
import subprocess

def run_pipeline():
    print("Starting Predictive Maintenance Training Pipeline on Colab...")
    scripts = [
        "download_data.py",
        "preprocess.py",
        "train_anomaly_detector.py",
        "train_rul_predictor.py",
        "train_battery_soh.py"
    ]
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    for script in scripts:
        script_path = os.path.join(base_dir, script)
        print(f"\n{'='*50}\nRunning {script}...\n{'='*50}")
        result = subprocess.run([sys.executable, script_path], cwd=base_dir)
        if result.returncode != 0:
            print(f"Error running {script}. Pipeline halted.")
            sys.exit(1)
            
    print("\n" + "="*50)
    print("PIPELINE COMPLETE!")
    print("All models saved to models/")
    print("All plots saved to plots/")
    print("="*50)

if __name__ == "__main__":
    run_pipeline()
