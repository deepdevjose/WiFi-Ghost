# WiFiGhost 3D Radar

WiFiGhost is a research-first workspace for Wi-Fi CSI environmental sensing on ESP32-S3 hardware.

The current project scope is intentionally constrained to 2.4 GHz Wi-Fi on the Heltec ESP32-S3 platform. That is the correct operating range for the hardware in this repository; 5 GHz and 6 GHz should be treated as future work on different radios.

## What this repository contains

- A research synthesis for Wi-Fi sensing, propagation, CSI, and compensation
- A system architecture draft for the transmitter, receiver, dashboard, and visualization pipeline
- Theory notes for OFDM, multipath, and CSI interpretation
- A roadmap for experiments, validation, and future extensions
- Simulation notebooks for validating the math before touching firmware

## Start here

- [Requirements](docs/requirements.md)
- [Master research dossier](docs/research/WiFiGhost_Research.md)
- [Research synthesis](docs/research/research-synthesis.md)
- [Canonical payload schema](docs/architecture/canonical-payload.schema.json)
- [Experimental protocol](docs/experiments/experimental-protocol.md)
- [CSI theory](docs/research/csi-theory.md)
- [Wi-Fi propagation](docs/research/wifi-propagation.md)
- [Environmental compensation](docs/research/environmental-compensation.md)
- [System architecture](docs/architecture/system-overview.md)
- [Localization risk](docs/localization.md)
- [Notebook roadmap](notebooks/README.md)
- [Roadmap](docs/roadmap.md)

## Repository layout

```text
WiFi-Ghost/
├── docs/
│   ├── research/
│   ├── architecture/
│   └── experiments/
├── notebooks/
├── firmware/
├── web/
├── tools/
└── assets/
```

## Design principle

The central idea is not to treat CSI as a magic sensor. It is a noisy, hardware-dependent view of a time-varying wireless channel. The project should therefore combine:

- sound physical modeling,
- disciplined calibration,
- environmental sensing for drift compensation,
- and careful visualization of uncertainty rather than false precision.
