import time
import math
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


def project_bbox_to_latlon(bbox: List[int], auv_lat: float, auv_lon: float, auv_heading: float, meters_per_pixel: float = 0.05) -> tuple:
    """
    Projects a bounding box from image coordinates to real-world Lat/Lon
    using the AUV's position, heading, and an assumed resolution.
    """
    # Calculate bounding box center
    cx = (bbox[0] + bbox[2]) / 2.0
    cy = (bbox[1] + bbox[3]) / 2.0
    
    # Calculate offsets in meters (assuming cy is along-track and cx is across-track)
    dx_m = cx * meters_per_pixel
    dy_m = cy * meters_per_pixel
    
    # Rotate by AUV heading to get North/East offsets
    heading_rad = math.radians(auv_heading)
    delta_n = dy_m * math.cos(heading_rad) + dx_m * math.sin(heading_rad)
    delta_e = dy_m * math.sin(heading_rad) - dx_m * math.cos(heading_rad)
    
    # Convert metric offsets to Lat/Lon degrees
    earth_radius = 6378137.0
    d_lat = delta_n / earth_radius
    d_lon = delta_e / (earth_radius * math.cos(math.radians(auv_lat)))
    
    det_lat = auv_lat + math.degrees(d_lat)
    det_lon = auv_lon + math.degrees(d_lon)
    
    return det_lat, det_lon


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

        # Project bbox to lat/lon
        bbox = det["bbox"]
        det_lat, det_lon = project_bbox_to_latlon(bbox, lat, lon, heading)

        tagged.append({
            "object_class":   det["class"],
            "confidence_raw": det["confidence_raw"],
            "confidence_cal": det["confidence_cal"],
            "shadow_penalty": det["shadow_penalty"],
            "lat":            round(det_lat, 6),
            "lon":            round(det_lon, 6),
            "auv_lat":        round(lat, 6),
            "auv_lon":        round(lon, 6),
            "depth_m":        depth_m,
            "heading_deg":    round(heading, 1),
            "bbox":           det["bbox"],
            "ping_number":    ping_number,
            "timestamp":      ts,
        })

    return tagged
