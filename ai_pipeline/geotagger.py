import time
from typing import List, Optional

try:
    import pyxtf
except ImportError:
    pyxtf = None


def parse_xtf(xtf_path: str) -> list:
    """
    Reads an XTF file and returns a list of ping headers.
    Each ping header contains position, orientation, and timing data.
    """
    if pyxtf is None:
        raise ImportError("pyxtf is not installed. Run 'pip install pyxtf'.")
        
    (fh, packets) = pyxtf.xtf_read(xtf_path)
    pings = packets.get(pyxtf.XTFHeaderType.sonar, [])
    return pings


def geotag_detections(
    detections: List[dict],
    pings: list,
    frame_index: int,
    depth_m: float = 0.0
) -> List[dict]:
    """
    Maps each detection to its originating sonar ping, extracts
    position from the ping header, and returns enriched records.

    For demo without a real XTF file: pass pings=None and a synthetic
    position is generated from the mission GPS position. The pipeline
    structure is identical.
    """
    tagged = []

    for det in detections:
        if pings and frame_index < len(pings):
            ping = pings[frame_index]
            lat = ping.SensorYcoordinate
            lon = ping.SensorXcoordinate
            heading = ping.SensorHeading
            ping_number = ping.PingNumber
            ts = (f"{ping.Year}-{ping.Month:02d}-{ping.Day:02d}"
                  f"T{ping.Hour:02d}:{ping.Minute:02d}:{ping.Second:02d}Z")
        else:
            # Synthetic position for dataset replay demo
            lat = -54.2 + frame_index * 0.0001
            lon = 60.8  + frame_index * 0.0001
            heading = 90.0
            ping_number = frame_index
            ts = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

        tagged.append({
            "object_class":   det["class"],
            "confidence_raw": det["confidence_raw"],
            "confidence_cal": det["confidence_cal"],
            "shadow_penalty": det["shadow_penalty"],
            "lat":            round(lat, 6),
            "lon":            round(lon, 6),
            "depth_m":        depth_m,
            "heading_deg":    round(heading, 1),
            "bbox":           det["bbox"],
            "ping_number":    ping_number,
            "timestamp":      ts,
        })

    return tagged
