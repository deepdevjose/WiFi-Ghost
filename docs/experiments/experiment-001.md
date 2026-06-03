# Experiment 001: Quiet-Room Baseline

## Goal

Measure CSI stability when the room is intentionally still.

## Setup

- Heltec A as the Wi-Fi CSI transmitter.
- ESP32 WROOM-32 B as the Wi-Fi CSI receiver, DHT22 reader, and motion algorithm node.
- ESP32 WROOM-32 C as the dashboard server.
- DHT22 connected to ESP32 B, preferably on `GPIO4`.
- Fixed antenna orientation.
- Fixed 2.4 GHz channel.

## Procedure

1. Place transmitter and receiver in fixed positions.
2. Record room geometry and antenna orientation.
3. Capture 2 to 5 minutes of quiet-room data.
4. Save raw CSI, RSSI, timestamps, temperature, and humidity.
5. Plot within-session variance in a notebook.

## Success Criteria

- Packet stream is replayable.
- Baseline variance is measurable.
- Metadata is sufficient to repeat the session.
