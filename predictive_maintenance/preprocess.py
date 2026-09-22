import os
import json
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')

def preprocess_cmapss():
    print("Preprocessing CMAPSS data...")
    path = os.path.join(DATA_DIR, "train_FD001.txt")
    columns = ['unit_id', 'cycle', 'op_setting_1', 'op_setting_2', 'op_setting_3'] + [f'sensor_{i}' for i in range(1, 22)]
    df = pd.read_csv(path, delim_whitespace=True, header=None, names=columns)
    
    # Calculate RUL
    rul = pd.DataFrame(df.groupby('unit_id')['cycle'].max()).reset_index()
    rul.columns = ['unit_id', 'max_cycle']
    df = df.merge(rul, on=['unit_id'], how='left')
    df['RUL'] = df['max_cycle'] - df['cycle']
    df['RUL'] = df['RUL'].clip(upper=125)
    df.drop('max_cycle', axis=1, inplace=True)
    
    # Drop constant sensors
    sensor_cols = [f'sensor_{i}' for i in range(1, 22)]
    stds = df[sensor_cols].std()
    drop_sensors = stds[stds < 0.01].index.tolist()
    print(f"Dropping sensors with low variance: {drop_sensors}")
    df.drop(drop_sensors, axis=1, inplace=True)
    
    features = [c for c in df.columns if c not in ['unit_id', 'cycle', 'RUL']]
    
    # Export sensor names
    sensor_names = {str(i): name for i, name in enumerate(features)}
    with open(os.path.join(DATA_DIR, 'sensor_names.json'), 'w') as f:
        json.dump(sensor_names, f, indent=4)
        
    scaler = MinMaxScaler()
    df[features] = scaler.fit_transform(df[features])
    
    # Save scaler params
    scaler_params = {
        'min_': scaler.min_.tolist(),
        'scale_': scaler.scale_.tolist(),
        'features': features
    }
    with open(os.path.join(DATA_DIR, 'scaler_params.json'), 'w') as f:
        json.dump(scaler_params, f, indent=4)
        
    # Windows
    window_size = 50
    
    X_list, y_list = [], []
    for unit_id in df['unit_id'].unique():
        unit_data = df[df['unit_id'] == unit_id]
        unit_X = unit_data[features].values
        unit_y = unit_data['RUL'].values
        
        for i in range(len(unit_X) - window_size + 1):
            X_list.append(unit_X[i:i+window_size])
            y_list.append(unit_y[i+window_size-1])
            
    X = np.array(X_list)
    y = np.array(y_list).reshape(-1, 1)
    
    # Split
    split_idx = int(len(X) * 0.8)
    X_train, y_train = X[:split_idx], y[:split_idx]
    X_val, y_val = X[split_idx:], y[split_idx:]
    
    np.save(os.path.join(DATA_DIR, 'X_train.npy'), X_train)
    np.save(os.path.join(DATA_DIR, 'y_train.npy'), y_train)
    np.save(os.path.join(DATA_DIR, 'X_val.npy'), X_val)
    np.save(os.path.join(DATA_DIR, 'y_val.npy'), y_val)
    
    # Save healthy data for anomaly detection (first 50% of each unit)
    healthy_X = []
    for unit_id in df['unit_id'].unique():
        unit_data = df[df['unit_id'] == unit_id]
        n_healthy = len(unit_data) // 2
        unit_healthy = unit_data.iloc[:n_healthy]
        unit_X = unit_healthy[features].values
        for i in range(len(unit_X) - window_size + 1):
            healthy_X.append(unit_X[i:i+window_size])
    
    np.save(os.path.join(DATA_DIR, 'X_healthy.npy'), np.array(healthy_X))
    
    print("CMAPSS preprocessing complete.")

def preprocess_battery():
    print("Preprocessing battery data...")
    path = os.path.join(DATA_DIR, "battery_data.csv")
    df = pd.read_csv(path)
    
    df['SoH'] = df['capacity'] / df['initial_capacity']
    features = ['voltage', 'current', 'temperature', 'capacity']
    
    scaler = MinMaxScaler()
    df[features] = scaler.fit_transform(df[features])
    
    window_size = 20
    X_list, y_list = [], []
    for unit_id in df['unit_id'].unique():
        unit_data = df[df['unit_id'] == unit_id]
        unit_X = unit_data[features].values
        unit_y = unit_data['SoH'].values
        
        for i in range(len(unit_X) - window_size + 1):
            X_list.append(unit_X[i:i+window_size])
            y_list.append(unit_y[i+window_size-1])
            
    X = np.array(X_list)
    y = np.array(y_list).reshape(-1, 1)
    
    np.save(os.path.join(DATA_DIR, 'battery_X.npy'), X)
    np.save(os.path.join(DATA_DIR, 'battery_y.npy'), y)
    print("Battery preprocessing complete.")

if __name__ == "__main__":
    preprocess_cmapss()
    preprocess_battery()
