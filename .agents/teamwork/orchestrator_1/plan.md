# Implementation Plan — ConvectNow Deep Learning & Scrollytelling Suite

## Mission Statement
Develop, integrate, and verify ConvectNow (MoES / NCMRWF · SIH PS-26084) — incorporating real-world data pipelines (IMD DWR, MOSDAC INSAT-3DR, SEVIR), unified multi-task spatiotemporal PyTorch network (ConvectNet for Hail, Cloudburst, Downburst, Convective Initiation), physics-grounded AI attribution, and a 4D Storm Anatomy scrollytelling experience adhering to the 'Ice and Ships' design tokens.

## Phased Strategy

### Phase 0: Survey & Discovery (3 Parallel Explorers)
- **Explorer 1 (Data & Pipeline)**: Survey existing data processing code in `convectnow`, examine raw data formats, ingestion points, coordinate transforms, SEVIR/IMD/MOSDAC integration points, and dependencies.
- **Explorer 2 (ML & ConvectNet Architecture)**: Survey existing models, PyTorch structure, loss functions, training scripts, checkpointing, and inference latency requirements.
- **Explorer 3 (Frontend & Scrollytelling)**: Survey frontend setup (Vite/Next.js/React/Tailwind), WebGIS dashboard structure, scrollytelling components, `DESIGN.md` tokens, canvas/3D/cross-section rendering capabilities.

### Phase 1 (M1): Dual Real-World Data Sourcing & Ingestion Pipeline
- IMD DWR GeoServer feeds & MOSDAC INSAT-3DR ingestion.
- SEVIR convective storm cube alignment and 1 km EPSG:4326 grid re-projection.
- Automated QC filtering (clutter rejection, missing data imputation).
- Multi-modal PyTorch dataset & DataLoader yielding `(B, C, T, H, W)`.

### Phase 2 (M2): Unified Multi-Task PyTorch ConvectNet & Training Script
- 3D-CNN / Spatiotemporal ConvLSTM backbone for 4D sequences `(B, C, T, H, W)`.
- 4 task heads: Hail (SHI, POSH, MESH), Cloudburst (>100mm/hr & binary), Downburst ($V_{db}$), Convective Initiation ($0.0-1.0$).
- Custom Asymmetric / Focal Loss functions for class imbalance.
- Self-contained training and ablation script `train_convectnet.py` with reproducible logging.

### Phase 3 (M3): Physics-Grounded AI Explainer & Operational Telemetry
- Feature attribution module (VIL density, $Z_{max}$ core height, cloud-top cooling rate, freezing level proximity).
- Telemetry & performance benchmarking: latency (<50 ms), confidence bands, verification skill logging.

### Phase 4 (M4): Interactive 4D Storm Anatomy Scrollytelling Experience
- Step-by-step physical phases with parallax reveals (1 to 5).
- Interactive vertical radar reflectivity cross-sections ($Z$ vs Height 0-18 km) with isotherms (0°C, -20°C).
- Dynamic AI telemetry and attribution link to scrollytelling steps.
- Implementation matching `DESIGN.md` Ice and Ships tokens.

### Phase 5 (M5): E2E Integration, Build & System Validation
- Frontend `npm run build` verification with 0 TypeScript errors.
- Comprehensive end-to-end integration and smoke tests.
- Final review and verification gate.
