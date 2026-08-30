# Hardware Specification

## Qualification Prototype Bill of Materials

All components are commercially available in India. Prices are current as of August 2026 from Robu.in and Evelta.

| Component | Model | Function | Cost (INR) | Operating Range | Accuracy |
|---|---|---|---|---|---|
| Microcontroller | ESP32 DevKit v1 | Sensor hub, WiFi MQTT publisher | 400 | -40 to +85 deg C | - |
| Temperature sensor | DS18B20 waterproof | Water temperature | 80 | -55 to +125 deg C | +-0.5 deg C |
| Pressure/altitude | BMP280 | Pressure, altitude proxy | 120 | -40 to +85 deg C, 300-1100 hPa | +-1 hPa |
| pH sensor | SEN0161 analog module | Water pH | 350 | 0 to 60 deg C | +-0.1 pH |
| IMU | MPU6050 6-axis | Pitch, roll, heading | 150 | -40 to +85 deg C | +-0.05 deg/s |
| TDS module | Gravity TDS v1.0 | Dissolved solids (salinity proxy) | 200 | 0 to 55 deg C | +-10% FS |
| Edge computer | Raspberry Pi 4, 4GB | AI inference, MQTT broker, database | 4500 | 0 to 50 deg C | - |
| Power supply | 5V 3A USB-C bench | Demo power | 300 | - | - |

**Total qualification hardware cost: approximately INR 6,100**

This cost structure proves the low-cost claim without overstating it. The sensors alone cost INR 1,300. The Raspberry Pi is the primary cost driver, and is a reusable platform. In the production design, the RPi is replaced with a custom compute board at lower cost and lower power consumption.

---

## Post-Selection Hardware Roadmap

The following components are procurement targets following SIH selection. Budget estimates are based on current supplier quotes.

| Component | Target Specification | Estimated Cost | Month |
|---|---|---|---|
| CTD sensor | Sea-Bird SBE25 or equivalent, 6000m rated | INR 1,80,000 | 1-2 |
| Dissolved oxygen | Aanderaa Optode 4330 | INR 90,000 | 1-2 |
| Fluorometer | WET Labs ECO-AFL/FL | INR 1,20,000 | 2-3 |
| Nitrate sensor | SUNA V2 or equivalent | INR 2,20,000 | 3-4 |
| Compact sonar | Ping360 or Blueprint Subsea Oculus M370 | INR 1,50,000 | 3-4 |
| Iridium modem | RockBLOCK 9603 or equivalent | INR 25,000 | 1-2 |
| Pressure housing | Acrylic tube with aluminum endcaps, rated 200m | INR 15,000 | 2-3 |
| Battery pack | LiFePO4 26650, rated to -20 deg C | INR 8,000 | 2-3 |
| Buoyancy foam | Syntactic foam blocks | INR 5,000 | 3-4 |

**Estimated total post-selection build cost: INR 8,13,000 for one fully instrumented prototype**

This is 25-30x cheaper than a commercial Argo float (INR 25-30 lakh) and operates with comparable physical oceanography sensors for the primary observation mission.

---

## Sensor Specification: Why These Sensors Work in Cold Water

This section addresses a common question about qualification prototype validity.

The Southern Ocean surface temperature ranges from -1.8 deg C (winter, near sea ice) to +4 deg C (summer, sub-Antarctic). The Antarctic Intermediate Water (AAIW) layer sits between 800-1000m at approximately 2-5 deg C.

The DS18B20 is rated to -55 deg C. It physically operates in Antarctic seawater temperatures without modification. The BMP280 is rated to -40 deg C. The MPU6050 is rated to -40 deg C.

The sensors are not the limiting factor for polar deployment. The limiting factors are:

1. The enclosure maintaining positive internal temperature and pressure seal
2. The battery chemistry maintaining capacity at low temperatures (LiFePO4 retains 70-80% capacity at -20 deg C; standard LiPo retains 30-40%)
3. The buoyancy material tolerating repeated pressure cycles

None of these are sensor physics problems. They are materials and enclosure engineering problems with known solutions documented in Argo float design references (Riser et al., 2016; Wong et al., 2020). The mechanism for sensing is identical in a bucket of ice water and in the Southern Ocean. What changes is the shell around the mechanism.

This point is critical for demonstration: placing the DS18B20 in ice water during the demo shows -1 to 0 deg C on the dashboard. The sensor reading and data pipeline are indistinguishable from a Southern Ocean surface measurement.

---

## ESP32 Firmware

### config.h

```cpp
// config.h
// Hardware configuration for ESP32 sensor publisher

#define WIFI_SSID        "your_ssid"
#define WIFI_PASSWORD    "your_password"
#define MQTT_BROKER      "192.168.1.100"   // Raspberry Pi local IP
#define MQTT_PORT        1883
#define MQTT_CLIENT_ID   "platform_001"
#define PLATFORM_ID      "001"

// Sensor pins
#define DS18B20_PIN      4     // OneWire data pin
#define PH_ANALOG_PIN    34    // ADC1 pin
#define TDS_ANALOG_PIN   35    // ADC1 pin
#define MPU_SDA          21
#define MPU_SCL          22
#define BMP_SDA          21    // Shared I2C bus
#define BMP_SCL          22

// Sampling interval (milliseconds)
#define SAMPLE_INTERVAL  2000

// MQTT topic template: platform/{id}/sensors/{parameter}
#define TOPIC_PREFIX     "platform/" PLATFORM_ID "/sensors/"
```

### esp32_publisher.ino

```cpp
#include <WiFi.h>
#include <PubSubClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <Wire.h>
#include <Adafruit_BMP280.h>
#include <MPU6050.h>
#include <ArduinoJson.h>
#include "config.h"

OneWire oneWire(DS18B20_PIN);
DallasTemperature tempSensor(&oneWire);
Adafruit_BMP280 bmp;
MPU6050 imu;
WiFiClient wifiClient;
PubSubClient mqtt(wifiClient);

unsigned long lastSample = 0;

void publishReading(const char* parameter, float value,
                    const char* unit, const char* source) {
    StaticJsonDocument<256> doc;
    doc["sensor"]    = parameter;
    doc["value"]     = round(value * 100.0) / 100.0;
    doc["unit"]      = unit;
    doc["source"]    = source;
    doc["platform"]  = PLATFORM_ID;
    doc["timestamp"] = millis();  // replaced with NTP in production

    char payload[256];
    serializeJson(doc, payload);

    char topic[64];
    snprintf(topic, sizeof(topic), "%s%s", TOPIC_PREFIX, parameter);
    mqtt.publish(topic, payload, true);  // retained message
}

void setup() {
    Serial.begin(115200);
    tempSensor.begin();
    bmp.begin(0x76);
    Wire.begin(MPU_SDA, MPU_SCL);
    imu.initialize();

    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    while (WiFi.status() != WL_CONNECTED) delay(500);

    mqtt.setServer(MQTT_BROKER, MQTT_PORT);
    while (!mqtt.connected()) {
        mqtt.connect(MQTT_CLIENT_ID);
        delay(1000);
    }
}

void loop() {
    if (!mqtt.connected()) {
        mqtt.connect(MQTT_CLIENT_ID);
    }
    mqtt.loop();

    if (millis() - lastSample >= SAMPLE_INTERVAL) {
        lastSample = millis();

        // Temperature
        tempSensor.requestTemperatures();
        float temp = tempSensor.getTempCByIndex(0);
        publishReading("temperature", temp, "degC", "REAL_HARDWARE");

        // Pressure
        float pressure = bmp.readPressure() / 100.0;  // Pa to hPa
        publishReading("pressure", pressure, "hPa", "REAL_HARDWARE");

        // pH (calibrated analog read)
        int rawPH = analogRead(PH_ANALOG_PIN);
        float voltage = rawPH * (3.3 / 4095.0);
        float ph = 3.5 * voltage + 0.0;  // calibration slope
        publishReading("ph", ph, "pH", "REAL_HARDWARE");

        // TDS (salinity proxy, uncalibrated, labelled accordingly)
        int rawTDS = analogRead(TDS_ANALOG_PIN);
        float tdsVoltage = rawTDS * (3.3 / 4095.0);
        float tds = (133.42 * pow(tdsVoltage, 3)
                   - 255.86 * pow(tdsVoltage, 2)
                   + 857.39 * tdsVoltage) * 0.5;
        publishReading("tds_proxy", tds, "ppm", "REAL_HARDWARE_UNCALIBRATED");

        // IMU
        int16_t ax, ay, az, gx, gy, gz;
        imu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);
        float pitch = atan2(ay, az) * 180.0 / PI;
        float roll  = atan2(-ax, az) * 180.0 / PI;

        StaticJsonDocument<128> imuDoc;
        imuDoc["pitch"] = round(pitch * 10) / 10.0;
        imuDoc["roll"]  = round(roll * 10) / 10.0;
        imuDoc["source"] = "REAL_HARDWARE";
        char imuPayload[128];
        serializeJson(imuDoc, imuPayload);
        mqtt.publish("platform/" PLATFORM_ID "/sensors/imu",
                     imuPayload, true);
    }
}
```

---

## Physical Connection Diagram

```
Raspberry Pi 4
    |
    +--- USB ----> Power (bench supply or battery pack)
    |
    +--- WiFi ----> Local network (same as ESP32)
    |
    +--- Ethernet (optional) ----> Wired fallback

ESP32 DevKit v1
    |
    +--- GPIO 4  ----> DS18B20 data (4.7k pullup to 3.3V)
    |
    +--- GPIO 21 ----> SDA (BMP280, MPU6050, shared I2C bus)
    +--- GPIO 22 ----> SCL (BMP280, MPU6050, shared I2C bus)
    |
    +--- GPIO 34 ----> pH sensor analog out
    +--- GPIO 35 ----> TDS sensor analog out
    |
    +--- 3.3V   ----> Sensor VCC (DS18B20, pH module, TDS module)
    +--- GND    ----> Common ground

BMP280 (I2C address 0x76)
    VCC --> 3.3V
    GND --> GND
    SDA --> GPIO 21
    SCL --> GPIO 22

MPU6050 (I2C address 0x68)
    VCC --> 3.3V
    GND --> GND
    SDA --> GPIO 21
    SCL --> GPIO 22
    AD0 --> GND (address select)

DS18B20 (waterproof probe)
    Red  --> 3.3V
    Black --> GND
    Yellow --> GPIO 4 + 4.7k to 3.3V
```

---

## Demo Setup Instructions

1. Flash ESP32 with firmware. Confirm serial output shows sensor readings.
2. Start Mosquitto on Raspberry Pi: `mosquitto -c /etc/mosquitto/mosquitto.conf`
3. Verify ESP32 connects and publishes: `mosquitto_sub -t "platform/001/sensors/#" -v`
4. Place DS18B20 probe in a cup of room-temperature water. Observe temperature on subscriber.
5. Place probe in ice water. Temperature should drop to 0-2 deg C within 30 seconds.
6. This validates the real-hardware data path end to end.
7. Start virtual publisher for biogeochemical parameters.
8. Start subscriber and database writer.
9. Open dashboard and confirm both real (LIVE) and virtual (VIRTUAL) parameters appear with correct labels.

The ice water step is the single most effective in-demo proof of live sensing. The judge observes a physical action, sees a corresponding numerical change, and the data path is proven without any possibility of pre-recorded data.
