# Wi-Fi Propagation

## Core idea

Wi-Fi propagation is the movement of electromagnetic energy through a real indoor environment. The received signal is not a single clean path. It is the sum of many direct and indirect paths that interfere with one another.

## Major mechanisms

- Free-space path loss
- Reflection from walls, furniture, glass, and metal surfaces
- Diffraction around edges and obstacles
- Scattering from rough surfaces and clutter
- Absorption by materials, bodies, and moisture
- Shadowing and blockage

## Multipath

Multipath occurs when the same transmitted signal arrives at the receiver through multiple paths. Those paths can arrive with different delay, attenuation, and phase, which produces constructive and destructive interference.

In indoor sensing, multipath is not just a nuisance. It is the mechanism that makes the channel sensitive to geometry and motion.

## Why 2.4 GHz matters

For the current ESP32-S3 hardware, the operating band is 2.4 GHz. That gives a wavelength of roughly 12.5 cm, so even relatively small movements can produce significant phase changes.

This is one reason Wi-Fi sensing can detect people moving in a room without any special imaging sensor.

## Indoor propagation implications

Indoor Wi-Fi channels are usually:

- frequency selective,
- time varying,
- and dominated by multipath rather than a clean line-of-sight path.

That means a channel response can have notches and peaks that shift when the environment changes.

## Sensing consequences

The main sensing cues are:

- amplitude changes from obstruction or reflection changes,
- phase changes from path-length variation,
- and time variation from moving scatterers.

This is why a person walking through the room can produce a measurable signature even if the communication link itself remains usable.

## Practical modeling stack

For WiFiGhost, a useful mental model is:

1. Geometry determines path lengths.
2. Path lengths determine delay and phase.
3. Many delayed paths combine into frequency-selective fading.
4. CSI samples the result across subcarriers.
5. The dashboard visualizes the evolution of that sampled channel.

## Research implication

Propagational theory tells you what CSI can plausibly see and what it cannot. If a phenomenon does not meaningfully perturb the channel at 2.4 GHz, CSI will not recover it reliably.

That makes propagation analysis the filter that keeps the project scientifically honest.
