# Research

This document is the synthesis layer for the WiFiGhost project. It connects the physical radio channel, the ESP32-S3 implementation, the compensation strategy, and the visualization stack into one engineering narrative.

## Corrected scope

The current hardware in this repository is based on Heltec ESP32-S3 boards. That matters because the ESP32-S3 family is a 2.4 GHz Wi-Fi platform. It does not provide native 5 GHz or 6 GHz Wi-Fi operation, so the research scope should stay aligned with 2.4 GHz 802.11 b/g/n behavior.

## Why CSI matters

Channel State Information is the receiver's estimate of the wireless channel on each OFDM subcarrier. For Wi-Fi sensing, this is more valuable than RSSI because it preserves frequency-selective structure across the channel rather than collapsing the channel into a single power number.

In practice, CSI is a noisy proxy for the environment, not a direct measurement of objects. It is influenced by:

- multipath geometry,
- antenna orientation and polarization,
- packet timing,
- carrier and sampling frequency offsets,
- temperature and humidity drift,
- and the hardware implementation itself.

## Research thesis

WiFiGhost should be treated as a sensing and estimation problem:

1. The wireless channel is a dynamical system whose impulse response changes as the environment changes.
2. The ESP32-S3 receiver gives a discretized, imperfect observation of that system through CSI.
3. Environmental sensors such as a DHT22 can help explain slow drift and improve normalization.
4. A dashboard should show the estimated state and the confidence or instability of that estimate, not only a polished 3D effect.

## Main technical threads

### 1. Radio propagation

Indoor Wi-Fi is dominated by reflection, scattering, diffraction, absorption, and shadowing. At 2.4 GHz, wavelengths are about 12.5 cm, which means small movements can cause measurable phase and amplitude changes. Multipath is not an edge case; it is the default operating condition indoors.

### 2. OFDM and CSI structure

Wi-Fi uses OFDM. Each subcarrier samples the channel at a slightly different frequency, so CSI can reveal frequency-selective fading and not just total received power. This is why the channel response is richer than RSSI and why subcarrier-wise processing is the correct primitive.

### 3. Calibration and compensation

CSI needs normalization. Some variation comes from the environment, but some comes from device drift, packet capture jitter, and sensor bias. Compensation should therefore remove slow nuisance variation without erasing the phenomena of interest.

### 4. Visualization

The React + Three.js layer should not only render a decorative 3D dashboard. It should encode meaningful state: channel energy, temporal change, confidence, anomaly score, or region-level occupancy estimates.

## Evaluation questions

- How stable is the CSI stream under fixed conditions?
- Which environmental changes produce the strongest and most repeatable CSI signatures?
- How much improvement does environmental compensation give over raw CSI?
- Which features are robust across sessions, boards, and room layouts?
- Can the visualization distinguish real signal changes from sensor drift?

## Recommended output artifacts

- A data dictionary for every packet and sensor field
- A calibration protocol for each deployment
- A reproducible experiment log
- A feature extraction notebook or script
- A metrics report with accuracy, latency, and stability results

## Canonical payload contract

This project should standardize on one transport object for both logging and visualization.

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

The machine-readable schema lives in [../architecture/canonical-payload.schema.json](../architecture/canonical-payload.schema.json).

## Key conclusion

The strongest version of this project is not "Wi-Fi radar" in the loose sense. It is a calibrated wireless sensing pipeline that combines channel physics, embedded measurement, and interactive visualization into a system that can be studied, tested, and improved like any other serious estimation stack.

## References

- [ESP-IDF Wi-Fi guide](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-guides/wifi.html)
- [ESP-IDF Wi-Fi CSI section](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-guides/wifi.html#wi-fi-channel-state-information)
- [Espressif esp-csi repository](https://github.com/espressif/esp-csi)
- [esp-csi OFDM introduction](https://github.com/espressif/esp-csi/blob/master/docs/en/OFDM-introduction.md)
- [Wireless Channel Fundamentals](https://github.com/espressif/esp-csi/blob/master/docs/en/Wireless-Channel-Fundamentals.md)
- [Orthogonal frequency-division multiplexing](https://en.wikipedia.org/wiki/Orthogonal_frequency-division_multiplexing)
- [Multipath propagation](https://en.wikipedia.org/wiki/Multipath_propagation)
