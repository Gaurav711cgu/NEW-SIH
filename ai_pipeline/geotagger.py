# ai_pipeline/geotagger.py
import time
from typing import List, Optional

def parse_xtf(xtf_path: str) -> list:
    """
    Reads an XTF file and returns a list of ping headers.
    Each ping header contains position, orientation, and timing data.
    """
    try:
        import pyxtf
        (fh, packets) = pyxtf.xtf_read(xtf_path)
        pings = packets.get(pyxtf.XTFHeaderType.sonar, [])
        return pings
    except Exception:
        return []

def geotag_detections(
    detections: List[dict],
    pings: Optional[list] = None,
    frame_index: int = 0,
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
        d = dict(det) if isinstance(det, dict) else det.to_dict()
        
        if pings and frame_index < len(pings):
            ping = pings[frame_index]
            lat = ping.SensorYcoordinate
            lon = ping.SensorXcoordinate
            heading = ping.SensorHeading
            ping_number = ping.PingNumber
            ts = (f"{ping.Year}-{ping.Month:02d}-{ping.Day:02d}"
                  f"T{ping.Hour:02d}:{ping.Minute:02d}:{ping.Second:02d}Z")
        else:
            # Synthetic position for dataset replay demo or use existing coordinates
            lat = d.get("lat") if d.get("lat") is not None else (-54.2 + frame_index * 0.0001)
            lon = d.get("lon") if d.get("lon") is not None else (60.8 + frame_index * 0.0001)
            heading = d.get("heading_deg") if d.get("heading_deg") is not None else 90.0
            ping_number = d.get("ping_number") if d.get("ping_number") is not None else frame_index
            ts = d.get("timestamp") or time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

        obj_class = d.get("object_class") or d.get("class") or d.get("class_name") or "anomaly"

        tagged.append({
            "object_class":   obj_class,
            "confidence_raw": d.get("confidence_raw", d.get("confidence", 0.5)),
            "confidence_cal": d.get("confidence_cal", d.get("confidence", 0.5)),
            "shadow_penalty": bool(d.get("shadow_penalty", False)),
            "lat":            round(float(lat), 6),
            "lon":            round(float(lon), 6),
            "depth_m":        float(d.get("depth_m") if d.get("depth_m") is not None else depth_m),
            "heading_deg":    round(float(heading), 1),
            "bbox":           d.get("bbox", [0, 0, 0, 0]),
            "ping_number":    int(ping_number),
            "timestamp":      ts,
        })

    return tagged
