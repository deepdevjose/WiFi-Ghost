#!/usr/bin/env python3
"""Receive WiFi Ghost telemetry from ESP32 B on a laptop.

Endpoints:
- POST /api/telemetry  receives JSON payloads from ESP32 B
- GET  /api/latest     returns the latest payload
- GET  /api/health     returns receiver status
"""

from __future__ import annotations

import argparse
import json
import statistics
from collections import defaultdict, deque
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Lock

RSSI_WINDOW_SIZE = 12
BASELINE_ALPHA = 0.035
MIN_BASELINE_SAMPLES = 6
MOTION_ON_THRESHOLD = 0.26
MOTION_OFF_THRESHOLD = 0.14


STATE = {
    "latest": {},
    "latest_environment": {},
    "latest_by_device": {},
    "motion_by_device": defaultdict(
        lambda: {
            "baseline_rssi": None,
            "samples": deque(maxlen=RSSI_WINDOW_SIZE),
            "motion": False,
            "score": 0.0,
        }
    ),
    "received_count": 0,
    "started_at": datetime.now(timezone.utc).isoformat(),
}
STATE_LOCK = Lock()


def clamp(value: float, minimum: float = 0.0, maximum: float = 1.0) -> float:
    return max(minimum, min(maximum, value))


def estimate_zone(delta_rssi: float, jitter: float) -> str:
    if abs(delta_rssi) >= 9 or jitter >= 5:
        return "center"
    if delta_rssi <= -4:
        return "near"
    if delta_rssi >= 4:
        return "right"
    return "unknown"


def enrich_motion(payload: dict) -> dict:
    if "rssi" not in payload or not ("temperature_c" in payload or "humidity_percent" in payload):
        return payload

    device_id = payload.get("device_id", "unknown")
    rssi = float(payload["rssi"])
    motion_state = STATE["motion_by_device"][device_id]
    samples = motion_state["samples"]
    baseline = motion_state["baseline_rssi"]

    samples.append(rssi)

    if baseline is None:
        baseline = rssi

    delta = rssi - baseline

    if len(samples) < MIN_BASELINE_SAMPLES:
        score = 0.0
        jitter = 0.0
        motion = False
        state = "calibrating"
        zone = "unknown"
        baseline = (1.0 - BASELINE_ALPHA) * baseline + BASELINE_ALPHA * rssi
    else:
        jitter = statistics.pstdev(samples) if len(samples) > 1 else 0.0
        delta_score = clamp(abs(delta) / 5.0)
        jitter_score = clamp(jitter / 2.4)
        score = clamp(delta_score * 0.72 + jitter_score * 0.28)

        if motion_state["motion"]:
            motion = score >= MOTION_OFF_THRESHOLD
        else:
            motion = score >= MOTION_ON_THRESHOLD

        motion_state["motion"] = motion
        motion_state["score"] = score
        state = "motion" if motion else "static"
        zone = estimate_zone(delta, jitter) if motion else "unknown"

        if not motion:
            baseline = (1.0 - BASELINE_ALPHA) * baseline + BASELINE_ALPHA * rssi

    motion_state["baseline_rssi"] = baseline

    return {
        **payload,
        "motion_score": round(score, 2),
        "motion": motion,
        "state": state,
        "zone": zone,
        "rssi_baseline": round(baseline, 2),
        "rssi_delta": round(delta, 2),
        "rssi_jitter": round(jitter, 2),
        "baseline_samples": len(samples),
    }


class TelemetryHandler(BaseHTTPRequestHandler):
    log_path: Path

    def end_headers(self) -> None:
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self.end_headers()

    def do_GET(self) -> None:
        if self.path == "/api/latest":
            with STATE_LOCK:
                body = STATE["latest_environment"] or STATE["latest"]
            self.send_json(200, body)
            return

        if self.path == "/api/devices":
            with STATE_LOCK:
                body = {
                    "devices": STATE["latest_by_device"],
                    "received_count": STATE["received_count"],
                }
            self.send_json(200, body)
            return

        if self.path == "/api/health":
            with STATE_LOCK:
                body = {
                    "status": "ok",
                    "receiver": "laptop",
                    "received_count": STATE["received_count"],
                    "devices": sorted(STATE["latest_by_device"].keys()),
                    "motion_detector": {
                        "type": "rssi_baseline",
                        "window_size": RSSI_WINDOW_SIZE,
                        "min_baseline_samples": MIN_BASELINE_SAMPLES,
                        "motion_on_threshold": MOTION_ON_THRESHOLD,
                        "motion_off_threshold": MOTION_OFF_THRESHOLD,
                    },
                    "started_at": STATE["started_at"],
                    "log_path": str(self.log_path),
                }
            self.send_json(200, body)
            return

        if self.path == "/api/calibrate":
            with STATE_LOCK:
                STATE["motion_by_device"].clear()
                for device in STATE["latest_by_device"].values():
                    device["motion_score"] = 0.0
                    device["motion"] = False
                    device["state"] = "calibrating"
                    device["zone"] = "unknown"
                if STATE["latest_environment"]:
                    STATE["latest_environment"]["motion_score"] = 0.0
                    STATE["latest_environment"]["motion"] = False
                    STATE["latest_environment"]["state"] = "calibrating"
                    STATE["latest_environment"]["zone"] = "unknown"
            self.send_json(200, {"ok": True, "message": "motion baseline reset"})
            return

        self.send_json(
            200,
            {
                "service": "WiFi Ghost laptop telemetry receiver",
                "post": "/api/telemetry",
                "latest": "/api/latest",
                "devices": "/api/devices",
                "health": "/api/health",
                "calibrate": "/api/calibrate",
            },
        )

    def do_POST(self) -> None:
        if self.path != "/api/telemetry":
            self.send_json(404, {"ok": False, "error": "route not found"})
            return

        content_length = int(self.headers.get("Content-Length", "0"))
        raw_body = self.rfile.read(content_length)

        try:
            payload = json.loads(raw_body.decode("utf-8"))
        except json.JSONDecodeError as exc:
            self.send_json(400, {"ok": False, "error": f"invalid json: {exc}"})
            return

        with STATE_LOCK:
            enriched_payload = enrich_motion(payload)
            received_at = datetime.now(timezone.utc).isoformat()
            enriched_payload = {**enriched_payload, "received_at": received_at}
            device_id = payload.get("device_id", "unknown")
            STATE["latest"] = enriched_payload
            STATE["latest_by_device"][device_id] = enriched_payload
            if "temperature_c" in payload or "humidity_percent" in payload:
                STATE["latest_environment"] = enriched_payload
            STATE["received_count"] += 1
            received_count = STATE["received_count"]

        record = {
            "received_at": received_at,
            "payload": enriched_payload,
        }

        self.log_path.parent.mkdir(parents=True, exist_ok=True)
        with self.log_path.open("a", encoding="utf-8") as log_file:
            log_file.write(json.dumps(record, separators=(",", ":")) + "\n")

        print(
            f"[{received_at}] #{received_count} "
            f"{payload.get('device_id', 'unknown')} "
            f"temp={payload.get('temperature_c')}C "
            f"humidity={payload.get('humidity_percent')}% "
            f"rssi={payload.get('rssi')} "
            f"score={enriched_payload.get('motion_score')} "
            f"state={enriched_payload.get('state')} "
            f"tx_rate={payload.get('tx_rate_hz')}"
        )

        self.send_json(202, {"ok": True, "received_count": received_count})

    def send_json(self, status: int, body: object) -> None:
        encoded = json.dumps(body).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)

    def log_message(self, format: str, *args: object) -> None:
        return


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=8080)
    parser.add_argument(
        "--log",
        type=Path,
        default=Path("data/telemetry/esp32_b_telemetry.jsonl"),
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    TelemetryHandler.log_path = args.log
    server = ThreadingHTTPServer((args.host, args.port), TelemetryHandler)
    print(f"WiFi Ghost receiver listening on http://{args.host}:{args.port}")
    print(f"POST ESP32 B telemetry to http://<laptop-ip>:{args.port}/api/telemetry")
    print(f"Logging JSONL to {args.log}")
    server.serve_forever()


if __name__ == "__main__":
    main()
