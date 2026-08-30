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
