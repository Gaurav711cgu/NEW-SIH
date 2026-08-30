"""
ai_pipeline/preprocessor.py
---------------------------
Side-Scan Sonar (SSS) acoustic image preprocessor.
Implements speckle noise reduction (median filter), CLAHE local contrast enhancement,
and acoustic shadow segmentation mask generation.
"""
import cv2
import numpy as np
import logging
from pathlib import Path
from dataclasses import dataclass
from typing import Optional, Union

logger = logging.getLogger(__name__)

@dataclass
class PreprocessResult:
    enhanced: np.ndarray
    denoised: np.ndarray
    shadow_mask: Optional[np.ndarray] = None
    original: Optional[np.ndarray] = None


class SonarPreprocessor:
    """
    Production-grade preprocessor for Side-Scan Sonar (SSS) imagery.
    Implements speckle noise reduction and Contrast Limited Adaptive Histogram Equalization (CLAHE).
    """
    def __init__(self, clip_limit: float = 2.0, tile_grid_size: tuple = (8, 8), shadow_thresh: int = 40):
        self.clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=tile_grid_size)
        self.shadow_thresh = shadow_thresh

    def process(self, image: np.ndarray) -> np.ndarray:
        """
        Runs the full sonar enhancement pipeline and returns 3-channel enhanced image.
        """
        if image is None or image.size == 0:
            return image

        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image.copy()

        denoised = cv2.medianBlur(gray, 3)
        enhanced = self.clahe.apply(denoised)
        final_img = cv2.cvtColor(enhanced, cv2.COLOR_GRAY2BGR)
        return final_img

    def extract_shadow_mask(self, gray_img: np.ndarray) -> np.ndarray:
        """
        Extracts acoustic shadow mask from dark pixel clusters.
        """
        # Pixels below shadow threshold
        _, raw_mask = cv2.threshold(gray_img, self.shadow_thresh, 255, cv2.THRESH_BINARY_INV)
        # Morphological closing to merge shadow patches
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (15, 5))
        closed_mask = cv2.morphologyEx(raw_mask, cv2.MORPH_CLOSE, kernel)
        return closed_mask


def preprocess(img: np.ndarray) -> np.ndarray:
    preprocessor = SonarPreprocessor()
    return preprocessor.process(img)


def preprocess_sss(image_input: Union[str, Path, np.ndarray]) -> PreprocessResult:
    """
    Accepts an image path (str/Path) or numpy array and returns a PreprocessResult
    containing enhanced 3-channel image, denoised image, shadow mask, and original image.
    """
    if isinstance(image_input, (str, Path)):
        img_path = str(image_input)
        img = cv2.imread(img_path)
        if img is None:
            raise ValueError(f"Could not read image from path: {img_path}")
    elif isinstance(image_input, np.ndarray):
        img = image_input
    else:
        raise TypeError(f"Unsupported image input type: {type(image_input)}")

    if len(img.shape) == 3:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    else:
        gray = img.copy()

    # Speckle noise reduction
    denoised = cv2.medianBlur(gray, 3)
    
    # CLAHE contrast enhancement
    clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
    enhanced_gray = clahe.apply(denoised)
    enhanced_bgr = cv2.cvtColor(enhanced_gray, cv2.COLOR_GRAY2BGR)

    # Shadow segmentation mask
    _, shadow_raw = cv2.threshold(enhanced_gray, 40, 255, cv2.THRESH_BINARY_INV)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (15, 5))
    shadow_mask = cv2.morphologyEx(shadow_raw, cv2.MORPH_CLOSE, kernel)

    return PreprocessResult(
        enhanced=enhanced_bgr,
        denoised=denoised,
        shadow_mask=shadow_mask,
        original=img
    )
