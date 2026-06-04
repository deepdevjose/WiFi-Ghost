/*
  WiFi Ghost ESP32 C: telemetry bridge

  Role:
  - Host a small HTTP server.
  - Accept ESP32 B JSON on POST /api/telemetry.
  - Broadcast latest JSON to browser clients on WebSocket port 81.

  Libraries:
  - WebSockets by Markus Sattler
*/

#include <LittleFS.h>
#include <WebServer.h>
#include <WebSocketsServer.h>
#include <WiFi.h>

// Update these before flashing.
const char* WIFI_SSID = "Deepdevnet";
const char* WIFI_PASSWORD = "Deepdevnet";

WebServer server(80);
WebSocketsServer webSocket = WebSocketsServer(81);

String latestPayload = "{}";
unsigned long latestReceivedMs = 0;
uint32_t receivedCount = 0;
bool filesystemMounted = false;

String contentTypeForPath(const String& path) {
  if (path.endsWith(".html")) return "text/html";
  if (path.endsWith(".css")) return "text/css";
  if (path.endsWith(".js")) return "application/javascript";
  if (path.endsWith(".json")) return "application/json";
  if (path.endsWith(".svg")) return "image/svg+xml";
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".jpg")) return "image/jpeg";
  if (path.endsWith(".ico")) return "image/x-icon";
  if (path.endsWith(".wasm")) return "application/wasm";
  return "text/plain";
}

void sendCorsHeaders() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
}

void handleOptions() {
  sendCorsHeaders();
  server.send(204);
}

void handleHealth() {
  sendCorsHeaders();

  String body = "{";
  body += "\"device_id\":\"esp32-c-webserver-01\",";
  body += "\"status\":\"ok\",";
  body += "\"ip\":\"" + WiFi.localIP().toString() + "\",";
  body += "\"websocket_port\":81,";
  body += "\"filesystem_mounted\":" + String(filesystemMounted ? "true" : "false") + ",";
  body += "\"dashboard_present\":" + String(LittleFS.exists("/index.html") ? "true" : "false") + ",";
  body += "\"received_count\":" + String(receivedCount) + ",";
  body += "\"latest_age_ms\":" + String(latestReceivedMs == 0 ? 0 : millis() - latestReceivedMs);
  body += "}";

  server.send(200, "application/json", body);
}

void handleFilesystemInfo() {
  sendCorsHeaders();

  String body = "{";
  body += "\"filesystem_mounted\":" + String(filesystemMounted ? "true" : "false") + ",";
  body += "\"dashboard_present\":" + String(LittleFS.exists("/index.html") ? "true" : "false") + ",";
  body += "\"files\":[";

  File root = LittleFS.open("/");
  File file = root.openNextFile();
  bool first = true;

  while (file) {
    if (!first) {
      body += ",";
    }

    body += "{\"name\":\"";
    body += file.name();
    body += "\",\"size\":";
    body += String(file.size());
    body += "}";

    first = false;
    file = root.openNextFile();
  }

  body += "]}";
  server.send(200, "application/json", body);
}

void handleLatest() {
  sendCorsHeaders();
  server.send(200, "application/json", latestPayload);
}

void handleTelemetryInfo() {
  sendCorsHeaders();
  server.send(200, "application/json", "{\"ok\":true,\"method\":\"POST\",\"path\":\"/api/telemetry\",\"note\":\"Send JSON from ESP32 B here. Open / for the dashboard.\"}");
}

void handleTelemetryPost() {
  sendCorsHeaders();

  if (!server.hasArg("plain")) {
    server.send(400, "application/json", "{\"ok\":false,\"error\":\"missing request body\"}");
    return;
  }

  latestPayload = server.arg("plain");
  latestReceivedMs = millis();
  receivedCount++;

  webSocket.broadcastTXT(latestPayload);

  Serial.print("Telemetry #");
  Serial.print(receivedCount);
  Serial.print(": ");
  Serial.println(latestPayload);

  server.send(202, "application/json", "{\"ok\":true}");
}

void sendBridgeFallback() {
  sendCorsHeaders();

  String html = "<!doctype html><html><head><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">";
  html += "<title>WiFi Ghost ESP32 C</title></head><body>";
  html += "<h1>WiFi Ghost ESP32 C</h1>";
  html += "<p>Telemetry bridge is running.</p>";
  html += "<ul>";
  html += "<li>POST JSON: <code>/api/telemetry</code></li>";
  html += "<li>Latest JSON: <code>/api/latest</code></li>";
  html += "<li>Health: <code>/api/health</code></li>";
  html += "<li>WebSocket: <code>ws://" + WiFi.localIP().toString() + ":81</code></li>";
  html += "</ul></body></html>";

  server.send(200, "text/html", html);
}

bool serveFile(String path) {
  sendCorsHeaders();

  if (path == "/") {
    path = "/index.html";
  }

  String filePath = path;

  if (!LittleFS.exists(filePath)) {
    return false;
  }

  server.sendHeader("Cache-Control", "no-cache");

  File file = LittleFS.open(filePath, "r");
  if (!file) {
    return false;
  }

  server.streamFile(file, contentTypeForPath(filePath));
  file.close();
  return true;
}

void handleRoot() {
  if (!serveFile("/index.html")) {
    sendBridgeFallback();
  }
}

void handleStaticFile() {
  String path = server.uri();

  if (path.startsWith("/api/")) {
    sendCorsHeaders();
    server.send(404, "application/json", "{\"ok\":false,\"error\":\"api route not found\"}");
    return;
  }

  if (serveFile(path)) {
    return;
  }

  if (path.startsWith("/assets/") || path == "/favicon.svg") {
    sendCorsHeaders();
    server.send(404, "text/plain", "Asset not found");
    return;
  }

  // Vite/React single-page app fallback.
  if (serveFile("/index.html")) {
    return;
  }

  server.send(404, "text/plain", "Not found");
}

void onWebSocketEvent(uint8_t clientNumber, WStype_t type, uint8_t* payload, size_t length) {
  (void)payload;
  (void)length;

  if (type == WStype_CONNECTED) {
    IPAddress ip = webSocket.remoteIP(clientNumber);
    Serial.print("WebSocket client connected: ");
    Serial.println(ip);
    webSocket.sendTXT(clientNumber, latestPayload);
  }

  if (type == WStype_DISCONNECTED) {
    Serial.print("WebSocket client disconnected: ");
    Serial.println(clientNumber);
  }
}

void connectWiFi() {
  Serial.print("Connecting to WiFi");
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.print("ESP32 C IP: ");
  Serial.println(WiFi.localIP());
  Serial.print("WebSocket URL: ws://");
  Serial.print(WiFi.localIP());
  Serial.println(":81");
}

void setupRoutes() {
  server.on("/", HTTP_GET, handleRoot);
  server.on("/api/health", HTTP_GET, handleHealth);
  server.on("/api/fs", HTTP_GET, handleFilesystemInfo);
  server.on("/api/latest", HTTP_GET, handleLatest);
  server.on("/api/telemetry", HTTP_GET, handleTelemetryInfo);
  server.on("/api/telemetry", HTTP_OPTIONS, handleOptions);
  server.on("/api/telemetry", HTTP_POST, handleTelemetryPost);
  server.onNotFound(handleStaticFile);
}

void setup() {
  Serial.begin(115200);
  delay(500);

  connectWiFi();

  if (!LittleFS.begin(true)) {
    Serial.println("LittleFS mount failed. Dashboard files will not be served.");
    filesystemMounted = false;
  } else {
    filesystemMounted = true;
    Serial.println("LittleFS mounted. Dashboard will be served from flash.");
    Serial.print("Dashboard present: ");
    Serial.println(LittleFS.exists("/index.html") ? "yes" : "no");
  }

  setupRoutes();

  server.begin();
  webSocket.begin();
  webSocket.onEvent(onWebSocketEvent);

  Serial.println("ESP32 C telemetry bridge ready.");
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  server.handleClient();
  webSocket.loop();
}
