# Notebooks

This folder contains simulation and analysis notebooks for WiFiGhost.

## Files

- [00_project_setup.ipynb](00_project_setup.ipynb)  
  Defines shared imports, constants, room dimensions, transmitter position, receiver position, and sample timing.
- [01_signal_propagation.ipynb](01_signal_propagation.ipynb)  
  Models 2.4 GHz wavelength, distance, path loss, and RSSI-like behavior for the direct path.
- [02_multipath_simulation.ipynb](02_multipath_simulation.ipynb)  
  Adds direct path, reflected paths, static reflectors, and moving-person effects.
- [03_synthetic_csi_generation.ipynb](03_synthetic_csi_generation.ipynb)  
  Converts path-level models into synthetic CSI-like vectors.
- [04_motion_detection_score.ipynb](04_motion_detection_score.ipynb)  
  Tests moving averages, variance, thresholds, and motion/no-motion state.
- [05_environmental_drift_compensation.ipynb](05_environmental_drift_compensation.ipynb)  
  Models DHT22-like temperature and humidity drift, then compensates it.
- [06_zone_estimation.ipynb](06_zone_estimation.ipynb)  
  Tests coarse front/back/center/left/right zone estimation from signal patterns.
- [07_virtual_room_simulation.ipynb](07_virtual_room_simulation.ipynb)  
  Renders the simulation state as a virtual room before implementing the React/Three.js dashboard.

## Purpose

These notebooks help validate the signal-processing logic before deploying the firmware to ESP32 devices.

The intended progression is:

```text
mathematical model -> simulation -> recorded data -> firmware/dashboard implementation
```
