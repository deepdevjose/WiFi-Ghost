# Frontend Architecture

The frontend should be a research dashboard, not only a visual demo.

## Responsibilities

- Show live CSI amplitude and phase summaries.
- Show raw versus compensated signals.
- Display motion score, drift indicators, and confidence.
- Render room zones when a localization model exists.
- Replay recorded sessions for comparison with notebooks.

## Visualization Rule

Three.js should encode meaningful state: zones, uncertainty, signal strength, motion events, or geometry. Decorative 3D should wait until the scientific view is useful.
