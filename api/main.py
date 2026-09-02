"""
api/main.py  —  DeepScan FastAPI backend
----------------------------------------
Run: uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
"""
import sys
import time
import tempfile
import logging
import io
from pathlib import Path
from typing import Any, List, Optional

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import yaml
from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse

START_TIME = time.time()

log = logging.getLogger("deepscan.api")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

_CFG_PATH = ROOT / "config" / "pipeline_config.yaml"
_cfg: dict = {}
if _CFG_PATH.exists():
    with open(_CFG_PATH, "r") as f:
        _cfg = yaml.safe_load(f) or {}

app = FastAPI(
    title="DeepScan API",
    description="AI-powered Marine Debris & Seabed Intelligence Telemetry OS",
    version="1.0.0"
)

# Explicit CORS configuration for frontend clients
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_detector = None
_model_ready: Optional[bool] = None

# Allowed image types for secure file uploads
ALLOWED_MIME_TYPES = {
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/tiff",
    "image/bmp",
    "image/webp",
    "application/octet-stream",
}
ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".tiff", ".tif", ".bmp", ".webp"}


def _get_detector():
    global _detector, _model_ready
    if _detector is not None:
        return _detector
    try:
        from ai_pipeline.detector import SonarDetector
        det = SonarDetector()
        _model_ready = det.model is not None
        if _model_ready:
            _detector = det
            log.info("SonarDetector loaded successfully.")
    except Exception as exc:
        log.error("Detector load failed: %s", exc)
        _model_ready = False
    return _detector


def _check_ready() -> bool:
    global _model_ready
    if _model_ready is None:
        _get_detector()
    return bool(_model_ready)


@app.on_event("startup")
async def on_startup():
    """Initialise database schema and warm up model detector."""
    try:
        from platform_pkg.database import initialise
        initialise()
    except Exception as exc:
        log.warning("Database init warning: %s", exc)
    _check_ready()


@app.get("/api/health")
async def health():
    """System health, model status, and uptime."""
    return {
        "status": "operational",
        "model_ready": _check_ready(),
        "uptime_s": int(time.time() - START_TIME),
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }


@app.get("/api/auv/state")
async def auv_state():
    """Return current simulated or live AUV position, state, depth, and battery."""
    try:
        from platform_pkg.database import get_latest_readings
        rows = get_latest_readings(limit=200)

        def _val(sensor_name: str) -> Optional[float]:
            return next((float(r["value"]) for r in rows if r.get("sensor") == sensor_name and r.get("value") is not None), None)

        def _raw(sensor_name: str) -> Optional[str]:
            return next((str(r["value"]) for r in rows if r.get("sensor") == sensor_name and r.get("value") is not None), None)

        depth = _val("depth")
        battery = _val("battery")
        lat = _val("lat")
        lon = _val("lon")
        db_state = _raw("mission_state") or _raw("phase")

        if db_state and db_state.strip():
            m_state = db_state.strip()
        elif depth is not None:
            if depth <= 5.0:
                m_state = "SATCOM_UPLINK"
            elif depth < 50.0:
                m_state = "SURFACE"
            elif depth < 500.0:
                m_state = "SUBMERGED_EDGE_AI"
            else:
                m_state = "DEEP_SURVEY"
        else:
            depth = 0.0
            battery = 100.0
            lat = -54.201
            lon = 60.810
            m_state = "SURFACE"

        return {
            "depth_m": round(depth, 2) if depth is not None else 0.0,
            "battery_pct": round(battery, 2) if battery is not None else 100.0,
            "mission_state": m_state,
            "lat": round(lat, 6) if lat is not None else -54.201,
            "lon": round(lon, 6) if lon is not None else 60.810,
        }
    except Exception as exc:
        log.error("auv_state retrieval error: %s", exc)
        return {
            "depth_m": 0.0,
            "battery_pct": 100.0,
            "mission_state": "SURFACE",
            "lat": -54.201,
            "lon": 60.810,
        }


@app.get("/api/telemetry")
async def telemetry():
    """Return live changing sensor telemetry, vehicle status, and ocean parameters."""
    try:
        from platform_pkg.database import get_latest_readings
        rows = get_latest_readings(limit=200)

        def _val(sensor_name: str) -> Optional[float]:
            return next((float(r["value"]) for r in rows if r.get("sensor") == sensor_name and r.get("value") is not None), None)

        def _raw(sensor_name: str) -> Optional[str]:
            return next((str(r["value"]) for r in rows if r.get("sensor") == sensor_name and r.get("value") is not None), None)

        depth = _val("depth")
        battery = _val("battery")
        lat = _val("lat")
        lon = _val("lon")
        db_state = _raw("mission_state") or _raw("phase")

        if db_state and db_state.strip():
            m_state = db_state.strip()
        elif depth is not None:
            if depth <= 5.0:
                m_state = "SATCOM_UPLINK"
            elif depth < 50.0:
                m_state = "SURFACE"
            elif depth < 500.0:
                m_state = "SUBMERGED_EDGE_AI"
            else:
                m_state = "DEEP_SURVEY"
        else:
            m_state = "SURFACE"

        uptime = _val("uptime")
        if uptime is None:
            uptime = int(time.time() - START_TIME)

        return {
            "depth_m": depth,
            "lat": lat,
            "lon": lon,
            "battery_pct": battery,
            "imu_roll": _val("imu_roll"),
            "imu_pitch": _val("imu_pitch"),
            "temperature_c": _val("TEMP"),
            "salinity_psu": _val("PSAL"),
            "doxy_umol_kg": _val("DOXY"),
            "chla_mg_m3": _val("CHLA"),
            "nitrate_umol_kg": _val("NITRATE"),
            "ph": _val("PH_IN_SITU_TOTAL"),
            "mission_state": m_state,
            "phase": m_state,
            "uptime_s": uptime,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "count": len(rows),
            "readings": rows[:20],
        }
    except Exception as exc:
        log.error("telemetry retrieval error: %s", exc)
        return {
            "depth_m": 0.0,
            "lat": 0.0,
            "lon": 0.0,
            "battery_pct": 100.0,
            "temperature_c": 4.2,
            "mission_state": "SURFACE",
            "phase": "SURFACE",
            "uptime_s": int(time.time() - START_TIME),
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "count": 0,
            "readings": [],
        }


@app.post("/api/detect")
async def detect(file: UploadFile = File(...)):
    """
    Run DeepScan detection pipeline on uploaded Side-Scan Sonar waterfall / crop image.
    Performs preprocessing, YOLO inference, acoustic shadow calibration, geotagging, and DB persistence.
    """
    t0 = time.perf_counter()

    filename = file.filename or "upload.png"
    suffix = Path(filename).suffix.lower()
    content_type = (file.content_type or "").lower()

    # Security check: validate content type & file extension
    is_valid_type = (
        content_type.startswith("image/")
        or content_type in ALLOWED_MIME_TYPES
        or suffix in ALLOWED_EXTENSIONS
    )
    if not is_valid_type or (suffix and suffix not in ALLOWED_EXTENSIONS and not content_type.startswith("image/")):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{content_type or suffix}'. Only image files (PNG, JPEG, TIFF, BMP, WebP) are allowed."
        )

    if not suffix:
        suffix = ".png"

    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(content)
        tmp_path = Path(tmp.name)

    try:
        # Stage 1: Preprocess (CLAHE local contrast enhancement, speckle filter, shadow mask)
        t_pre = time.perf_counter()
        from ai_pipeline.preprocessor import preprocess_sss
        prep = preprocess_sss(str(tmp_path))
        shadow_mask = getattr(prep, "shadow_mask", None)
        h, w = prep.enhanced.shape[:2] if hasattr(prep, "enhanced") else (0, 0)
        pre_ms = (time.perf_counter() - t_pre) * 1000

        # Stage 2: Detection check
        # Using the Pre-Trained Academic Foundation Model (RT-DETR) for the MVP Pitch
        self.weights_path = ROOT / "models" / "stage2_rtdetr_sctd" / "weights" / "best.pt"
        detector = _get_detector()
        if not self.weights_path.exists() or not _check_ready() or detector is None:
            return JSONResponse({
                "model_ready": False,
                "detections": [],
                "message": "Model weights not found. Run Colab training first.",
                "preprocessing_time_ms": round(pre_ms, 1),
                "inference_time_ms": 0.0,
                "total_time_ms": round((time.perf_counter() - t0) * 1000, 1),
                "image_size": [w, h],
                "detection_count": 0,
            })

        # Stage 3: Inference
        t_inf = time.perf_counter()
        raw = detector.run(prep.enhanced)
        inf_ms = (time.perf_counter() - t_inf) * 1000

        # Stage 4: Acoustic Shadow Calibration
        try:
            from ai_pipeline.confidence_calibrator import calibrate
            calibrated = calibrate([d.to_dict() for d in raw], shadow_mask=shadow_mask)
        except Exception as exc:
            log.warning("Confidence calibration fallback: %s", exc)
            calibrated = [d.to_dict() for d in raw]

        # Stage 5: Geotagging
        try:
            from ai_pipeline.geotagger import geotag_detections
            geotagged = geotag_detections(calibrated, pings=None)
        except Exception as exc:
            log.warning("Geotagging fallback: %s", exc)
            geotagged = calibrated

        # Stage 6: Database Persistence
        try:
            from platform_pkg.database import initialise, insert_detection
            initialise()
            for det in geotagged:
                insert_detection(det)
        except Exception as exc:
            log.warning("Database persist warning: %s", exc)

        return JSONResponse({
            "model_ready": True,
            "detections": geotagged,
            "message": "Detections computed successfully",
            "preprocessing_time_ms": round(pre_ms, 1),
            "inference_time_ms": round(inf_ms, 1),
            "total_time_ms": round((time.perf_counter() - t0) * 1000, 1),
            "image_size": [w, h],
            "detection_count": len(geotagged),
        })

    finally:
        try:
            tmp_path.unlink()
        except OSError:
            pass


@app.get("/api/detections")
async def get_dets(limit: int = Query(default=50, ge=1, le=500)):
    """Retrieve persisted detections from SQLite store."""
    try:
        from platform_pkg.database import get_detections
        rows = get_detections(limit=limit)
        return {"detections": rows, "count": len(rows)}
    except Exception as exc:
        log.error("Failed to load detections: %s", exc)
        return {"detections": [], "count": 0}


@app.post("/api/download/json")
async def dl_json(payload: list[dict[str, Any]]):
    """Export detection results as a JSON report."""
    from ai_pipeline.reporter import to_json
    return StreamingResponse(
        io.BytesIO(to_json(payload).encode()),
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=deepscan_detections.json"}
    )


@app.post("/api/download/csv")
async def dl_csv(payload: list[dict[str, Any]]):
    """Export detection results as a CSV report."""
    from ai_pipeline.reporter import to_csv
    return StreamingResponse(
        io.BytesIO(to_csv(payload).encode()),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=deepscan_detections.csv"}
    )


@app.get("/api/mission/status")
async def mission_status():
    """Return comprehensive AUV mission navigation and subsystem status."""
    try:
        from platform_pkg.database import get_latest_readings, get_unsynced_count
        rows = get_latest_readings(limit=200)

        def _val(sensor_name: str) -> Optional[float]:
            return next((float(r["value"]) for r in rows if r.get("sensor") == sensor_name and r.get("value") is not None), None)

        def _raw(sensor_name: str) -> Optional[str]:
            return next((str(r["value"]) for r in rows if r.get("sensor") == sensor_name and r.get("value") is not None), None)

        depth = _val("depth")
        db_state = _raw("mission_state") or _raw("phase")

        if db_state and db_state.strip():
            phase = db_state.strip()
        elif depth is not None:
            if depth <= 5.0:
                phase = "SATCOM_UPLINK"
            elif depth < 50.0:
                phase = "SURFACE"
            elif depth < 500.0:
                phase = "SUBMERGED_EDGE_AI"
            else:
                phase = "DEEP_SURVEY"
        else:
            phase = "UNKNOWN"

        try:
            unsynced = get_unsynced_count()
        except Exception:
            unsynced = 0

        return {
            "depth_m": depth,
            "lat": _val("lat"),
            "lon": _val("lon"),
            "battery_pct": _val("battery"),
            "imu_roll": _val("imu_roll"),
            "imu_pitch": _val("imu_pitch"),
            "sync_queue_size": unsynced,
            "phase": phase,
            "mission_state": phase,
            "uptime_s": _val("uptime"),
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }
    except Exception as exc:
        log.error("mission_status error: %s", exc)
        return {
            "depth_m": None,
            "lat": None,
            "lon": None,
            "battery_pct": None,
            "imu_roll": None,
            "imu_pitch": None,
            "sync_queue_size": None,
            "phase": "UNKNOWN",
            "mission_state": "UNKNOWN",
            "uptime_s": None,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }


@app.get("/api/ocean/state")
async def ocean_state():
    """Return biogeochemical ocean parameters (TEMP, PSAL, DOXY, CHLA, NITRATE, pH)."""
    try:
        from platform_pkg.database import get_latest_readings
        rows = get_latest_readings(limit=500)

        def _sensor(name: str) -> Optional[dict]:
            r = next((r for r in rows if r.get("sensor") == name), None)
            if not r:
                return None
            return {
                "value": r.get("value"),
                "unit": r.get("unit"),
                "depth_m": r.get("depth_m"),
                "status": r.get("status", "ONLINE"),
                "uncertainty": r.get("uncertainty"),
            }

        return {
            "temperature": _sensor("TEMP"),
            "salinity": _sensor("PSAL"),
            "oxygen": _sensor("DOXY"),
            "chlorophyll": _sensor("CHLA"),
            "nitrate": _sensor("NITRATE"),
            "ph": _sensor("PH_IN_SITU_TOTAL"),
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }
    except Exception as exc:
        log.error("ocean_state error: %s", exc)
        return {
            "temperature": None,
            "salinity": None,
            "oxygen": None,
            "chlorophyll": None,
            "nitrate": None,
            "ph": None,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)
