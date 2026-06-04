import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTelemetryStore } from "../store/useTelemetryStore.js";

export default function MotionChart() {
  const history = useTelemetryStore((state) => state.history);
  const chartData = history.map((sample) => ({
    time: new Date(sample.timestamp).toLocaleTimeString([], {
      minute: "2-digit",
      second: "2-digit"
    }),
    score: Number((sample.motion_score * 100).toFixed(0)),
    temp: sample.temperature_c,
    humidity: sample.humidity_percent
  }));

  return (
    <section className="chart-band">
      <div className="chart-header">
        <div>
          <p className="eyebrow">Live ESP32 stream</p>
          <h2>Motion and room conditions</h2>
        </div>
        <div className="chart-legend" aria-label="Chart legend">
          <span className="legend-score">Motion</span>
          <span className="legend-humidity">Humidity</span>
          <span className="legend-temp">Temp</span>
        </div>
      </div>

      <div className="chart-frame">
        {chartData.length === 0 ? (
          <div className="empty-chart">Waiting for ESP32 telemetry</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 12, right: 18, bottom: 0, left: -18 }}>
              <XAxis dataKey="time" tickLine={false} axisLine={false} minTickGap={24} />
              <YAxis tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  background: "rgba(255, 255, 255, 0.94)",
                  border: "1px solid rgba(18, 24, 31, 0.1)",
                  borderRadius: "8px",
                  color: "#1d1d1f",
                  boxShadow: "0 18px 48px rgba(18, 24, 31, 0.14)"
                }}
              />
              <Line type="monotone" dataKey="score" stroke="#d69e2e" strokeWidth={3} dot={false} name="Motion score" />
              <Line type="monotone" dataKey="humidity" stroke="#0f8aa6" strokeWidth={2} dot={false} name="Humidity" />
              <Line type="monotone" dataKey="temp" stroke="#d75a4a" strokeWidth={2} dot={false} name="Temperature" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
