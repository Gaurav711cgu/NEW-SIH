## 2026-09-06T17:30:00Z

Task: Milestone 2 - Ingestion Pipeline (R1) & Contextual Enrichment + XGBoost Classification (R2)
Working Directory: /Users/gauravkumarnayak/Desktop/new sih/.agents/geoint_worker_m2
Project Root Directory: /Users/gauravkumarnayak/Desktop/new sih/ntro_fire_intel
Authoritative Request: /Users/gauravkumarnayak/Desktop/new sih/.agents/ORIGINAL_REQUEST.md
Survey Handoffs:
- /Users/gauravkumarnayak/Desktop/new sih/.agents/geoint_survey_exp_1/report.md
- /Users/gauravkumarnayak/Desktop/new sih/.agents/geoint_survey_exp_3/report.md

Objectives:
1. Implement `ingestion.py` in `/Users/gauravkumarnayak/Desktop/new sih/ntro_fire_intel/`:
   - Connects to NASA FIRMS API for VIIRS/MODIS active fires over India bounding box [68.0, 6.5, 97.5, 37.5].
   - Implements resilient dual-mode live-first with automatic fallback to `data/firms_seed.json` on network error/timeout/sandbox DNS block.
   - Ensures running `python ingestion.py` (or `./python ingestion.py`) always outputs at least 10 active thermal points to `data/firms_latest.json`.
   - Formats each point with required standard fields (`latitude`, `longitude`, `bright_ti4`, `scan`, `track`, `acq_date`, `acq_time`, `satellite`, `confidence`, `version`, `bright_ti5`, `frp`, `daynight`).
2. Implement `train_model.py` in `/Users/gauravkumarnayak/Desktop/new sih/ntro_fire_intel/`:
   - Spatial enrichment: queries OSM Overpass (2km radius around anomalies for industrial tags: landuse=industrial, industrial=*, power=*, man_made=refinery|works|chimney) with fallback to `data/osm_cache.json`.
   - Calculates Haversine distance, count of industrial tags within 2km, proximity to refineries/power facilities.
   - Extracts 9 features: `[frp, brightness, bright_t31, temp_delta, osm_industrial_count, osm_min_dist_m, has_chemical_refinery, has_power_infrastructure, is_night]`.
   - Trains an authentic XGBoost classifier (`xgboost.XGBClassifier`) with stratified train/validation split.
   - Validates that validation accuracy is strictly > 75% (aim for >85%).
   - Serializes trained model to `model.pkl` in the project root (also can mirror in `models/model.pkl`).
3. Maintain the Manus Planning Protocol in `ntro_fire_intel/`:
   - Update `task_plan.md`, `findings.md`, and `progress.md` with Task 2, Task 3, Task 4, and Task 5 completion details.
4. Verify by running:
   - `python ingestion.py` and checking `data/firms_latest.json` has >= 10 points.
   - `python train_model.py` and checking `model.pkl` exists and printed validation accuracy > 75%.

Files Owned Exclusively by this Worker:
- `ntro_fire_intel/ingestion.py`
- `ntro_fire_intel/train_model.py`
- `ntro_fire_intel/model.pkl`
- `ntro_fire_intel/data/firms_latest.json`
- `ntro_fire_intel/task_plan.md` (updates)
- `ntro_fire_intel/findings.md` (updates)
- `ntro_fire_intel/progress.md` (updates)

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A reviewer will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Write your complete report to `/Users/gauravkumarnayak/Desktop/new sih/.agents/geoint_worker_m2/handoff.md` and send a completion message.
