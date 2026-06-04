import { CircleGauge, MapPin, Radar, Wifi } from "lucide-react";

export default function StatusPanel({ telemetry }) {
  const motionPercent = Math.round(telemetry.motion_score * 100);
  const hasTelemetry = telemetry.device_id !== "waiting-for-esp32";

  return (
    <section className="panel">
      <div className="panel-header">
        <Radar size={18} aria-hidden="true" />
        <h2>Occupancy</h2>
      </div>

      <div className={`presence ${telemetry.motion ? "presence-active" : "presence-idle"}`}>
        <span className="presence-dot" />
        <div>
          <strong>{hasTelemetry ? (telemetry.motion ? "Motion detected" : "Room idle") : "Waiting for ESP32"}</strong>
          <span>{hasTelemetry ? telemetry.state : "no telemetry yet"}</span>
        </div>
      </div>

      <div className="confidence-meter" aria-label={`Motion score ${motionPercent}%`}>
        <span style={{ width: `${motionPercent}%` }} />
      </div>

      <dl className="data-list">
        <div>
          <dt><CircleGauge size={16} aria-hidden="true" /> Score</dt>
          <dd>{hasTelemetry ? `${motionPercent}%` : "--"}</dd>
        </div>
        <div>
          <dt><MapPin size={16} aria-hidden="true" /> Zone</dt>
          <dd>{telemetry.zone}</dd>
        </div>
        <div>
          <dt><Wifi size={16} aria-hidden="true" /> Device</dt>
          <dd>{telemetry.device_id}</dd>
        </div>
        <div>
          <dt>RSSI delta</dt>
          <dd>{hasTelemetry ? `${telemetry.rssi_delta ?? "--"} dB` : "--"}</dd>
        </div>
        <div>
          <dt>Jitter</dt>
          <dd>{hasTelemetry ? `${telemetry.rssi_jitter ?? "--"} dB` : "--"}</dd>
        </div>
      </dl>
    </section>
  );
}
