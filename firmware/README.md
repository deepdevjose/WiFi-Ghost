# Firmware

The firmware layer should behave like a measurement instrument. Keep the embedded nodes focused on capture, timing, and serialization; analysis belongs in notebooks and the dashboard until the pipeline is validated.

## Nodes

### heltec-a

The transmitter emits controlled 2.4 GHz Wi-Fi traffic so the receiver has a repeatable channel excitation source.

Responsibilities:

- keep packet cadence stable,
- document Wi-Fi channel and rate assumptions,
- avoid unrelated behavior that changes timing.

### esp32-b

The receiver captures CSI, RSSI, packet metadata, environmental telemetry, and first-stage motion scores.

Responsibilities:

- enable CSI capture,
- attach timestamps and sequence numbers,
- read temperature and humidity from the DHT22 on the same receiver node,
- run the first-stage motion algorithm against the current baseline,
- serialize observations using the canonical payload schema.

Recommended DHT22 wiring on a regular ESP32 WROOM-32:

- `VCC` -> `3V3`
- `GND` -> `GND`
- `DATA` -> `GPIO4`

`GPIO5` is acceptable if `GPIO4` is unavailable. Avoid `GPIO0`, `GPIO2`, `GPIO12`, `GPIO15`, `GPIO1`, `GPIO3`, and `GPIO6` through `GPIO11`.

### esp32-c

This node is dedicated to the web dashboard role.

Responsibilities:

- host the web server,
- serve the React dashboard,
- publish capture data over WebSocket,
- avoid owning the research model or localization logic.

## Contract

The canonical payload schema lives at [../docs/architecture/canonical-payload.schema.json](../docs/architecture/canonical-payload.schema.json).

## Phase 2 Firmware: DHT22 to Dashboard Bridge

CSI is intentionally not enabled yet. This phase proves the live telemetry path:

`esp32-b DHT22 JSON -> esp32-c HTTP ingest -> esp32-c WebSocket -> React dashboard served by esp32-c`

For faster testing, ESP32 B can also send every payload directly to your laptop:

`esp32-b DHT22 JSON -> laptop receiver -> local React dashboard`

### Required Arduino libraries

Install these in Arduino IDE Library Manager:

- `DHT sensor library` by Adafruit
- `Adafruit Unified Sensor`
- `WebSockets` by Markus Sattler
- `Adafruit SSD1306`
- `Adafruit GFX Library`
- `Adafruit BusIO`

The ESP32 board package must also be installed in Arduino IDE.

### Build the embedded dashboard

From `web/dashboard`:

```bash
pnpm embed:esp32
```

This builds the ESP32-embedded React dashboard and copies assets into:

```text
firmware/esp32-webserver/data
```

The embedded build is a lightweight dashboard without Three.js/Recharts so it fits in LittleFS without gzip. The full local development dashboard can still run from `web/dashboard` with `pnpm dev`.

The dashboard does not generate simulated telemetry. It starts in a waiting state, fetches `http://ESP32_C_IP/api/latest`, and then listens to `ws://ESP32_C_IP:81` for real payloads from ESP32 B.

For local frontend development without embedding, point Vite at ESP32 C:

```bash
cd web/dashboard
VITE_ESP32_HOST=192.168.1.50 pnpm dev
```

### Laptop receiver path

Find your laptop IP on the same Wi-Fi network:

```bash
hostname -I
```

Start the receiver from the repo root:

```bash
python3 tools/telemetry_receiver.py --host 0.0.0.0 --port 8080
```

In `esp32-rx/esp32-rx.ino`, set:

```cpp
const char* TELEMETRY_ENDPOINT = "http://YOUR_LAPTOP_IP:8080/api/telemetry";
```

Upload ESP32 B. The receiver prints each payload and logs JSONL to:

```text
data/telemetry/esp32_b_telemetry.jsonl
```

Run the dashboard locally against the laptop receiver:

```bash
cd web/dashboard
VITE_TELEMETRY_HOST=YOUR_LAPTOP_IP:8080 pnpm dev
```

Useful receiver URLs:

```text
http://YOUR_LAPTOP_IP:8080/api/health
http://YOUR_LAPTOP_IP:8080/api/latest
```

The laptop receiver currently enriches ESP32 B packets with a provisional RSSI-baseline motion detector. It adds `motion_score`, `motion`, `state`, `zone`, `rssi_baseline`, `rssi_delta`, `rssi_jitter`, and `baseline_samples`. This is not CSI yet; it is a real-data bridge so the dashboard can visualize obstacle perturbation before CSI capture starts.

### Flash order

1. Open `heltec-tx/heltec-tx.ino`.
2. Set `WIFI_SSID` and `WIFI_PASSWORD`.
3. Upload it to Heltec A.
4. Confirm the OLED shows the minimal TX status screen.
5. Open the serial monitor at `115200` baud and confirm it prints `Heltec A UDP transmitter ready`.
6. Open `esp32-webserver/esp32-webserver.ino`.
7. Set `WIFI_SSID` and `WIFI_PASSWORD`.
8. Upload the sketch to ESP32 C.
9. Upload the LittleFS filesystem image from `esp32-webserver/data`.
10. Open the serial monitor at `115200` baud.
11. Copy the printed `ESP32 C IP`.
12. Open that IP in a browser to load the embedded dashboard.
13. Open `esp32-rx/esp32-rx.ino`.
14. Set `WIFI_SSID`, `WIFI_PASSWORD`, and `TELEMETRY_ENDPOINT`.

Example:

```cpp
const char* TELEMETRY_ENDPOINT = "http://192.168.1.50/api/telemetry";
```

15. Upload `esp32-rx/esp32-rx.ino` to ESP32 B.

Heltec A sends fixed-size UDP broadcast packets every `50 ms` on port `4210`. Its OLED shows a minimal status screen with TX rate, RSSI, Wi-Fi channel, IP address, and battery indicator. This creates repeatable Wi-Fi activity for later receiver experiments while keeping CSI disabled for Phase 2.

The Heltec WiFi LoRa 32 V3 battery indicator currently reads ADC `GPIO1` using a `4.9x` divider estimate. The serial monitor prints raw ADC, estimated raw millivolts, calculated battery voltage, and percent. If your board reports `0`, check whether your revision needs an ADC enable pin and set `BATTERY_ADC_ENABLE_PIN` in `heltec-tx/heltec-tx.ino`. Avoid `GPIO37` on this board if it causes boot loops or resets.

ESP32 B posts a canonical JSON payload every 2 seconds using DHT22 readings from `GPIO4`. ESP32 C stores the latest payload at `/api/latest`, reports bridge status at `/api/health`, and broadcasts each payload over WebSocket on port `81`.

Example WebSocket URL:

```text
ws://192.168.1.50:81
```

### Upload ESP32 C filesystem

If your Arduino IDE has an ESP32 filesystem upload tool, use it on `firmware/esp32-webserver/data`.

For CLI upload on the default 4 MB ESP32 partition layout, create the LittleFS image with:

```bash
~/.arduino15/packages/esp32/tools/mklittlefs/4.0.2-db0513a/mklittlefs \
  -c firmware/esp32-webserver/data \
  -s 0x160000 \
  firmware/esp32-webserver/littlefs.bin
```

Then upload that image to the default data partition offset:

```bash
python3 -m pip install esptool pyserial

python3 -m esptool \
  --chip esp32 \
  --port /dev/ttyUSB0 \
  --baud 921600 \
  write_flash 0x290000 firmware/esp32-webserver/littlefs.bin
```

Use your real serial port in place of `/dev/ttyUSB0`.

Default ESP32 4 MB partition values used above:

- LittleFS image size: `0x160000`
- Data partition offset: `0x290000`

The current embedded dashboard is about `211 KB`, so it fits comfortably.

### ESP32-only flash order

Use this shorter path if you only want to test the DHT22 dashboard bridge without Heltec A.

1. Open `esp32-webserver/esp32-webserver.ino`.
2. Set `WIFI_SSID` and `WIFI_PASSWORD`.
3. Upload the sketch to ESP32 C.
4. Upload the LittleFS filesystem image from `esp32-webserver/data`.
5. Open the serial monitor at `115200` baud.
6. Copy the printed `ESP32 C IP`.
7. Open that IP in a browser to load the embedded dashboard.
8. Open `esp32-rx/esp32-rx.ino`.
9. Set `WIFI_SSID`, `WIFI_PASSWORD`, and `TELEMETRY_ENDPOINT`.

Example:

```cpp
const char* TELEMETRY_ENDPOINT = "http://192.168.1.50/api/telemetry";
```

10. Upload `esp32-rx/esp32-rx.ino` to ESP32 B.
