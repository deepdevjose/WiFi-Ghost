# Notebooks

This folder contains simulation and analysis notebooks for WiFiGhost.

## Files

- [01_signal_propagation.ipynb](01_signal_propagation.ipynb)  
  Models a room, transmitter, receiver, person, direct path, reflected path, and noise.
- [02_multipath_simulation.ipynb](02_multipath_simulation.ipynb)  
  Expands the propagation model into multiple reflected paths.
- [03_csi_generation.ipynb](03_csi_generation.ipynb)  
  Converts path-level models into synthetic CSI-like vectors.
- [04_motion_detection.ipynb](04_motion_detection.ipynb)  
  Tests motion scores against synthetic and recorded baselines.
- [05_environmental_drift.ipynb](05_environmental_drift.ipynb)  
  Models temperature and humidity drift as nuisance variation.
- [06_zone_estimation.ipynb](06_zone_estimation.ipynb)  
  Tests coarse room-zone estimation from calibrated features.
- [07_virtual_room.ipynb](07_virtual_room.ipynb)  
  Renders the simulation state as a virtual room before implementing the React/Three.js dashboard.
- [01_wifi_csi_motion_simulation.ipynb](01_wifi_csi_motion_simulation.ipynb)  
  Existing combined simulation notebook retained for continuity.

## Purpose

These notebooks help validate the signal-processing logic before deploying the firmware to ESP32 devices.

The intended progression is:

```text
mathematical model -> simulation -> recorded data -> firmware/dashboard implementation
```
