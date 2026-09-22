import os
import json
import torch
import numpy as np

from .train_anomaly_detector import LSTMAutoencoder
from .train_rul_predictor import CNNLSTM_RUL
from .train_battery_soh import BatterySoHPredictor

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class PredictiveMaintenanceEngine:
    def __init__(self, models_dir=os.path.join(BASE_DIR, 'models'), data_dir=os.path.join(BASE_DIR, 'data')):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        with open(os.path.join(data_dir, 'scaler_params.json'), 'r') as f:
            self.scaler_params = json.load(f)
            
        with open(os.path.join(data_dir, 'sensor_names.json'), 'r') as f:
            self.sensor_names = json.load(f)
            
        with open(os.path.join(models_dir, 'anomaly_threshold.json'), 'r') as f:
            self.threshold = json.load(f)['threshold']
            
        n_features = len(self.scaler_params['features'])
        
        self.anomaly_model = LSTMAutoencoder(n_features).to(self.device)
        self.anomaly_model.load_state_dict(torch.load(os.path.join(models_dir, 'anomaly_detector.pt'), map_location=self.device))
        self.anomaly_model.eval()
        
        self.rul_model = CNNLSTM_RUL(n_features).to(self.device)
        self.rul_model.load_state_dict(torch.load(os.path.join(models_dir, 'rul_predictor.pt'), map_location=self.device))
        self.rul_model.eval()
        
        self.battery_model = BatterySoHPredictor().to(self.device)
        self.battery_model.load_state_dict(torch.load(os.path.join(models_dir, 'battery_soh.pt'), map_location=self.device))
        self.battery_model.eval()
        
    def diagnose(self, sensor_window: np.ndarray, battery_window: np.ndarray) -> dict:
        sw = torch.FloatTensor(sensor_window).unsqueeze(0).to(self.device)
        bw = torch.FloatTensor(battery_window).unsqueeze(0).to(self.device)
        
        with torch.no_grad():
            recon = self.anomaly_model(sw)
            errors = ((recon - sw)**2).mean(dim=1).cpu().numpy()[0]
            anomaly_score = errors.mean()
            
            is_anomaly = anomaly_score > self.threshold
            anomaly_sensors = []
            if is_anomaly:
                for i, err in enumerate(errors):
                    if err > self.threshold:
                        anomaly_sensors.append(self.sensor_names.get(str(i), f"sensor_{i}"))
                        
            rul_pred = self.rul_model(sw).item()
            soh_pred = self.battery_model(bw).item()
            
        health_score = self.compute_health_score(anomaly_score, rul_pred, soh_pred)
        
        if health_score < 40 or rul_pred < 10 or is_anomaly:
            priority = 'CRITICAL'
        elif health_score < 70 or rul_pred < 30:
            priority = 'HIGH'
        elif health_score < 85:
            priority = 'MEDIUM'
        else:
            priority = 'LOW'
            
        diag = {
            'anomaly_score': float(anomaly_score),
            'is_anomaly': bool(is_anomaly),
            'anomaly_sensors': anomaly_sensors,
            'rul_days': float(rul_pred),
            'rul_confidence': float(max(0.1, 1.0 - anomaly_score)),
            'battery_soh': float(soh_pred),
            'health_score': float(health_score),
            'maintenance_priority': priority,
        }
        
        diag['recommendations'] = self.get_recommendations(diag)
        return diag
        
    def compute_health_score(self, anomaly_score, rul, soh) -> float:
        rul_score = min(100, max(0, rul))
        anomaly_factor = max(0, 1 - (anomaly_score / (self.threshold * 2)))
        soh_score = soh * 100
        score = 0.3 * (anomaly_factor * 100) + 0.4 * rul_score + 0.3 * soh_score
        return float(max(0, min(100, score)))
        
    def get_recommendations(self, diagnosis) -> list:
        recs = []
        if diagnosis['is_anomaly']:
            sensors = ", ".join(diagnosis['anomaly_sensors'])
            recs.append(f"Immediate inspection required: Anomalous behavior detected in sensors: {sensors}")
            
        if diagnosis['rul_days'] < 30:
            recs.append(f"Schedule maintenance within {int(diagnosis['rul_days'])} days for impending component failure.")
            
        if diagnosis['battery_soh'] < 0.7:
            recs.append(f"Battery replacement recommended (SoH below 70%). Current SoH: {diagnosis['battery_soh']:.2%}")
            
        if not recs:
            recs.append("System operating normally. No maintenance required.")
            
        return recs
