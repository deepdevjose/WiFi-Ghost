# WiFiGhost 3D Radar

WiFiGhost is a research-first workspace for Wi-Fi CSI environmental sensing on ESP32-S3 hardware. The goal is to explore whether commodity 2.4 GHz Wi-Fi channel-state information can detect presence, motion, drift, and coarse room-zone changes in a disciplined, reproducible way.

This repository is not trying to turn CSI into a magic camera. CSI is a noisy, hardware-dependent view of a time-varying wireless channel, so the project emphasizes calibration, repeatable experiments, environmental compensation, and visualization of uncertainty.

## Current Scope

The current hardware target is the Heltec ESP32-S3 platform operating on 2.4 GHz Wi-Fi.

In scope:

- Wi-Fi CSI and RSSI capture on ESP32-class 2.4 GHz hardware
- Controlled transmitter and receiver behavior
- Temperature and humidity metadata near the receiver
- Synthetic CSI simulation before firmware deployment
- Motion and presence detection against a quiet-room baseline
- Local-first visualization and offline notebook analysis

Out of scope for the current hardware:

- Native 5 GHz or 6 GHz sensing
- Fine-grained imaging of room geometry
- Person identification
- Safety, medical, or security-critical claims

## Repository Contents

```text
WiFi-Ghost/
├── docs/                 Project requirements, research, architecture, and experiments
├── firmware/             ESP32 transmitter/receiver design notes
├── notebooks/            Simulation and analysis notebooks
├── tools/                Utility scripts for capture and plotting
├── web/dashboard/        Local React/Three.js dashboard workspace
├── requirements.txt      Python notebook dependencies
└── README.md
```

## Quick Start

Clone the repository, then set up the Python notebook environment:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
jupyter lab
```

Start with the notebooks in order:

1. [00_project_setup.ipynb](notebooks/00_project_setup.ipynb)
2. [01_signal_propagation.ipynb](notebooks/01_signal_propagation.ipynb)
3. [02_multipath_simulation.ipynb](notebooks/02_multipath_simulation.ipynb)
4. [03_synthetic_csi_generation.ipynb](notebooks/03_synthetic_csi_generation.ipynb)
5. [04_motion_detection_score.ipynb](notebooks/04_motion_detection_score.ipynb)
6. [05_environmental_drift_compensation.ipynb](notebooks/05_environmental_drift_compensation.ipynb)
7. [06_zone_estimation.ipynb](notebooks/06_zone_estimation.ipynb)
8. [07_virtual_room_simulation.ipynb](notebooks/07_virtual_room_simulation.ipynb)

The intended progression is:

```text
mathematical model -> simulation -> recorded data -> firmware/dashboard implementation
```

## Dashboard Workspace

The dashboard package is under [web/dashboard](web/dashboard). Install dependencies and run the local Vite server from that directory:

```bash
cd web/dashboard
npm install
npm run dev
```

Available scripts:

- `npm run dev` starts the local development server.
- `npm run build` type-checks and builds the dashboard.
- `npm run preview` serves the built dashboard.
- `npm run lint` runs ESLint.

## Firmware Direction

Firmware should behave like a measurement instrument. Embedded nodes should focus on capture, timing, and serialization while analysis remains in notebooks and the dashboard until the sensing pipeline is validated.

Planned node roles:

- `heltec-tx`: emits controlled 2.4 GHz Wi-Fi traffic.
- `heltec-rx`: captures CSI, RSSI, packet metadata, and environmental telemetry.
- `esp32-dashboard`: optional gateway or embedded display role.

The data contract is defined by the [canonical payload schema](docs/architecture/canonical-payload.schema.json).

## Start Here

- [Requirements](docs/requirements.md)
- [Documentation index](docs/README.md)
- [Notebook roadmap](notebooks/README.md)
- [System overview](docs/architecture/system-overview.md)
- [Firmware architecture](docs/architecture/firmware.md)
- [Frontend architecture](docs/architecture/frontend.md)
- [Communication architecture](docs/architecture/communication.md)
- [Experimental protocol](docs/experiments/experimental-protocol.md)
- [Roadmap](docs/roadmap.md)

## Research Notes

- [Master research dossier](docs/research/WiFiGhost_Research.md)
- [Research synthesis](docs/research/research-synthesis.md)
- [Wi-Fi bands](docs/research/wifi-bands.md)
- [Electromagnetic propagation](docs/research/electromagnetic-propagation.md)
- [Wi-Fi propagation](docs/research/wifi-propagation.md)
- [CSI theory](docs/research/csi-theory.md)
- [Multipath](docs/research/multipath.md)
- [Environmental compensation](docs/research/environmental-compensation.md)
- [Localization risk](docs/localization.md)

## Design Principles

- Treat CSI as a noisy measurement, not a direct image.
- Prefer repeatable experiments over impressive one-off demos.
- Preserve raw captures and metadata for later analysis.
- Separate capture, analysis, and visualization responsibilities.
- Show uncertainty clearly instead of implying exact localization.
- Keep the project local-first and independent of cloud services.

## First Success Criteria

- A quiet-room baseline can be captured and replayed.
- A simple direct-path plus reflected-path simulation matches expected qualitative behavior.
- Motion events are detectable above baseline drift in at least one controlled room setup.
- The dashboard can display confidence and uncertainty without implying exact location.
