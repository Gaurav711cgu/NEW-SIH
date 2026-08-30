# Dashboard Specification

## Design Principles

The dashboard is designed for a domain expert audience: oceanographers, marine scientists, and policy officers from MoES, NCPOR, and NIOT. The primary objective is operational clarity, not visual novelty.

Every parameter displayed carries a source label: LIVE (physical sensor), VIRTUAL (dataset-derived), or PLANNED (not yet implemented). This labelling is non-negotiable. Presenting virtual data without a source label is scientific misrepresentation.

The reference for dashboard design is the Argo Data Management System's float visualisation tools and the INCOIS Ocean Colour and Biogeochemistry portal, both of which present parameters in the same panel structure used here.

---

## Technology

Streamlit is used for the qualification prototype. It is Python-native, requires no frontend build toolchain, and handles real-time data updates via `st.rerun()` on a polling interval. The dashboard layout is a 4-page multi-page Streamlit application.

---

## Page 1: Ocean State

Shows the core physical oceanographic parameters. These are the parameters NCPOR's Southern Ocean programme has been measuring since 2004 across 7 expeditions. The depth profiles here are the primary scientific output of the platform.

### Content

Left column: real-time gauge values

| Parameter | Source | Unit |
|---|---|---|
| Water Temperature | LIVE | deg C |
| Pressure | LIVE | hPa |
| Derived Depth | LIVE | m |
| pH | LIVE | pH units |
| TDS (salinity proxy) | LIVE (uncalibrated) | ppm |
| Current Mission Phase | LIVE | - |
| Platform Depth | Mission simulator | m |

Right column: depth profile plots (updated as mission descends)

- Temperature vs Depth: shows thermocline structure. In a real Southern Ocean profile, a sharp temperature drop between 100-500m is expected.
- Salinity vs Depth: shows the AAIW salinity minimum at 800-1000m. This feature is the scientific validation that the dataset is correctly drawn from the Southern Ocean.

Both profile plots pull from the real BGC-Argo profile data, not from the real-time sensor stream. They represent the expected profile for the platform's current geographic position.

```python
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
```

---

## Page 2: Biogeochemistry

Shows the biogeochemical parameters that represent the state of ocean health and carbon cycling. These are virtual parameters derived from BGC-Argo profiles. Every value carries the VIRTUAL label.

NCPOR's Southern Ocean programme specifically targets biogeochemistry (carbon uptake, oxygen cycling, biological productivity). This page directly demonstrates awareness of those research priorities.

Reference: SOCCOM (Southern Ocean Carbon and Climate Observations and Modeling) has identified that the Southern Ocean is the most critical region for global carbon uptake, responsible for absorbing approximately 40% of the ocean's annual uptake of anthropogenic CO2. The parameters on this page are the primary measurands for carbon cycle research.

### Content

| Parameter | Source | Unit | Scientific Significance |
|---|---|---|---|
| Dissolved Oxygen (DOXY) | VIRTUAL (BGC-Argo) | micromol/kg | Ventilation, biological productivity |
| Chlorophyll-a (CHLA) | VIRTUAL (BGC-Argo) | mg/m3 | Phytoplankton biomass, carbon export |
| pH | VIRTUAL (BGC-Argo) | pH units | Ocean acidification indicator |
| Nitrate | VIRTUAL (BGC-Argo) | micromol/kg | Nutrient availability, productivity |

All parameters displayed with:
- Current value and 2-sigma uncertainty band
- Source label: VIRTUAL -- BGC-Argo Southern Ocean
- Sensor status: ONLINE / DROPOUT / OUTAGE / RECOVERING
- Time-series sparkline for the last 10 minutes of mission

### Sensor Failure Demonstration

The virtual sensor engine randomly generates DROPOUT and OUTAGE events (2% and 0.5% probability per reading respectively). When a dropout occurs, the dashboard displays "SIGNAL LOST" for that parameter. When the sensor recovers, it displays "RECOVERING" then "ONLINE". This behaviour simulates real sensor failure modes observed in BGC-Argo deployments:

- Biofouling of optical sensors (chlorophyll, backscatter) is the most common BGC-Argo failure mode
- Communication interference causes transient dropouts
- Optode membrane failure causes extended DO outages

Showing these failure modes and recovery in the demo demonstrates that the platform architecture handles sensor degradation gracefully, which is a requirement for long-duration autonomous deployment.

---

## Page 3: Seafloor Intelligence

Shows the PS-26057 subsystem output. This is the AI detection pipeline visualised for a domain expert audience.

### Content

Left panel: SSS image viewer
- Raw / Preprocessed toggle
- Shadow zone overlay toggle
- Detected objects shown as coloured bounding boxes with class labels
- Confidence score per detection
- Shadow penalty warning where applied

Right panel: Detection list
- Sorted by calibrated confidence (descending)
- Each detection: class, raw confidence, calibrated confidence, shadow warning, lat/lon
- Colour coding: green (high confidence), amber (medium), red (low or shadow-penalised)

Lower panel: Geotag map
- Plotly scatter mapbox showing detection positions
- Point colour encodes object class
- Point size encodes calibrated confidence
- Clicking a point shows full detection record

Bottom bar: Report download
- Download JSON report
- Download CSV report
- Record count: "N detections, M geotagged"

### What to Show During Demo

1. Load a raw SSS image from AI4Shipwrecks.
2. Toggle preprocessing. Show the judge the before/after contrast and noise reduction.
3. Run inference. Detection boxes appear with class and confidence.
4. Point to the shadow zone overlay. Show a detection whose confidence was reduced by the shadow penalty. State: "This detection's confidence was reduced from 88% to 44% because the centroid is within an acoustic shadow zone. The system flags it for human review rather than suppressing it."
5. Show the detection table. Sort by confidence.
6. Download the JSON report. Open it. Show the lat, lon, object_class, confidence fields.

This sequence covers all four mandatory PS-26057 deliverables in under 90 seconds.

---

## Page 4: Mission Control

Shows platform operational health. This page proves the system is an autonomous platform, not a passive sensor display. It corresponds to what a mission operations team would monitor during a real deployment.

### Content

Left column: Platform status

| Parameter | Source | Display |
|---|---|---|
| Mission Phase | Mission FSM | Text + progress bar |
| Current Depth | Mission simulator | Gauge, 0-2000m |
| GPS Position | Real (or hardcoded for demo) | Lat/lon |
| Battery | Estimated | Percentage bar |
| Pitch | LIVE (MPU6050) | Numeric + tilt indicator |
| Roll | LIVE (MPU6050) | Numeric + tilt indicator |

Right column: Communication status

| Element | Display |
|---|---|
| Network status | ONLINE / OFFLINE indicator |
| Unsynced records | Count |
| Last sync timestamp | Time |
| MQTT broker | Connected / Disconnected |
| Mission uptime | HH:MM:SS |

Right column: Sensor health matrix

A grid showing each sensor's current status:

```
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
```

Lower panel: Mission track plot
- Plotly line chart showing the simulated mission depth over time
- Phases annotated: SURFACE, DESCENDING, OBSERVING, SONAR_SCAN, ASCENDING, REPORTING

### The Offline Demonstration

This is the single most memorable event in the demo and should be rehearsed as a deliberate moment.

1. Show the judge the ONLINE indicator and the unsynced count (0).
2. Disable the WiFi hotspot or disconnect the Ethernet cable.
3. The indicator changes to OFFLINE. The unsynced count begins incrementing.
4. Demonstrate that the sensors continue reading and the values continue updating. The platform is still running. The data is being stored locally.
5. State: "The platform continues operating autonomously even when communication is unavailable. This is essential for Southern Ocean deployment, where satellite windows are intermittent."
6. Reconnect the network.
7. The indicator changes to SYNCING. The unsynced count drops to zero within 30 seconds.
8. State: "All observations collected during the outage are automatically synchronised when connectivity is restored."

This sequence takes approximately 60 seconds. It directly demonstrates PS-26065's requirement for operation in environments with intermittent communication, and it is an observable physical event that a non-technical judge can understand without explanation.

---

## Source Label Implementation

```python
# dashboard/components/source_labels.py

import streamlit as st

SOURCE_CONFIG = {
    "REAL_HARDWARE":              {"label": "LIVE",            "color": "#22c55e"},
    "REAL_HARDWARE_UNCALIBRATED": {"label": "LIVE (uncal)",    "color": "#f59e0b"},
    "VIRTUAL_BGC_ARGO":           {"label": "VIRTUAL",         "color": "#3b82f6"},
    "PLANNED":                    {"label": "PLANNED",         "color": "#6b7280"},
    "DATASET":                    {"label": "DATASET",         "color": "#8b5cf6"},
}


def render_source_badge(source: str) -> str:
    cfg = SOURCE_CONFIG.get(source, {"label": source, "color": "#6b7280"})
    return (
        f'<span style="background:{cfg["color"]}22; '
        f'color:{cfg["color"]}; '
        f'border:1px solid {cfg["color"]}44; '
        f'border-radius:4px; '
        f'padding:2px 8px; '
        f'font-size:10px; '
        f'font-family:monospace; '
        f'letter-spacing:0.08em;">'
        f'{cfg["label"]}</span>'
    )


def render_parameter_row(
    label: str,
    value,
    unit: str,
    source: str,
    uncertainty=None,
    status: str = "ONLINE"
):
    badge = render_source_badge(source)
    if status in ("OUTAGE", "DROPOUT"):
        value_str = f'<span style="color:#ef4444">SIGNAL LOST ({status})</span>'
    elif value is None:
        value_str = "---"
    else:
        value_str = f"{value:.3f} {unit}"
        if uncertainty:
            value_str += f" &#177; {uncertainty:.3f}"

    st.markdown(
        f"**{label}** &nbsp; {badge} &nbsp; {value_str}",
        unsafe_allow_html=True
    )
```
