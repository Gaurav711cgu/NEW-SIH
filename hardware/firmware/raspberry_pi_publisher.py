import time
import json
import random
import paho.mqtt.client as mqtt

# --- CONFIGURATION ---
MQTT_BROKER = "192.168.x.x"  # Mac's IP address on the Mobile Hotspot
MQTT_PORT = 1883
TOPIC = "aquila/telemetry/live"

def get_sensor_data():
    # Friend can replace this with actual Raspberry Pi GPIO/I2C sensor reading code
    # e.g., using smbus2 for BMP280, or w1thermsensor for DS18B20
    return {
        "temperature_c": round(random.uniform(2.0, 15.0), 2),
        "pressure_dbar": round(random.uniform(10.0, 500.0), 2),
        "depth_m": round(random.uniform(10.0, 500.0), 2)
    }

def main():
    client = mqtt.Client(client_id="rpi_aquila")
    
    print(f"Connecting to MQTT Broker at {MQTT_BROKER}...")
    try:
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
    except Exception as e:
        print(f"Connection failed: {e}. Check IP address and hotspot.")
        return

    client.loop_start()
    
    print(f"Connected! Publishing data to {TOPIC}...")
    try:
        while True:
            data = get_sensor_data()
            payload = json.dumps(data)
            client.publish(TOPIC, payload)
            print(f"Published: {payload}")
            time.sleep(1.5)  # Send data every 1.5 seconds
    except KeyboardInterrupt:
        print("Stopping publisher...")
    finally:
        client.loop_stop()
        client.disconnect()

if __name__ == "__main__":
    main()
