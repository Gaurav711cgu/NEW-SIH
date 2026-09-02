import numpy as np
import xarray as xr
from scipy.interpolate import interp1d
from pathlib import Path
from typing import Optional

class ProfileInterpolator:
    """
    Interpolates oceanographic parameters from a real Argo profile
    at arbitrary depth points.

    The profile selection uses spatial nearest-neighbour from the
    available profiles in the loaded dataset. This means at any
    simulated platform position, the virtual sensor values reflect
    a real Southern Ocean profile collected in that geographic region.
    """

    PARAMETERS = ["TEMP", "PSAL", "DOXY", "CHLA", "PH_IN_SITU_TOTAL", "NITRATE"]

    def __init__(self, dataset_path: str = "data/argo_southern_ocean.nc"):
        self.ds = xr.open_dataset(dataset_path)
        self._build_profile_index()

    def _build_profile_index(self):
        """Build a searchable index of profile positions."""
        self.profile_lats = self.ds.LATITUDE.values
        self.profile_lons = self.ds.LONGITUDE.values
        self.n_profiles = len(self.ds.N_PROF)

    def select_nearest_profile(self, lat: float, lon: float) -> int:
        """Return index of the geographically nearest profile."""
        dist = np.sqrt(
            (self.profile_lats - lat) ** 2 +
            (self.profile_lons - lon) ** 2
        )
        return int(np.argmin(dist))

    def get_value_at_depth(
        self,
        profile_idx: int,
        depth_m: float,
        parameter: str
    ) -> Optional[float]:
        """
        Returns interpolated parameter value at given depth.
        Returns None if insufficient valid data points exist.
        """
        try:
            profile = self.ds.isel(N_PROF=profile_idx)
            pressures = profile.PRES.values
            values = profile[parameter].values

            # Filter NaN (failed QC)
            valid = ~(np.isnan(pressures) | np.isnan(values))
            if valid.sum() < 4:
                return None

            f = interp1d(
                pressures[valid],
                values[valid],
                kind="cubic",
                bounds_error=False,
                fill_value=(values[valid][0], values[valid][-1])
            )
            return float(f(depth_m))
        except Exception:
            return None

    def get_full_profile(self, profile_idx: int, parameter: str) -> dict:
        """
        Returns the full depth profile for a parameter.
        Used for dashboard depth profile plots.
        """
        profile = self.ds.isel(N_PROF=profile_idx)
        pressures = profile.PRES.values
        values = profile[parameter].values
        valid = ~(np.isnan(pressures) | np.isnan(values))
        return {
            "depth": pressures[valid].tolist(),
            "values": values[valid].tolist(),
            "units": self._get_units(parameter),
            "wmo": str(profile.PLATFORM_NUMBER.values)
        }

    def _get_units(self, parameter: str) -> str:
        units = {
            "TEMP": "deg C", "PSAL": "PSU", "DOXY": "micromol/kg",
            "CHLA": "mg/m3", "PH_IN_SITU_TOTAL": "pH units",
            "NITRATE": "micromol/kg"
        }
        return units.get(parameter, "")
