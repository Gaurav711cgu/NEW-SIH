import numpy as np
import xarray as xr
import os

os.makedirs('data', exist_ok=True)

n_prof = 100
n_levels = 50

n_prof_arr = np.arange(n_prof)
pres_arr = np.linspace(0, 2000, n_levels)

# Create 2D arrays (N_PROF, N_LEVELS)
pres_2d = np.tile(pres_arr, (n_prof, 1))

ds = xr.Dataset(
    {
        "PRES": (("N_PROF", "N_LEVELS"), pres_2d),
        "TEMP": (("N_PROF", "N_LEVELS"), 25 - pres_2d * 0.01 + np.random.randn(n_prof, n_levels)),
        "PSAL": (("N_PROF", "N_LEVELS"), 35 + np.random.randn(n_prof, n_levels) * 0.1),
        "DOXY": (("N_PROF", "N_LEVELS"), 200 - pres_2d * 0.05 + np.random.randn(n_prof, n_levels) * 10),
        "CHLA": (("N_PROF", "N_LEVELS"), np.exp(-pres_2d/100) + np.random.randn(n_prof, n_levels) * 0.1),
        "PH_IN_SITU_TOTAL": (("N_PROF", "N_LEVELS"), 8.1 - pres_2d * 0.0001 + np.random.randn(n_prof, n_levels) * 0.01),
        "NITRATE": (("N_PROF", "N_LEVELS"), 10 + pres_2d * 0.01 + np.random.randn(n_prof, n_levels)),
        "LATITUDE": (("N_PROF",), np.random.uniform(-75, -40, n_prof)),
        "LONGITUDE": (("N_PROF",), np.random.uniform(20, 90, n_prof)),
        "PLATFORM_NUMBER": (("N_PROF",), np.random.randint(1000000, 9999999, n_prof)),
    },
    coords={
        "N_PROF": n_prof_arr,
        "N_LEVELS": np.arange(n_levels)
    }
)

ds.to_netcdf("data/argo_southern_ocean.nc")
print("Created dummy data/argo_southern_ocean.nc")
