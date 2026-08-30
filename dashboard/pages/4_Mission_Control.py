import streamlit as st
import pandas as pd
import time
import random
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

st.set_page_config(layout="wide")
st.title("Mission Control")
st.caption("Platform operational health and communication status.")

if 'mission_time' not in st.session_state:
    st.session_state.mission_time = 0
    st.session_state.unsynced_records = 0
    st.session_state.is_offline = False

col1, col2 = st.columns([1, 1])

with col1:
    st.subheader("Platform Status")
    st.progress(0.45, text="Mission Phase: OBSERVING")
    
    st.metric("Current Depth [Simulator]", "842 m")
    st.metric("GPS Position [Live]", "54°12'S, 60°49'E")
    st.progress(0.82, text="Battery Estimated (82%)")
    
    cols = st.columns(2)
    cols[0].metric("Pitch [LIVE]", "2.4°")
    cols[1].metric("Roll [LIVE]", "-1.1°")

with col2:
    st.subheader("Communication Status")
    
    # Simulate network toggle
    st.session_state.is_offline = st.checkbox("Simulate Network Outage", value=st.session_state.is_offline)
    
    if st.session_state.is_offline:
        st.error("NETWORK STATUS: OFFLINE")
        st.session_state.unsynced_records += random.randint(1, 5)
    else:
        if st.session_state.unsynced_records > 0:
            st.warning("NETWORK STATUS: SYNCING")
            st.session_state.unsynced_records = max(0, st.session_state.unsynced_records - 10)
        else:
            st.success("NETWORK STATUS: ONLINE")
            
    st.metric("Unsynced Records", st.session_state.unsynced_records)
    st.metric("MQTT Broker", "Disconnected" if st.session_state.is_offline else "Connected")
    
    st.subheader("Sensor Health Matrix")
    st.code("""
Temperature     [LIVE]    ONLINE
Pressure        [LIVE]    ONLINE
pH              [LIVE]    ONLINE
IMU             [LIVE]    ONLINE
TDS             [LIVE]    ONLINE (uncalibrated)
Dissolved O2    [VIRTUAL] ONLINE
Chlorophyll     [VIRTUAL] DROPOUT (recovering)
Nitrate         [VIRTUAL] ONLINE
pH (virtual)    [VIRTUAL] ONLINE
Sonar           [DATASET] SCANNING
    """)

st.markdown("---")
st.subheader("Mission Track")
st.caption("Simulated mission depth over time")

if 'depth_history' not in st.session_state:
    st.session_state.depth_history = [0]

if len(st.session_state.depth_history) > 100:
    st.session_state.depth_history.pop(0)

# Simulate diving
last_depth = st.session_state.depth_history[-1]
new_depth = min(2000, last_depth + random.uniform(0, 50))
st.session_state.depth_history.append(new_depth)

st.line_chart(st.session_state.depth_history)

time.sleep(1)
st.session_state.mission_time += 1
st.rerun()
