# Firmware Architecture

The firmware should behave like a measurement instrument.

## Heltec A: Transmitter

- Emit controlled 2.4 GHz Wi-Fi traffic.
- Keep packet cadence stable enough for repeatable captures.
- Avoid unnecessary application behavior that changes timing.

## ESP32 B: Receiver and Motion Node

- Capture CSI, RSSI, channel, rate, sequence number, and timestamps.
- Read temperature and humidity from a DHT22 connected to the same receiver node.
- Run the first-stage motion algorithm.
- Serialize raw observations using the canonical payload contract.
- Preserve raw data before applying derived labels or scores.

Recommended DHT22 wiring on a regular ESP32 WROOM-32:

- `VCC` -> `3V3`
- `GND` -> `GND`
- `DATA` -> `GPIO4`

`GPIO5` is acceptable if `GPIO4` is unavailable. Avoid `GPIO0`, `GPIO2`, `GPIO12`, `GPIO15`, `GPIO1`, `GPIO3`, and `GPIO6` through `GPIO11`.

## ESP32 C: Dashboard Server

- Host the web server.
- Serve the React dashboard.
- Publish observations to the browser over WebSocket.
- Keep dashboard hosting separate from CSI capture.

## Boundaries

Firmware can own simple motion scoring on `esp32-b`, but should not own localization claims or room-position inference. It should collect clean, timestamped measurements that notebooks and the dashboard can replay.
