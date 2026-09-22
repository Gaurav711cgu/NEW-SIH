from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List

from api.diagnosis_engine import DiagnosisEngine
from api.digital_twin import DigitalTwinManager

router = APIRouter(prefix='/api/diagnosis', tags=['diagnosis'])

# Instantiate the engines at module level so state is preserved in-memory
diagnosis_engine = DiagnosisEngine()
digital_twin = DigitalTwinManager()

class TelemetryPayload(BaseModel):
    readings: Dict[str, Any]

@router.get('/health')
async def diagnosis_health():
    """Returns whether ML models are loaded and ready."""
    return {
        "status": "operational",
        "ml_engine_loaded": diagnosis_engine.ml_engine is not None,
        "mode": "ML_PREDICTIVE" if diagnosis_engine.ml_engine else "RULE_BASED_FALLBACK"
    }

@router.get('/fleet')
async def get_fleet_status():
    """Returns all buoys with health scores, positions, alerts."""
    fleet = digital_twin.get_fleet_overview()
    health = diagnosis_engine.get_fleet_status()
    
    merged = {}
    for b_id, data in fleet.items():
        merged[b_id] = {
            "digital_twin": data,
            "diagnosis": health.get(b_id, {"status": "UNKNOWN", "score": 100.0, "alerts": []})
        }
    return {"fleet": merged}

@router.get('/buoy/{buoy_id}')
async def get_buoy_detail(buoy_id: str):
    """Returns detailed diagnosis for one buoy."""
    detail = digital_twin.get_buoy_detail(buoy_id)
    if not detail:
        raise HTTPException(status_code=404, detail="Buoy not found")
        
    health = diagnosis_engine.health_state.get(buoy_id, {"status": "UNKNOWN", "score": 100.0, "alerts": []})
    return {
        "buoy_id": buoy_id,
        "digital_twin": detail,
        "diagnosis": health
    }

@router.get('/buoy/{buoy_id}/timeline')
async def get_buoy_timeline(buoy_id: str):
    """Returns health history for timeline chart."""
    timeline = diagnosis_engine.get_buoy_timeline(buoy_id)
    return {"buoy_id": buoy_id, "timeline": timeline}

@router.get('/buoy/{buoy_id}/predict')
async def predict_failures(buoy_id: str):
    """Returns failure predictions with confidence and timeline."""
    history = diagnosis_engine.sensor_history.get(buoy_id, [])
    if not history:
        return {"buoy_id": buoy_id, "prediction": "No data available to predict (simulate tick first)"}
        
    if diagnosis_engine.ml_engine:
        try:
            prediction = diagnosis_engine.ml_engine.predict(history)
            return {"buoy_id": buoy_id, "prediction": prediction}
        except Exception as e:
            pass # Fallback to rules if prediction fails
            
    # Fallback pseudo-prediction based on rules if ML not available
    latest = history[-1]
    battery = latest.get("battery_pct", 100)
    rul = max(0, int(battery * 1.5)) # simple heuristic
    return {
        "buoy_id": buoy_id,
        "prediction": {
            "anomaly_detected": battery < 30.0,
            "rul_days": rul,
            "confidence": 0.75,
            "note": "Rule-based fallback estimation"
        }
    }

@router.post('/buoy/{buoy_id}/diagnose')
async def run_diagnosis(buoy_id: str, payload: TelemetryPayload):
    """Runs ML diagnosis on provided sensor readings."""
    report = diagnosis_engine.ingest_telemetry(buoy_id, payload.readings)
    return report

@router.post('/simulate/tick')
async def simulate_tick():
    """Advances simulation by one tick (generates new telemetry, runs diagnosis)."""
    readings = digital_twin.simulate_telemetry_tick()
    results = {}
    for b_id, reading in readings.items():
        results[b_id] = diagnosis_engine.ingest_telemetry(b_id, reading)
    return {"tick": digital_twin.ticks, "diagnoses": results}

@router.post('/simulate/failure')
async def simulate_failure(buoy_id: str, failure_type: str):
    """Triggers emergency scenario, returns triage plan."""
    detail = digital_twin.get_buoy_detail(buoy_id)
    if not detail:
        raise HTTPException(status_code=404, detail="Buoy not found")
        
    triage = diagnosis_engine.trigger_emergency(buoy_id, failure_type)
    return triage
