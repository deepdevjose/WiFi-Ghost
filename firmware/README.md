# Firmware

The firmware layer should behave like a measurement instrument. Keep the embedded nodes focused on capture, timing, and serialization; analysis belongs in notebooks and the dashboard until the pipeline is validated.

## Nodes

### heltec-tx

The transmitter emits controlled 2.4 GHz Wi-Fi traffic so the receiver has a repeatable channel excitation source.

Responsibilities:

- keep packet cadence stable,
- document Wi-Fi channel and rate assumptions,
- avoid unrelated behavior that changes timing.

### heltec-rx

The receiver captures CSI, RSSI, packet metadata, and environmental telemetry.

Responsibilities:

- enable CSI capture,
- attach timestamps and sequence numbers,
- read temperature and humidity near the receiver,
- serialize observations using the canonical payload schema.

### esp32-dashboard

This folder is reserved for an optional embedded display or gateway role.

Responsibilities:

- forward capture data to the local dashboard,
- display minimal device state if needed,
- avoid owning the research model or localization logic.

## Contract

The canonical payload schema lives at [../docs/architecture/canonical-payload.schema.json](../docs/architecture/canonical-payload.schema.json).
