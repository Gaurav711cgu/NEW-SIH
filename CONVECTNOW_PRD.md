# ConvectNow — PRD v1.0
## Convective-Scale Nowcasting System · Thunderstorms, Hail & Cloudbursts · 0–6h Lead Time
**SIH 2026 · Problem Statement 26084 · Category: Software · Theme: Disaster Management**
**Organization: Ministry of Earth Sciences (MoES) / NCMRWF**
**Team: DEBUG THUGS**

---

## 1. Executive Summary

ConvectNow is a multi-source data fusion nowcasting system that ingests real-time heterogeneous meteorological streams—Doppler radar reflectivity/velocity, geostationary satellite IR/WV/VIS, and ground-based lightning—and produces probabilistic 0–6 hour forecasts of four convective hazard parameters at 1–2 km resolution, rendered on a live GIS dashboard with per-storm ETA countdown clocks.

- **Spatial Resolution**: 1–2 km (Target: 1–3 km)
- **Update Cycle**: 5 min (Radar scan interval)
- **Hazard Parameters**: 4 (Lightning, Hail, Downburst, Cloudburst)
- **Lead Time**: 0–6h (0–2h physics · 2–6h ML+NWP)

**Winning Thesis.** Most SIH teams will submit a dashboard with hardcoded data or a ChatGPT wrapper. ConvectNow wins by running actual PySTEPS optical-flow nowcasting on real NEXRAD/SEVIR data, computing physically-grounded hazard indices (SHI, MDAP, VIL), and presenting NCMRWF judges with CSI/FSS skill scores — the metrics they use internally. Scientific rigor, not visual polish, is the differentiator.

**Honest Scope Boundary.** 0–2h lead time is production-ready via PySTEPS Lagrangian advection — CSI ~0.4–0.6 on extreme events. 2–6h is the "research/advanced" arm using EarthFormer + HRRR ensemble blend — scores will be lower and judges who know meteorology will ask. Frame 2–6h as "AI-augmented NWP fusion, experimental" and cite skill scores honestly. Do not overclaim.

---

## 2. Problem Statement Deconstruction

| PS Requirement | Interpretation | How ConvectNow Addresses It | Status |
| --- | --- | --- | --- |
| Real-time nowcasting 0–6h lead time | Must produce forecasts continuously, not batch | Streaming replay at 5-min cadence; live PySTEPS pipeline | Covered |
| Hyper-local 1–3 km spatial resolution | Output grid must be ≤ 3 km | PySTEPS at 1 km (NEXRAD native); HRRR bilinear downscaling to 1 km | Covered |
| Multi-source data fusion | Must ingest ≥ 3 heterogeneous sources | DWR + Satellite + Lightning + NWP (4 sources) | Covered |
| Doppler Weather Radar (reflectivity + velocity) | Z and V fields, dual-pol preferred | NEXRAD Level-II (proxy for IMD DWR); IMD adapter stub for native NetCDF/UF | Proxy used |
| Geostationary satellite (INSAT-3D/3DR) | TIR1, TIR2, WV bands | GOES-16 ABI Ch13 (10.35μm) + Ch09 (6.9μm WV) as structural proxy | Proxy used |
| Ground-based lightning detection | Strike density maps | GLM (GOES-16 Geostationary Lightning Mapper) via SEVIR dataset | Covered |
| Auto-detect early convective initiation | Pre-storm signature detection | CAPE + CIN threshold + dBZ growth rate + IR cooling rate classifier | Covered |
| Lightning strike density forecast | Spatial density map, 0–6h | XGBoost on (VIL, dBZ_max, IR_Tb, GLM_count, CAPE) → density raster | Covered |
| Hail probability forecast | Binary/probabilistic hail map | SHI (Witt 1998) + POSH formula + freezing level from HRRR | Covered |
| Downburst velocity forecast | Velocity magnitude estimate | MDAP (dBZ gradient) + CAPE × lapse_rate regression model | Covered |
| Cloudburst threshold forecast | >100 mm/hr detection | Tropical Z-R (Marshall-Palmer variant) → rain rate → 100mm/hr flag | Covered |
| Real-time GIS dashboard | Interactive, live hazard map | Leaflet.js / MapLibre + dynamic overlays; hazard polygon overlays; countdown clocks | Covered |
| Live countdown clocks for storm arrivals | ETA to target locations | TINT cell tracking → motion vector → distance/speed → ETA ± ensemble spread | Covered |

---

## 3. System Architecture

```
Raw Sources
  NEXRAD S3 / IMD DWR     ─┐
  GOES-16 / MOSDAC         ├─► Ingestion Engine ─► Unified Analysis Cube (xarray)
  GLM / Lightning Net       │     (Layer 1)              ↓
  GFS HRRR (CAPE, wind)  ─┘                   ┌─────────────────────┐
                                                │  0–2h: PySTEPS STEPS│
                                                │  2–6h: EarthFormer  │ ─► Ensemble
                                                │  3–6h: HRRR NWP     │    BMA Blend
                                                └─────────────────────┘       ↓
                                                                    Hazard Engine (Layer 3)
                                                                      ↓            ↓            ↓            ↓
                                                                  Lightning     Hail      Downburst   Cloudburst
                                                                   Density    Prob (%)    Velocity     Flag
                                                                       ↓
                                                                GIS Dashboard → Storm ETAs → Alerts
```

### Layer Breakdown
- **Layer 1 — Data Ingestion & Preprocessing**: `wradlib`, `pyart`, `xarray`, `netCDF4`, `h5py`. Consumes raw streams, converts to 1-km EPSG:4326 grid, applies QC, clutter removal, beam-blocking.
- **Layer 2 — Nowcasting Engine (0–6h)**: `pysteps`, `tint`, `EarthFormer`, `herbie`, `scipy`. Three-arm ensemble (PySTEPS 24-member, EarthFormer, HRRR NWP) blended via BMA.
- **Layer 3 — Hazard Parameter Engine**: `xgboost`, `scipy`, `MetPy`. Generates 4 separate 1-km raster grids per timestep.
- **Layer 4 — GIS Dashboard & Alerting**: Interactive Map, 4-tier severity polygons, TINT storm tracks, per-cell countdown clocks, SHAP explainability.

---

## 4. F1 — Data Ingestion Engine

### 4.1 Data Sources
- **NEXRAD Level-II**: Reflectivity (Z) + Velocity (V) on AWS S3 (`s3://noaa-nexrad-level2`).
- **GOES-16 ABI**: Ch13 TIR (10.35μm) + Ch09 WV (6.9μm) (`s3://noaa-goes16`).
- **SEVIR GLM**: Lightning flash extent density (`s3://sevir`).
- **SEVIR VIL+IR**: VIL + IR069 + IR107 storm events (`s3://sevir`).
- **HRRR via Herbie**: CAPE, CIN, UGRD, VGRD, HGT (0°C isotherm).
- **ISRO MOSDAC**: INSAT-3D/3DR HDF5 TIR1, TIR2, WV.
- **IMD DWR Adapter**: Plug-in adapter stub for native NetCDF/UF.

### 4.2 QC Pipeline
- Radar clutter removal: `pyart.filters.GateFilter`.
- Beam-blocking correction: SRTM 90m DEM + attenuation.
- Velocity dealiasing: Region-based dealiasing.
- Satellite parallax correction using DEM.
- Grid interpolation to uniform 1-km EPSG:4326.

---

## 5. F2 — Nowcasting Engine (0–6h)

### 5.1 Arm 1 — PySTEPS (0–90 min)
- Optical Flow: Variational Echo Tracking (VET) / Lucas-Kanade.
- STEPS 24-member ensemble with non-parametric noise cascading and velocity perturbations.
- Output: Mean rain rate field + uncertainty spread.

### 5.2 Arm 2 — EarthFormer / SimVP (30 min – 4h)
- Cuboid Self-Attention Transformer / SimVP spatiotemporal model.
- Input: `(B, T_in=20, 128, 128, 4)` [VIL, IR107, WV069, GLM].
- Loss: MSE + SSIM + Physics-constrained advection loss.

### 5.3 Arm 3 — HRRR NWP (3–6h backbone)
- Convective potential index ($CPI = CAPE / \max(1, -CIN)$).
- Bicubic downscaling to 1-km grid.

### 5.4 Lead-Time Bayesian Model Averaging (BMA) Blend
- $T+15$: 85% PySTEPS, 10% EarthFormer, 5% HRRR
- $T+60$: 45% PySTEPS, 40% EarthFormer, 15% HRRR
- $T+120$: 5% PySTEPS, 55% EarthFormer, 40% HRRR
- $T+360$: 0% PySTEPS, 15% EarthFormer, 85% HRRR

### 5.5 Storm Cell Tracking (TINT)
- Tracks storm centroids, areas, max reflectivity, and $u, v$ velocity vectors.
- Projects motion vector to compute ETA at target cities/airports.

---

## 6. F3 — Hazard Parameter Engine

1. **Lightning Strike Density**:
   - XGBoost Regressor trained on SEVIR GLM features (VIL, $dBZ_{max}$, $IR\ T_b$, GLM count, CAPE, LCL).
   - Real-time SHAP tree explanation.
2. **Hail Probability**:
   - Severe Hail Index (SHI) & Probability of Severe Hail (POSH) via Witt et al. (1998).
   - $SHI = 0.1 \times \int_{0^\circ\text{C}}^{top} w(T) \times E(Z) dh$.
   - $POSH = 29 \times \ln(SHI) - 2.84$ (clipped to 0–100%).
   - $MESH = 2.54 \times \sqrt{SHI}$ (mm).
3. **Downburst Velocity**:
   - Wet-Bulb Zero Method & MDAP regression based on CAPE, lapse rate, and mid-level reflectivity gradient.
4. **Cloudburst Detection**:
   - Tropical Z-R relationship: $R = (Z / 300)^{1 / 1.5}$ mm/hr.
   - Confirmed cloudburst flagged if $R > 100\text{ mm/hr}$ across $\ge 3$ adjacent grid cells.

---

## 7. F4 — GIS Dashboard & Alerting

- **Live Hazard Map**: Animated overlays for 4 hazards, storm polygons, vector arrows, countdown clocks.
- **4-Tier Severity System**:
  - 🟡 Advisory: CAPE > 500 J/kg or dBZ > 35.
  - 🟠 Watch: POSH > 30% or Lightning > 2/km²/hr or R > 50 mm/hr.
  - 🔴 Warning: POSH > 60% or Downburst > 15 m/s or R > 100 mm/hr.
  - 🟣 Extreme: Compound severe thresholds (Full-screen alert + ETA + SHAP).
- **ETA Countdown Clocks**: Projected distance along approach vector $\pm$ ensemble uncertainty window.

---

## 8. F5 — Evaluation Framework

- **CSI (Critical Success Index)**: Target $\ge 0.4$ at 1h lead time.
- **FSS (Fractions Skill Score)**: Target $\ge 0.5$ at 60 km neighborhood.
- **HSS (Heidke Skill Score)**: Target $\ge 0.3$.
- **Brier Score & Reliability Diagrams**: For probabilistic hazard calibration.
- **ETA Mean Absolute Error**: Target $\le 15\text{ min}$ at 30-min lead time.

---

## 9. Verification & Indian Case Studies

1. **Kolkata Kalbaisakhi (Nor'wester)**: Severe squall line, 100+ km/h gusts, hail, lightning outbreak.
2. **Delhi Severe Thunderstorm**: Microburst downburst and high flash density.
3. **Uttarakhand Cloudburst (Chamoli)**: Orographic convective precipitation $> 200\text{ mm/hr}$.
