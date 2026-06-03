# Wi-Fi Bands

The current WiFiGhost hardware target is ESP32-S3, which means the active project scope is 2.4 GHz Wi-Fi.

## Current Scope

- 2.4 GHz 802.11 b/g/n behavior.
- Commodity ESP32-S3 CSI capture.
- Indoor room-scale sensing with one transmitter and one receiver.

## Future Work

5 GHz and 6 GHz sensing require different radio hardware. Those bands may offer different multipath behavior, bandwidth, and antenna constraints, but they should not be mixed into the current ESP32-S3 implementation plan.

## Design Consequence

All simulations, notebooks, firmware assumptions, and dashboard labels should default to 2.4 GHz unless a future hardware branch explicitly changes the platform.
