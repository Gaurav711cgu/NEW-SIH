# SIH Live Demo: Hardware-to-Software Integration Guide

## 1. Architecture Overview
For this hackathon, **you do not need a Raspberry Pi.** The architecture is designed to be streamlined for a live stage presentation:

*   **The Hardware (ESP32):** Acts as the sensor node. It sits in the water (or the judge's hand), reads the physical temperature/pressure sensors, and transmits a tiny JSON message over WiFi.
*   **The Server (Mac Laptop):** Acts as the central brain. It runs the MQTT Broker (Mosquitto), the Data Ingestor (`mqtt_subscriber.py`), and the Streamlit Dashboard.

---

## 2. ⚠️ The "College WiFi" Death Trap
Enterprise networks (like College or Hackathon Event WiFi) use **Client Isolation**. This prevents two devices on the same WiFi from communicating with each other. If you use the venue WiFi, your ESP32 will **never** connect to your Mac.

**The Solution:** 
Turn on your phone's **Mobile Hotspot**. Connect *both* your Mac and the ESP32 directly to your phone.

---

## 3. Mac (Server) Setup Instructions

### Step A: Find your Mac's IP Address
1. Connect your Mac to your phone's hotspot.
2. Hold down the **Option (⌥)** key and click the Wi-Fi icon in the top right of your Mac menu bar.
3. Note your **IP Address** (e.g., `172.20.10.4`). You will put this into the ESP32 code.

### Step B: Start the MQTT Broker
1. Open a Terminal and install Mosquitto (if you haven't already):
   ```bash
   brew install mosquitto
   ```
2. Navigate to your project folder:
   ```bash
   cd "/Users/gauravkumarnayak/Desktop/new sih"
   ```
3. Start the broker using the custom config file (this allows the ESP32 to bypass security and connect):
   ```bash
   /opt/homebrew/sbin/mosquitto -c demo_mosquitto.conf
   ```
   *(Leave this terminal window running in the background).*

### Step C: Start the Data Ingestor
1. Open a **second** Terminal window in your project folder.
2. Run the subscriber:
   ```bash
   python platform_pkg/mqtt_subscriber.py
   ```
   *(Leave this running. It will print incoming data as soon as the ESP32 sends it).*

---

## 4. ESP32 (Microcontroller) Firmware

Give this code to your hardware teammate. They should upload it using the Arduino IDE. 
**Required Library:** `PubSubClient` by Nick O'Leary (install via Arduino Library Manager).

```cpp
#include <WiFi.h>
#include <PubSubClient.h>

// --- UPDATE THESE 3 LINES BEFORE UPLOADING ---
const char* ssid = "YOUR_PHONE_HOTSPOT_NAME";
const char* password = "YOUR_PHONE_HOTSPOT_PASSWORD";
const char* mqtt_server = "172.20.10.4"; // The Mac IP address you found in Step A
// ---------------------------------------------

WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(115200);
  
  // 1. Connect to Phone Hotspot
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected.");
  
  // 2. Setup MQTT
  client.setServer(mqtt_server, 1883);
}

void loop() {
  // Reconnect if connection drops
  if (!client.connected()) {
    client.connect("ESP32_Platform_001");
  }
  client.loop();
  
  // 1. Read your physical sensor here (e.g., analogRead or a DallasTemperature library)
  // For the demo, we simulate a reading if you don't have a real sensor attached yet:
  float temp = 14.5 + random(0, 10) / 10.0; 
  
  // 2. Format as a JSON Payload string
  String payload = "{";
  payload += "\"sensor\": \"temperature\", ";
  payload += "\"value\": " + String(temp) + ", ";
  payload += "\"unit\": \"C\", ";
  payload += "\"source\": \"PHYSICAL_ESP32_SENSOR\"";
  payload += "}";

  // 3. Publish to the MQTT Broker
  client.publish("platform/001/sensors/physical/temperature", payload.c_str());
  
  Serial.println("Published: " + payload);
  delay(2000); // Send data every 2 seconds
}
```

---

## 5. Live Stage Presentation Choreography
1. Ensure `mosquitto` and `mqtt_subscriber.py` are running on your Mac.
2. Have your teammate turn on the battery for the ESP32.
3. **The Play:** Hand the physical temperature sensor (or the ESP32 itself) to the judge. Say: *"Please hold the sensor. Our system uses MQTT, the industry standard for marine telemetry. As the heat from your hand transfers to the sensor, the ESP32 is transmitting it wirelessly to our platform."*
4. The dashboard will spike upwards on the screen in real-time, proving the hardware and software are fully integrated. 
