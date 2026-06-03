# Requirements

This document defines the first usable target for WiFiGhost. Requirements should stay modest until the sensing pipeline is validated with repeatable experiments.

## Functional Requirements

- Detect human presence in a monitored indoor area.
- Detect movement events against a quiet-room baseline.
- Estimate motion intensity from CSI and RSSI variation.
- Estimate an approximate room zone only after simulation and calibration support it.
- Measure environmental conditions near the receiver.
- Visualize raw and processed observations in real time or near real time.
- Preserve raw captures for later notebook analysis.

## Non-Functional Requirements

- Keep end-to-end visualization latency below 500 ms for live demos.
- Operate without cloud services.
- Run the capture side on ESP32-class 2.4 GHz Wi-Fi hardware.
- Keep the dashboard local-first.
- Store enough metadata to reproduce each experiment.
- Make each layer testable with synthetic or recorded data.

## Out of Scope for the Current Hardware

- Native 5 GHz or 6 GHz sensing.
- Fine-grained imaging of room geometry.
- Person identification.
- Safety, medical, or security-critical detection claims.

## First Success Criteria

- A quiet-room baseline can be captured and replayed.
- A simple direct-path plus reflected-path simulation matches the expected qualitative behavior.
- Motion events are detectable above baseline drift in at least one controlled room setup.
- The dashboard can display uncertainty instead of implying exact location.
