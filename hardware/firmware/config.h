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
