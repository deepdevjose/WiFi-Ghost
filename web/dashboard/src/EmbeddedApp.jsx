import { useLiveTelemetry } from "./hooks/useLiveTelemetry.js";
import { useTelemetryStore } from "./store/useTelemetryStore.js";

export default function EmbeddedApp() {
  useLiveTelemetry();

  const telemetry = useTelemetryStore((state) => state.telemetry);
  const history = useTelemetryStore((state) => state.history);
  const connectionStatus = useTelemetryStore((state) => state.connectionStatus);
  const hasTelemetry = telemetry.device_id !== "waiting-for-esp32";
  const motionPercent = Math.round(telemetry.motion_score * 100);
  const latestHistory = history.slice(-24);

  return (
    <main className="embedded-shell">
      <section className="embedded-hero">
        <div>
          <p className="eyebrow">WiFi Ghost</p>
          <h1>Room Lab</h1>
        </div>
        <span className="live-pill"><span /> {connectionStatus}</span>
      </section>

      <section className="embedded-grid">
        <article className="hero-metric">
          <div>
            <p className="eyebrow">Motion confidence</p>
            <strong>{hasTelemetry ? `${motionPercent}%` : "--"}</strong>
          </div>
          <span className={telemetry.motion ? "hero-state hero-state-active" : "hero-state"}>
            {hasTelemetry ? (telemetry.motion ? "Active" : "Idle") : "Waiting"}
          </span>
        </article>

        <article className="panel">
          <div className="panel-header">
            <h2>Environment</h2>
          </div>
          <div className="environment-grid">
            <div className="readout">
              <span>Temperature</span>
              <strong>{hasTelemetry ? `${telemetry.temperature_c.toFixed(1)} C` : "-- C"}</strong>
            </div>
            <div className="readout">
              <span>Humidity</span>
              <strong>{hasTelemetry ? `${telemetry.humidity_percent.toFixed(1)}%` : "--%"}</strong>
            </div>
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <h2>Signal</h2>
          </div>
          <dl className="data-list">
            <div><dt>Device</dt><dd>{telemetry.device_id}</dd></div>
            <div><dt>RSSI</dt><dd>{hasTelemetry ? `${telemetry.rssi} dBm` : "--"}</dd></div>
            <div><dt>Sequence</dt><dd>{hasTelemetry ? telemetry.sequence_number : "--"}</dd></div>
            <div><dt>Zone</dt><dd>{telemetry.zone}</dd></div>
          </dl>
        </article>

        <article className="panel embedded-room">
          <div className="panel-header">
            <h2>Room</h2>
          </div>
          <div className="room-map">
            <span className="sensor-node sensor-a">ESP32 B</span>
            <span className="sensor-node sensor-b">ESP32 C</span>
            {telemetry.motion && <span className={`presence-avatar zone-${telemetry.zone}`} />}
          </div>
        </article>

        <article className="panel embedded-chart">
          <div className="panel-header">
            <h2>Recent stream</h2>
          </div>
          {latestHistory.length === 0 ? (
            <div className="empty-chart">Waiting for ESP32 telemetry</div>
          ) : (
            <div className="spark-bars">
              {latestHistory.map((sample) => (
                <span
                  key={sample.timestamp}
                  style={{ height: `${Math.max(4, Math.round((sample.motion_score ?? 0) * 100))}%` }}
                  title={`${Math.round((sample.motion_score ?? 0) * 100)}%`}
                />
              ))}
            </div>
          )}
        </article>
      </section>
    </main>
  );
}
