# Environmental Compensation

## Purpose

Environmental compensation attempts to separate true channel variation from slow nuisance drift caused by temperature, humidity, and device behavior.

The goal is not to erase the environment. The goal is to reduce variation that is unrelated to the sensing event of interest.

## Why a DHT22 helps

The DHT22 provides ambient temperature and relative humidity at low cost. It is not a precision lab sensor, but it is good enough to track broad environmental conditions that can correlate with CSI drift.

## What can drift

- RF front-end behavior
- Oscillator stability
- Antenna matching
- Air dielectric properties
- Material response in the room
- Baseline channel power over time

## Compensation strategies

### 1. Baseline subtraction

Store a reference CSI profile in a known quiet state and subtract or compare later measurements to that baseline.

### 2. Rolling normalization

Use a sliding window to compute mean and variance, then normalize new samples relative to recent history.

### 3. Regression-based correction

Fit a simple model that predicts slow CSI drift from temperature and humidity, then remove the predicted component.

### 4. Session-aware calibration

Calibrate once per deployment session or room state, then reuse the calibration until the environment changes materially.

## What compensation should not do

- It should not force every trace to look identical.
- It should not remove motion signatures.
- It should not hide uncertainty.
- It should not claim physical accuracy beyond the sensor's limits.

## Recommended workflow

1. Record a quiet baseline with room metadata.
2. Record DHT22 data at the same timestamps as CSI.
3. Fit a simple drift model on the quiet periods.
4. Apply the correction to subsequent packets.
5. Compare raw and corrected CSI side by side.
6. Validate whether compensation improves separability or stability.

## Metrics to report

- Reduction in baseline variance
- Improvement in session-to-session repeatability
- Correlation between CSI drift and temperature/humidity
- Preservation of motion-sensitive variation
- Latency and computational cost of compensation

## Research caution

Temperature and humidity are explanatory variables, not universal causes. They may correlate with drift in one deployment and be weak in another. The model should therefore be empirical and validated, not assumed.

## References

- [ESP-IDF Wi-Fi CSI guide](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-guides/wifi.html#wi-fi-channel-state-information)
- [Espressif esp-csi repository](https://github.com/espressif/esp-csi)
- [Wireless Channel Fundamentals](https://github.com/espressif/esp-csi/blob/master/docs/en/Wireless-Channel-Fundamentals.md)
