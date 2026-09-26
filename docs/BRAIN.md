# BRAIN.md — ConvectNow · SIH PS-26084 · DEBUG THUGS
> Read this at session start instead of re-analyzing the project. Update after every milestone.

**Last updated:** 2026-09-24T19:19 IST

---

## 🎯 Primary Objective
Convective-scale nowcasting system (thunderstorms, hail, cloudbursts, downbursts) · 0–6h · 1–3 km · MoES/NCMRWF

---

## 📍 Compressed State
```
[Project: ConvectNow | PS: SIH-26084 | Team: DEBUG THUGS]
[M1: DONE✅19/19 | M2: DONE✅8/8 | M3: DONE✅ (Evolution) | M4: DONE✅ (Fusion) | M5: VERIFIED✅ | M6: READY | M7: READY]
[UI: Blizzard-styled DONE✅ | Build: PASS✅ 583ms 0-errors]
[Backend: FastAPI v1.2 with ConvectNet, Cell Evolution & Multimodal Fusion]
```

---

## 📁 Key File Map

### Backend
| File | Purpose | Status |
|------|---------|--------|
| `convectnow/backend/data/ingester_imd.py` | IMD DWR GeoServer + GIF decoder | ✅ Done |
| `convectnow/backend/data/ingester_mosdac.py` | MOSDAC INSAT-3DR multispectral + Planck | ✅ Done |
| `convectnow/backend/data/quality_control.py` | TDBZ clutter rejection, AP gating | ✅ Done |
| `convectnow/backend/data/projection.py` | 1km EPSG:4326 reprojection | ✅ Done |
| `convectnow/backend/data/dataset_sevir.py` | ConvectDataset PyTorch (B,4,12,128,128) | ✅ Done |
| `convectnow/backend/server.py` | FastAPI server port 8008 | ✅ Operational |
| `convectnow/backend/models/` | **DOES NOT EXIST YET** — M2 agent writing now | 🔄 |
| `convectnow/backend/physics_explainer.py` | M3 — Shapley attribution | ❌ Pending |
| `convectnow/backend/telemetry.py` | M3 — latency + skill tracking | ❌ Pending |

### Frontend
| File | Purpose | Status |
|------|---------|--------|
| `convectnow/frontend/src/App.tsx` | Main app, Blizzard header + mode pills | ✅ Styled |
| `convectnow/frontend/src/components/HazardMap.tsx` | 60FPS canvas wind streamlines + isobars | ✅ Done |
| `convectnow/frontend/src/components/ETACountdown.tsx` | Storm ETA clocks | ✅ Blizzard |
| `convectnow/frontend/src/components/HazardMeters.tsx` | 4 hazard dials | ✅ Blizzard |
| `convectnow/frontend/src/components/CapAlertModal.tsx` | NDMA CAP v1.2 XML modal | ✅ Blizzard |
| `convectnow/frontend/src/components/EvaluationPanel.tsx` | CSI/FSS verification modal | ✅ Blizzard |
| `convectnow/frontend/src/components/scrollytelling/StormAnatomyScrolly.tsx` | 4D Storm Anatomy master | ✅ M4 Done |
| `convectnow/frontend/src/components/scrollytelling/VerticalRadarCrossSection.tsx` | 60FPS RHI cross-section | ✅ M4 Done |
| `convectnow/frontend/src/components/scrollytelling/AITelemetryHUD.tsx` | JetBrains Mono HUD | ✅ M4 Done |
| `convectnow/frontend/src/index.css` | Blizzard CSS classes | ✅ Done |
| `convectnow/frontend/tailwind.config.js` | Blizzard palette extended | ✅ Done |

### Tests
| File | Tests | Status |
|------|-------|--------|
| `convectnow/tests/test_data_pipeline.py` | 19 tests — M1 pipeline | ✅ 19/19 PASS |
| `convectnow/tests/test_convectnet.py` | 7 tests — M2 model | 🔄 Being written |

### Datasets (real, not mock)
```
datasets/sevir/vil/SEVIR_VIL_STORMEVENTS_2017_0101_0630.h5   ← real SEVIR
datasets/sevir/lght/SEVIR_LGHT_ALLEVENTS_2018_0601_0701.h5  ← real SEVIR
datasets/sevir/CATALOG.csv                                    ← 33MB catalog
datasets/imd_radar/{ppi,caz,ppv,sri,pac,vp2}_delhi.gif       ← real IMD GIFs
```

---

## 🎨 Design System (Blizzard — STRICTLY ENFORCE)

| Token | Value |
|-------|-------|
| Background | `#0a0d15`, `#131928` |
| Primary gradient | `linear-gradient(135deg, #1888ef, #009fe9)` |
| Accent | `#38a8ff` |
| Border | `border-white/10` |
| Pill radius | `rounded-full` (100px) |
| Fonts | `Poppins` (heading/`font-heading`), `Archivo` (body), `JetBrains Mono` (data/`font-mono`) |
| Primary btn | CSS class `btn-blizzard-primary` |
| Secondary btn | CSS class `btn-blizzard-secondary` |
| Glass card | CSS class `card-blizzard` |

---

## 🔌 Running Services
| Service | URL | Status |
|---------|-----|--------|
| FastAPI backend | `http://localhost:8008` | Run: `PYTHONPATH=. uvicorn convectnow.backend.server:app --port 8008` |
| Vite frontend | `http://localhost:5174` | Run: `npm run dev` in `convectnow/frontend/` |

---

## 🤖 Milestone Status

### M1 — Data Pipeline ✅ DONE
- All 3 ingesters: IMD DWR, MOSDAC INSAT-3DR, SEVIR
- TDBZ QC, AP gating, optical-flow imputation
- 1km EPSG:4326 reprojection
- ConvectDataset + DataLoader → `(B,4,12,128,128)`
- **FIX APPLIED:** `_resolve_path()` added to all 3 modules so `datasets/` resolves regardless of `cwd`
- **Tests:** `PYTHONPATH=.. pytest tests/test_data_pipeline.py` → 19/19 ✅

### M2 — ConvectNet ✅ IN PROGRESS (agent e5f59d0f)
Files being created:
- `convectnow/backend/models/losses.py` — ASL (gamma_pos=1, gamma_neg=4) + ACL (3x under-penalty) + ConvectNetLoss
- `convectnow/backend/models/convectnet.py` — 3D-CNN + SpatioTemporalConvLSTM + 4 hazard heads
- `convectnow/backend/models/inference.py` — ConvectNetInference (<50ms SLA)
- `convectnow/backend/models/__init__.py`
- `convectnow/backend/train_convectnet.py` — training loop + SyntheticConvectDataset fallback
- `convectnow/tests/test_convectnet.py` — 7 tests

**Critical constraint:** NO `AdaptiveAvgPool3d` — breaks Apple MPS. Use `AdaptiveAvgPool2d` on squeezed spatial dim.

### M3 — Physics Explainer + FastAPI ❌ PLANNED (after M2)
Files to create:
- `convectnow/backend/physics_explainer.py` — VIL density, Z_max height, cooling rate, freezing level Shapley attribution
- `convectnow/backend/telemetry.py` — inference latency + CSI/FSS verification logger
- Add to `server.py`: `/api/convectnet/predict`, `/api/convectnet/explain`, `/api/convectnet/telemetry`

### M4 — 4D Storm Anatomy ✅ DONE
- 5-phase scrollytelling: Initiation → Explosive Updraft → Hail Core → Downdraft → Flash Flood
- 60FPS canvas RHI cross-section (0–18km, 0°C at 4.5km, -20°C at 7.5km)
- AI Telemetry HUD + Feature Attribution Panel
- Dual-reviewer APPROVED

### M5 — E2E Verification ❌ PLANNED (after M2+M3)
- Playwright screenshot: Tactical, 4D Anatomy, CAP Alert views
- `npm run build` → 0 errors (currently verified ✅)
- Full integration test suite

---

## ⚡ Key Technical Decisions
| Decision | Reason |
|----------|--------|
| `AdaptiveAvgPool2d` not 3d | Apple MPS lacks `aten::_adaptive_avg_pool3d` |
| MPS device for inference | 1.17ms forward pass (beats 50ms SLA by 43x) |
| `_resolve_path()` in all data modules | cwd-independent path resolution for tests |
| SyntheticConvectDataset fallback | Allows M2 tests to run without 33GB SEVIR download |
| ASL gamma_neg=4 | Severe weather false negatives cost 4x more than false alarms |
| ACL alpha_under=3.0 | Missing a cloudburst warning 3x worse than false alarm |

---

## 🚀 Next 3 Actions (in order)
1. **Wait for M2 agent** (`e5f59d0f`) to complete — then verify `PYTHONPATH=.. pytest tests/test_convectnet.py` 7/7 pass
2. **Dispatch M3 agent** — `physics_explainer.py` + `telemetry.py` + FastAPI endpoints
3. **Dispatch M5 agent** — Playwright E2E + final build verify

---

## 📋 Run Commands Quick Reference
```bash
# M1 tests
cd "/Users/gauravkumarnayak/Desktop/new sih/convectnow"
PYTHONPATH=.. pytest tests/test_data_pipeline.py    # 19/19

# M2 tests (after M2 agent completes)
PYTHONPATH=.. pytest tests/test_convectnet.py -v    # 7/7

# Frontend build
cd convectnow/frontend && npm run build              # expect <600ms, 0 errors

# Training (synthetic data fallback)
cd convectnow && PYTHONPATH=.. python backend/train_convectnet.py --epochs 5

# Backend server
cd convectnow && PYTHONPATH=. uvicorn backend.server:app --port 8008 --reload
```

---

## 🔑 Agent Conversation IDs (active)
| Agent | Conv ID | State |
|-------|---------|-------|
| ConvectNet M2 | `e5f59d0f-e855-4e9c-aff9-cc76d428815a` | RUNNING |
| ConvectNow Teamwork (original) | `da2cc780-0df4-4218-8b78-19eab1ed69a5` | idle |
