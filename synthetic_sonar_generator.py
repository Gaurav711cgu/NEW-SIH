import cv2
import numpy as np
import os
import traceback

def add_rayleigh_noise(image, scale=0.79):
    """
    Adds multiplicative Rayleigh speckle noise to the image.
    scale=0.79 gives a mean of roughly 1.0 for the Rayleigh distribution.
    """
    # numpy.random.rayleigh(scale, size)
    noise = np.random.rayleigh(scale, size=image.shape)
    
    # Multiplicative noise: I = I_original * noise
    noisy_image = image.astype(np.float32) * noise
    noisy_image = np.clip(noisy_image, 0, 255).astype(np.uint8)
    return noisy_image

def simulate_acoustic_shadow(image):
    """
    Simulates acoustic shadow assuming the sonar sensor is on the left.
    Bright objects cast a shadow to the right.
    """
    shadow_map = np.ones_like(image, dtype=np.float32)
    decay_factor = 0.90  # How fast the shadow dissipates (higher = longer shadow)
    
    current_shadow = np.zeros(image.shape[0], dtype=np.float32)
    
    for col in range(image.shape[1]):
        # Normalize pixel intensities
        intensities = image[:, col] / 255.0
        
        # Bright pixels represent taller/more reflective objects
        # They cast a new shadow proportional to their brightness
        new_shadow = intensities * 1.5 
        
        # Propagate the shadow
        current_shadow = np.maximum(current_shadow * decay_factor, new_shadow)
        
        # Shadows only affect the background, not the object itself
        is_object = intensities > 0.2
        
        # Calculate illumination (1.0 = fully illuminated, 0.0 = full shadow)
        # Base illumination is 0.1 to avoid completely black shadows (ambient scatter)
        illumination = np.clip(1.0 - current_shadow, 0.1, 1.0)
        
        shadow_map[:, col] = np.where(is_object, 1.0, illumination)
        
    shadowed_image = image.astype(np.float32) * shadow_map
    return np.clip(shadowed_image, 0, 255).astype(np.uint8)

def generate_synthetic_sonar(input_image_path, output_image_path):
    """
    Reads an optical image and generates a synthetic Side-Scan Sonar (SSS) image.
    """
    try:
        # 1. Read input image and convert to Grayscale
        img = cv2.imread(input_image_path, cv2.IMREAD_GRAYSCALE)
        if img is None:
            raise FileNotFoundError(f"Could not read image at {input_image_path}")

        # 2. Add acoustic shadow
        # Simulates the shadow cast by objects blocking the acoustic ping
        shadowed = simulate_acoustic_shadow(img)
        
        # 3. Add Rayleigh Speckle Noise
        # Sonar images suffer from multiplicative speckle noise
        noisy = add_rayleigh_noise(shadowed, scale=0.79)
        
        # 4. Apply golden/bronze colormap
        # COLORMAP_BONE gives a typical sonar palette. 
        # (You can also experiment with COLORMAP_HOT or COLORMAP_PINK for bronze tints)
        sonar_color = cv2.applyColorMap(noisy, cv2.COLORMAP_BONE)
        
        # 5. Save output
        os.makedirs(os.path.dirname(os.path.abspath(output_image_path)), exist_ok=True)
        cv2.imwrite(output_image_path, sonar_color)
        print(f"Successfully generated synthetic sonar image at:\n  -> {output_image_path}")
        
    except Exception as e:
        print(f"Error generating synthetic sonar: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    # Create a dummy image for testing
    script_dir = os.path.dirname(os.path.abspath(__file__))
    testing_dir = os.path.join(script_dir, "testing_images")
    os.makedirs(testing_dir, exist_ok=True)
    
    dummy_path = os.path.join(testing_dir, "dummy_input.jpg")
    out_path = os.path.join(testing_dir, "synthetic_sample.jpg")
    
    # Draw a white square on a black background to simulate an object
    dummy_img = np.zeros((300, 400), dtype=np.uint8)
    cv2.rectangle(dummy_img, (150, 100), (200, 200), 255, -1)
    
    cv2.imwrite(dummy_path, dummy_img)
    print(f"Created dummy clean input image at:\n  -> {dummy_path}")
    
    # Process the dummy image
    generate_synthetic_sonar(dummy_path, out_path)
