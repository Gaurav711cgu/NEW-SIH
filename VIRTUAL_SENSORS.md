# Virtual Ocean Sensor Engine

## Purpose

The virtual sensor engine validates the complete data acquisition, storage, processing, and visualisation architecture before expensive oceanographic instruments are procured. It uses real, quality-controlled oceanographic data from published datasets rather than random number generation.

This approach is not a compromise. It is a deliberate systems engineering decision: the data pipeline does not care whether a value was produced by a physical sensor or retrieved from a validated dataset. The subscriber, database schema, and dashboard components are identical in both cases. Only the source label changes.

---

## Why This Approach Is Scientifically Valid

The Argo programme has demonstrated that ocean observation can be conducted by autonomous platforms using standardised sensors and data protocols. The BGC-Argo extension adds biogeochemical sensors to the same platform class. Both programmes produce publicly available, quality-controlled profile data that is used directly by NCPOR for its Southern Ocean research programme.

Using BGC-Argo profiles as the virtual sensor source means our virtual dissolved oxygen, chlorophyll, and nitrate values are drawn from the same dataset that NCPOR itself uses to study the Southern Ocean. The data is not simulated. It is real oceanographic data from real float deployments in the target region, replayed through our pipeline.

Precedent: The HIDA (Helmholtz Information and Data Analytics) hackathon explicitly defines a track for teams using high-quality labelled data from prior missions with similar sensors to validate data pipelines. This is the same methodology.

---

## Data Sources

### Primary: BGC-Argo via argopy

BGC-Argo provides biogeochemical profiles from autonomous floats globally. The Southern Ocean, specifically the Indian sector (20E-90E, 75S-40S), is covered by the SOCCOM (Southern Ocean Carbon and Climate Observations and Modeling) project with approximately 200 active floats.

Target float WMO numbers for the Indian sector of the Southern Ocean:
- WMO 5904859 (SOCCOM, Indian sector)
- WMO 5905003 (SOCCOM, Indian sector)
- WMO 5904468 (Argo, temperature/salinity primary)

Parameters available:
- PRES (pressure, dbar)
- TEMP (temperature, deg C)
- PSAL (practical salinity, PSU)
- DOXY (dissolved oxygen, micromol/kg)
- CHLA (chlorophyll-a, mg/m3)
- BBP700 (particulate backscattering, m-1)
- PH_IN_SITU_TOTAL (in-situ pH)
- NITRATE (nitrate, micromol/kg)

### Secondary: Copernicus CMEMS

Used for current velocity (u, v components) which is not measured by profiling floats. Product: GLOBAL_MULTIYEAR_PHY_001_030. Variables: uo, vo, depth, time.

---

## Data Fetching

```python
# datasets/fetch_argo.py
"""
Fetches BGC-Argo profiles for the Southern Ocean Indian sector.
Run once. Output saved to data/argo_southern_ocean.nc
"""

import argopy
from argopy import DataFetcher
import xarray as xr
import os

OUTPUT_PATH = "data/argo_southern_ocean.nc"

# Southern Ocean Indian sector bounding box
LON_MIN, LON_MAX = 20, 90
LAT_MIN, LAT_MAX = -75, -40
DEPTH_MIN, DEPTH_MAX = 0, 2000
DATE_START, DATE_END = "2018-01", "2024-12"

def fetch_and_save():
    os.makedirs("data", exist_ok=True)

    print("Fetching BGC-Argo profiles. This may take several minutes.")

    fetcher = DataFetcher(
        src="gdac",
        mode="standard"
    ).region([
        LON_MIN, LON_MAX,
        LAT_MIN, LAT_MAX,
        DEPTH_MIN, DEPTH_MAX,
        DATE_START, DATE_END
    ])

    ds = fetcher.to_xarray()

    # Apply quality control: keep only QC flag = 1 (good data)
    params_to_qc = ["TEMP", "PSAL", "DOXY", "CHLA", "PH_IN_SITU_TOTAL", "NITRATE"]
    for param in params_to_qc:
        if param in ds:
            qc_var = f"{param}_QC"
            if qc_var in ds:
                ds[param] = ds[param].where(ds[qc_var] == 1)

    ds.to_netcdf(OUTPUT_PATH)
    print(f"Saved {len(ds.N_PROF)} profiles to {OUTPUT_PATH}")
    print(f"Float WMO numbers: {ds.PLATFORM_NUMBER.values[:10]}")

if __name__ == "__main__":
    fetch_and_save()
```

---

## Profile Interpolation

The mission simulator descends through a depth range. At each depth point, the interpolator retrieves the parameter value from the nearest real Argo profile using cubic interpolation.

```python
# virtual_sensors/profile_interpolator.py

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
```

---

## Noise Engine

Real sensors do not produce exact values. They exhibit Gaussian measurement noise, temporally correlated (AR(1)) noise from electronic drift, slow long-term drift due to fouling or electrode degradation, and occasional signal loss from communication interference or sensor failure.

The noise model uses published accuracy specifications from the Argo data management documentation as the standard deviation for the Gaussian component.

```python
# virtual_sensors/noise_engine.py

import numpy as np
from dataclasses import dataclass
from typing import Optional

@dataclass
class SensorSpec:
    # Gaussian noise standard deviation (matches published sensor accuracy)
    noise_std: float
    # AR(1) autocorrelation coefficient (0 = white noise, 1 = random walk)
    ar1_rho: float
    # Drift rate per reading (simulates biofouling / electrode degradation)
    drift_rate: float
    # Probability of single-reading dropout per sample
    dropout_prob: float
    # Probability of extended outage starting per sample
    outage_start_prob: float
    # Duration of outage in readings (geometric distribution mean)
    outage_mean_duration: int


# Sensor accuracy specifications from Argo User Manual (Version 3.41, 2023)
# and published BGC-Argo quality control documentation.
SENSOR_SPECS = {
    "TEMP":              SensorSpec(0.002,  0.70, 0.00005, 0.005, 0.002, 5),
    "PSAL":              SensorSpec(0.010,  0.70, 0.00010, 0.005, 0.002, 5),
    "DOXY":              SensorSpec(2.000,  0.80, 0.02000, 0.010, 0.005, 8),
    "CHLA":              SensorSpec(0.020,  0.60, 0.00050, 0.020, 0.008, 10),
    "PH_IN_SITU_TOTAL":  SensorSpec(0.005,  0.75, 0.00010, 0.010, 0.003, 6),
    "NITRATE":           SensorSpec(0.500,  0.80, 0.01000, 0.010, 0.004, 7),
}


class VirtualSensor:
    """
    Wraps a real Argo profile value with a physically realistic
    sensor behaviour model.

    Noise model components:
    1. Gaussian measurement noise (instantaneous electronic noise)
    2. AR(1) correlated noise (short-term electronic drift)
    3. Linear accumulating drift (biofouling, electrode aging)
    4. Random dropout (communication interference, transient failure)
    5. Extended outage with recovery (extended sensor failure)

    The AR(1) and Gaussian noise model is consistent with the approach
    used in virtual sensing literature for autonomous underwater vehicles
    (see: arxiv:2412.00107, Aguiar et al., 2024).
    """

    def __init__(self, parameter: str):
        if parameter not in SENSOR_SPECS:
            raise ValueError(f"Unknown parameter: {parameter}")
        self.parameter = parameter
        self.spec = SENSOR_SPECS[parameter]
        self.prev_ar1 = 0.0
        self.drift_accumulator = 0.0
        self.reading_count = 0
        self.outage_remaining = 0

    def read(self, true_value: float) -> tuple[Optional[float], Optional[float], str]:
        """
        Args:
            true_value: interpolated value from real Argo profile

        Returns:
            (measured_value, uncertainty_2sigma, status)
            measured_value is None during outages.
            status is one of: ONLINE, DROPOUT, OUTAGE, RECOVERING
        """
        self.reading_count += 1

        # Check for extended outage
        if self.outage_remaining > 0:
            self.outage_remaining -= 1
            status = "OUTAGE" if self.outage_remaining > 0 else "RECOVERING"
            return None, None, status

        # Start new extended outage
        if np.random.random() < self.spec.outage_start_prob:
            self.outage_remaining = np.random.geometric(
                1.0 / self.spec.outage_mean_duration
            )
            return None, None, "OUTAGE"

        # Single-reading dropout
        if np.random.random() < self.spec.dropout_prob:
            return None, None, "DROPOUT"

        # Gaussian measurement noise
        gaussian = np.random.normal(0, self.spec.noise_std)

        # AR(1) correlated noise
        self.prev_ar1 = (
            self.spec.ar1_rho * self.prev_ar1 +
            np.random.normal(0, self.spec.noise_std * 0.3)
        )

        # Long-term drift (accumulates over mission lifetime)
        self.drift_accumulator += (
            self.spec.drift_rate *
            np.random.normal(1.0, 0.2)
        )

        measured = true_value + gaussian + self.prev_ar1 + self.drift_accumulator

        # 2-sigma uncertainty (reported on dashboard)
        uncertainty = 2.0 * self.spec.noise_std

        return round(measured, 4), round(uncertainty, 4), "ONLINE"

    def reset_drift(self):
        """Called when sensor is recalibrated (post-deployment maintenance)."""
        self.drift_accumulator = 0.0
        self.prev_ar1 = 0.0
```

---

## Virtual Publisher

The virtual publisher runs as a separate process alongside the ESP32 hardware publisher. Both publish to the same MQTT broker. The subscriber receives messages from both and routes them to the database with their source labels intact.

```python
# virtual_sensors/virtual_publisher.py

import json
import time
import paho.mqtt.client as mqtt
from profile_interpolator import ProfileInterpolator
from noise_engine import VirtualSensor, SENSOR_SPECS
from mission_fsm import MissionFSM

MQTT_BROKER = "localhost"
MQTT_PORT   = 1883
PLATFORM_ID = "001"

VIRTUAL_PARAMETERS = {
    "DOXY":             {"display": "dissolved_oxygen", "unit": "micromol/kg"},
    "CHLA":             {"display": "chlorophyll",      "unit": "mg/m3"},
    "PH_IN_SITU_TOTAL": {"display": "ph_virtual",      "unit": "pH"},
    "NITRATE":          {"display": "nitrate",          "unit": "micromol/kg"},
}

# Southern Ocean Indian sector reference position
# Matches the geographic region of the BGC-Argo profiles used
REFERENCE_LAT = -54.2
REFERENCE_LON = 60.8


def main():
    interpolator = ProfileInterpolator()
    profile_idx = interpolator.select_nearest_profile(REFERENCE_LAT, REFERENCE_LON)

    sensors = {param: VirtualSensor(param) for param in VIRTUAL_PARAMETERS}

    mission = MissionFSM()

    client = mqtt.Client(client_id=f"virtual_publisher_{PLATFORM_ID}")
    client.connect(MQTT_BROKER, MQTT_PORT)
    client.loop_start()

    print(f"Virtual publisher started. Using Argo profile index {profile_idx}")
    print(f"Float WMO: {interpolator.ds.isel(N_PROF=profile_idx).PLATFORM_NUMBER.values}")

    while True:
        current_depth = mission.current_depth()
        phase = mission.current_phase()

        for param, meta in VIRTUAL_PARAMETERS.items():
            true_value = interpolator.get_value_at_depth(
                profile_idx, current_depth, param
            )
            if true_value is None:
                continue

            measured, uncertainty, status = sensors[param].read(true_value)

            payload = {
                "sensor":          meta["display"],
                "value":           measured,
                "uncertainty":     uncertainty,
                "unit":            meta["unit"],
                "source":          "VIRTUAL_BGC_ARGO",
                "dataset":         "BGC-Argo Southern Ocean Indian sector",
                "qc_flag":         1,
                "depth_m":         current_depth,
                "mission_phase":   phase,
                "status":          status,
                "platform":        PLATFORM_ID,
                "timestamp":       time.time()
            }

            topic = f"platform/{PLATFORM_ID}/sensors/virtual/{meta['display']}"
            client.publish(topic, json.dumps(payload), retain=True)

        mission.step()
        time.sleep(2)


if __name__ == "__main__":
    main()
```

---

## Validation

The virtual sensor engine must be validated against withheld real data before the demo.

```python
# virtual_sensors/validator.py

import numpy as np
import xarray as xr
from sklearn.metrics import mean_absolute_error
from scipy.stats import pearsonr
from profile_interpolator import ProfileInterpolator

def validate_interpolation_accuracy(
    dataset_path: str = "data/argo_southern_ocean.nc",
    test_fraction: float = 0.2
) -> dict:
    """
    Splits profiles 80/20, trains interpolator on 80%, validates on 20%.
    Reports MAE, RMSE, and R-squared for each parameter.

    This is the validation result to present to judges when asked
    about the accuracy of the virtual sensor data.
    """
    ds = xr.open_dataset(dataset_path)
    n = len(ds.N_PROF)
    test_idx = np.random.choice(n, int(n * test_fraction), replace=False)
    train_idx = np.setdiff1d(np.arange(n), test_idx)

    interpolator = ProfileInterpolator.__new__(ProfileInterpolator)
    interpolator.ds = ds.isel(N_PROF=train_idx)
    interpolator._build_profile_index()

    results = {}
    params = ["DOXY", "CHLA", "PH_IN_SITU_TOTAL", "NITRATE"]

    for param in params:
        y_true, y_pred = [], []
        for idx in test_idx[:50]:  # limit for speed
            profile = ds.isel(N_PROF=idx)
            lat = float(profile.LATITUDE)
            lon = float(profile.LONGITUDE)
            nearest = interpolator.select_nearest_profile(lat, lon)

            pressures = profile.PRES.values
            values = profile[param].values
            valid = ~(np.isnan(pressures) | np.isnan(values))
            for p, v in zip(pressures[valid], values[valid]):
                pred = interpolator.get_value_at_depth(nearest, p, param)
                if pred is not None:
                    y_true.append(v)
                    y_pred.append(pred)

        if len(y_true) > 10:
            y_true = np.array(y_true)
            y_pred = np.array(y_pred)
            rmse = np.sqrt(np.mean((y_true - y_pred) ** 2))
            mae = mean_absolute_error(y_true, y_pred)
            r2 = pearsonr(y_true, y_pred)[0] ** 2
            results[param] = {
                "MAE":  round(mae, 4),
                "RMSE": round(rmse, 4),
                "R2":   round(r2, 4),
                "n_points": len(y_true)
            }

    return results


if __name__ == "__main__":
    results = validate_interpolation_accuracy()
    print("\nVirtual Sensor Validation Results")
    print("Dataset: BGC-Argo Southern Ocean Indian sector (20E-90E, 75S-40S)")
    print("Method: 80/20 profile split, cubic interpolation\n")
    for param, metrics in results.items():
        print(f"{param}")
        print(f"  MAE:  {metrics['MAE']}")
        print(f"  RMSE: {metrics['RMSE']}")
        print(f"  R2:   {metrics['R2']}")
        print(f"  N:    {metrics['n_points']}\n")
```

Run this validation before the demo. Record the output. When a judge asks "how do you know your virtual DO is accurate?", the answer is: "We split the BGC-Argo dataset 80/20, trained the interpolator on the training set, and validated on the withheld profiles. Our dissolved oxygen MAE is [value] micromol/kg against real measurements. The results are in our validation report."

---

## Antarctic Intermediate Water Verification

The Antarctic Intermediate Water (AAIW) is a distinctive Southern Ocean water mass identifiable as a salinity minimum at approximately 800-1000m depth. If our dataset is genuinely drawn from the Southern Ocean, the salinity depth profile must show this feature.

After fetching the dataset, run:

```python
import xarray as xr
import matplotlib.pyplot as plt

ds = xr.open_dataset("data/argo_southern_ocean.nc")
# Select a profile from the Indian sector
profile = ds.isel(N_PROF=0)
pres = profile.PRES.values
psal = profile.PSAL.values
valid = ~(np.isnan(pres) | np.isnan(psal))

plt.figure(figsize=(4, 8))
plt.plot(psal[valid], pres[valid])
plt.gca().invert_yaxis()
plt.xlabel("Salinity (PSU)")
plt.ylabel("Pressure (dbar)")
plt.title("Salinity Profile - Southern Ocean Indian Sector")
plt.savefig("aaiw_verification.png", dpi=150)
```

The resulting plot should show a clear salinity minimum between 800-1100 dbar. This is the AAIW signature. Save this plot and include it in the demo as evidence of dataset geographic validity.

If a judge asks "does your data show the Antarctic Intermediate Water?", display this plot. A fabricated or wrong-region dataset will not show the correct feature. A real Southern Ocean dataset will.
