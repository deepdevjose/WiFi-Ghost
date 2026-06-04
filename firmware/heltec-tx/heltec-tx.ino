/*
  WiFi Ghost Heltec A: controlled Wi-Fi traffic transmitter

  Role:
  - Join the same 2.4 GHz Wi-Fi network as ESP32 B/C.
  - Emit fixed-size UDP packets at a stable cadence.
  - Provide repeatable RF activity for the receiver path.

  This sketch does not enable CSI and does not host dashboard services.
*/

#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <WiFi.h>
#include <WiFiUdp.h>

// Update these before flashing.
const char* WIFI_SSID = "Deepdevnet";
const char* WIFI_PASSWORD = "Deepdevnet";

// Replace this with your laptop receiver IP while testing.
const char* TELEMETRY_ENDPOINT = "http://192.168.100.135:8080/api/telemetry";

// Broadcast works well for early experiments because ESP32 B can observe traffic
// without needing a dedicated UDP server yet.
IPAddress TARGET_IP(255, 255, 255, 255);
const uint16_t TARGET_PORT = 4210;

const char* DEVICE_ID = "heltec-a-tx-01";
const uint16_t PACKET_SIZE_BYTES = 160;
const unsigned long PACKET_INTERVAL_MS = 50;
const unsigned long STATUS_INTERVAL_MS = 5000;
const unsigned long OLED_REFRESH_MS = 1000;

const uint8_t OLED_ADDRESS = 0x3C;
const uint8_t OLED_WIDTH = 128;
const uint8_t OLED_HEIGHT = 64;
const int8_t OLED_RESET_PIN = RST_OLED;

const uint8_t BATTERY_ADC_PIN = 1;
const int8_t BATTERY_ADC_ENABLE_PIN = -1;
const float BATTERY_DIVIDER_RATIO = 4.9;
const float BATTERY_EMPTY_V = 3.20;
const float BATTERY_FULL_V = 4.20;
const float ADC_REFERENCE_MV = 3300.0;

WiFiUDP udp;
Adafruit_SSD1306 display(OLED_WIDTH, OLED_HEIGHT, &Wire, OLED_RESET_PIN);

uint8_t packetBuffer[PACKET_SIZE_BYTES];
uint32_t sequenceNumber = 0;
unsigned long lastPacketMs = 0;
unsigned long lastStatusMs = 0;
unsigned long lastOledMs = 0;
uint32_t packetsSentInWindow = 0;
float currentRateHz = 0.0;
float batteryVoltage = 0.0;
uint8_t batteryPercent = 0;

void updateBatteryReading() {
  if (BATTERY_ADC_ENABLE_PIN >= 0) {
    digitalWrite(BATTERY_ADC_ENABLE_PIN, HIGH);
    delay(3);
  }

  uint32_t raw = analogRead(BATTERY_ADC_PIN);
  uint32_t millivolts = (uint32_t)((raw / 4095.0) * ADC_REFERENCE_MV);
  batteryVoltage = (millivolts / 1000.0) * BATTERY_DIVIDER_RATIO;

  float normalized = (batteryVoltage - BATTERY_EMPTY_V) / (BATTERY_FULL_V - BATTERY_EMPTY_V);
  normalized = constrain(normalized, 0.0, 1.0);
  batteryPercent = (uint8_t)round(normalized * 100.0);

  Serial.print("RAW battery ADC = ");
  Serial.print(raw);
  Serial.print(" raw_mv=");
  Serial.print(millivolts);
  Serial.print(" battery_v=");
  Serial.print(batteryVoltage, 2);
  Serial.print(" battery_percent=");
  Serial.println(batteryPercent);

  if (BATTERY_ADC_ENABLE_PIN >= 0) {
    digitalWrite(BATTERY_ADC_ENABLE_PIN, LOW);
  }
}

void drawBatteryIcon(int16_t x, int16_t y, uint8_t percent) {
  display.drawRoundRect(x, y, 22, 10, 2, SSD1306_WHITE);
  display.fillRect(x + 22, y + 3, 2, 4, SSD1306_WHITE);

  uint8_t fillWidth = map(percent, 0, 100, 0, 18);
  if (fillWidth > 0) {
    display.fillRect(x + 2, y + 2, fillWidth, 6, SSD1306_WHITE);
  }
}

void drawCenteredText(const String& text, int16_t y, uint8_t size = 1) {
  int16_t x1;
  int16_t y1;
  uint16_t width;
  uint16_t height;

  display.setTextSize(size);
  display.getTextBounds(text, 0, y, &x1, &y1, &width, &height);
  display.setCursor((OLED_WIDTH - width) / 2, y);
  display.print(text);
}

void drawBootScreen(const String& status) {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);
  display.drawRoundRect(0, 0, OLED_WIDTH, OLED_HEIGHT, 8, SSD1306_WHITE);
  display.setTextSize(1);
  drawCenteredText("WiFi Ghost", 12, 1);
  display.setTextSize(2);
  drawCenteredText("TX", 26, 2);
  display.setTextSize(1);
  drawCenteredText(status, 50, 1);
  display.display();
}

void drawStatusScreen() {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);

  display.setTextSize(1);
  display.setCursor(0, 0);
  display.print("WiFi Ghost");
  drawBatteryIcon(101, 0, batteryPercent);

  display.drawLine(0, 11, OLED_WIDTH, 11, SSD1306_WHITE);

  display.setTextSize(2);
  display.setCursor(0, 17);
  display.print(currentRateHz, 1);
  display.setTextSize(1);
  display.setCursor(74, 24);
  display.print("Hz");

  display.setCursor(0, 40);
  display.print("RSSI ");
  display.print(WiFi.RSSI());
  display.print(" dBm");

  display.setCursor(74, 40);
  display.print(batteryVoltage, 2);
  display.print("V");

  display.setCursor(0, 52);
  display.print("CH ");
  display.print(WiFi.channel());
  display.print("  ");
  display.print(WiFi.localIP());

  if (WiFi.status() == WL_CONNECTED) {
    display.fillCircle(120, 26, 4, SSD1306_WHITE);
  } else {
    display.drawCircle(120, 26, 4, SSD1306_WHITE);
  }

  display.display();
}

void initDisplay() {
  pinMode(Vext, OUTPUT);
  digitalWrite(Vext, LOW);
  delay(100);

  pinMode(OLED_RESET_PIN, OUTPUT);
  digitalWrite(OLED_RESET_PIN, LOW);
  delay(20);
  digitalWrite(OLED_RESET_PIN, HIGH);
  delay(20);

  Wire.begin(SDA_OLED, SCL_OLED);

  if (!display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDRESS)) {
    Serial.println("OLED init failed.");
    return;
  }

  display.setRotation(0);
  display.clearDisplay();
  drawBootScreen("Booting");
}

void initBatteryMonitor() {
  analogReadResolution(12);
  analogSetPinAttenuation(BATTERY_ADC_PIN, ADC_11db);

  if (BATTERY_ADC_ENABLE_PIN >= 0) {
    pinMode(BATTERY_ADC_ENABLE_PIN, OUTPUT);
    digitalWrite(BATTERY_ADC_ENABLE_PIN, LOW);
  }

  updateBatteryReading();
}

void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) {
    return;
  }

  drawBootScreen("Connecting WiFi");
  Serial.print("Connecting to WiFi");
  WiFi.mode(WIFI_STA);
  WiFi.setSleep(false);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.print("Heltec A IP: ");
  Serial.println(WiFi.localIP());
  Serial.print("WiFi channel: ");
  Serial.println(WiFi.channel());
  Serial.print("UDP target: ");
  Serial.print(TARGET_IP);
  Serial.print(":");
  Serial.println(TARGET_PORT);

  drawBootScreen("Connected");
  delay(450);
}

void writeUint32(uint8_t* buffer, size_t offset, uint32_t value) {
  buffer[offset + 0] = (value >> 24) & 0xff;
  buffer[offset + 1] = (value >> 16) & 0xff;
  buffer[offset + 2] = (value >> 8) & 0xff;
  buffer[offset + 3] = value & 0xff;
}

void buildPacket() {
  memset(packetBuffer, 0, sizeof(packetBuffer));

  const char* prefix = "WIFIGHOST_TX";
  memcpy(packetBuffer, prefix, strlen(prefix));

  writeUint32(packetBuffer, 16, sequenceNumber);
  writeUint32(packetBuffer, 20, millis());

  for (size_t index = 24; index < sizeof(packetBuffer); index++) {
    packetBuffer[index] = (uint8_t)((sequenceNumber + index) & 0xff);
  }
}

void sendPacket() {
  buildPacket();

  udp.beginPacket(TARGET_IP, TARGET_PORT);
  udp.write(packetBuffer, sizeof(packetBuffer));
  udp.endPacket();

  sequenceNumber++;
  packetsSentInWindow++;
}

void printStatus() {
  unsigned long now = millis();
  unsigned long elapsedMs = now - lastStatusMs;
  currentRateHz = elapsedMs == 0 ? 0.0 : (packetsSentInWindow * 1000.0) / elapsedMs;

  Serial.print("TX packets=");
  Serial.print(sequenceNumber);
  Serial.print(" rate_hz=");
  Serial.print(currentRateHz, 1);
  Serial.print(" rssi=");
  Serial.print(WiFi.RSSI());
  Serial.print(" channel=");
  Serial.print(WiFi.channel());
  Serial.print(" battery_v=");
  Serial.print(batteryVoltage, 2);
  Serial.print(" battery_percent=");
  Serial.print(batteryPercent);
  Serial.print(" device_id=");
  Serial.println(DEVICE_ID);

  packetsSentInWindow = 0;
  lastStatusMs = now;
}

String buildStatusPayload() {
  String payload = "{";
  payload += "\"timestamp_ms\":" + String(millis()) + ",";
  payload += "\"device_id\":\"" + String(DEVICE_ID) + "\",";
  payload += "\"role\":\"wifi_tx\",";
  payload += "\"state\":\"tx\",";
  payload += "\"sequence_number\":" + String(sequenceNumber) + ",";
  payload += "\"tx_packets\":" + String(sequenceNumber) + ",";
  payload += "\"tx_rate_hz\":" + String(currentRateHz, 1) + ",";
  payload += "\"packet_interval_ms\":" + String(PACKET_INTERVAL_MS) + ",";
  payload += "\"packet_size_bytes\":" + String(PACKET_SIZE_BYTES) + ",";
  payload += "\"rssi\":" + String(WiFi.RSSI()) + ",";
  payload += "\"channel\":" + String(WiFi.channel()) + ",";
  payload += "\"battery_v\":" + String(batteryVoltage, 2) + ",";
  payload += "\"battery_percent\":" + String(batteryPercent) + ",";
  payload += "\"ip\":\"" + WiFi.localIP().toString() + "\"";
  payload += "}";

  return payload;
}

void postStatusTelemetry() {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  String payload = buildStatusPayload();
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

  initDisplay();
  initBatteryMonitor();
  connectWiFi();
  udp.begin(TARGET_PORT);

  lastPacketMs = millis();
  lastStatusMs = millis();
  lastOledMs = millis();

  Serial.println("Heltec A UDP transmitter ready.");
  drawStatusScreen();
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  unsigned long now = millis();

  if (now - lastPacketMs >= PACKET_INTERVAL_MS) {
    lastPacketMs += PACKET_INTERVAL_MS;
    sendPacket();
  }

  if (now - lastStatusMs >= STATUS_INTERVAL_MS) {
    printStatus();
    postStatusTelemetry();
  }

  if (now - lastOledMs >= OLED_REFRESH_MS) {
    lastOledMs = now;
    updateBatteryReading();
    drawStatusScreen();
  }
}
