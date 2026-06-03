# CSI Theory

## Definition

Channel State Information describes the receiver's estimate of the wireless channel. In OFDM systems such as Wi-Fi, this estimate is naturally expressed per subcarrier as a complex value containing amplitude and phase.

The high-level channel model is:

$$
y = Hx + n
$$

where $H$ is the channel response, $x$ is the transmitted signal, and $n$ is noise.

## Why CSI is useful

RSSI compresses the channel to one scalar power value. CSI retains structure across subcarriers, so it can reveal frequency-selective fading, multipath changes, and motion-induced variation.

For sensing, that extra structure is the main signal.

## OFDM view

Wi-Fi uses many orthogonal subcarriers. Each subcarrier experiences a slightly different gain and phase shift. If the environment changes, the CSI vector changes as well.

This gives CSI three important properties:

- frequency selectivity across the band,
- sensitivity to motion and geometry,
- and a natural link to multipath modeling.

## What CSI contains

Each measured packet typically yields:

- per-subcarrier amplitude,
- per-subcarrier phase,
- RSSI or receive power,
- noise or quality indicators,
- and timing metadata.

The raw phase is often difficult to use directly because it is contaminated by offset and timing effects. Amplitude is usually more stable, while phase becomes valuable after correction.

## Common distortions

CSI is not a perfect channel readout. It is affected by:

- carrier frequency offset,
- sampling frequency offset,
- packet boundary alignment,
- quantization and fixed-point limitations,
- AGC behavior,
- and hardware-specific implementation details.

That means CSI is best treated as a measurement signal that needs calibration, not as a direct truth signal.

## Practical processing pipeline

1. Capture packets with CSI enabled.
2. Filter out corrupted or incomplete samples.
3. Normalize amplitude across packets.
4. Sanitize or unwrap phase if phase is needed.
5. Remove slow baseline drift.
6. Extract time-domain and subcarrier-domain features.
7. Feed the features into detection, estimation, or visualization logic.

## Useful feature families

- Mean and variance of amplitude across subcarriers
- Temporal derivatives of amplitude
- Subcarrier correlation patterns
- Spectral entropy or energy concentration
- Windowed statistics over time
- Motion-sensitive change scores

## Interpretation guidance

If the room is static, CSI should still fluctuate slightly because of measurement noise and radio instability. If the environment changes, the variation should be structured and repeatable rather than random.

This distinction matters:

- random variation suggests weak measurement quality,
- structured variation suggests sensing signal,
- and repeatable structured variation is what you want for a research system.

## Research relevance

CSI is useful for sensing because it lies at the intersection of communication theory and estimation theory. It is a channel estimate, but the estimated channel is also a proxy for the environment.

That makes WiFiGhost an applied problem in:

- wireless communications,
- signal processing,
- embedded systems,
- and sensing analytics.

## References

- [ESP-IDF Wi-Fi CSI guide](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-guides/wifi.html#wi-fi-channel-state-information)
- [Espressif esp-csi repository](https://github.com/espressif/esp-csi)
- [esp-csi OFDM introduction](https://github.com/espressif/esp-csi/blob/master/docs/en/OFDM-introduction.md)
- [Orthogonal frequency-division multiplexing](https://en.wikipedia.org/wiki/Orthogonal_frequency-division_multiplexing)
