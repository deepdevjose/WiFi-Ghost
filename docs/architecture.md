# Architecture

## System view

WiFiGhost should be organized as a measurement pipeline with explicit boundaries between radio capture, transport, analysis, and presentation.

```mermaid
flowchart LR
	TX[Heltec ESP32-S3 TX] --> AIR[2.4 GHz Wi-Fi Channel]
	AIR --> RX[Heltec ESP32-S3 RX]
	DHT[DHT22 Temp/Humidity] --> RX
	RX --> EDGE[ESP32 Capture / Gateway Layer]
	EDGE --> BUS[Stream Transport]
	BUS --> APP[Research Backend / Feature Pipeline]
	APP --> UI[React Dashboard]
	UI --> VIZ[Three.js 3D Visualization]
```

## Responsibilities

### Transmitter

- Emits controlled Wi-Fi traffic
- Keeps packet timing as stable as possible
- Provides a repeatable excitation source for the channel

### Receiver

- Captures CSI and packet metadata
- Reads ambient temperature and humidity
- Applies first-stage filtering and serialization

### Backend

- Stores raw observations
- Computes normalized features
- Runs drift compensation and analytics
- Serves data to the UI in real time or near real time

### Frontend

- Displays raw and normalized channel state
- Shows temporal trends and confidence indicators
- Presents the environment as a research instrument, not just a demo scene

## Data model

Use a payload that separates raw and derived data:

- `timestamp`
- `device_id`
- `sequence_number`
- `rssi`
- `csi_amplitude[]`
- `csi_phase[]`
- `channel`
- `rate`
- `temperature_c`
- `humidity_percent`
- `normalized_features`
- `anomaly_score`

## Research engineering principle

Every layer should be testable independently.

- Hardware capture can be validated against known packet streams.
- Compensation can be validated on quiet-room baselines.
- Visualization can be validated on synthetic and recorded data.
- The end-to-end pipeline can then be evaluated as a system, not as a UI prototype.
