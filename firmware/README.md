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
