import sys
from synthetic_sonar_generator import generate_synthetic_sonar

img = 'testing_images/02_sunken_vessel_hull_structure.jpg'
out = 'testing_images/synthetic_02_sunken_vessel_hull_structure.jpg'
generate_synthetic_sonar(img, out)
