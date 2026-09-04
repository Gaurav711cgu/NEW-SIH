import cv2
import numpy as np
from pathlib import Path
from typing import Union
from dataclasses import dataclass

@dataclass
class PreprocessedImage:
    original: np.ndarray
    processed: np.ndarray
    shadow_mask: np.ndarray
    shadow_coverage_pct: float

    @property
    def enhanced(self) -> np.ndarray:
        """Alias for processed image to ensure seamless compatibility with api/main.py."""
        return self.processed

def preprocess_sss(image_input: Union[str, Path, np.ndarray]) -> PreprocessedImage:
    """
    Applies the standard SSS preprocessing chain.

    Justification for each step:

    Median filter: Side-scan sonar images contain multiplicative speckle
    noise from coherent acoustic interference. Median filtering is preferred
    over Gaussian for speckle because it preserves edges (debris boundaries)
    while suppressing noise, consistent with published SSS processing
    literature (Cervenka and de Moustier, 1993).

    CLAHE: Sonar imagery has strong contrast variation along the range
    direction (near-field strong return, far-field weak return). CLAHE
    normalises local contrast without clipping global brightness, making
    targets at different ranges equally visible to the detector.

    Shadow masking: Acoustic shadows are the primary source of false
    positives in SSS target detection. Objects occlude insonification
    and produce a dark band in the direction away from the sonar.
    Natural rock formations produce similar shadows. Identifying shadow
    zones allows downstream confidence calibration.
    """
    if isinstance(image_input, np.ndarray):
        if len(image_input.shape) == 3:
            img = cv2.cvtColor(image_input, cv2.COLOR_BGR2GRAY)
        else:
            img = image_input.copy()
    else:
        img = cv2.imread(str(image_input), cv2.IMREAD_GRAYSCALE)
        if img is None:
            raise FileNotFoundError(f"Cannot read image: {image_input}")

    # Stage 1: Speckle reduction
    denoised = cv2.medianBlur(img, 5)

    # Stage 2: CLAHE
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(denoised)

    # Stage 3: Acoustic shadow detection
    # Shadow zones appear as sustained low-intensity regions
    # adjacent to high-intensity returns (object highlights)
    _, dark_mask = cv2.threshold(enhanced, 40, 255, cv2.THRESH_BINARY_INV)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (20, 8))
    shadow_zones = cv2.morphologyEx(dark_mask, cv2.MORPH_CLOSE, kernel)

    coverage = float(np.sum(shadow_zones > 0)) / shadow_zones.size

    return PreprocessedImage(
        original=img,
        processed=enhanced,
        shadow_mask=shadow_zones,
        shadow_coverage_pct=round(coverage * 100, 1)
    )
