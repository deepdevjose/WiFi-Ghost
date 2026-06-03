# Firmware Architecture

The firmware should behave like a measurement instrument.

## Transmitter

- Emit controlled 2.4 GHz Wi-Fi traffic.
- Keep packet cadence stable enough for repeatable captures.
- Avoid unnecessary application behavior that changes timing.

## Receiver

- Capture CSI, RSSI, channel, rate, sequence number, and timestamps.
- Read temperature and humidity near the receiver.
- Serialize raw observations using the canonical payload contract.
- Preserve raw data before applying derived labels or scores.

## Boundaries

Firmware should not own localization logic. It should collect clean, timestamped measurements that notebooks and the dashboard can replay.
