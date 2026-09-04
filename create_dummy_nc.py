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

# Set reproducible seed for consistent profiles
np.random.seed(42)

# Southern Ocean Indian Sector (AAIW) realistic profiles
# TEMP: 1.5°C to 2.5°C with intermediate water temperature peak around 900 dbar
temp_base = 1.60 + 0.72 * np.exp(-((pres_2d - 900.0) ** 2) / (2 * 350.0 ** 2))
prof_temp_offset = np.random.uniform(-0.05, 0.05, (n_prof, 1))
temp_noise = np.random.normal(0, 0.02, (n_prof, n_levels))
temp_2d = np.clip(temp_base + prof_temp_offset + temp_noise, 1.51, 2.49)

# PSAL: 34.2 to 34.8 PSU with AAIW salinity minimum around 800-1000 dbar and deep saline core
psal_base = 34.40 - 0.18 * np.exp(-((pres_2d - 900.0) ** 2) / (2 * 200.0 ** 2)) + 0.32 / (1.0 + np.exp(-(pres_2d - 1300.0) / 200.0))
prof_psal_offset = np.random.uniform(-0.03, 0.03, (n_prof, 1))
psal_noise = np.random.normal(0, 0.01, (n_prof, n_levels))
psal_2d = np.clip(psal_base + prof_psal_offset + psal_noise, 34.21, 34.79)

# DOXY: Oxygen minimum zone (OMZ) at 200-400 dbar
doxy_base = 240.0 + 80.0 * np.exp(-pres_2d / 120.0) - 70.0 * np.exp(-((pres_2d - 300.0) ** 2) / (2 * 100.0 ** 2))
doxy_noise = np.random.normal(0, 3.0, (n_prof, n_levels))
doxy_2d = np.clip(doxy_base + doxy_noise, 150.0, 340.0)

# CHLA: Surface photosynthetic peak decaying exponentially with depth
chla_base = 0.85 * np.exp(-pres_2d / 60.0) + 0.02
chla_noise = np.random.normal(0, 0.01, (n_prof, n_levels))
chla_2d = np.clip(chla_base + chla_noise, 0.01, 1.50)

# PH: Surface equilibrium dropping slightly with pressure and respiration
ph_base = 8.12 - 0.25 * (pres_2d / 2000.0)
ph_noise = np.random.normal(0, 0.005, (n_prof, n_levels))
ph_2d = np.clip(ph_base + ph_noise, 7.70, 8.20)

# NITRATE: Nutrient consumption at surface, accumulation at depth
nitrate_base = 18.0 + 15.0 * (pres_2d / 2000.0)
nitrate_noise = np.random.normal(0, 0.3, (n_prof, n_levels))
nitrate_2d = np.clip(nitrate_base + nitrate_noise, 15.0, 35.0)

ds = xr.Dataset(
    {
        "PRES": (("N_PROF", "N_LEVELS"), pres_2d),
        "TEMP": (("N_PROF", "N_LEVELS"), temp_2d),
        "PSAL": (("N_PROF", "N_LEVELS"), psal_2d),
        "DOXY": (("N_PROF", "N_LEVELS"), doxy_2d),
        "CHLA": (("N_PROF", "N_LEVELS"), chla_2d),
        "PH_IN_SITU_TOTAL": (("N_PROF", "N_LEVELS"), ph_2d),
        "NITRATE": (("N_PROF", "N_LEVELS"), nitrate_2d),
        "LATITUDE": (("N_PROF",), np.random.uniform(-58.0, -50.0, n_prof)),
        "LONGITUDE": (("N_PROF",), np.random.uniform(55.0, 70.0, n_prof)),
        "PLATFORM_NUMBER": (("N_PROF",), np.random.randint(1000000, 9999999, n_prof)),
    },
    coords={
        "N_PROF": n_prof_arr,
        "N_LEVELS": np.arange(n_levels)
    }
)

ds.to_netcdf("data/argo_southern_ocean.nc")
print("Created dummy data/argo_southern_ocean.nc (Southern Ocean AAIW calibrated)")
