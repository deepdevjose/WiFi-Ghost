# Roadmap

## Phase 1: Correct the scientific scope

- Lock the hardware description to 2.4 GHz ESP32-S3 operation
- Remove any remaining assumptions about 5 GHz or 6 GHz support on the current boards
- Define the canonical data schema for CSI and environmental telemetry

## Phase 2: Build a reproducible capture pipeline

- Stabilize transmitter and receiver packet behavior
- Save raw CSI, RSSI, timestamps, and sensor metadata
- Add a session log for room state, antenna placement, and environmental conditions
- Verify that captures are repeatable across multiple runs

## Phase 3: Establish baseline science

- Measure noise levels in a quiet room
- Quantify session-to-session drift
- Test sensitivity to motion, occupancy, and object movement
- Compare raw CSI against normalized CSI

## Phase 4: Add compensation and feature engineering

- Introduce DHT22-informed drift correction
- Build rolling normalization and baseline subtraction
- Extract robust features from amplitude and phase
- Compare handcrafted features with lightweight learned features

## Phase 5: Improve visualization and interpretation

- Render time-series, heatmaps, and confidence bands
- Use Three.js only where 3D encoding adds meaning
- Add event markers for motion or anomaly transitions
- Keep raw and processed views side by side

## Phase 6: Evaluate research hypotheses

- Does compensation improve stability?
- Which features generalize across sessions?
- How much signal is due to motion versus drift?
- Can the system detect environmental change faster than a baseline threshold method?

## Phase 7: Publishable output

- Experimental protocol
- Dataset description
- Feature extraction summary
- Ablation study for compensation
- Honest limitations section

## Long-term extensions

- Alternative radios with richer band support
- Multi-receiver or multi-antenna setups
- Better atmospheric sensing
- Localization or occupancy estimation
- Model-based or hybrid ML approaches

The roadmap should be treated as a scientific maturity ladder. Each phase should produce something measurable before the next phase begins.
