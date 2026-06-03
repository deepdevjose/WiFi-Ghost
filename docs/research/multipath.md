# Multipath

Multipath is the default indoor Wi-Fi condition, not an edge case.

## Definition

Multipath occurs when one transmitted signal reaches the receiver by several routes. Each route can have a different distance, delay, attenuation, and phase.

## Sensing Implication

A person can perturb one path without blocking the direct line between transmitter and receiver. That perturbation can still change the combined channel response enough to appear in CSI.

## First Notebook Target

The first simulation should model:

```text
H = H_direct + H_reflected + noise
```

Then vary the reflected path length as a person moves. This creates a controlled way to observe fading, phase rotation, and motion-sensitive amplitude variation before using real hardware.
