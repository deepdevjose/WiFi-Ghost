import { create } from "zustand";
import { initialTelemetry } from "../data/initialTelemetry.js";

const withTimestamp = {
  ...initialTelemetry,
  timestamp: Date.now()
};

export const useTelemetryStore = create((set, get) => ({
  telemetry: withTimestamp,
  history: [],
  devices: {},
  source: "waiting",
  connectionStatus: "connecting",
  ingestTelemetry: (payload, source = "esp32") => {
    const deviceId = payload.device_id ?? "unknown";
    const shouldUpdateEnvironment = deviceId.includes("esp32-b")
      || "temperature_c" in payload
      || "humidity_percent" in payload;

    if (!shouldUpdateEnvironment) {
      set((state) => ({
        devices: {
          ...state.devices,
          [deviceId]: {
            ...payload,
            timestamp: Date.now()
          }
        },
        source,
        connectionStatus: "live"
      }));
      return;
    }

    const next = {
      ...get().telemetry,
      ...payload,
      timestamp: Date.now(),
      motion: payload.motion ?? (payload.motion_score ?? 0) > 0.35,
      motion_score: payload.motion_score ?? 0,
      zone: payload.zone ?? "unknown",
      temperature_c: payload.temperature_c ?? get().telemetry.temperature_c,
      humidity_percent: payload.humidity_percent ?? get().telemetry.humidity_percent,
      rssi: payload.rssi ?? get().telemetry.rssi,
      latency_ms: payload.latency_ms ?? get().telemetry.latency_ms
    };

    set((state) => ({
      telemetry: next,
      history: [...state.history.slice(-47), next],
      devices: {
        ...state.devices,
        [deviceId]: next
      },
      source,
      connectionStatus: "live"
    }));
  },
  ingestDevices: (devices, source = "esp32") => {
    set((state) => ({
      devices: {
        ...state.devices,
        ...devices
      },
      source,
      connectionStatus: "live"
    }));
  },
  setConnectionStatus: (connectionStatus) => set({ connectionStatus })
}));
