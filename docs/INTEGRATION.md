# Integration Guide

## Architecture Principle

The downstream processing pipeline does not know whether a sensor reading originated from physical hardware or a virtual dataset source. This is enforced by a shared JSON schema on all MQTT messages. The source label field identifies the origin without changing the processing path.

This is not a workaround. It is the same decoupling principle used in production telemetry systems (e.g., OpenTelemetry) and is consistent with the Argo programme's own distinction between real-time and delayed-mode data, which go through the same processing pipeline with a quality flag indicating data mode.

---

## MQTT Topic Schema

All messages follow this topic convention:

```
platform/{platform_id}/sensors/{parameter}         # real hardware
platform/{platform_id}/sensors/virtual/{parameter} # virtual source
platform/{platform_id}/mission/phase               # mission state
platform/{platform_id}/mission/gps                 # position
platform/{platform_id}/sonar/detection             # AI detection result
platform/{platform_id}/system/battery              # system health
platform/{platform_id}/system/status               # connectivity
```

---

## MQTT Message Schema

Every message from both real and virtual publishers uses this JSON structure:

```json
{
    "sensor":        "temperature",
    "value":         24.31,
    "uncertainty":   0.004,
    "unit":          "degC",
    "source":        "REAL_HARDWARE",
    "depth_m":       0.0,
    "platform":      "001",
    "timestamp":     1725000000.0,
    "status":        "ONLINE"
}
```

Virtual sources add:

```json
{
    "dataset":       "BGC-Argo Southern Ocean Indian sector",
    "qc_flag":       1,
    "mission_phase": "OBSERVING"
}
```

The subscriber processes both message types identically. The source field is stored in the database and displayed as a label on the dashboard.

---

## Database Schema

```python
# platform/database.py

import sqlite3
from contextlib import contextmanager
from pathlib import Path

DB_PATH = "data/platform.db"

SCHEMA = """
CREATE TABLE IF NOT EXISTS sensor_readings (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    platform_id     TEXT    NOT NULL,
    sensor          TEXT    NOT NULL,
    value           REAL,
    uncertainty     REAL,
    unit            TEXT,
    source          TEXT    NOT NULL,
    depth_m         REAL,
    mission_phase   TEXT,
    status          TEXT,
    timestamp       REAL    NOT NULL,
    synced          INTEGER DEFAULT 0,
    created_at      REAL    DEFAULT (unixepoch('now', 'subsec'))
);

CREATE TABLE IF NOT EXISTS detections (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    platform_id     TEXT    NOT NULL,
    object_class    TEXT    NOT NULL,
    confidence_raw  REAL    NOT NULL,
    confidence_cal  REAL    NOT NULL,
    shadow_penalty  INTEGER DEFAULT 0,
    lat             REAL,
    lon             REAL,
    depth_m         REAL,
    bbox_x          REAL,
    bbox_y          REAL,
    bbox_w          REAL,
    bbox_h          REAL,
    ping_number     INTEGER,
    timestamp       REAL    NOT NULL,
    synced          INTEGER DEFAULT 0,
    created_at      REAL    DEFAULT (unixepoch('now', 'subsec'))
);

CREATE TABLE IF NOT EXISTS mission_log (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    platform_id     TEXT    NOT NULL,
    phase           TEXT    NOT NULL,
    depth_m         REAL,
    lat             REAL,
    lon             REAL,
    battery_pct     REAL,
    timestamp       REAL    NOT NULL
);

CREATE TABLE IF NOT EXISTS sync_queue (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name      TEXT    NOT NULL,
    record_id       INTEGER NOT NULL,
    created_at      REAL    DEFAULT (unixepoch('now', 'subsec'))
);

CREATE INDEX IF NOT EXISTS idx_readings_platform_time
    ON sensor_readings(platform_id, timestamp);

CREATE INDEX IF NOT EXISTS idx_detections_platform_time
    ON detections(platform_id, timestamp);

CREATE INDEX IF NOT EXISTS idx_readings_synced
    ON sensor_readings(synced);

CREATE INDEX IF NOT EXISTS idx_detections_synced
    ON detections(synced);
"""


@contextmanager
def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def initialise():
    Path("data").mkdir(exist_ok=True)
    with get_connection() as conn:
        conn.executescript(SCHEMA)


def insert_reading(payload: dict) -> int:
    with get_connection() as conn:
        cur = conn.execute("""
            INSERT INTO sensor_readings
                (platform_id, sensor, value, uncertainty, unit, source,
                 depth_m, mission_phase, status, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            payload.get("platform", "001"),
            payload["sensor"],
            payload.get("value"),
            payload.get("uncertainty"),
            payload.get("unit", ""),
            payload["source"],
            payload.get("depth_m", 0.0),
            payload.get("mission_phase", "UNKNOWN"),
            payload.get("status", "ONLINE"),
            payload["timestamp"]
        ))
        record_id = cur.lastrowid
        conn.execute(
            "INSERT INTO sync_queue (table_name, record_id) VALUES (?, ?)",
            ("sensor_readings", record_id)
        )
        return record_id


def insert_detection(detection: dict) -> int:
    with get_connection() as conn:
        cur = conn.execute("""
            INSERT INTO detections
                (platform_id, object_class, confidence_raw, confidence_cal,
                 shadow_penalty, lat, lon, depth_m,
                 bbox_x, bbox_y, bbox_w, bbox_h,
                 ping_number, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            detection.get("platform", "001"),
            detection["object_class"],
            detection["confidence_raw"],
            detection["confidence_cal"],
            int(detection.get("shadow_penalty", False)),
            detection.get("lat"),
            detection.get("lon"),
            detection.get("depth_m", 0.0),
            detection["bbox"]["x"],
            detection["bbox"]["y"],
            detection["bbox"]["w"],
            detection["bbox"]["h"],
            detection.get("ping_number"),
            detection["timestamp"]
        ))
        record_id = cur.lastrowid
        conn.execute(
            "INSERT INTO sync_queue (table_name, record_id) VALUES (?, ?)",
            ("detections", record_id)
        )
        return record_id


def get_unsynced_count() -> int:
    with get_connection() as conn:
        row = conn.execute("SELECT COUNT(*) FROM sync_queue").fetchone()
        return row[0]


def mark_synced(table_name: str, record_ids: list):
    with get_connection() as conn:
        conn.execute(
            f"UPDATE {table_name} SET synced = 1 WHERE id IN ({','.join('?'*len(record_ids))})",
            record_ids
        )
        conn.execute(
            "DELETE FROM sync_queue WHERE table_name = ? AND record_id IN "
            f"({','.join('?'*len(record_ids))})",
            [table_name] + record_ids
        )


def get_latest_readings(platform_id: str = "001", limit: int = 100) -> list:
    with get_connection() as conn:
        rows = conn.execute("""
            SELECT sensor, value, uncertainty, unit, source, depth_m,
                   mission_phase, status, timestamp
            FROM sensor_readings
            WHERE platform_id = ?
            ORDER BY timestamp DESC
            LIMIT ?
        """, (platform_id, limit)).fetchall()
        return [dict(row) for row in rows]
```

---

## MQTT Subscriber

```python
# platform/mqtt_subscriber.py

import json
import paho.mqtt.client as mqtt
from database import initialise, insert_reading

MQTT_BROKER = "localhost"
MQTT_PORT   = 1883
PLATFORM_ID = "001"

initialise()


def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload.decode())

        # Normalise virtual topic to same schema as real
        if "/virtual/" in msg.topic:
            payload["source"] = payload.get("source", "VIRTUAL")

        insert_reading(payload)

    except json.JSONDecodeError:
        print(f"Invalid JSON on topic {msg.topic}")
    except Exception as e:
        print(f"Error processing message: {e}")


def on_connect(client, userdata, flags, rc):
    if rc == 0:
        client.subscribe(f"platform/{PLATFORM_ID}/sensors/#")
        client.subscribe(f"platform/{PLATFORM_ID}/sonar/#")
        client.subscribe(f"platform/{PLATFORM_ID}/mission/#")
        print(f"Subscriber connected. Listening on platform/{PLATFORM_ID}/#")
    else:
        print(f"Connection failed with code {rc}")


client = mqtt.Client(client_id="subscriber_001")
client.on_connect = on_connect
client.on_message = on_message
client.connect(MQTT_BROKER, MQTT_PORT)
client.loop_forever()
```

---

## Mission Finite State Machine

```python
# platform/mission_fsm.py

import time
from enum import Enum

class Phase(str, Enum):
    SURFACE      = "SURFACE"
    DESCENDING   = "DESCENDING"
    OBSERVING    = "OBSERVING"
    SONAR_SCAN   = "SONAR_SCAN"
    ASCENDING    = "ASCENDING"
    REPORTING    = "REPORTING"

MISSION_PROFILE = [
    (Phase.SURFACE,    0,   30),   # phase, target_depth_m, duration_s
    (Phase.DESCENDING, 500, 120),
    (Phase.OBSERVING,  500, 60),
    (Phase.SONAR_SCAN, 200, 45),
    (Phase.ASCENDING,  0,   90),
    (Phase.REPORTING,  0,   30),
]


class MissionFSM:
    def __init__(self):
        self.phase_idx   = 0
        self.phase_start = time.time()
        self.depth       = 0.0

    def _current_spec(self):
        return MISSION_PROFILE[self.phase_idx % len(MISSION_PROFILE)]

    def step(self):
        phase, target_depth, duration = self._current_spec()
        elapsed = time.time() - self.phase_start

        # Update depth (linear interpolation toward target)
        if self.depth != target_depth:
            prev_phase, prev_depth, _ = MISSION_PROFILE[
                (self.phase_idx - 1) % len(MISSION_PROFILE)
            ]
            progress = min(elapsed / duration, 1.0)
            self.depth = prev_depth + (target_depth - prev_depth) * progress

        if elapsed >= duration:
            self.phase_idx += 1
            self.phase_start = time.time()

    def current_depth(self) -> float:
        return round(self.depth, 1)

    def current_phase(self) -> str:
        return self._current_spec()[0].value

    def is_sonar_active(self) -> bool:
        return self._current_spec()[0] == Phase.SONAR_SCAN
```

---

## Offline Sync

When the network connection is cut, the platform continues operating. All data is written to SQLite immediately. When connectivity is restored, the sync queue is flushed.

```python
# platform/sync_manager.py

import time
import requests
from database import get_connection, get_unsynced_count, mark_synced

GROUND_STATION_URL = "http://ground-station:8080/api/v1/sync"
SYNC_INTERVAL = 30  # seconds


def attempt_sync():
    with get_connection() as conn:
        queue = conn.execute("""
            SELECT sq.table_name, sq.record_id
            FROM sync_queue sq
            ORDER BY sq.created_at ASC
            LIMIT 100
        """).fetchall()

    if not queue:
        return 0

    records = {"sensor_readings": [], "detections": []}
    for row in queue:
        records[row["table_name"]].append(row["record_id"])

    try:
        response = requests.post(
            GROUND_STATION_URL,
            json=records,
            timeout=10
        )
        if response.status_code == 200:
            for table, ids in records.items():
                if ids:
                    mark_synced(table, ids)
            return sum(len(v) for v in records.values())
    except requests.RequestException:
        pass  # Network unavailable. Will retry.

    return 0


def run():
    while True:
        synced = attempt_sync()
        remaining = get_unsynced_count()
        if synced > 0:
            print(f"Synced {synced} records. {remaining} remaining in queue.")
        time.sleep(SYNC_INTERVAL)


if __name__ == "__main__":
    run()
```

---

## End-to-End Data Flow Summary

```
Physical sensor (ESP32)          Virtual sensor (Python)
    |                                    |
    +--- MQTT publish ---+--- MQTT publish ---+
                         |
                    MQTT Broker
                    (Mosquitto)
                         |
              mqtt_subscriber.py
                         |
                   JSON parse
                   source check
                         |
                      SQLite
                  sensor_readings
                  detections
                  sync_queue
                         |
              +----------+-----------+
              |          |           |
          Dashboard   AI Engine  Sync Manager
          (Streamlit) (YOLOv8)   (HTTP POST)
              |                       |
          4 pages             Ground station
          LIVE/VIRTUAL        (when online)
          labels
```

The AI engine reads sonar frames from the dataset replay buffer (or real sonar when integrated), runs inference, and writes detection records to the database via `insert_detection()`. The dashboard reads from the database on a polling interval. There is no direct dependency between the AI engine and the dashboard.

---

## Startup Order

```
1. mosquitto -c config/mosquitto.conf
2. python platform/mqtt_subscriber.py
3. python virtual_sensors/virtual_publisher.py
4. python hardware/mock_esp32.py          # if ESP32 not connected
5. python ai_pipeline/sonar_runner.py
6. python platform/sync_manager.py
7. streamlit run dashboard/app.py
```

For hardware integration, replace step 4 with flashing and connecting the ESP32. All other steps remain identical.
