# Experiment 001: Quiet-Room Baseline

## Goal

Measure CSI stability when the room is intentionally still.

## Setup

- One Heltec ESP32-S3 transmitter.
- One Heltec ESP32-S3 receiver.
- DHT22 near the receiver.
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
