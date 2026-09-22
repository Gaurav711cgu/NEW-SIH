import math
import time
import random
from typing import Dict, Any

class DigitalTwinManager:
    def __init__(self):
        # Initialize a fleet of 6 simulated buoys deployed around Antarctica
        self.buoys = {
            'AQUILA-01': {'lat': -65.2, 'lng': 48.7, 'name': 'Maitri Station', 'deployed': '2026-03-15'},
            'AQUILA-02': {'lat': -69.4, 'lng': 76.2, 'name': 'Bharati Station', 'deployed': '2026-04-01'},
            'AQUILA-03': {'lat': -62.0, 'lng': -58.7, 'name': 'Drake Passage', 'deployed': '2026-02-20'},
            'AQUILA-04': {'lat': -70.8, 'lng': 11.7, 'name': 'Weddell Sea', 'deployed': '2025-01-10'}, # Oldest deployment
            'AQUILA-05': {'lat': -66.5, 'lng': 110.5, 'name': 'East Antarctic', 'deployed': '2026-03-28'},
            'AQUILA-06': {'lat': -77.8, 'lng': 166.7, 'name': 'Ross Sea', 'deployed': '2026-01-15'},
        }
        
        self.ticks = 0
        self.state: Dict[str, Dict[str, Any]] = {}
        for b_id, info in self.buoys.items():
            self.state[b_id] = {
                "info": info,
                "battery_pct": 100.0,
                "temperature_c": 1.5,
                "salinity_psu": 34.5,
                "iridium_sig": 100.0,
                "cycles": 0
            }
            # AQUILA-04 is older, start with degraded battery and higher cycles
            if b_id == 'AQUILA-04':
                self.state[b_id]["cycles"] = 500
                self.state[b_id]["battery_pct"] = 65.0
            
    def simulate_telemetry_tick(self) -> Dict[str, Dict[str, Any]]:
        self.ticks += 1
        now = time.time()
        
        # Real Antarctic seasonality (simplified)
        day_of_year = time.localtime(now).tm_yday
        seasonal_temp_shift = math.sin((day_of_year - 172) * 2 * math.pi / 365) * 2.0  # Coldest in June/July (around day 172)
        
        readings = {}
        for b_id, b_state in self.state.items():
            b_state["cycles"] += 1
            cycles = b_state["cycles"]
            
            # Battery: capacity_fade = exp(-beta * sqrt(cycles))
            # NASA battery data approximation
            beta = 0.005
            capacity_fade = math.exp(-beta * math.sqrt(cycles))
            
            # Add some discharge over time
            discharge = 0.05 + random.uniform(0.01, 0.03)
            b_state["battery_pct"] = max(0.0, (b_state["battery_pct"] - discharge))
            
            # Recharge from solar (0 in winter, peak in summer)
            solar_irradiance = max(0, math.sin((day_of_year - 80) * 2 * math.pi / 365)) 
            recharge = solar_irradiance * 0.1 * capacity_fade
            b_state["battery_pct"] = min(100.0 * capacity_fade, b_state["battery_pct"] + recharge)
            
            # Sensor drift: CTD drift rates ±0.002°C/year
            drift = 0.002 * (cycles / 365.0) + random.uniform(-0.001, 0.001)
            base_temp = 0.0 + seasonal_temp_shift
            
            # AQUILA-04 specific anomaly (Weddell Sea problem buoy)
            if b_id == 'AQUILA-04':
                drift *= 8.0  # Accelerated drift
                if self.ticks % 5 == 0:
                    b_state["battery_pct"] -= random.uniform(1.0, 4.0)  # Random voltage drops
            
            temp_c = base_temp + drift
            
            # Biofouling: logistic growth curve on optical sensors (affects salinity readings slightly)
            # rate depends on water temperature, warmer = more fouling
            fouling_rate = 1.0 / (1.0 + math.exp(-0.01 * (cycles - 200))) 
            salinity = 34.5 - (fouling_rate * 0.5) + random.uniform(-0.05, 0.05)
            
            # Communication: Iridium success rate decreases in high seas (real polar weather patterns)
            weather_noise = random.uniform(0, 100)
            iridium = 100.0 if weather_noise > 25 else random.uniform(40, 80)
            if b_id == 'AQUILA-04':
                iridium -= 20.0 # Worse antenna condition
                iridium = max(0.0, iridium)
            
            b_state["temperature_c"] = temp_c
            b_state["salinity_psu"] = salinity
            b_state["iridium_sig"] = iridium
            
            readings[b_id] = {
                "timestamp": now,
                "battery_pct": round(b_state["battery_pct"], 2),
                "temperature_c": round(temp_c, 3),
                "salinity_psu": round(salinity, 3),
                "iridium_sig": round(iridium, 1),
                "cycles": cycles
            }
            
        return readings
    
    def get_fleet_overview(self) -> dict:
        return self.state
    
    def get_buoy_detail(self, buoy_id: str) -> dict:
        return self.state.get(buoy_id, {})
