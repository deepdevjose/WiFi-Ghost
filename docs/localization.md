# Localization

Localization is the highest-risk research problem in WiFiGhost.

Detecting that the channel changed is much easier than converting CSI into a meaningful room position. Position estimates should therefore be treated as hypotheses with confidence, not as ground truth.

## Core Question

How do we convert a noisy CSI stream into an approximate room zone?

The project should answer this progressively:

1. Can motion be detected at all?
2. Can the system distinguish static, moving, and post-motion recovery states?
3. Can controlled movement near known zones produce repeatable signatures?
4. Can those signatures generalize across sessions?
5. Can they generalize after small changes in furniture, orientation, temperature, or humidity?

## Candidate Approaches

- Baseline subtraction against an empty-room reference.
- Rolling variance and anomaly scores across subcarriers.
- Zone fingerprints captured during calibration walks.
- Multi-feature classifiers using CSI amplitude, sanitized phase, RSSI, and environmental context.
- Multi-receiver triangulation in future hardware revisions.
- Hybrid simulation plus empirical calibration.

## Known Risks

- CSI is not a direct spatial measurement.
- Multipath can make distant motion look stronger than nearby motion.
- Antenna placement and orientation can dominate the signature.
- Phase may require sanitization before it is useful.
- A model that works in one room may fail in another.
- Environmental drift can masquerade as slow motion or occupancy change.

## Research Direction

The first localization target should be coarse zone estimation:

- near transmitter,
- near receiver,
- central path,
- wall or doorway region,
- outside monitored region.

The dashboard should display zone confidence and uncertainty. It should not show precise coordinates until experiments justify that precision.
