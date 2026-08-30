import streamlit as st
import pandas as pd
import random
import time
from platform.database import get_latest_readings
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
from dashboard.components.source_labels import render_parameter_row

st.set_page_config(layout="wide")
st.title("Biogeochemistry")
st.caption("Virtual sensors derived from BGC-Argo profiles (Southern Ocean).")
st.markdown("---")

readings = get_latest_readings(limit=500)
df = pd.DataFrame(readings)

# Simulated state for dropouts (in a real app this would be in st.session_state or db)
if 'sensor_states' not in st.session_state:
    st.session_state.sensor_states = {
        "DOXY": "ONLINE",
        "CHLA": "ONLINE",
        "PH": "ONLINE",
        "NITRATE": "ONLINE"
    }

def update_sensor_state(param):
    current = st.session_state.sensor_states[param]
    r = random.random()
    if current == "ONLINE":
        if r < 0.005: return "OUTAGE"
        if r < 0.02: return "DROPOUT"
    elif current in ("DROPOUT", "OUTAGE"):
        if r < 0.2: return "RECOVERING"
    elif current == "RECOVERING":
        if r < 0.4: return "ONLINE"
    return current

params = [
    {"id": "DOXY", "label": "Dissolved Oxygen (DOXY)", "unit": "µmol/kg", "desc": "Ventilation, biological productivity"},
    {"id": "CHLA", "label": "Chlorophyll-a (CHLA)", "unit": "mg/m³", "desc": "Phytoplankton biomass, carbon export"},
    {"id": "PH", "label": "pH", "unit": "pH units", "desc": "Ocean acidification indicator"},
    {"id": "NITRATE", "label": "Nitrate", "unit": "µmol/kg", "desc": "Nutrient availability, productivity"},
]

cols = st.columns(2)

for i, p in enumerate(params):
    st.session_state.sensor_states[p["id"]] = update_sensor_state(p["id"])
    status = st.session_state.sensor_states[p["id"]]
    
    with cols[i % 2]:
        st.subheader(p["label"])
        st.caption(p["desc"])
        
        # In a real app we query 'df' for the specific sensor, but we'll simulate if df is empty
        val = random.uniform(10, 200) if p["id"] == "DOXY" else random.uniform(0.1, 2.0)
        uncertainty = val * 0.05
        
        if not df.empty and p["id"] in df['sensor'].values:
            subset = df[df['sensor'] == p["id"]].head(1)
            if not subset.empty:
                val = subset.iloc[0]['value']
                
        render_parameter_row(
            label=p["label"],
            value=val,
            unit=p["unit"],
            source="VIRTUAL_BGC_ARGO",
            uncertainty=uncertainty,
            status=status
        )
        
        # Sparkline
        if status == "ONLINE":
            chart_data = pd.DataFrame({p["id"]: [val + random.uniform(-val*0.05, val*0.05) for _ in range(20)]})
            st.line_chart(chart_data, height=150)
        else:
            st.warning(f"Sensor Status: {status}")
            st.line_chart(pd.DataFrame({p["id"]: [None]*20}), height=150)
        
        st.markdown("---")

time.sleep(1)
st.rerun()
