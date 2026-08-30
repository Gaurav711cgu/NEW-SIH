"""
dashboard/pages/3_Seafloor_Intelligence.py
------------------------------------------
PS-26057 — AI-Powered Marine Debris & Anomaly Detection
National Institute of Ocean Technology (NIOT) | MoES

This page fulfils all four PS-26057 deliverables:
  1. Upload raw sonar image (PNG/JPG from AI4Shipwrecks / SeabedObjects-KLSG)
  2. Preprocess (CLAHE + Median speckle filter + shadow mask) — real pipeline
  3. Run YOLOv8-seg inference — real model, zero mock data
  4. Display detections with calibrated confidence, shadow penalty badge
  5. Show geotagged map with ESRI Ocean Basemap
  6. Download structured JSON and CSV reports

No hardcoded detections. No Wikipedia images. No random.uniform fakes.
Every detection comes from the real model running on the uploaded image.
"""

import io
import sys
import os
import yaml
import logging
import tempfile
import time
import numpy as np
import cv2
import pandas as pd
import streamlit as st
from pathlib import Path

# ── Path setup ────────────────────────────────────────────────────────────────
ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT))

CONFIG_PATH = ROOT / "config" / "pipeline_config.yaml"

# ── Load config (no hardcoded values) ─────────────────────────────────────────
def _load_cfg() -> dict:
    if not CONFIG_PATH.exists():
        st.error(f"Pipeline config not found: {CONFIG_PATH}")
        st.stop()
    with open(CONFIG_PATH) as f:
        return yaml.safe_load(f)

CFG = _load_cfg()
DET_CFG   = CFG.get("detector", {})
PRE_CFG   = CFG.get("preprocessor", {})
CAL_CFG   = CFG.get("confidence_calibrator", {})
GEO_CFG   = CFG.get("geotagging", {})

# ── Pipeline imports ───────────────────────────────────────────────────────────
from ai_pipeline.preprocessor        import preprocess_sss
from ai_pipeline.confidence_calibrator import calibrate
from ai_pipeline.geotagger            import geotag_detections
from ai_pipeline.reporter             import to_json, to_csv

# ── Page config ───────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="DeepScan · PS-26057",
    page_icon="🌊",
    layout="wide",
)

# ── Custom CSS: NIOT/Naval C2 aesthetic ───────────────────────────────────────
st.markdown("""
<style>
    .main { background: #060d1b; color: #e2e8f0; }
    .stApp { background: #060d1b; }
    h1, h2, h3 { color: #00d4ff; font-family: 'Courier New', monospace; }
    .metric-box {
        background: #0b1a2e;
        border: 1px solid #00d4ff33;
        border-radius: 8px;
        padding: 14px;
        margin-bottom: 10px;
    }
    .det-card {
        border-left: 4px solid;
        padding: 10px 14px;
        border-radius: 4px;
        margin-bottom: 10px;
        background: #0b1a2e;
    }
    .badge-shadow { background:#7c3aed; color:#fff; padding:2px 8px; border-radius:12px; font-size:11px; }
    .badge-high   { background:#059669; color:#fff; padding:2px 8px; border-radius:12px; font-size:11px; }
    .badge-mid    { background:#d97706; color:#fff; padding:2px 8px; border-radius:12px; font-size:11px; }
    .badge-low    { background:#dc2626; color:#fff; padding:2px 8px; border-radius:12px; font-size:11px; }
</style>
""", unsafe_allow_html=True)

# ── Header ─────────────────────────────────────────────────────────────────────
st.markdown("# 🌊 DeepScan · Seafloor Intelligence")
st.markdown("**PS-26057 | NIOT · Ministry of Earth Sciences | Team DEBUG THUGS**")
st.markdown("*AI-Powered Marine Debris & Anomaly Detection in Side-Scan Sonar Imagery*")
st.markdown("---")

# ── Model availability check ──────────────────────────────────────────────────
model_path = Path(DET_CFG.get("model_path", ""))
model_ready = model_path.exists()

if not model_ready:
    st.warning(
        f"⚠️ Trained model not found at `{model_path}`. "
        "Run `python ai_pipeline/train.py` to train and generate weights. "
        "Upload functionality is available; inference will activate once weights are present."
    )

# ── Sidebar: Pipeline config display ─────────────────────────────────────────
with st.sidebar:
    st.markdown("### ⚙️ Pipeline Configuration")
    st.markdown(f"**Model:** `{Path(DET_CFG.get('model_path','')).name}`")
    st.markdown(f"**Conf Threshold:** `{DET_CFG.get('conf_threshold', 0.25)}`")
    st.markdown(f"**IoU Threshold:** `{DET_CFG.get('iou_threshold', 0.45)}`")
    st.markdown(f"**Shadow Penalty:** `{CAL_CFG.get('shadow_penalty_factor', 0.5) * 100:.0f}%`")
    st.markdown(f"**Low-Conf Gate:** `{CAL_CFG.get('low_confidence_threshold', 0.35)}`")
    st.markdown("---")
    st.markdown("**Datasets Used:**")
    st.markdown("- AI4Shipwrecks (UMich/NOAA) — 286 images")
    st.markdown("- SeabedObjects-KLSG (Harbin) — 1,190 boxes")
    st.markdown("- Synthetic ghost net via CycleGAN — ~300 images")
    st.markdown("---")
    st.markdown("**Classes:**")
    for cls in DET_CFG.get("class_names", []):
        st.markdown(f"  `{cls}`")

# ── Upload section ────────────────────────────────────────────────────────────
st.subheader("📤 Upload Side-Scan Sonar Image")
st.caption(
    "Upload a real SSS image (PNG/JPG) from AI4Shipwrecks, SeabedObjects-KLSG, "
    "or any grayscale sonar waterfall. No simulated data is accepted here."
)

uploaded = st.file_uploader(
    "Drop SSS image file (PNG / JPG / JPEG)",
    type=["png", "jpg", "jpeg"],
    help="Use images from AI4Shipwrecks (umfieldrobotics.github.io/ai4shipwrecks) "
         "or SeabedObjects-KLSG for best results.",
)

if uploaded is None:
    st.info(
        "👆 Upload a sonar image to begin. "
        "Recommended test images: AI4Shipwrecks dataset (NOAA Thunder Bay, 28 shipwreck sites). "
        "Download from: https://umfieldrobotics.github.io/ai4shipwrecks/"
    )
    st.stop()

# ── Save upload to temp file ──────────────────────────────────────────────────
with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
    tmp.write(uploaded.read())
    tmp_path = tmp.name

# ── Preprocessing ─────────────────────────────────────────────────────────────
st.markdown("---")
st.subheader("🔬 Stage 1 — Acoustic Physics Preprocessing")

with st.spinner("Applying CLAHE + Median speckle filter + shadow mask..."):
    try:
        preprocessed = preprocess_sss(tmp_path)
    except FileNotFoundError as e:
        st.error(str(e))
        st.stop()

col_raw, col_proc = st.columns(2)

with col_raw:
    st.markdown("**Raw Sonar (unprocessed)**")
    st.caption("High speckle noise · Uneven range illumination · No shadow detection")
    st.image(preprocessed.original, use_container_width=True, clamp=True)

with col_proc:
    st.markdown("**Enhanced (CLAHE + Median + Shadow Mask)**")
    st.caption(
        f"Speckle suppressed · Contrast normalized · "
        f"Shadow coverage: **{preprocessed.shadow_coverage_pct}%**"
    )
    # Overlay shadow mask in red on the enhanced image
    overlay = cv2.cvtColor(preprocessed.processed, cv2.COLOR_GRAY2BGR)
    overlay[preprocessed.shadow_mask > 0] = [80, 0, 0]   # dark red shadow zones
    st.image(overlay, use_container_width=True, clamp=True)

st.metric(
    "Acoustic Shadow Coverage",
    f"{preprocessed.shadow_coverage_pct}%",
    help="Percentage of image area identified as acoustic shadow. "
         "Detections in shadow zones receive confidence penalty."
)

# ── Inference ─────────────────────────────────────────────────────────────────
if not model_ready:
    st.warning("Model weights not found — skipping inference. Train the model first.")
    os.unlink(tmp_path)
    st.stop()

st.markdown("---")
st.subheader("🤖 Stage 2 — YOLOv8-seg Inference")

with st.spinner(f"Running inference (conf={DET_CFG.get('conf_threshold', 0.25)})..."):
    t0 = time.perf_counter()
    from ai_pipeline.detector import SonarDetector
    try:
        detector = SonarDetector()
    except FileNotFoundError as e:
        st.error(str(e))
        os.unlink(tmp_path)
        st.stop()

    raw_detections = detector.run(preprocessed.processed)
    inference_ms = (time.perf_counter() - t0) * 1000

st.caption(f"⚡ Inference time: **{inference_ms:.1f} ms**")

if not raw_detections:
    st.info("No objects detected above the confidence threshold in this image.")
    os.unlink(tmp_path)
    st.stop()

# ── Confidence calibration ────────────────────────────────────────────────────
raw_dicts = [d.to_dict() for d in raw_detections]
# confidence_calibrator expects dict with 'confidence' and 'bbox' keys
for d in raw_dicts:
    d["confidence"] = d.pop("confidence")  # already present
    x, y, w, h = d["bbox"]
    d["bbox"] = (x, y, w, h)

calibrated = calibrate(raw_dicts, preprocessed.shadow_mask)

# ── Draw bounding boxes on image ──────────────────────────────────────────────
annotated = cv2.cvtColor(preprocessed.processed, cv2.COLOR_GRAY2BGR)

# Color map per class (loaded from config class_names)
CLASS_COLORS = {
    "shipwreck": (0, 240, 255),    # cyan
    "pipe":      (0, 200, 255),
    "cylinder":  (255, 165, 0),    # amber
    "ghost_net": (255, 80, 200),   # magenta
    "anomaly":   (200, 200, 50),
}

for det in calibrated:
    x, y, w, h = det["bbox"]
    x1, y1, x2, y2 = int(x), int(y), int(x + w), int(y + h)
    cls = det["class"]
    color = CLASS_COLORS.get(cls, (200, 200, 200))
    conf_pct = det["confidence_cal"] * 100

    cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 2)
    label = f"{cls} {conf_pct:.1f}%"
    if det["shadow_penalty"]:
        label += " [shadow]"
    (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
    cv2.rectangle(annotated, (x1, y1 - th - 4), (x1 + tw + 4, y1), color, -1)
    cv2.putText(annotated, label, (x1 + 2, y1 - 3),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1, cv2.LINE_AA)

st.markdown("---")
st.subheader("🎯 Stage 3 — Detection Results")

col_img, col_list = st.columns([3, 2])

with col_img:
    st.markdown("**Annotated Sonar Image — Bounding Boxes + Shadow Calibration**")
    st.image(annotated, use_container_width=True, clamp=True)

with col_list:
    st.markdown(f"**{len(calibrated)} object(s) detected**")
    for det in calibrated:
        conf_cal = det["confidence_cal"]
        if conf_cal > 0.70:
            border = "#059669"; badge = "HIGH CONFIDENCE"
        elif conf_cal > 0.50:
            border = "#d97706"; badge = "MEDIUM"
        else:
            border = "#dc2626"; badge = "LOW / REVIEW"

        shadow_badge = (
            '<span class="badge-shadow">⚠️ Shadow Penalised</span>'
            if det["shadow_penalty"] else ""
        )
        conf_badge = f'<span class="badge-{"high" if conf_cal > 0.7 else "mid" if conf_cal > 0.5 else "low"}">{badge}</span>'

        st.markdown(
            f"""<div class="det-card" style="border-color:{border};">
            <strong>{det['class'].upper()}</strong>&nbsp;&nbsp;{conf_badge}&nbsp;{shadow_badge}<br/>
            Calibrated: <strong>{conf_cal*100:.1f}%</strong> &nbsp;·&nbsp;
            Raw: {det['confidence_raw']*100:.1f}%<br/>
            BBox (x,y,w,h): {[round(v,1) for v in det['bbox']]}
            </div>""",
            unsafe_allow_html=True,
        )

# ── Geotagging ────────────────────────────────────────────────────────────────
st.markdown("---")
st.subheader("🗺️ Stage 4 — Geotagging Engine")
st.caption(
    "Coordinates parsed from XTF ping headers if XTF file supplied. "
    "Fallback: configurable reference position from pipeline_config.yaml "
    f"(lat={GEO_CFG.get('fallback_lat')}, lon={GEO_CFG.get('fallback_lon')})."
)

tagged = geotag_detections(
    detections=calibrated,
    pings=None,     # No XTF file in image-upload mode; position from config
    frame_index=0,
)

geo_df = pd.DataFrame([
    {"lat": t["lat"], "lon": t["lon"],
     "class": t["object_class"], "conf": t["confidence_cal"]}
    for t in tagged
])

try:
    import folium
    from streamlit_folium import st_folium

    fallback_lat = GEO_CFG.get("fallback_lat", -54.2)
    fallback_lon = GEO_CFG.get("fallback_lon", 60.8)

    m = folium.Map(location=[fallback_lat, fallback_lon], zoom_start=10, tiles=None)
    folium.TileLayer(
        tiles="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}",
        attr="ESRI Ocean Basemap / GEBCO / NOAA",
        name="ESRI Ocean Bathymetry",
    ).add_to(m)

    for t in tagged:
        color = "red" if t["shadow_penalty"] else "blue"
        folium.CircleMarker(
            location=[t["lat"], t["lon"]],
            radius=10,
            color="#00d4ff",
            fill=True,
            fill_color=color,
            fill_opacity=0.85,
            popup=folium.Popup(
                f"<b>{t['object_class']}</b><br>"
                f"Confidence: {t['confidence_cal']*100:.1f}%<br>"
                f"Lat: {t['lat']}<br>Lon: {t['lon']}<br>"
                f"Ping: {t['ping_number']}<br>"
                f"Time: {t['timestamp']}",
                max_width=220,
            ),
            tooltip=f"{t['object_class']} ({t['confidence_cal']*100:.1f}%)",
        ).add_to(m)

    st_folium(m, height=420, use_container_width=True)

except ImportError:
    # Fallback to st.map if folium not installed
    st.map(geo_df)
    st.caption("Install `folium` and `streamlit-folium` for the full ESRI Ocean basemap.")

# ── Reports ───────────────────────────────────────────────────────────────────
st.markdown("---")
st.subheader("📋 Stage 5 — Structured Reports")

json_report = to_json(tagged)
csv_report  = to_csv(tagged)

c1, c2, c3, c4 = st.columns(4)
with c1:
    st.download_button(
        "⬇️ Download JSON Report",
        data=json_report,
        file_name=f"deepscan_report_{int(time.time())}.json",
        mime="application/json",
    )
with c2:
    st.download_button(
        "⬇️ Download CSV Report",
        data=csv_report,
        file_name=f"deepscan_report_{int(time.time())}.csv",
        mime="text/csv",
    )
with c3:
    st.metric("Detections", len(tagged))
with c4:
    st.metric("Inference", f"{inference_ms:.0f} ms")

st.markdown("**JSON Report Preview:**")
st.code(json_report[:2000] + ("\n... (truncated)" if len(json_report) > 2000 else ""), language="json")

# ── Cleanup temp file ─────────────────────────────────────────────────────────
os.unlink(tmp_path)
