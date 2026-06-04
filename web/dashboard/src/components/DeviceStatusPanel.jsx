import { Battery, RadioTower, Router, Zap } from "lucide-react";

export default function DeviceStatusPanel({ devices }) {
  const heltec = devices["heltec-a-tx-01"];
  const esp32b = devices["esp32-b-dht22-01"];
  const heltecOnline = Boolean(heltec);
  const esp32bOnline = Boolean(esp32b);

  return (
    <section className="panel device-panel">
      <div className="panel-header">
        <Router size={18} aria-hidden="true" />
        <h2>Nodes</h2>
      </div>

      <div className="node-status-grid">
        <NodeRow
          icon={<RadioTower size={16} aria-hidden="true" />}
          name="Heltec A"
          status={heltecOnline ? "TX online" : "Waiting"}
          meta={heltecOnline ? `${heltec.tx_rate_hz ?? "--"} Hz · ${heltec.rssi ?? "--"} dBm` : "No telemetry"}
          detail={heltecOnline ? `${heltec.tx_packets ?? "--"} packets · ch ${heltec.channel ?? "--"}` : "Flash Heltec TX"}
          online={heltecOnline}
        />
        <NodeRow
          icon={<Battery size={16} aria-hidden="true" />}
          name="Battery"
          status={heltecOnline ? `${heltec.battery_percent ?? "--"}%` : "--"}
          meta={heltecOnline ? `${heltec.battery_v ?? "--"} V` : "Heltec"}
          detail={heltecOnline && Number(heltec.battery_v) <= 0 ? "ADC needs calibration" : heltec?.ip ?? "No IP yet"}
          online={heltecOnline && Number(heltec.battery_v) > 0}
          warning={heltecOnline && Number(heltec.battery_v) <= 0}
        />
        <NodeRow
          icon={<Zap size={16} aria-hidden="true" />}
          name="ESP32 B"
          status={esp32bOnline ? "DHT22 live" : "Waiting"}
          meta={esp32bOnline ? `${esp32b.temperature_c ?? "--"} C · ${esp32b.humidity_percent ?? "--"}% · score ${Math.round((esp32b.motion_score ?? 0) * 100)}%` : "No telemetry"}
          detail={esp32bOnline ? `delta ${esp32b.rssi_delta ?? "--"} dB · jitter ${esp32b.rssi_jitter ?? "--"} dB` : "Flash ESP32 B"}
          online={esp32bOnline}
        />
      </div>
    </section>
  );
}

function NodeRow({ icon, name, status, meta, detail, online, warning }) {
  return (
    <div className={`node-status-row ${online ? "node-online" : ""} ${warning ? "node-warning" : ""}`}>
      <span className="node-status-icon">{icon}</span>
      <div>
        <strong>{name}</strong>
        <span>{meta}</span>
        <small>{detail}</small>
      </div>
      <b><i />{status}</b>
    </div>
  );
}
