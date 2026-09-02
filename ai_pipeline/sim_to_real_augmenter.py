"""
DeepScan AUV - Sim-to-Real Dataset Augmentation Pipeline
---------------------------------------------------------
This script artificially expands a small Side-Scan Sonar (SSS) dataset 
by applying physics-based mathematical augmentations to simulate 
various underwater environments and AUV operational states.

Techniques used:
1. Multiplicative Rayleigh Speckle Noise (Simulates water turbidity)
2. Acoustic Shadow Modulation (Simulates different Towfish Altitudes)
3. Spatial Transformations (Simulates AUV yaw/pitch variations)

Author: DeepScan Engineering Team
Target: Smart India Hackathon (Ministry of Earth Sciences)
"""

import cv2
import numpy as np
import os
import glob
from pathlib import Path
import random

def add_rayleigh_noise(image: np.ndarray, scale: float = 0.08) -> np.ndarray:
    """
    Side-scan sonar imagery suffers from multiplicative speckle noise due to 
    coherent acoustic wave interference, modeled by a Rayleigh distribution 
    (not standard Gaussian noise).
    """
    # Convert image to float 0.0 - 1.0
    img_float = image.astype(np.float32) / 255.0
    
    # Generate Rayleigh noise mathematically
    noise = np.random.rayleigh(scale, image.shape)
    
    # Apply multiplicative interference
    noisy_img = img_float + (img_float * noise)
    
    # Clip and convert back to 8-bit image
    noisy_img = np.clip(noisy_img * 255.0, 0, 255).astype(np.uint8)
    return noisy_img


def modulate_acoustic_shadows(image: np.ndarray, altitude_factor: float = 0.6) -> np.ndarray:
    """
    Adjusts the intensity of acoustic shadows.
    A lower towfish altitude creates darker, longer shadows. 
    A higher altitude creates lighter, shorter shadows.
    """
    # Isolate shadow regions (typically pixels with intensity < 45 in sonar)
    # Convert to grayscale if it isn't already
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image
        
    _, shadow_mask = cv2.threshold(gray, 45, 255, cv2.THRESH_BINARY_INV)
    
    # Modulate shadow intensity based on simulated altitude
    img_float = image.astype(np.float32)
    img_float[shadow_mask == 255] *= altitude_factor
    
    return np.clip(img_float, 0, 255).astype(np.uint8)


def augment_dataset(input_dir: str, output_dir: str, multiplier: int = 5):
    """
    Takes a directory of raw sonar images and multiplies the dataset size 
    by applying randomized physics-based augmentations.
    """
    in_path = Path(input_dir)
    out_path = Path(output_dir)
    out_path.mkdir(parents=True, exist_ok=True)
    
    # Find all images (jpg, png)
    image_files = list(in_path.glob("*.jpg")) + list(in_path.glob("*.png"))
    
    if not image_files:
        print(f"[ERROR] No images found in {input_dir}")
        return
        
    print(f"[INFO] Found {len(image_files)} source images. Generating {len(image_files) * multiplier} augmented samples...")
    
    generated_count = 0
    
    for img_path in image_files:
        img = cv2.imread(str(img_path))
        if img is None:
            continue
            
        # Save original first
        cv2.imwrite(str(out_path / f"{img_path.stem}_orig.jpg"), img)
        generated_count += 1
        
        # Generate N variations per image
        for i in range(1, multiplier):
            aug_img = img.copy()
            
            # 1. Random Spatial Flips (AUV scanning from opposite direction)
            if random.random() > 0.5:
                aug_img = cv2.flip(aug_img, 1) # Horizontal flip
            if random.random() > 0.5:
                aug_img = cv2.flip(aug_img, 0) # Vertical flip
                
            # 2. Simulate Towfish Altitude (Shadow Darkness)
            # Random factor between 0.3 (very deep shadow) and 0.9 (light shadow)
            alt_factor = random.uniform(0.3, 0.9)
            aug_img = modulate_acoustic_shadows(aug_img, altitude_factor=alt_factor)
            
            # 3. Simulate Water Turbidity (Rayleigh Speckle)
            # Random scale between 0.05 (clear) and 0.15 (heavy sediment/noise)
            turbidity_scale = random.uniform(0.05, 0.15)
            aug_img = add_rayleigh_noise(aug_img, scale=turbidity_scale)
            
            # Save augmented image
            out_name = f"{img_path.stem}_aug_alt{int(alt_factor*100)}_turb{int(turbidity_scale*100)}.jpg"
            cv2.imwrite(str(out_path / out_name), aug_img)
            generated_count += 1
            
    print(f"[SUCCESS] Sim-to-Real Augmentation Complete. Total images ready for RT-DETR training: {generated_count}")


if __name__ == "__main__":
    # Example usage:
    # python ai_pipeline/sim_to_real_augmenter.py
    
    INPUT_DATASET = "data/raw_sonar_images"
    OUTPUT_DATASET = "data/augmented_training_set"
    
    # Create mock directory if it doesn't exist just so the script can run without crashing
    Path(INPUT_DATASET).mkdir(parents=True, exist_ok=True)
    
    print("==================================================")
    print("🌊 DEEPSCAN SIM-TO-REAL SONAR AUGMENTATION ENGINE")
    print("==================================================")
    augment_dataset(INPUT_DATASET, OUTPUT_DATASET, multiplier=5)
