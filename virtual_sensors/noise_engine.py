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
