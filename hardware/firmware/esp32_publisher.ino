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
