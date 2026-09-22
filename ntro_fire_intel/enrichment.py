#!/usr/bin/env python3
"""
OSM Overpass Spatial Enrichment Engine for GEOINT Fire Intel.
SIH PS-26162
"""

import os
import json
import math
import logging
from pathlib import Path
from typing import Dict, Any, Optional, Tuple, List
import requests

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("enrichment")

EARTH_RADIUS_M = 6371000.0
DEFAULT_CACHE_PATH = Path(__file__).parent / "data" / "osm_cache.json"

FEATURE_NAMES = [
    "frp",
    "brightness",
    "bright_t31",
    "temp_delta",
    "osm_industrial_count",
    "osm_min_dist_m",
    "has_chemical_refinery",
    "has_power_infrastructure",
    "is_night"
]

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great-circle distance between two points on the Earth (in meters)
    using the Haversine formula (pure Python, no C-extension dependency).
    """
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lon2 - lon1)
    a = (math.sin(dphi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * (math.sin(dlam / 2.0) ** 2))
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return EARTH_RADIUS_M * c

def _point_in_bbox(lat: float, lon: float, bounds: Dict[str, float]) -> bool:
    return (bounds.get("min_lat", -90) <= lat <= bounds.get("max_lat", 90) and
            bounds.get("min_lon", -180) <= lon <= bounds.get("max_lon", 180))

class OSMEnricher:
    """
    Dual-mode spatial enricher:
    1. Attempts live Overpass API query within 2km radius.
    2. Falls back to pre-seeded gazetteer/cache in data/osm_cache.json if offline or sandboxed.
    """

    def __init__(self, cache_path: Optional[Path] = None):
        self.cache_path = cache_path or DEFAULT_CACHE_PATH
        self.gazetteer: List[Dict[str, Any]] = []
        self._load_cache()

    def _load_cache(self):
        if self.cache_path.exists():
            try:
                with open(self.cache_path, "r", encoding="utf-8") as f:
                    self.gazetteer = json.load(f)
                logger.debug("Loaded %d industrial clusters from %s", len(self.gazetteer), self.cache_path)
            except Exception as e:
                logger.warning("Could not read OSM cache: %s", e)
                self.gazetteer = []
        else:
            logger.warning("OSM cache not found at %s", self.cache_path)

    def query_overpass_live(self, lat: float, lon: float, radius_m: int = 2000, timeout: float = 3.0) -> Optional[Dict[str, Any]]:
        """
        Query OSM Overpass API for industrial tags within radius_m.
        """
        overpass_url = "https://overpass-api.de/api/interpreter"
        query = f"""
        [out:json][timeout:5];
        (
          node["landuse"="industrial"](around:{radius_m},{lat},{lon});
          way["landuse"="industrial"](around:{radius_m},{lat},{lon});
          node["industrial"](around:{radius_m},{lat},{lon});
          way["industrial"](around:{radius_m},{lat},{lon});
          node["power"~"plant|substation|generator"](around:{radius_m},{lat},{lon});
          way["power"~"plant|substation|generator"](around:{radius_m},{lat},{lon});
          node["man_made"~"refinery|works|chimney|storage_tank|silo|pipeline|flare"](around:{radius_m},{lat},{lon});
          way["man_made"~"refinery|works|chimney|storage_tank|silo|pipeline|flare"](around:{radius_m},{lat},{lon});
        );
        out center;
        """
        try:
            resp = requests.post(overpass_url, data={"data": query}, timeout=timeout)
            if resp.status_code == 200:
                data = resp.json()
                elements = data.get("elements", [])
                if not elements:
                    return None
                
                min_dist = float("inf")
                has_chem = 0
                has_pow = 0
                
                for el in elements:
                    el_lat = el.get("lat") or el.get("center", {}).get("lat")
                    el_lon = el.get("lon") or el.get("center", {}).get("lon")
                    if el_lat is not None and el_lon is not None:
                        d = haversine_distance(lat, lon, el_lat, el_lon)
                        if d < min_dist:
                            min_dist = d
                    tags = el.get("tags", {})
                    man_made = tags.get("man_made", "")
                    industrial = tags.get("industrial", "")
                    power = tags.get("power", "")
                    if any(x in str(man_made).lower() for x in ["refinery", "chemical", "storage_tank", "flare"]) or                        any(x in str(industrial).lower() for x in ["oil", "chemical", "refinery", "petro"]):
                        has_chem = 1
                    if any(x in str(power).lower() for x in ["plant", "substation", "generator"]):
                        has_pow = 1

                min_dist_m = min(min_dist, float(radius_m)) if min_dist != float("inf") else float(radius_m)
                return {
                    "osm_industrial_count": len(elements),
                    "osm_min_dist_m": round(min_dist_m, 2),
                    "has_chemical_refinery": has_chem,
                    "has_power_infrastructure": has_pow,
                    "dist_to_industrial_km": round(min_dist_m / 1000.0, 3),
                    "industrial_density_2km": len(elements),
                    "source": "live_overpass"
                }
        except Exception as e:
            logger.debug("Live Overpass query failed (%s). Using fallback.", e)
            return None
        return None

    def enrich_point(self, lat: float, lon: float, radius_m: int = 2000) -> Dict[str, Any]:
        """
        Enrich a spatial coordinate (lat, lon) with industrial proximity features.
        Attempts live Overpass API first, falls back seamlessly to gazetteer cache.
        """
        live_result = self.query_overpass_live(lat, lon, radius_m=radius_m)
        if live_result:
            return live_result

        # Fallback to local gazetteer
        best_cluster = None
        min_dist_to_center = float("inf")
        is_inside_bounds = False

        for cluster in self.gazetteer:
            bounds = cluster.get("bounds", {})
            if bounds and _point_in_bbox(lat, lon, bounds):
                is_inside_bounds = True
                best_cluster = cluster
                break
            
            center = cluster.get("center", {})
            c_lat = center.get("lat")
            c_lon = center.get("lon")
            if c_lat is not None and c_lon is not None:
                d = haversine_distance(lat, lon, c_lat, c_lon)
                if d < min_dist_to_center:
                    min_dist_to_center = d
                    best_cluster = cluster

        if is_inside_bounds and best_cluster:
            # Point is within the industrial zone perimeter
            center = best_cluster.get("center", {})
            d = haversine_distance(lat, lon, center.get("lat", lat), center.get("lon", lon))
            effective_dist = min(d, 450.0)  # Inside the complex
            tags = best_cluster.get("tags", {})
            facilities = best_cluster.get("facilities", [])
            tag_count = max(len(facilities) * 3, 12)
            has_chem = 1 if (tags.get("man_made") == "refinery" or "chemical" in str(tags.get("industrial", "")) or "petrochemical" in str(tags.get("industrial", ""))) else 0
            has_pow = 1 if (tags.get("power") == "plant" or any("power" in str(f).lower() or "ntpc" in str(f).lower() for f in facilities)) else 0
            return {
                "osm_industrial_count": tag_count,
                "osm_min_dist_m": round(effective_dist, 2),
                "has_chemical_refinery": has_chem,
                "has_power_infrastructure": has_pow,
                "dist_to_industrial_km": round(effective_dist / 1000.0, 3),
                "industrial_density_2km": tag_count,
                "matched_cluster": best_cluster.get("name"),
                "cluster_id": best_cluster.get("cluster_id"),
                "jurisdiction": best_cluster.get("jurisdiction"),
                "primary_hazard": best_cluster.get("primary_hazard"),
                "facilities": facilities,
                "source": "osm_cache_inside_cluster"
            }
        elif best_cluster and min_dist_to_center <= radius_m:
            tags = best_cluster.get("tags", {})
            facilities = best_cluster.get("facilities", [])
            tag_count = max(len(facilities) * 2, 6)
            has_chem = 1 if (tags.get("man_made") == "refinery" or "chemical" in str(tags.get("industrial", "")) or "petrochemical" in str(tags.get("industrial", ""))) else 0
            has_pow = 1 if (tags.get("power") == "plant" or any("power" in str(f).lower() for f in facilities)) else 0
            return {
                "osm_industrial_count": tag_count,
                "osm_min_dist_m": round(min_dist_to_center, 2),
                "has_chemical_refinery": has_chem,
                "has_power_infrastructure": has_pow,
                "dist_to_industrial_km": round(min_dist_to_center / 1000.0, 3),
                "industrial_density_2km": tag_count,
                "matched_cluster": best_cluster.get("name"),
                "cluster_id": best_cluster.get("cluster_id"),
                "jurisdiction": best_cluster.get("jurisdiction"),
                "primary_hazard": best_cluster.get("primary_hazard"),
                "facilities": facilities,
                "source": "osm_cache_proximity"
            }
        else:
            # Rural, agricultural, or wilderness location
            capped_dist = 2000.0
            return {
                "osm_industrial_count": 0,
                "osm_min_dist_m": capped_dist,
                "has_chemical_refinery": 0,
                "has_power_infrastructure": 0,
                "dist_to_industrial_km": round(capped_dist / 1000.0, 3),
                "industrial_density_2km": 0,
                "matched_cluster": None,
                "cluster_id": None,
                "jurisdiction": None,
                "primary_hazard": "Vegetation / Agricultural Biomass Burn",
                "facilities": [],
                "source": "osm_cache_rural_benchmark"
            }

_DEFAULT_ENRICHER = OSMEnricher()

def enrich_point(lat: float, lon: float, radius_m: int = 2000) -> Dict[str, Any]:
    """Module-level convenience function."""
    return _DEFAULT_ENRICHER.enrich_point(lat, lon, radius_m=radius_m)

def extract_features(anomaly: Dict[str, Any], osm_info: Optional[Dict[str, Any]] = None) -> Tuple[List[float], Dict[str, float]]:
    """
    Extract the 9 standardized features for model training & inference:
    [frp, brightness, bright_t31, temp_delta, osm_industrial_count, osm_min_dist_m, has_chemical_refinery, has_power_infrastructure, is_night]
    """
    if osm_info is None:
        lat = float(anomaly.get("latitude", 0.0))
        lon = float(anomaly.get("longitude", 0.0))
        osm_info = enrich_point(lat, lon)

    frp = float(anomaly.get("frp", 15.0))
    brightness = float(anomaly.get("bright_ti4", anomaly.get("brightness", 340.0)))
    bright_t31 = float(anomaly.get("bright_ti5", anomaly.get("bright_t31", 295.0)))
    temp_delta = float(round(brightness - bright_t31, 2))
    osm_industrial_count = float(osm_info.get("osm_industrial_count", 0))
    osm_min_dist_m = float(osm_info.get("osm_min_dist_m", 2000.0))
    has_chemical_refinery = float(osm_info.get("has_chemical_refinery", 0))
    has_power_infrastructure = float(osm_info.get("has_power_infrastructure", 0))
    
    dn = str(anomaly.get("daynight", "D")).strip().upper()
    is_night = 1.0 if dn == "N" else 0.0

    feat_dict = {
        "frp": frp,
        "brightness": brightness,
        "bright_t31": bright_t31,
        "temp_delta": temp_delta,
        "osm_industrial_count": osm_industrial_count,
        "osm_min_dist_m": osm_min_dist_m,
        "has_chemical_refinery": has_chemical_refinery,
        "has_power_infrastructure": has_power_infrastructure,
        "is_night": is_night
    }
    
    vector = [feat_dict[k] for k in FEATURE_NAMES]
    return vector, feat_dict

if __name__ == "__main__":
    # Self-test on Hazira Industrial Anomaly
    res = enrich_point(21.1625, 72.8312)
    print("Enrichment Self-Test (Hazira):", json.dumps(res, indent=2))
    vec, d = extract_features({"latitude": 21.1625, "longitude": 72.8312, "frp": 84.5, "bright_ti4": 365.4, "bright_ti5": 298.2, "daynight": "D"}, res)
    print("Extracted Features Vector:", vec)
    print("Features Dict:", d)
