import xarray as xr
import matplotlib.pyplot as plt
import os
import sys

def verify_doxy(nc_path):
    print(f"Loading data from {nc_path}...")
    ds = xr.open_dataset(nc_path)
    
    # DOXY vs PRES
    if 'DOXY' not in ds.data_vars or 'PRES' not in ds.data_vars:
        print("Missing DOXY or PRES in dataset.")
        return
        
    plt.figure(figsize=(6, 8))
    
    # Plot DOXY vs Depth (PRES)
    doxy = ds['DOXY'].values.flatten()
    pres = ds['PRES'].values.flatten()
    
    # Filter NaNs
    valid = (~sys.modules['numpy'].isnan(doxy)) & (~sys.modules['numpy'].isnan(pres))
    doxy = doxy[valid]
    pres = pres[valid]
    
    plt.scatter(doxy, pres, alpha=0.1, s=1, color='green')
    plt.gca().invert_yaxis()
    plt.xlabel('Dissolved Oxygen (DOXY) [µmol/kg]')
    plt.ylabel('Pressure (PRES) [dbar]')
    plt.title('Southern Ocean Oxygen Minimum Zone (OMZ)')
    
    # Highlight OMZ region (200-400 dbar typically)
    plt.axhspan(200, 400, color='yellow', alpha=0.2, label='Expected OMZ (200-400 dbar)')
    
    plt.legend()
    plt.grid(True, linestyle='--', alpha=0.7)
    
    out_path = os.path.join(os.path.dirname(nc_path), '../virtual_sensors/doxy_verification.png')
    plt.savefig(out_path, dpi=150, bbox_inches='tight')
    print(f"Successfully saved DOXY verification plot to {out_path}")

if __name__ == "__main__":
    # We must import numpy here to avoid early failures if numpy isn't loaded correctly
    import numpy as np
    nc_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../data/argo_southern_ocean.nc'))
    if os.path.exists(nc_path):
        verify_doxy(nc_path)
    else:
        print("Dataset not found at", nc_path)
