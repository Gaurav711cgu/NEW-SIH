"""
platform/database.py
--------------------
SQLite schema and access layer for the ocean platform.
Uses WAL mode for concurrent read/write from multiple processes.
"""

import json
import sqlite3
import time
import logging
from pathlib import Path
from typing import List, Optional, Any

log = logging.getLogger(__name__)

# Resolved relative to project root, not caller's cwd
DB_PATH = Path(__file__).resolve().parent.parent / "data" / "platform.db"


def get_connection() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def initialise():
    """Create all tables if they do not exist."""
    conn = get_connection()
    with conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS sensor_readings (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                sensor      TEXT    NOT NULL,
                value       REAL,
                unit        TEXT,
                source      TEXT,
                uncertainty REAL,
                depth_m     REAL,
                status      TEXT    DEFAULT 'ONLINE',
                qc_flag     INTEGER DEFAULT 1,
                platform    TEXT    DEFAULT '001',
                timestamp   REAL    NOT NULL,
                synced      INTEGER DEFAULT 0
            );

            CREATE INDEX IF NOT EXISTS idx_sensor_readings_sensor
                ON sensor_readings (sensor, timestamp DESC);

            CREATE TABLE IF NOT EXISTS detections (
                id             INTEGER PRIMARY KEY AUTOINCREMENT,
                object_class   TEXT    NOT NULL,
                confidence_cal REAL,
                confidence_raw REAL,
                shadow_penalty INTEGER DEFAULT 0,
                lat            REAL,
                lon            REAL,
                depth_m        REAL,
                bbox_x         REAL,
                bbox_y         REAL,
                bbox_w         REAL,
                bbox_h         REAL,
                heading_deg    REAL,
                ping_number    INTEGER,
                timestamp      TEXT,
                synced         INTEGER DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS mission_log (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                phase       TEXT    NOT NULL,
                depth_m     REAL,
                lat         REAL,
                lon         REAL,
                timestamp   REAL    NOT NULL
            );
        """)
    conn.close()


def get_latest_readings(sensor: Optional[str] = None, limit: int = 500) -> List[dict]:
    """Return most recent sensor readings, optionally filtered by sensor name."""
    conn = get_connection()
    try:
        if sensor:
            rows = conn.execute(
                "SELECT * FROM sensor_readings WHERE sensor = ? ORDER BY timestamp DESC LIMIT ?",
                (sensor, limit),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM sensor_readings ORDER BY timestamp DESC LIMIT ?",
                (limit,),
            ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def insert_reading(payload: dict) -> None:
    """Insert a single sensor reading from a validated payload dict."""
    conn = get_connection()
    try:
        with conn:
            conn.execute(
                """INSERT INTO sensor_readings
                   (sensor, value, unit, source, uncertainty, depth_m, status, qc_flag, platform, timestamp)
                   VALUES (:sensor, :value, :unit, :source, :uncertainty, :depth_m,
                           :status, :qc_flag, :platform, :timestamp)""",
                {
                    "sensor":      payload.get("sensor"),
                    "value":       payload.get("value"),
                    "unit":        payload.get("unit"),
                    "source":      payload.get("source"),
                    "uncertainty": payload.get("uncertainty"),
                    "depth_m":     payload.get("depth_m"),
                    "status":      payload.get("status", "ONLINE"),
                    "qc_flag":     payload.get("qc_flag", 1),
                    "platform":    payload.get("platform", "001"),
                    "timestamp":   payload.get("timestamp", time.time()),
                },
            )
    finally:
        conn.close()


def insert_detection(detection: dict) -> None:
    """
    Insert a geotagged detection record.
    Accepts bbox as either list [x,y,w,h] or dict {x, y, w, h}.
    """
    bbox = detection.get("bbox", [0, 0, 0, 0])
    if isinstance(bbox, (list, tuple)) and len(bbox) == 4:
        bx, by, bw, bh = float(bbox[0]), float(bbox[1]), float(bbox[2]), float(bbox[3])
    elif isinstance(bbox, dict):
        bx = float(bbox.get("x", 0))
        by = float(bbox.get("y", 0))
        bw = float(bbox.get("w", 0))
        bh = float(bbox.get("h", 0))
    else:
        bx = by = bw = bh = 0.0

    conn = get_connection()
    try:
        with conn:
            conn.execute(
                """INSERT INTO detections
                   (object_class, confidence_cal, confidence_raw, shadow_penalty,
                    lat, lon, depth_m, bbox_x, bbox_y, bbox_w, bbox_h,
                    heading_deg, ping_number, timestamp)
                   VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                (
                    detection.get("object_class"),
                    detection.get("confidence_cal"),
                    detection.get("confidence_raw"),
                    int(bool(detection.get("shadow_penalty", False))),
                    detection.get("lat"),
                    detection.get("lon"),
                    detection.get("depth_m"),
                    bx, by, bw, bh,
                    detection.get("heading_deg"),
                    detection.get("ping_number"),
                    detection.get("timestamp"),
                ),
            )
    finally:
        conn.close()


def get_detections(limit: int = 100) -> List[dict]:
    """Return most recent detection records."""
    conn = get_connection()
    try:
        rows = conn.execute(
            "SELECT * FROM detections ORDER BY id DESC LIMIT ?", (limit,)
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def get_unsynced_count() -> int:
    """Return number of sensor readings not yet synced to ground station."""
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT COUNT(*) as n FROM sensor_readings WHERE synced = 0"
        ).fetchone()
        return row["n"] if row else 0
    finally:
        conn.close()


def mark_synced(record_ids: List[int]) -> None:
    """Mark given record IDs as synced."""
    if not record_ids:
        return
    conn = get_connection()
    try:
        with conn:
            placeholders = ",".join("?" * len(record_ids))
            conn.execute(
                f"UPDATE sensor_readings SET synced=1 WHERE id IN ({placeholders})",
                record_ids,
            )
    finally:
        conn.close()
