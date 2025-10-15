"""Telemetry ingestion utilities."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Dict, Iterable

import json

DATA_DIR = Path(__file__).parent / "data" / "telemetry"


@dataclass
class TelemetrySnapshot:
    site_id: str
    timestamp: datetime
    flow_rate_m3_h: float
    residual_mg_L: float
    turbidity_NTU: float
    sensors: Dict[str, float]

    @classmethod
    def from_payload(cls, payload: Dict[str, object]) -> "TelemetrySnapshot":
        return cls(
            site_id=str(payload["site_id"]),
            timestamp=datetime.fromisoformat(str(payload["timestamp"])),
            flow_rate_m3_h=float(payload.get("flow_rate", 0.0)),
            residual_mg_L=float(payload.get("residual_chlorine", 0.0)),
            turbidity_NTU=float(payload.get("turbidity", 0.0)),
            sensors={k: float(v) for k, v in payload.get("sensors", {}).items()},
        )


def load_telemetry(site_id: str, data_dir: Path | None = None) -> Iterable[TelemetrySnapshot]:
    directory = data_dir or DATA_DIR
    for path in sorted(directory.glob(f"{site_id}_*.json")):
        with path.open("r", encoding="utf-8") as handle:
            payload = json.load(handle)
        yield TelemetrySnapshot.from_payload(payload)
