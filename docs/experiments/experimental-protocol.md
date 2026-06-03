# Experimental Protocol

## Purpose

This protocol defines how to run repeatable WiFiGhost experiments so that CSI captures can be compared across sessions, rooms, and hardware revisions.

## Scope

The protocol is intended for the current 2.4 GHz ESP32-S3 setup with a Heltec transmitter, a Heltec receiver, and a DHT22 sensor near the capture device.

## Required metadata

Record the following for every session:

- Session ID
- Date and time
- Room name or location
- Transmitter placement
- Receiver placement
- Antenna orientation
- Packet rate
- Wi-Fi channel
- Room occupancy state
- Furniture or obstacle changes
- Ambient temperature
- Ambient humidity

## Session phases

### 1. Baseline capture

Capture 2 to 5 minutes of data in a quiet, stable room with no intentional movement. This becomes the baseline reference for the session.

### 2. Controlled perturbation

Introduce one change at a time, such as:

- walking through the sensing area,
- opening or closing a door,
- moving a chair,
- or changing the position of one object.

Keep each perturbation short and clearly labeled.

### 3. Recovery capture

Return the room to the baseline state and capture again. This helps measure whether the channel returns to the original profile.

## Logging requirements

Each packet or observation should include:

- Timestamp in milliseconds
- Device ID
- Sequence number
- RSSI
- Channel number
- CSI amplitude array
- CSI phase array
- Temperature
- Humidity
- Motion score or event label
- State label such as static, transition, or motion

## Acceptance criteria

An experiment is acceptable when:

- the baseline is stable enough to show low within-session variance,
- perturbations are labeled clearly,
- raw and normalized data are both preserved,
- and the metadata is sufficient to reproduce the session.

## Recommended file outputs

- Raw packet log
- Derived feature log
- Environmental sensor log
- Session metadata file
- Visualization snapshot or report

## Notes

- Do not mix calibration and evaluation in the same unlabeled block.
- Do not compare sessions without recording hardware placement.
- Do not skip the quiet baseline, because it is the reference that makes drift visible.
