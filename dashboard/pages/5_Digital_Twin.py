import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import sys
from pathlib import Path
import time

# Ensure project root is in sys.path so platform.database can be imported
ROOT = Path(__file__).resolve().parent.parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from platform.database import get_connection

st.set_page_config(page_title="Digital Twin & HITL Validation", page_icon="🌊", layout="wide")
st.title("🌊 Digital Twin & HITL Validation")
st.markdown("Live 6-DOF Kinematics & TEOS-10 Environmental State")

# Setup auto refresh
st.sidebar.title("Controls")
auto_refresh = st.sidebar.checkbox("Auto Refresh (1s)", value=True)

def get_kpis():
    """Fetch the latest KPIs from the SQLite database."""
    conn = get_connection()
    kpis = {}
    try:
        for sensor in ['mission_state', 'depth', 'imu_pitch', 'imu_roll']:
            row = conn.execute(
                "SELECT value FROM sensor_readings WHERE sensor = ? ORDER BY timestamp DESC LIMIT 1", 
                (sensor,)
            ).fetchone()
            kpis[sensor] = row['value'] if row else None
    except Exception as e:
        st.error(f"Error fetching KPIs: {e}")
    finally:
        conn.close()
    return kpis

def get_trajectory(limit=500):
    """Fetch the latest N trajectory points for 3D visualization."""
    conn = get_connection()
    try:
        query = """
            SELECT 
                timestamp,
                MAX(CASE WHEN sensor = 'pos_x' THEN value END) as pos_x,
                MAX(CASE WHEN sensor = 'pos_y' THEN value END) as pos_y,
                MAX(CASE WHEN sensor = 'depth' THEN value END) as depth
            FROM sensor_readings
            WHERE sensor IN ('pos_x', 'pos_y', 'depth')
            GROUP BY timestamp
            ORDER BY timestamp DESC
            LIMIT ?
        """
        df = pd.read_sql_query(query, conn, params=(limit,))
    except Exception as e:
        st.error(f"Error fetching trajectory: {e}")
        df = pd.DataFrame()
    finally:
        conn.close()
    
    if not df.empty:
        # Sort chronologically for correct line plotting
        df = df.sort_values('timestamp').reset_index(drop=True)
        # In underwater robotics, depth is positive downwards.
        # For a natural 3D plot, we plot Z as negative depth.
        df['z'] = -df['depth']
    return df

# Fetch data
kpis = get_kpis()
df_traj = get_trajectory(500)

# Render KPIs
col1, col2, col3, col4 = st.columns(4)

with col1:
    state_val = kpis.get('mission_state')
    st.metric("Mission State", str(state_val) if state_val is not None else "UNKNOWN")

with col2:
    depth_val = kpis.get('depth')
    st.metric("Depth (m)", f"{float(depth_val):.1f}" if depth_val is not None else "0.0")

with col3:
    pitch_val = kpis.get('imu_pitch')
    st.metric("Pitch (deg)", f"{float(pitch_val):.1f}" if pitch_val is not None else "0.0")

with col4:
    roll_val = kpis.get('imu_roll')
    st.metric("Roll (deg)", f"{float(roll_val):.1f}" if roll_val is not None else "0.0")

st.divider()

# Render 3D Trajectory
st.subheader("AUV Trajectory (Latest 500 points)")
if not df_traj.empty and not df_traj[['pos_x', 'pos_y', 'z']].isnull().all().all():
    fig = go.Figure()
    
    # Path trace
    fig.add_trace(go.Scatter3d(
        x=df_traj['pos_x'],
        y=df_traj['pos_y'],
        z=df_traj['z'],
        mode='lines+markers',
        marker=dict(
            size=3,
            color=df_traj['timestamp'],
            colorscale='Viridis',
            opacity=0.8,
            colorbar=dict(title='Timestamp (s)', x=0.85)
        ),
        line=dict(
            color='darkblue',
            width=2
        ),
        name='AUV Path'
    ))
    
    # Highlight the current/latest position
    latest = df_traj.iloc[-1]
    if pd.notnull(latest['pos_x']):
        fig.add_trace(go.Scatter3d(
            x=[latest['pos_x']],
            y=[latest['pos_y']],
            z=[latest['z']],
            mode='markers',
            marker=dict(
                size=8,
                color='red',
                symbol='diamond'
            ),
            name='Current Position'
        ))
    
    fig.update_layout(
        scene=dict(
            xaxis_title='X (m)',
            yaxis_title='Y (m)',
            zaxis_title='Depth (m) [Negative]',
            aspectmode='auto'
        ),
        margin=dict(l=0, r=0, b=0, t=30),
        height=650,
        legend=dict(x=0.05, y=0.95)
    )
    st.plotly_chart(fig, use_container_width=True)
else:
    st.info("No trajectory data available. Ensure the `digital_twin_engine.py` script is running and generating telemetry.")

# Handle Auto-refresh
if auto_refresh:
    time.sleep(1)
    st.rerun()
