import { Activity, Clock3, RadioTower, ThermometerSun, Wifi } from "lucide-react";
import { useLiveTelemetry } from "./hooks/useLiveTelemetry.js";
import { useTelemetryStore } from "./store/useTelemetryStore.js";
import StatusPanel from "./components/StatusPanel.jsx";
import EnvironmentPanel from "./components/EnvironmentPanel.jsx";
import MotionChart from "./components/MotionChart.jsx";
import RoomScene from "./components/RoomScene.jsx";
import DeviceStatusPanel from "./components/DeviceStatusPanel.jsx";

export default function App() {
  useLiveTelemetry();

  const telemetry = useTelemetryStore((state) => state.telemetry);
  const devices = useTelemetryStore((state) => state.devices);
  const source = useTelemetryStore((state) => state.source);
  const connectionStatus = useTelemetryStore((state) => state.connectionStatus);
  const hasTelemetry = telemetry.device_id !== "waiting-for-esp32";
  const motionPercent = Math.round(telemetry.motion_score * 100);

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">
            <RadioTower size={22} aria-hidden="true" />
          </div>
          <div>
            <p className="eyebrow">WiFi Ghost</p>
            <h1>Room Lab</h1>
          </div>
        </div>

        <section className="hero-metric" aria-label="Current motion confidence">
          <div>
            <p className="eyebrow">Motion confidence</p>
            <strong>{hasTelemetry ? `${motionPercent}%` : "--"}</strong>
          </div>
          <span className={telemetry.motion ? "hero-state hero-state-active" : "hero-state"}>
            {hasTelemetry ? (telemetry.motion ? "Active" : "Idle") : "Waiting"}
          </span>
        </section>

        <StatusPanel telemetry={telemetry} />
        <EnvironmentPanel telemetry={telemetry} />

        <div className="metric-strip" aria-label="Signal status">
          <div>
            <Activity size={18} aria-hidden="true" />
            <span>{hasTelemetry ? `${telemetry.rssi} dBm` : "-- dBm"}</span>
          </div>
          <div>
            <Clock3 size={18} aria-hidden="true" />
            <span>{hasTelemetry ? `${telemetry.latency_ms} ms` : "-- ms"}</span>
          </div>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Live environment model</p>
            <h2>{source === "esp32" ? "ESP32 telemetry" : "Waiting for ESP32 telemetry"}</h2>
          </div>
          <div className="topbar-meta">
            <span>{connectionStatus}</span>
            <span><Wifi size={16} aria-hidden="true" /> {telemetry.device_id}</span>
            <span><ThermometerSun size={16} aria-hidden="true" /> {hasTelemetry ? `${telemetry.temperature_c.toFixed(1)} C` : "-- C"}</span>
          </div>
        </header>
        <DeviceStatusPanel devices={devices} />
        <RoomScene />
        <MotionChart />
      </section>
    </main>
  );
}
