# Electromagnetic Propagation

WiFiGhost observes changes in an electromagnetic field indirectly through Wi-Fi channel estimates.

## Working Model

At the receiver, the signal is a superposition of paths:

```text
received signal = direct path + reflected paths + noise
```

Each path has:

- distance,
- attenuation,
- phase rotation,
- delay,
- and possible interaction with people, walls, furniture, or doors.

## Why This Matters

At 2.4 GHz, the wavelength is roughly 12.5 cm. Small movements can change path length by a meaningful fraction of a wavelength, which changes constructive and destructive interference at the receiver.

## Simulation Priority

Before CSI generation, simulate a simple room with:

- one transmitter,
- one receiver,
- one moving person,
- one direct path,
- one reflected path,
- and additive noise.

This gives the firmware a physics-backed target instead of turning embedded debugging into the first research tool.
