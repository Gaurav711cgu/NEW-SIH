# dashboard/pages/ocean_state.py

import streamlit as st
import pandas as pd
import plotly.graph_objects as go
from platform.database import get_latest_readings
from virtual_sensors.profile_interpolator import ProfileInterpolator

st.set_page_config(layout="wide")
st.title("Ocean State")
st.caption("Physical oceanographic parameters from platform sensors.")

interpolator = ProfileInterpolator()
PROFILE_IDX  = interpolator.select_nearest_profile(-54.2, 60.8)

def source_badge(source: str) -> str:
    badges = {
        "REAL_HARDWARE":             "LIVE",
        "VIRTUAL_BGC_ARGO":          "VIRTUAL",
        "REAL_HARDWARE_UNCALIBRATED": "LIVE (uncalibrated)",
    }
    return badges.get(source, source)

readings = get_latest_readings(limit=500)
df = pd.DataFrame(readings)

col1, col2 = st.columns([1, 2])

with col1:
    for param in ["temperature", "pressure", "ph", "tds_proxy"]:
        subset = df[df["sensor"] == param].head(1)
        if not subset.empty:
            row = subset.iloc[0]
            value = row["value"]
            source = source_badge(row["source"])
            uncertainty = row.get("uncertainty")

            st.metric(
                label=f"{param.upper()}   [{source}]",
                value=f"{value:.2f} {row['unit']}" if value else "OFFLINE",
                delta=f"+/- {uncertainty:.3f}" if uncertainty else None
            )

with col2:
    temp_profile = interpolator.get_full_profile(PROFILE_IDX, "TEMP")
    psal_profile = interpolator.get_full_profile(PROFILE_IDX, "PSAL")

    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=temp_profile["values"],
        y=temp_profile["depth"],
        name="Temperature (deg C)",
        line=dict(color="#00d4aa", width=2)
    ))
    fig.update_layout(
        title=f"Temperature Profile -- BGC-Argo float {temp_profile['wmo']}",
        xaxis_title="Temperature (deg C)",
        yaxis_title="Depth (dbar)",
        yaxis_autorange="reversed",
        height=400,
        margin=dict(l=40, r=20, t=40, b=40),
        plot_bgcolor="#0a1628",
        paper_bgcolor="#050d1a",
        font_color="#e2e8f0"
    )
    st.plotly_chart(fig, use_container_width=True)

st.caption(
    "Depth profiles are from a real BGC-Argo float in the Southern Ocean "
    "Indian sector (20E-90E, 75S-40S), QC flag = 1. "
    f"Float WMO: {temp_profile['wmo']}."
)

st.rerun()
