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
