import { useEffect } from "react";
import { useTelemetryStore } from "../store/useTelemetryStore.js";

function getTelemetryTarget() {
  const configuredHost = import.meta.env.VITE_TELEMETRY_HOST || import.meta.env.VITE_ESP32_HOST;
  const currentHost = window.location.hostname;
  const defaultHost = ["localhost", "127.0.0.1"].includes(currentHost)
    ? `${currentHost}:8080`
    : window.location.host;
  const host = configuredHost || defaultHost;
  const protocol = import.meta.env.VITE_TELEMETRY_PROTOCOL || window.location.protocol.replace(":", "");
  const wsUrl = import.meta.env.VITE_TELEMETRY_WS_URL || null;

  return {
    baseUrl: `${protocol}://${host}`,
    wsUrl
  };
}

export function useLiveTelemetry() {
  const ingestTelemetry = useTelemetryStore((state) => state.ingestTelemetry);
  const ingestDevices = useTelemetryStore((state) => state.ingestDevices);
  const setConnectionStatus = useTelemetryStore((state) => state.setConnectionStatus);

  useEffect(() => {
    const { baseUrl, wsUrl } = getTelemetryTarget();
    let socket;
    let pollTimer;
    let reconnectTimer;
    let disposed = false;
    let websocketAvailable = Boolean(wsUrl);

    async function fetchLatest() {
      try {
        const [latestResponse, devicesResponse] = await Promise.all([
          fetch(`${baseUrl}/api/latest`, { cache: "no-store" }),
          fetch(`${baseUrl}/api/devices`, { cache: "no-store" })
        ]);

        const response = latestResponse;
        if (!response.ok) {
          if (!websocketAvailable) setConnectionStatus("offline");
          return;
        }

        const payload = await response.json();
        if (payload && Object.keys(payload).length > 0) {
          ingestTelemetry(payload, "esp32");
        } else if (!websocketAvailable) {
          setConnectionStatus("waiting");
        }

        if (devicesResponse.ok) {
          const devicesPayload = await devicesResponse.json();
          if (devicesPayload.devices) {
            ingestDevices(devicesPayload.devices, "esp32");
          }
        }
      } catch (error) {
        if (!websocketAvailable) setConnectionStatus("offline");
        console.warn("Unable to fetch latest telemetry", error);
      }
    }

    function startPolling() {
      fetchLatest();
      pollTimer = window.setInterval(fetchLatest, 2000);
    }

    function connectWebSocket() {
      if (disposed || !wsUrl) return;
      setConnectionStatus("connecting");
      websocketAvailable = true;
      socket = new WebSocket(wsUrl);

      socket.addEventListener("open", () => setConnectionStatus("live"));
      socket.addEventListener("message", (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload && Object.keys(payload).length > 0) {
            ingestTelemetry(payload, "esp32");
          }
        } catch (error) {
          console.warn("Invalid telemetry payload", error);
        }
      });
      socket.addEventListener("close", () => {
        if (disposed) return;
        setConnectionStatus("offline");
        reconnectTimer = window.setTimeout(connectWebSocket, 2000);
      });
      socket.addEventListener("error", () => {
        setConnectionStatus("offline");
        socket.close();
      });
    }

    startPolling();
    connectWebSocket();

    return () => {
      disposed = true;
      window.clearInterval(pollTimer);
      window.clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, [ingestDevices, ingestTelemetry, setConnectionStatus]);
}
