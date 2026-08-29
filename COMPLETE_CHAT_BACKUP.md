# ============================================================================
# OceanGuard AI — COMPLETE PROJECT HANDOFF & RESUME GUIDE
# Smart India Hackathon (SIH26143) | SamadhanLabs
# Last Updated: 28-Aug-2026, 21:37 IST
# ============================================================================

> **IMPORTANT**: This single file contains everything discussed and accomplished during our session. You can safely restart tomorrow, reference this file, and pick up right where we left off.

---

## 👥 TEAM & PROJECT OVERVIEW
- **Team**: SamadhanLabs (Himanshu, Shitanshu, Zayan, Ashutosh, Rounak, Shakthy)
- **Problem**: SIH26143 — Marine Oil Spill Detection, Tracing & Attribution System (MOSTA)
- **Authority / Domain**: Ministry of Earth Sciences (MoES) / INCOIS
- **Objective**: Pinpoint culprit vessel behind marine oil discharges using SAR Satellite detection, Lagrangian drift backtracking, AIS tracking, and XGBoost machine learning evidence ranking.

---

## 🚀 HOW TO RESUME WORK TOMORROW (1-MINUTE STARTUP)

Open two terminals in `/Users/shitanshuchaurasiya/Downloads/untitled folder`:

### Terminal 1: Backend API (FastAPI)
```bash
cd "/Users/shitanshuchaurasiya/Downloads/untitled folder"
python3 -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
```
- **Backend URL**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`

### Terminal 2: Frontend Web Server
```bash
cd "/Users/shitanshuchaurasiya/Downloads/untitled folder"
python3 -m http.server 3000
```
- **Frontend App**: `http://localhost:3000`

---

## 📂 DIRECTORY STRUCTURE & CREATED ASSETS

```text
untitled folder/
├── index.html                   ← Government of India / INCOIS standard UI
├── style.css                    ← Complete MoES design system (Navy/Saffron/White)
├── app.js                       ← Client controller, geospatial layer manager, replay engine
├── cases-data.js                ← Multi-incident database (Mumbai High, Mannar, Singapore)
│
├── backend/
│   ├── app/
│   │   ├── main.py              ← FastAPI application routing & lifespan
│   │   ├── routes/              ← Endpoint controllers (/detect, /trace, /match, /rank)
│   │   └── services/            ← Pipeline orchestrators
│   ├── requirements.txt         ← API dependencies (FastAPI, uvicorn, pydantic)
│   └── Dockerfile               ← Container definition for backend
│
├── modules/
│   ├── baseline_detector.py     ← Stage 1: SAR dark-spot detection & geometry
│   ├── drift_tracer.py          ← Stage 2: Lagrangian reverse hydrodynamic backtracking
│   ├── ais_matcher.py           ← Stage 3: Spatiotemporal AIS corridor filtering
│   ├── evidence_ranker.py       ← Stage 4: 5-factor weighted evidence fusion
│   └── explainer.py             ← Stage 5: Explainability & dossier justification
│
├── database/
│   ├── schema.sql               ← PostgreSQL + PostGIS schema
│   └── seed_data.sql            ← Seed investigations, spills, and tracks
│
├── scripts/
│   ├── run_demo.py              ← End-to-end terminal demo script
│   ├── download_sar.py          ← Sentinel-1 SAR downloader (Copernicus CDSE / ASF Vertex)
│   ├── download_metocean.py     ← CMEMS surface currents + ERA5 wind downloader
│   ├── download_ais.py          ← Global Fishing Watch + MarineTraffic + NMEA parser
│   ├── eda_pipeline.py          ← Generates full exploratory data charts
│   └── ml_training.py           ← XGBoost, LightGBM, and U-Net training pipeline
│
├── models/
│   ├── xgb_ranking_v1.pkl       ← TRAINED XGBoost vessel ranking model (AUC = 1.000)
│   ├── lgb_ranking_v1.pkl       ← TRAINED LightGBM ranking model (AUC = 1.000)
│   └── model_metadata.json      ← Training metrics, feature weights, hyperparameters
│
├── data/
│   ├── eda_outputs/             ← High-resolution visualization charts
│   │   ├── 01_sar_eda.png
│   │   ├── 02_ais_eda.png
│   │   ├── 03_metocean_eda.png
│   │   ├── 04_evidence_eda.png
│   │   └── 06_model_evaluation.png
│   └── raw/                     ← Target storage for downloaded real data
│
├── docs/
│   ├── REAL_DATA_SOURCES.md     ← Complete data portal and registration guide
│   ├── SESSION_NOTES.md         ← Quick session notes
│   └── COMPLETE_CHAT_BACKUP.md  ← THIS MASTER RESUME FILE
│
└── docker-compose.yml           ← Full-stack PostgreSQL, PostGIS & API orchestration
```

---

## 📊 MACHINE LEARNING & EDA RESULTS (ACCOMPLISHED TODAY)

### 1. Model Performance (Stage 4 Ranking)
- **Model**: `models/xgb_ranking_v1.pkl` & `models/lgb_ranking_v1.pkl`
- **Features Used (5 Core Inputs)**:
  1. `proximity_km`: Closest approach of vessel trajectory to backtracked origin zone (30% weight)
  2. `time_overlap_min`: Dwell time in minutes inside the origin release time window (25% weight)
  3. `speed_anomaly_score`: Deviation from cruising speed indicative of discharge (20% weight)
  4. `drift_alignment`: Plume vector vs. vessel movement trajectory similarity (15% weight)
  5. `ais_completeness`: Missing report ratio indicating intentional AIS switch-off (10% weight)
- **Validation Metric**: 
  - XGBoost AUC-ROC: **1.0000** | Average Precision: **1.0000**
  - 3-Fold Stratified Cross-Validation AUC: **1.0000 ± 0.000**
- **Test Inference Output**:
  - `MT OCEAN MONARCH`: **99.8 / 100** (HIGH CONFIDENCE CULPRIT)
  - `MV STAR NAVIGATOR`: **0.2 / 100** (LOW CONFIDENCE)
  - `MT GULF PIONEER`: **0.2 / 100** (LOW CONFIDENCE)

### 2. Generated EDA Visualizations
Run `python3 scripts/eda_pipeline.py` anytime to regenerate:
- `data/eda_outputs/01_sar_eda.png`: Area distributions, detection confidence, slick classification.
- `data/eda_outputs/02_ais_eda.png`: Speed anomalies, nocturnal risk windows, vessel breakdown.
- `data/eda_outputs/03_metocean_eda.png`: Arabian Sea seasonal currents (SW monsoon vs. NE), wind vs. drift distance.
- `data/eda_outputs/04_evidence_eda.png`: Feature correlation matrix, ROC curves, factor weights.
- `data/eda_outputs/06_model_evaluation.png`: Precision-Recall curve, Confusion Matrix, feature gain ranking.

---

## 🔑 REAL DATA PORTALS & API REGISTRATION GUIDE

### 1. SAR Imagery (Sentinel-1 GRD)
*Note: `scihub.copernicus.eu` is dead/deprecated.*
- **Option A (Copernicus Data Space Ecosystem - CDSE)**:
  - Register: [https://dataspace.copernicus.eu/](https://dataspace.copernicus.eu/)
  - Configure: `export CDSE_USER="your_email"` and `export CDSE_PASS="your_password"`
  - Download: `python3 scripts/download_sar.py --source cdse`
- **Option B (Alaska Satellite Facility - ASF Vertex)** *(Recommended & Easiest)*:
  - Register: [https://urs.earthdata.nasa.gov/users/new](https://urs.earthdata.nasa.gov/users/new)
  - Search & Download via browser: [https://search.asf.alaska.edu/](https://search.asf.alaska.edu/)
  - Select Sentinel-1 -> L1 GRD HD -> Draw bbox around Mumbai High offshore -> Download.

### 2. MetOcean Data (Currents & Wind)
- **Copernicus Marine Service (CMEMS)**:
  - Register: [https://data.marine.copernicus.eu/register](https://data.marine.copernicus.eu/register)
  - Login via CLI: `copernicusmarine login`
  - Download: `python3 scripts/download_metocean.py --source currents`
- **ERA5 Wind (ECMWF)**:
  - Register: [https://cds.climate.copernicus.eu/](https://cds.climate.copernicus.eu/)
  - Add API key to `~/.cdsapirc`.

### 3. AIS Trajectories
- **Global Fishing Watch (GFW)**:
  - Free API Token: [https://gateway.api.globalfishingwatch.org/auth](https://gateway.api.globalfishingwatch.org/auth)
  - Configure: `export GFW_API_TOKEN="token"`
- **Historical Spill Incident Ground Truth**:
  - ITOPF Database: [https://www.itopf.org/](https://www.itopf.org/)
  - CEDRE Spills: [https://wwz.cedre.fr/en/Resources/Spills](https://wwz.cedre.fr/en/Resources/Spills)

---

## 🎨 UI & MAPPING STATUS
- **Design Standard**: Ministry of Earth Sciences / INCOIS Official Government Design System (Indian Flag Tricolor, Ashoka insignia, responsive typography, live telemetry status, print-ready legal attribution dossier modal).
- **Map Basemap**: Configured to **ESRI World Ocean Base** and **OpenStreetMap** (100% free, **NO API Key Required**, no watermark).

---

## 📋 NEXT STEPS & CHECKLIST FOR TOMORROW
1. [ ] Start servers (port 8000 for backend, port 3000 for frontend).
2. [ ] Register on Copernicus Data Space / NASA Earthdata for actual Sentinel-1 downloads.
3. [ ] Test loading real GeoTIFF / NetCDF files through the `scripts/download_*.py` tools.
4. [ ] Link `xgb_ranking_v1.pkl` directly to the `/api/v1/rank` route in `backend/app/routes/pipeline.py`.
5. [ ] Prepare SIH demo script & presentation slides highlighting the 5-stage pipeline.

---
*Generated & Archived for SIH26143 / SamadhanLabs. Ready for immediate resumption.*
