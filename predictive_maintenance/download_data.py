import os
import urllib.request
import zipfile
import numpy as np
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
os.makedirs(DATA_DIR, exist_ok=True)

def download_cmapss():
    url = "https://raw.githubusercontent.com/makinarocks/awesome-industrial-machine-datasets/master/data-explanation/NASA-CMAPSS/CMAPSSData/train_FD001.txt"
    dest_path = os.path.join(DATA_DIR, "train_FD001.txt")
    
    if not os.path.exists(dest_path):
        print(f"Downloading CMAPSS data from {url}...")
        try:
            urllib.request.urlretrieve(url, dest_path)
            print("Download complete.")
        except Exception as e:
            print(f"Failed to download from primary URL. Error: {e}")
            # Fallback could be implemented here
    else:
        print("CMAPSS data already exists.")

def generate_battery_data():
    print("Generating battery degradation data...")
    num_units = 50
    data = []
    
    for unit_id in range(1, num_units + 1):
        num_cycles = np.random.randint(300, 801)
        cap_0 = np.random.uniform(2.8, 3.2) # Ah
        r_0 = np.random.uniform(0.04, 0.06) # Ohms
        beta = np.random.uniform(0.0003, 0.0008)
        base_temp = np.random.uniform(20, 35) # C
        
        for n in range(1, num_cycles + 1):
            # Capacity_n = Capacity_0 * exp(-beta * sqrt(n))
            temp_factor = 2 ** ((base_temp - 25) / 10)
            adjusted_beta = beta * temp_factor
            
            cap_n = cap_0 * np.exp(-adjusted_beta * np.sqrt(n))
            # Add some noise
            cap_n += np.random.normal(0, 0.005)
            
            # R_n = R_0 * (1 + 0.001 * n)
            r_n = r_0 * (1 + 0.001 * n) + np.random.normal(0, 0.001)
            
            # Voltage sag increases
            load_current = np.random.uniform(1.0, 1.5)
            voltage = 4.2 - load_current * r_n + np.random.normal(0, 0.01)
            
            temp = base_temp + load_current * r_n * 5 + np.random.normal(0, 0.5)
            
            data.append([unit_id, n, voltage, load_current, temp, cap_n, cap_0])
            
    df = pd.DataFrame(data, columns=['unit_id', 'cycle', 'voltage', 'current', 'temperature', 'capacity', 'initial_capacity'])
    dest_path = os.path.join(DATA_DIR, "battery_data.csv")
    df.to_csv(dest_path, index=False)
    print(f"Battery data generated and saved to {dest_path}")

if __name__ == "__main__":
    download_cmapss()
    generate_battery_data()
