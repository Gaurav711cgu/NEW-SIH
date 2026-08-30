import os
import numpy as np
from sklearn.ensemble import RandomForestRegressor
import joblib

MODEL_PATH = os.path.join(os.path.dirname(__file__), "sensor_model.joblib")

def generate_synthetic_data(n_samples=1000):
    np.random.seed(42)
    # Basic inputs
    depth_m = np.random.uniform(0, 2000, n_samples)
    lat = np.random.uniform(-90, 90, n_samples)
    lon = np.random.uniform(-180, 180, n_samples)
    
    # Physics-based relations
    # Temperature decreases with depth
    temp_c = 25.0 * np.exp(-depth_m / 500) + np.random.normal(0, 1, n_samples)
    pressure_dbar = depth_m * 1.01325 + np.random.normal(0, 5, n_samples)
    
    # Expensive outputs
    # Salinity ~35 PSU in deep ocean, slight variation at surface
    salinity_psu = 35.0 - 1.5 * np.exp(-depth_m / 200) + np.random.normal(0, 0.1, n_samples)
    # Current velocity higher near surface
    current_velocity_ms = 1.0 * np.exp(-depth_m / 1000) + np.random.normal(0, 0.05, n_samples)
    current_velocity_ms = np.clip(current_velocity_ms, 0, None)
    # Turbidity decreases with depth
    turbidity_ntu = 5.0 * np.exp(-depth_m / 300) + np.random.normal(0, 0.2, n_samples)
    turbidity_ntu = np.clip(turbidity_ntu, 0, None)
    # Chlorophyll peaks near surface, zero at depth
    chlorophyll_ug_l = 2.0 * np.exp(-depth_m / 150) + np.random.normal(0, 0.1, n_samples)
    chlorophyll_ug_l = np.clip(chlorophyll_ug_l, 0, None)
    # Dissolved oxygen decreases with depth then slightly increases
    dissolved_oxygen_ml_l = 5.0 - 2.0 * (depth_m / 2000) + np.random.normal(0, 0.2, n_samples)
    
    X = np.column_stack((depth_m, temp_c, pressure_dbar, lat, lon))
    y = np.column_stack((salinity_psu, current_velocity_ms, turbidity_ntu, chlorophyll_ug_l, dissolved_oxygen_ml_l))
    
    return X, y

def train_and_save_model():
    print("Generating synthetic training data...")
    X, y = generate_synthetic_data(5000)
    
    print("Training RandomForestRegressor model...")
    model = RandomForestRegressor(n_estimators=50, max_depth=10, random_state=42)
    model.fit(X, y)
    
    print(f"Saving model to {MODEL_PATH}...")
    joblib.dump(model, MODEL_PATH)
    print("Model saved successfully.")

def predict(depth_m, temp_c, pressure_dbar, lat, lon):
    if not os.path.exists(MODEL_PATH):
        print(f"Model not found at {MODEL_PATH}. Training new model...")
        train_and_save_model()
    
    model = joblib.load(MODEL_PATH)
    X_input = np.array([[depth_m, temp_c, pressure_dbar, lat, lon]])
    y_pred = model.predict(X_input)[0]
    
    return {
        "salinity_psu": float(y_pred[0]),
        "current_velocity_ms": float(y_pred[1]),
        "turbidity_ntu": float(y_pred[2]),
        "chlorophyll_ug_l": float(y_pred[3]),
        "dissolved_oxygen_ml_l": float(y_pred[4])
    }

if __name__ == "__main__":
    train_and_save_model()
    
    print("\nTesting predict function...")
    sample_depth = 500.0
    sample_temp = 10.0
    sample_pressure = 506.0
    sample_lat = 45.0
    sample_lon = -45.0
    
    results = predict(sample_depth, sample_temp, sample_pressure, sample_lat, sample_lon)
    print("Predictions:")
    for k, v in results.items():
        print(f"  {k}: {v:.4f}")
    print("DL Sensor Replicator works successfully!")
