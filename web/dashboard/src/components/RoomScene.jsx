import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import Room from "../three/Room.jsx";
import SensorNode from "../three/SensorNode.jsx";
import HumanSilhouette from "../three/HumanSilhouette.jsx";
import WifiPropagation from "../three/WifiPropagation.jsx";
import { useTelemetryStore } from "../store/useTelemetryStore.js";

const zonePositions = {
  left: [-1.65, 0, -0.25],
  center: [0, 0, 0.1],
  right: [1.55, 0, -0.18],
  near: [0.25, 0, 1.25]
};

export default function RoomScene() {
  const telemetry = useTelemetryStore((state) => state.telemetry);
  const source = useTelemetryStore((state) => state.source);
  const devices = useTelemetryStore((state) => state.devices);
  const avatarPosition = zonePositions[telemetry.zone] ?? zonePositions.center;
  const heltec = devices["heltec-a-tx-01"];
  const heltecOnline = Boolean(heltec);
  const hasObstacle = telemetry.motion || telemetry.motion_score > 0.35;

  return (
    <section className="scene-section" aria-label="3D room telemetry">
      <div className="scene-topline">
        <div>
          <p className="eyebrow">RF Propagation</p>
          <h2>{hasObstacle ? "Obstacle perturbing the link" : "Baseline link model"}</h2>
        </div>
        <div className="live-pill">
          <span />
          {heltecOnline ? `${heltec.tx_rate_hz ?? "--"} Hz TX` : source === "esp32" ? "ESP32 JSON" : "Waiting"}
        </div>
      </div>

      <div className="scene-canvas">
        <div className="scene-hud">
          <span>TX: {heltecOnline ? "Heltec A online" : "waiting"}</span>
          <span>RX RSSI: {telemetry.rssi} dBm</span>
          <span>Delta: {telemetry.rssi_delta ?? "--"} dB</span>
          <span>Obstacle: {hasObstacle ? `${Math.round(telemetry.motion_score * 100)}%` : "clear"}</span>
        </div>
        <Canvas shadows camera={{ position: [4.4, 3.45, 5.2], fov: 42 }}>
          <color attach="background" args={["#eef2f3"]} />
          <ambientLight intensity={1.15} />
          <directionalLight position={[3, 5, 4]} intensity={2.15} castShadow />
          <spotLight position={[-3, 4.5, 3]} angle={0.5} penumbra={0.8} intensity={0.9} castShadow />
          <Room activeZone={telemetry.zone} />
          <SensorNode position={[-2.05, 0.16, 1.55]} label="ESP32 B" color="#0f8aa6" />
          <SensorNode position={[2.05, 0.16, -1.55]} label={heltecOnline ? "Heltec A" : "TX node"} color="#d69e2e" />
          <WifiPropagation
            motion={hasObstacle}
            score={telemetry.motion_score}
            txOnline={heltecOnline}
            rssi={telemetry.rssi}
            txRate={heltec?.tx_rate_hz}
            obstaclePosition={avatarPosition}
          />
          {hasObstacle && <HumanSilhouette position={avatarPosition} score={telemetry.motion_score} />}
          <ContactShadows position={[0, -0.02, 0]} opacity={0.22} scale={6.2} blur={2.8} far={3} />
          <OrbitControls enablePan={false} minDistance={4} maxDistance={8} maxPolarAngle={Math.PI / 2.1} />
        </Canvas>
      </div>
    </section>
  );
}
