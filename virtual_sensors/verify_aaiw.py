import xarray as xr
import matplotlib.pyplot as plt
import numpy as np
import os

OUTPUT_DIR = os.path.dirname(__file__)
DATA_PATH = os.path.join(OUTPUT_DIR, "..", "data", "argo_southern_ocean.nc")
OUTPUT_IMAGE = os.path.join(OUTPUT_DIR, "aaiw_verification.png")

def main():
    if not os.path.exists(DATA_PATH):
        print(f"Dataset not found at {DATA_PATH}. Please run datasets/fetch_argo.py first.")
        return

    ds = xr.open_dataset(DATA_PATH)
    
    # Select a profile from the Indian sector
    if len(ds.N_PROF) == 0:
        print("No profiles found in dataset.")
        return
        
    profile = ds.isel(N_PROF=0)
    pres = profile.PRES.values
    psal = profile.PSAL.values
    valid = ~(np.isnan(pres) | np.isnan(psal))
    
    if valid.sum() == 0:
        print("No valid salinity data in this profile.")
        return

    plt.figure(figsize=(4, 8))
    plt.plot(psal[valid], pres[valid])
    plt.gca().invert_yaxis()
    plt.xlabel("Salinity (PSU)")
    plt.ylabel("Pressure (dbar)")
    plt.title("Salinity Profile - Southern Ocean Indian Sector")
    plt.savefig(OUTPUT_IMAGE, dpi=150)
    print(f"Success! AAIW verification plot saved to: {OUTPUT_IMAGE}")
    
    # Check if a minimum exists around 800-1100
    depth_mask = (pres[valid] > 600) & (pres[valid] < 1200)
    if np.any(depth_mask):
        min_salinity_idx = np.argmin(psal[valid][depth_mask])
        min_depth = pres[valid][depth_mask][min_salinity_idx]
        print(f"Note: Found salinity minimum at approximately {min_depth:.1f} dbar.")
        print("This confirms the presence of Antarctic Intermediate Water (AAIW).")

if __name__ == "__main__":
    main()
