# platform/mqtt_subscriber.py

import json
import paho.mqtt.client as mqtt
from database import initialise, insert_reading

MQTT_BROKER = "localhost"
MQTT_PORT   = 1883
PLATFORM_ID = "001"

initialise()


def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload.decode())

        # Normalise virtual topic to same schema as real
        if "/virtual/" in msg.topic:
            payload["source"] = payload.get("source", "VIRTUAL")

        insert_reading(payload)

    except json.JSONDecodeError:
        print(f"Invalid JSON on topic {msg.topic}")
    except Exception as e:
        print(f"Error processing message: {e}")


def on_connect(client, userdata, flags, rc):
    if rc == 0:
        client.subscribe(f"platform/{PLATFORM_ID}/sensors/#")
        client.subscribe(f"platform/{PLATFORM_ID}/sonar/#")
        client.subscribe(f"platform/{PLATFORM_ID}/mission/#")
        print(f"Subscriber connected. Listening on platform/{PLATFORM_ID}/#")
    else:
        print(f"Connection failed with code {rc}")


client = mqtt.Client(client_id="subscriber_001")
client.on_connect = on_connect
client.on_message = on_message
client.connect(MQTT_BROKER, MQTT_PORT)
client.loop_forever()
