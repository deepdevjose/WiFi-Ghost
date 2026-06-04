/*
  WiFi Ghost ESP32 B: DHT22 JSON publisher

  Role:
  - Read DHT22 on GPIO4.
  - Build the canonical WiFi Ghost payload shape.
  - POST JSON to a laptop or ESP32 C at /api/telemetry.

  Libraries:
  - DHT sensor library by Adafruit
  - Adafruit Unified Sensor
*/

#include <DHT.h>
#include <HTTPClient.h>
#include <WiFi.h>

// Update these before flashing.
const char* WIFI_SSID = "Deepdevnet";
const char* WIFI_PASSWORD = "Deepdevnet";

// Replace this with your laptop IP while testing, for example:
// http://192.168.100.20:8080/api/telemetry
const char* TELEMETRY_ENDPOINT = "http://192.168.100.135:8080/api/telemetry";

const char* DEVICE_ID = "esp32-b-dht22-01";
const uint8_t DHT_PIN = 4;
const uint8_t WIFI_CHANNEL = 6;
const unsigned long POST_INTERVAL_MS = 2000;

#define DHT_TYPE DHT22

DHT dht(DHT_PIN, DHT_TYPE);

unsigned long lastPostMs = 0;
uint32_t sequenceNumber = 0;

void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) {
    return;
  }

  Serial.print("Connecting to WiFi");
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.print("WiFi connected. IP: ");
  Serial.println(WiFi.localIP());
}

String buildPayload(float temperatureC, float humidityPercent) {
  int32_t rssi = WiFi.RSSI();
  const char* state = "unknown";
  float motionScore = 0.0;

  String payload = "{";
  payload += "\"timestamp_ms\":" + String(millis()) + ",";
  payload += "\"device_id\":\"" + String(DEVICE_ID) + "\",";
  payload += "\"sequence_number\":" + String(sequenceNumber++) + ",";
  payload += "\"rssi\":" + String(rssi) + ",";
  payload += "\"channel\":" + String(WIFI_CHANNEL) + ",";
  payload += "\"csi_amplitude\":[],";
  payload += "\"csi_phase\":[],";
  payload += "\"temperature_c\":" + String(temperatureC, 1) + ",";
  payload += "\"humidity_percent\":" + String(humidityPercent, 1) + ",";
  payload += "\"motion_score\":" + String(motionScore, 2) + ",";
  payload += "\"state\":\"" + String(state) + "\",";
  payload += "\"source\":\"dht22\",";
  payload += "\"motion\":false,";
  payload += "\"zone\":\"unknown\"";
  payload += "}";

  return payload;
}

void postTelemetry(const String& payload) {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  HTTPClient http;
  http.begin(TELEMETRY_ENDPOINT);
  http.addHeader("Content-Type", "application/json");

  int httpCode = http.POST(payload);
  Serial.print("POST ");
  Serial.print(TELEMETRY_ENDPOINT);
  Serial.print(" -> ");
  Serial.println(httpCode);

  if (httpCode > 0) {
    Serial.println(http.getString());
  }

  http.end();
}

void setup() {
  Serial.begin(115200);
  delay(500);

  dht.begin();
  connectWiFi();

  Serial.println("ESP32 B DHT22 JSON publisher ready.");
}

void loop() {
  if (millis() - lastPostMs < POST_INTERVAL_MS) {
    return;
  }

  lastPostMs = millis();

  float temperatureC = dht.readTemperature();
  float humidityPercent = dht.readHumidity();

  if (isnan(temperatureC) || isnan(humidityPercent)) {
    Serial.println("DHT22 read failed; skipping payload.");
    return;
  }

  String payload = buildPayload(temperatureC, humidityPercent);
  Serial.println(payload);
  postTelemetry(payload);
}
