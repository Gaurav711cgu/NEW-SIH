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
        value_str = f'<span style="color:#ef4444; font-weight: bold;">SIGNAL LOST ({status})</span>'
    elif value is None:
        value_str = "---"
    else:
        value_str = f"{value:.3f} {unit}"
        if uncertainty:
            value_str += f" &#177; {uncertainty:.3f}"

    st.markdown(
        f"<div style='margin-bottom: 0.5rem;'>**{label}** &nbsp; {badge} &nbsp; {value_str}</div>",
        unsafe_allow_html=True
    )
