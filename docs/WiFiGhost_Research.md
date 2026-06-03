# WiFiGhost 3D Radar Research

## Abstract

WiFiGhost is an embedded sensing and visualization study that uses Wi-Fi Channel State Information, environmental telemetry, and a 3D dashboard to infer changes in an indoor environment. The correct framing is not classical imaging radar. It is channel inference from a commodity Wi-Fi link operating on the 2.4 GHz ESP32-S3 radio stack.

The scientific challenge is that CSI is informative but unstable: it contains genuine environmental signal mixed with hardware noise, packet-to-packet variation, and slow drift from temperature and humidity. A serious design must therefore combine propagation theory, OFDM structure, embedded sensing, calibration, and data visualization.

## 1. System premise

The current system should be understood as five coupled subsystems:

1. A Heltec ESP32-S3 transmitter emits Wi-Fi packets.
2. A Heltec ESP32-S3 receiver captures per-packet CSI and related metadata.
3. A DHT22 reports ambient temperature and relative humidity near the radio hardware.
4. An ESP32-side service or gateway forwards stream data to a higher-level application.
5. A React + Three.js front end displays the evolving channel state.

The important correction is that this platform is 2.4 GHz only. Any references to 5 GHz or 6 GHz should be treated as future extensions that require different radio hardware.

## 2. Physical-layer foundations

Wireless propagation is governed by superposition. The receiver observes a sum of many paths, each with its own attenuation, delay, and phase rotation:

$$
h(t) = \sum_{n=0}^{N-1} \alpha_n e^{j\phi_n} \delta(t-\tau_n)
$$

In the frequency domain, this becomes a complex transfer function with peaks and notches caused by constructive and destructive interference. Indoor Wi-Fi is therefore highly frequency selective, especially when the room geometry or the person in the room changes.

At 2.4 GHz, the wavelength is about 12.5 cm. That scale is small enough that movement of a hand, torso, or object can materially perturb phase and amplitude across the channel.

## 3. Why OFDM is the right lens

Wi-Fi does not observe one channel number. It uses OFDM, so the receiver can estimate the channel on many subcarriers. Each subcarrier provides a complex coefficient describing amplitude and phase at a narrow frequency slice.

That matters because:

- the channel is often not flat across the band,
- narrow notches can appear due to multipath delay spread,
- movement can shift phase and amplitude differently across subcarriers,
- and the resulting CSI vector is a richer signal than RSSI.

In practical sensing, this makes CSI useful for motion detection, occupancy cues, gesture patterns, and coarse environmental state estimation, but not for exact geometric reconstruction without much stronger modeling and instrumentation.

## 4. Signal interpretation

CSI should be interpreted as a noisy estimate of the channel, not as a directly observable truth. The raw stream can be distorted by:

- automatic gain control behavior,
- packet loss and retransmission patterns,
- timing jitter,
- carrier frequency offset,
- sampling frequency offset,
- antenna mismatch,
- and phase wrapping.

Because of that, the amplitude channel is often easier to exploit than raw phase. Phase can still be valuable, but only after phase sanitization, calibration, or differential processing.

### Practical consequence

Any downstream model should be evaluated on stability, not just raw separability. A feature that looks impressive on a single session but collapses on the next day is not a scientific result.

## 5. Environmental compensation

The DHT22 is not a replacement for CSI. It is a contextual sensor that can explain slow environmental drift.

Temperature and humidity can matter because they influence:

- dielectric properties of air and materials,
- propagation loss over time,
- oscillator stability and clock drift at the device level,
- and the baseline state of the channel when the room is otherwise unchanged.

The correct role of this sensor is compensation and stratification. It can support normalization models such as:

- baseline subtraction,
- rolling z-score normalization,
- linear or nonlinear regression against temperature and humidity,
- session-specific calibration,
- and drift-aware anomaly thresholds.

The DHT22 should not be presented as a precise laboratory instrument. It is good enough for relative ambient compensation, not for metrology-grade atmospheric science.

## 6. Architecture

The architecture should preserve the distinction between measurement, transport, processing, and visualization.

### Data path

1. The transmitter sends a controlled packet stream.
2. The receiver captures CSI samples and local sensor readings.
3. A parser attaches timestamps and metadata.
4. The data stream is serialized for transport.
5. The visualization layer consumes the stream and updates the dashboard.

This separation is important because the system will otherwise mix raw measurement logic with UI state and become difficult to validate.

### Recommended interface model

- Packet-level fields: sequence number, RSSI, CSI amplitudes, CSI phases, rate, channel, timestamp
- Sensor fields: temperature, humidity, sampling time, sensor validity
- Derived fields: normalized CSI, trend, anomaly score, confidence

## 7. What the 3D dashboard should show

The 3D interface should be functional, not decorative. Good candidates for visualization include:

- channel amplitude envelopes,
- subcarrier heatmaps,
- rolling variance over time,
- compensation-adjusted versus raw CSI,
- event markers for motion or threshold crossings,
- and confidence bands around state estimates.

If the 3D view is used, it should encode structure, such as room zones, sensing regions, or estimated activity states. A visually appealing scene that does not help interpretation is not a research contribution.

## 8. Experimental methodology

To make this project research-grade, each experiment should control a small set of variables:

- transmitter placement,
- receiver placement,
- antenna orientation,
- packet rate,
- channel number,
- room occupancy,
- furniture layout,
- temperature and humidity window,
- and subject motion pattern.

For each run, keep a metadata record that can reproduce the conditions.

### Minimum evaluation metrics

- CSI stability under static conditions
- Repeatability across sessions
- Sensitivity to motion or occupancy
- Drift reduction after compensation
- Latency from capture to dashboard update
- Robustness across days and environmental conditions

## 9. Failure modes and risks

Wi-Fi sensing projects often fail for predictable reasons:

- They confuse visualization quality with sensing quality.
- They overfit to one room or one day of data.
- They ignore the hardware-dependent nature of CSI.
- They do not separate calibration from inference.
- They claim precision that the instrument cannot support.

WiFiGhost should avoid those errors by publishing its assumptions explicitly and by preserving raw data alongside normalized features.

## 10. Research direction

The strongest next step is to build a reproducible pipeline for one of three goals:

1. Static occupancy and motion detection.
2. Drift-aware environmental monitoring.
3. Subcarrier-level anomaly visualization with calibration.

That path is more defensible than jumping directly to full 3D localization. It is also much more realistic for an ESP32-S3-based platform.

## 11. Canonical payload contract

The project should standardize one message format for capture, processing, and visualization.

```json
{
	"timestamp_ms": 0,
	"device_id": "heltec-rx-01",
	"sequence_number": 0,
	"rssi": -50,
	"channel": 6,
	"csi_amplitude": [],
	"csi_phase": [],
	"temperature_c": 25.4,
	"humidity_percent": 58.1,
	"motion_score": 0.0,
	"state": "static"
}
```

See the machine-readable schema in [canonical-payload.schema.json](canonical-payload.schema.json).

## 12. Conclusion

WiFiGhost can become a serious applied research project if it is framed as a channel-estimation and compensation system rather than a generic radar idea. The combination of CSI, environmental telemetry, and a disciplined dashboard can produce a useful experimental platform for indoor sensing research, but only if the work is grounded in real physical limits and reproducible methodology.

## References

- [ESP-IDF Wi-Fi CSI guide](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-guides/wifi.html#wi-fi-channel-state-information)
- [Espressif esp-csi repository](https://github.com/espressif/esp-csi)
- [esp-csi esp-radar examples](https://github.com/espressif/esp-csi/tree/master/examples/esp-radar)
- [esp-csi OFDM introduction](https://github.com/espressif/esp-csi/blob/master/docs/en/OFDM-introduction.md)
- [Wireless Channel Fundamentals](https://github.com/espressif/esp-csi/blob/master/docs/en/Wireless-Channel-Fundamentals.md)
- [Orthogonal frequency-division multiplexing](https://en.wikipedia.org/wiki/Orthogonal_frequency-division_multiplexing)
- [Multipath propagation](https://en.wikipedia.org/wiki/Multipath_propagation)
