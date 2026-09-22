import time
from typing import Dict, List, Any

try:
    from predictive_maintenance.inference import PredictiveMaintenanceEngine
except ImportError:
    PredictiveMaintenanceEngine = None

class DiagnosisEngine:
    """
    Continuously monitors buoy sensor data, runs ML models,
    and maintains a real-time health assessment.
    """
    def __init__(self):
        # Fallback to rule-based if ML engine isn't available
        try:
            self.ml_engine = PredictiveMaintenanceEngine() if PredictiveMaintenanceEngine else None
        except Exception:
            self.ml_engine = None
            
        self.sensor_history: Dict[str, List[Dict[str, Any]]] = {}  # per-buoy sensor history buffers
        self.health_state: Dict[str, Dict[str, Any]] = {}   # per-buoy current health state
        self.alert_log: List[Dict[str, Any]] = []      # chronological alerts
    
    def ingest_telemetry(self, buoy_id: str, readings: dict) -> dict:
        if buoy_id not in self.sensor_history:
            self.sensor_history[buoy_id] = []
            
        self.sensor_history[buoy_id].append(readings)
        # Keep a rolling window of history (e.g. 50 ticks)
        if len(self.sensor_history[buoy_id]) > 50:
            self.sensor_history[buoy_id].pop(0)
            
        return self.run_diagnosis(buoy_id)
    
    def run_diagnosis(self, buoy_id: str) -> dict:
        history = self.sensor_history.get(buoy_id, [])
        if not history:
            return {"status": "UNKNOWN", "score": 100.0, "alerts": []}
            
        latest = history[-1]
        score = 100.0
        alerts = []
        
        # Base Rule-based checks (fallback if no ML)
        battery = latest.get("battery_pct", 100.0)
        if battery < 20.0:
            score -= 30.0
            alerts.append({"type": "CRITICAL", "message": f"Battery critically low: {battery:.1f}%"})
        elif battery < 50.0:
            score -= 10.0
            alerts.append({"type": "WARNING", "message": f"Battery degraded: {battery:.1f}%"})
            
        temp = latest.get("temperature_c", 2.0)
        # Assuming nominal Antarctic temps between -2 and 4
        if temp < -2.5 or temp > 4.5:
            score -= 15.0
            alerts.append({"type": "WARNING", "message": f"Temperature {temp:.2f}°C anomalous"})
            
        # Optional ML checks
        if self.ml_engine:
            try:
                # Mock calling the ML models
                ml_result = self.ml_engine.predict(history)
                if ml_result.get("anomaly_detected", False):
                    score -= 25.0
                    alerts.append({"type": "CRITICAL", "message": "ML: Structural/Sensor anomaly detected"})
                
                rul = ml_result.get("rul_days", 100)
                if rul < 14:
                    score -= 20.0
                    alerts.append({"type": "WARNING", "message": f"ML: Low Remaining Useful Life ({rul} days)"})
            except Exception as e:
                pass
                
        score = max(0.0, min(100.0, score))
        
        if score >= 80:
            status = "HEALTHY"
        elif score >= 50:
            status = "WARNING"
        else:
            status = "CRITICAL"
            
        health_report = {
            "buoy_id": buoy_id,
            "timestamp": latest.get("timestamp", time.time()),
            "score": round(score, 1),
            "status": status,
            "alerts": alerts,
            "latest_battery": battery,
            "latest_temp": temp
        }
        
        self.health_state[buoy_id] = health_report
        
        if alerts:
            for alert in alerts:
                self.alert_log.append({
                    "buoy_id": buoy_id,
                    "time": health_report["timestamp"],
                    "status": status,
                    **alert
                })
                
        return health_report
    
    def get_fleet_status(self) -> dict:
        return self.health_state
    
    def get_buoy_timeline(self, buoy_id: str) -> list:
        # Mock timeline returning health scores over time based on history length
        timeline = []
        history = self.sensor_history.get(buoy_id, [])
        if not history:
            return timeline
            
        base_score = self.health_state.get(buoy_id, {}).get("score", 100.0)
        
        for i, h in enumerate(history):
            # add a little noise for the timeline plot
            score_val = max(0.0, min(100.0, base_score + (len(history) - i) * 0.1))
            timeline.append({
                "timestamp": h.get("timestamp", time.time()),
                "score": round(score_val, 1)
            })
            
        return timeline
    
    def trigger_emergency(self, buoy_id: str, failure_type: str):
        alerts = [{"type": "EMERGENCY", "message": f"Simulated critical failure: {failure_type}"}]
        
        self.health_state[buoy_id] = {
            "buoy_id": buoy_id,
            "timestamp": time.time(),
            "score": 0.0,
            "status": "EMERGENCY",
            "alerts": alerts
        }
        
        for a in alerts:
            self.alert_log.append({
                "buoy_id": buoy_id,
                "time": time.time(),
                "status": "EMERGENCY",
                **a
            })
            
        return {
            "buoy_id": buoy_id,
            "systems_to_shutdown": ["main_sensor_array", "telemetry_high_bandwidth", "active_sonar"],
            "max_endurance_hours": 12.5,
            "distress_message": f"SOS AQUILA FLEET - {buoy_id} CRITICAL FAILURE ({failure_type}) - ENTERING LOW POWER MODE",
            "triage_actions": [
                "Deploy emergency beacon",
                "Lock control surfaces",
                "Switch to Iridium SBD"
            ]
        }
