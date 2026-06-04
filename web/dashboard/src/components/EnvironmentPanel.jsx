import { Droplets, Gauge, Thermometer } from "lucide-react";

export default function EnvironmentPanel({ telemetry }) {
  const hasTelemetry = telemetry.device_id !== "waiting-for-esp32";

  return (
    <section className="panel">
      <div className="panel-header">
        <Gauge size={18} aria-hidden="true" />
        <h2>Environment</h2>
      </div>

      <div className="environment-grid">
        <article className="readout">
          <div className="readout-icon"><Thermometer size={19} aria-hidden="true" /></div>
          <span>Temperature</span>
          <strong>{hasTelemetry ? `${telemetry.temperature_c.toFixed(1)} C` : "-- C"}</strong>
        </article>
        <article className="readout">
          <div className="readout-icon"><Droplets size={19} aria-hidden="true" /></div>
          <span>Humidity</span>
          <strong>{hasTelemetry ? `${telemetry.humidity_percent.toFixed(1)}%` : "--%"}</strong>
        </article>
      </div>
    </section>
  );
}
