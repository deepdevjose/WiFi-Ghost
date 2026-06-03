# Communication

This document defines the transport boundary between capture, analysis, and visualization.

## Canonical Payload

The machine-readable schema lives in [canonical-payload.schema.json](canonical-payload.schema.json).

Every packet should preserve:

- timestamp,
- device id,
- sequence number,
- RSSI,
- channel,
- CSI amplitude,
- CSI phase,
- environmental readings,
- and optional derived fields.

## Transport Principles

- Preserve raw observations.
- Make packet order explicit.
- Include enough metadata for replay.
- Treat missing or invalid sensor readings as data, not as silent failures.
