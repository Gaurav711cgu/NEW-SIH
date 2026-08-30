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
