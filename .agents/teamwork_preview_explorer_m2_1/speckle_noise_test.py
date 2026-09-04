#!/usr/bin/env python3
"""
AQUILA OS — Edge Inference Extreme Speckle Noise & Preprocessing Audit
======================================================================
Tests the edge AI inference engine and preprocessing chain (CLAHE, median blur,
shadow segmentation) under simulated and real extreme Side-Scan Sonar speckle noise.
"""

import sys
import os
import time
import json
from pathlib import Path
import numpy as np
import cv2

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT))

from ai_pipeline.detector import SonarDetector
from ai_pipeline.preprocessor import preprocess_sss

def box_iou(box1, box2):
    """Compute IoU between two [x, y, w, h] boxes."""
    x1_1, y1_1, x2_1, y2_1 = box1[0], box1[1], box1[0] + box1[2], box1[1] + box1[3]
    x1_2, y1_2, x2_2, y2_2 = box2[0], box2[1], box2[0] + box2[2], box2[1] + box2[3]
    
    inter_x1 = max(x1_1, x1_2)
    inter_y1 = max(y1_1, y1_2)
    inter_x2 = min(x2_1, x2_2)
    inter_y2 = min(y2_1, y2_2)
    
    inter_w = max(0.0, inter_x2 - inter_x1)
    inter_h = max(0.0, inter_y2 - inter_y1)
    inter_area = inter_w * inter_h
    
    area1 = box1[2] * box1[3]
    area2 = box2[2] * box2[3]
    union_area = area1 + area2 - inter_area
    if union_area <= 0:
        return 0.0
    return inter_area / union_area

def add_rayleigh_speckle(img_bgr: np.ndarray, scale: float, seed: int = 42) -> np.ndarray:
    """Inject multiplicative Rayleigh speckle noise."""
    if scale <= 0.0:
        return img_bgr.copy()
    np.random.seed(seed)
    img_f = img_bgr.astype(np.float32) / 255.0
    noise = np.random.rayleigh(scale, img_bgr.shape)
    noisy_f = img_f + (img_f * noise)
    return np.clip(noisy_f * 255.0, 0, 255).astype(np.uint8)

def run_speckle_audit():
    detector = SonarDetector(weights_path=ROOT / "best.pt", conf=0.20, device="cpu")
    
    test_images = [
        "testing_images/01_shipwreck_large_waterfall.jpg",
        "testing_images/07_shipwreck_broken_keel.jpg",
        "testing_images/13_shallow_water_heavy_speckle.jpg",
        "testing_images/21_extreme_speckle_noise_ghost_net.jpg",
    ]
    
    noise_scales = [0.0, 0.10, 0.25, 0.50, 0.75]
    results = {}
    
    print("=" * 90)
    print("AQUILA OS — SSS INFERENCE SPECKLE NOISE ROBUSTNESS & CLAHE AUDIT")
    print("=" * 90)
    
    for img_rel in test_images:
        img_p = ROOT / img_rel
        if not img_p.exists():
            continue
            
        print(f"\nEvaluating: {img_p.name}")
        print("-" * 90)
        print(f"{'Noise Scale':<12} | {'Condition':<18} | {'Dets':<5} | {'Top Class':<15} | {'Conf':<7} | {'IoU to Base':<12} | {'Shadow %'}")
        print("-" * 90)
        
        orig_bgr = cv2.imread(str(img_p))
        
        # 1. Baseline: Clean image with CLAHE pipeline
        base_prep = preprocess_sss(orig_bgr)
        base_dets = detector.run(base_prep.processed, conf=0.20, use_clahe=False)
        base_top = base_dets[0] if base_dets else None
        
        img_results = []
        
        for scale in noise_scales:
            noisy_bgr = add_rayleigh_speckle(orig_bgr, scale=scale, seed=42)
            
            # Condition 1: Full AQUILA pipeline (MedianBlur + CLAHE + Shadow Detection)
            t0 = time.perf_counter()
            prep = preprocess_sss(noisy_bgr)
            t_prep = (time.perf_counter() - t0) * 1000
            
            dets_pipeline = detector.run(prep.processed, conf=0.20, use_clahe=False)
            top_p = dets_pipeline[0] if dets_pipeline else None
            iou_p = box_iou(base_top.bbox, top_p.bbox) if (base_top and top_p) else 0.0
            
            p_class = top_p.class_name if top_p else "None"
            p_conf = f"{top_p.confidence*100:.1f}%" if top_p else "N/A"
            iou_str = f"{iou_p:.3f}" if top_p else "N/A"
            print(f"sigma={scale:<6.2f} | Full CLAHE+Blur   | {len(dets_pipeline):<5} | {p_class:<15} | {p_conf:<7} | {iou_str:<12} | {prep.shadow_coverage_pct:.1f}%")
            
            # Condition 2: Raw Noisy Image (NO CLAHE, NO MedianBlur)
            dets_raw = detector.run(noisy_bgr, conf=0.20, use_clahe=False)
            top_r = dets_raw[0] if dets_raw else None
            iou_r = box_iou(base_top.bbox, top_r.bbox) if (base_top and top_r) else 0.0
            
            r_class = top_r.class_name if top_r else "None"
            r_conf = f"{top_r.confidence*100:.1f}%" if top_r else "N/A"
            iou_r_str = f"{iou_r:.3f}" if top_r else "N/A"
            print(f"sigma={scale:<6.2f} | Raw (No CLAHE/Blur)| {len(dets_raw):<5} | {r_class:<15} | {r_conf:<7} | {iou_r_str:<12} | -")
            
            # Condition 3: CLAHE only (No MedianBlur)
            gray = cv2.cvtColor(noisy_bgr, cv2.COLOR_BGR2GRAY)
            clahe_only = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8)).apply(gray)
            dets_clahe_only = detector.run(clahe_only, conf=0.20, use_clahe=False)
            top_co = dets_clahe_only[0] if dets_clahe_only else None
            iou_co = box_iou(base_top.bbox, top_co.bbox) if (base_top and top_co) else 0.0
            co_class = top_co.class_name if top_co else "None"
            co_conf = f"{top_co.confidence*100:.1f}%" if top_co else "N/A"
            iou_co_str = f"{iou_co:.3f}" if top_co else "N/A"
            print(f"sigma={scale:<6.2f} | CLAHE Only (NoBlur)| {len(dets_clahe_only):<5} | {co_class:<15} | {co_conf:<7} | {iou_co_str:<12} | -")
            
            img_results.append({
                "noise_scale": scale,
                "pipeline": {
                    "count": len(dets_pipeline),
                    "top_class": p_class,
                    "top_conf": float(top_p.confidence) if top_p else 0.0,
                    "iou_to_baseline": float(iou_p),
                    "shadow_pct": prep.shadow_coverage_pct,
                    "prep_time_ms": round(t_prep, 2)
                },
                "raw_no_clahe": {
                    "count": len(dets_raw),
                    "top_class": r_class,
                    "top_conf": float(top_r.confidence) if top_r else 0.0,
                    "iou_to_baseline": float(iou_r)
                },
                "clahe_only_no_blur": {
                    "count": len(dets_clahe_only),
                    "top_class": co_class,
                    "top_conf": float(top_co.confidence) if top_co else 0.0,
                    "iou_to_baseline": float(iou_co)
                }
            })
            
        results[img_p.name] = img_results
        
    out_json = Path(__file__).resolve().parent / "speckle_noise_benchmark.json"
    with open(out_json, "w") as f:
        json.dump(results, f, indent=2)
    print("\n" + "=" * 90)
    print(f"Speckle noise audit results saved to: {out_json}")
    print("=" * 90)

if __name__ == "__main__":
    run_speckle_audit()
