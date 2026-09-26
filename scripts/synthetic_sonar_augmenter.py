import cv2
import numpy as np
import os
import glob

def generate_synthetic_sonar(img_path, out_path):
    """Converts a standard image into a synthetic Side-Scan Sonar (SSS) image."""
    img = cv2.imread(img_path)
    if img is None:
        return
        
    # 1. Convert to Grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # 2. Add Multiplicative Speckle Noise (Rayleigh distribution characteristic of Sonar)
    row, col = gray.shape
    gauss = np.random.randn(row, col)
    noisy = gray + gray * gauss * 0.4  # 40% speckle
    
    # 3. Simulate Acoustic Shadow (dark streaks behind bright objects)
    # Simple threshold to find bright objects, then blur and translate to simulate shadow
    _, thresh = cv2.threshold(gray, 200, 255, cv2.THRESH_BINARY)
    shadow = cv2.GaussianBlur(thresh, (15, 15), 0)
    M = np.float32([[1, 0, 20], [0, 1, 0]]) # shift right for shadow
    shifted_shadow = cv2.warpAffine(shadow, M, (col, row))
    
    # Darken the areas where the shadow falls
    noisy = np.where(shifted_shadow > 50, noisy * 0.3, noisy)
    
    # 4. Apply Sonar Colormap (Bone / Copper)
    noisy = np.clip(noisy, 0, 255).astype(np.uint8)
    sonar_colored = cv2.applyColorMap(noisy, cv2.COLORMAP_BONE)
    
    cv2.imwrite(out_path, sonar_colored)

def augment_dataset(input_dir, output_dir):
    os.makedirs(output_dir, exist_ok=True)
    images = glob.glob(os.path.join(input_dir, "*.jpg"))
    print(f"Found {len(images)} images for Synthetic Sonar Augmentation...")
    for idx, img in enumerate(images):
        out_name = os.path.join(output_dir, f"synthetic_sss_{idx}.jpg")
        generate_synthetic_sonar(img, out_name)
    print("Synthetic dataset generation complete. Data starvation mitigated.")

if __name__ == "__main__":
    # Create dummy dirs for the script to run without failing
    os.makedirs("data/raw_optical", exist_ok=True)
    augment_dataset("data/raw_optical", "data/synthetic_sonar")
