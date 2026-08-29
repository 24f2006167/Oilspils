# ============================================================================
# OceanGuard AI — SESSION NOTES & COMPLETE PROGRESS LOG
# SIH26143 | SamadhanLabs | Last Updated: 28-Aug-2026, 21:35 IST
# Save this file. Read it first when you restart tomorrow.
# ============================================================================

## 👥 TEAM: SamadhanLabs
Himanshu • Shitanshu • Zayan • Ashutosh • Rounak • Shakthy

## 🎯 PROJECT
Name:      OceanGuard AI (MOSTA — Marine Oil Spill Tracing & Attribution System)
SIH ID:    SIH26143
Ministry:  Ministry of Earth Sciences | INCOIS
Problem:   AI-powered reverse-backtracking of marine oil spills to identify culprit vessel
Tech:      SAR satellite + Lagrangian drift physics + AIS vessel tracking + XGBoost ML

---

## 📂 PROJECT FOLDER
/Users/shitanshuchaurasiya/Downloads/untitled folder/

### File Structure (Everything Created)
```
untitled folder/
├── index.html              ← Main frontend (Government of India UI design)
├── style.css               ← Complete gov design system (INCOIS/MoES theme)
├── app.js                  ← Full frontend logic + Leaflet map + replay engine
├── cases-data.js           ← Investigation case data (3 demo cases)
│
├── backend/
│   ├── app/
│   │   ├── main.py         ← FastAPI application entry point
│   │   ├── routes/         ← API route handlers
│   │   └── services/       ← Business logic layer
│   ├── requirements.txt    ← Python dependencies
│   └── Dockerfile          ← Docker container config
│
├── modules/
│   ├── baseline_detector.py   ← Stage 1: SAR spill detection
│   ├── drift_tracer.py        ← Stage 2: Lagrangian backtracking
│   ├── ais_matcher.py         ← Stage 3: AIS vessel candidate filter
│   ├── evidence_ranker.py     ← Stage 4: XGBoost evidence scoring
│   └── explainer.py           ← Stage 5: SHAP explainability
│
├── database/
│   ├── schema.sql          ← PostgreSQL + PostGIS table schema
│   └── seed_data.sql       ← Demo vessel + investigation seed data
│
├── scripts/
│   ├── run_demo.py         ← Full pipeline CLI demo (works without backend)
│   ├── download_sar.py     ← Real SAR data downloader (Copernicus/ASF)
│   ├── download_metocean.py← Real ocean current + wind downloader (CMEMS/ERA5)
│   ├── download_ais.py     ← Real AIS data (GFW API + MarineTraffic + NMEA)
│   ├── eda_pipeline.py     ← Exploratory data analysis (4 plot files)
│   └── ml_training.py      ← XGBoost + LightGBM + U-Net training pipeline
│
├── models/
│   ├── xgb_ranking_v1.pkl  ← ✅ TRAINED XGBoost model (289 KB)
│   ├── lgb_ranking_v1.pkl  ← ✅ TRAINED LightGBM model (199 KB)
│   └── model_metadata.json ← AUC=1.000, features, timestamps
│
├── data/
│   ├── eda_outputs/
│   │   ├── 01_sar_eda.png       ← SAR detection analysis plots
│   │   ├── 02_ais_eda.png       ← AIS traffic analysis plots
│   │   ├── 03_metocean_eda.png  ← Ocean drift seasonal analysis
│   │   ├── 04_evidence_eda.png  ← Feature correlation + ROC curve
│   │   └── 06_model_evaluation.png ← Confusion matrix + PR curve
│   └── raw/                ← Put real downloaded data here
│
├── docs/
│   ├── REAL_DATA_SOURCES.md  ← All data APIs + registration links
│   └── SESSION_NOTES.md      ← THIS FILE
│
└── docker-compose.yml      ← Full stack Docker deployment
```

---

## 🚀 HOW TO RESTART SERVERS TOMORROW

### Step 1: Start FastAPI Backend (Terminal 1)
```bash
cd "/Users/shitanshuchaurasiya/Downloads/untitled folder"
python3 -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
```
Backend URL: http://localhost:8000
API Docs:    http://localhost:8000/docs

### Step 2: Start Frontend Server (Terminal 2)
```bash
cd "/Users/shitanshuchaurasiya/Downloads/untitled folder"
python3 -m http.server 3000
```
Frontend URL: http://localhost:3000

### Step 3: Open in Browser
http://localhost:3000

---

## ✅ WHAT IS FULLY WORKING RIGHT NOW

| Feature | Status |
|---------|--------|
| Government UI (INCOIS/MoES theme) | ✅ Done |
| India tricolor header + Ashoka emblem | ✅ Done |
| 5-stage pipeline nav (DETECT→EXPLAIN) | ✅ Done |
| Interactive Leaflet map (3 free basemaps) | ✅ Done — NO API KEY NEEDED |
| Map tile issue fixed (was showing "API KEY REQUIRED") | ✅ Fixed |
| 3 demo investigation cases | ✅ Done |
| AIS vessel tracks on map | ✅ Done |
| Lagrangian drift vector | ✅ Done |
| Origin zone polygon | ✅ Done |
| Investigation replay timeline | ✅ Done |
| Evidence score bars (5 factors) | ✅ Done |
| Official Dossier modal (print-ready) | ✅ Done |
| FastAPI backend (5 endpoints) | ✅ Done |
| XGBoost ranking model TRAINED | ✅ Done — AUC 1.000 |
| LightGBM ranking model TRAINED | ✅ Done — AUC 1.000 |
| EDA plots (4 analysis charts) | ✅ Done |
| Real data download scripts | ✅ Done |

---

## 🔑 API KEYS NEEDED (Get These Tomorrow)

### Priority 1 — SAR Satellite (scihub IS DEAD, use these instead)
- ✅ Copernicus Data Space (SciHub replacement):
    https://dataspace.copernicus.eu/
    → Set: CDSE_USER + CDSE_PASS

- ✅ Alaska Satellite Facility (Easiest, browser-based):
    https://search.asf.alaska.edu/
    → Register: https://urs.earthdata.nasa.gov/users/new
    → Set: ASF_USER + ASF_PASS

- ✅ ISRO Bhuvan (Indian SAR):
    https://bhuvan.nrsc.gov.in/

### Priority 2 — Ocean Currents + Wind (Both FREE)
- CMEMS (ocean currents):
    https://data.marine.copernicus.eu/register
    → After register: run `copernicusmarine login` in terminal

- ERA5 Wind (ECMWF):
    https://cds.climate.copernicus.eu/user/register
    → Create ~/.cdsapirc file with UID:KEY

### Priority 3 — AIS Vessel Tracking (FREE)
- Global Fishing Watch:
    https://gateway.api.globalfishingwatch.org/auth
    → Set: GFW_API_TOKEN

### Map Tiles — FIXED, NO KEY NEEDED
- Now using ESRI Ocean + OpenStreetMap (both free, no key)

---

## 🧠 ML PIPELINE STATUS

### Models Trained (Saved in /models/ folder)
```
XGBoost  (xgb_ranking_v1.pkl):  AUC-ROC = 1.000 | AP = 1.000
LightGBM (lgb_ranking_v1.pkl):  AUC-ROC = 1.000 | AP = 1.000
5-Fold CV AUC = 1.000 ± 0.000
```

### Evidence Features (5 inputs to ML model)
1. proximity_km          — closest approach to backtracked origin zone
2. time_overlap_min      — minutes the vessel was inside origin time window
3. speed_anomaly_score   — how abnormal the speed drop was (0.0 – 1.0)
4. drift_alignment       — cosine similarity of vessel course vs drift direction
5. ais_completeness      — fraction of expected AIS broadcasts that were received

### Evidence Weights (MOSTA Protocol)
| Factor | Weight | Rationale |
|--------|--------|-----------|
| Proximity to Origin | 30% | Strongest physical evidence |
| Time-Window Match | 25% | Must be in zone during discharge window |
| Trajectory Alignment | 20% | Course matches backtracked plume |
| Drift Consistency | 15% | Oceanographic model match |
| AIS Data Quality | 10% | AIS manipulation indicator |

### To Retrain Tomorrow
```bash
cd "/Users/shitanshuchaurasiya/Downloads/untitled folder"
python3 scripts/eda_pipeline.py      # generates EDA plots
python3 scripts/ml_training.py       # trains and saves models
```

---

## 🔬 5-STAGE PIPELINE EXPLAINED (For SIH Presentation)

### Stage 1 — DETECT
- Input:  Sentinel-1 SAR GRD scene (C-band, VV+VH, IW mode)
- Model:  U-Net CNN (segmentation) → binary oil/water mask
- Output: Spill polygon + centroid + area + confidence score
- File:   modules/baseline_detector.py

### Stage 2 — TRACE
- Input:  Spill centroid + CMEMS currents + ERA5 wind
- Model:  Lagrangian particle advection (physics-based, no ML)
  Equations: dx/dt = u_current + 0.032 * u_wind (windage factor)
- Output: Origin zone polygon (6-hour backtrack), uncertainty envelope
- File:   modules/drift_tracer.py

### Stage 3 — MATCH
- Input:  Origin zone polygon + time window + AIS vessel positions
- Method: Spatial-temporal join via PostGIS / Shapely
- Output: Candidate vessel shortlist (vessels that were in zone during window)
- File:   modules/ais_matcher.py

### Stage 4 — RANK
- Input:  5 evidence features per candidate vessel
- Model:  XGBoost classifier → culpability probability
- Output: Ranked list with scores (0-100)
- File:   modules/evidence_ranker.py

### Stage 5 — EXPLAIN
- Input:  Trained XGBoost model + candidate features
- Method: SHAP TreeExplainer → per-vessel feature contributions
- Output: Plain-English justification + visual evidence breakdown
- File:   modules/explainer.py

---

## 🌐 BACKEND API ENDPOINTS

Base URL: http://localhost:8000

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Backend health check |
| GET | /api/v1/investigations | List all investigations |
| GET | /api/v1/investigations/{id} | Get investigation details |
| POST | /api/v1/detect | Run SAR spill detection |
| POST | /api/v1/trace | Run Lagrangian backtracking |
| POST | /api/v1/match | Run AIS vessel matching |
| POST | /api/v1/rank | Run evidence ranking |
| GET | /docs | Swagger API documentation |

---

## 🗄️ DATABASE SCHEMA (PostgreSQL + PostGIS)

Tables:
- investigations  — case management (id, title, region, status)
- spills          — SAR-detected slicks (geometry, area, confidence)
- drift_results   — Lagrangian backtrack outputs (origin_polygon, window)
- vessel_tracks   — AIS trajectory points (mmsi, lat, lon, speed, time)
- evidence_scores — ML ranking results (vessel_id, score, feature breakdown)

To setup DB (requires Docker or local PostgreSQL + PostGIS):
```bash
docker-compose up -d db
psql -h localhost -U oceanguard -d oceanguard -f database/schema.sql
psql -h localhost -U oceanguard -d oceanguard -f database/seed_data.sql
```

---

## 📋 TOMORROW'S TODO LIST

### High Priority
- [ ] Register at dataspace.copernicus.eu + urs.earthdata.nasa.gov
- [ ] Download 2-3 real Sentinel-1 SAR scenes over Mumbai High offshore
- [ ] Register at data.marine.copernicus.eu → run `copernicusmarine login`
- [ ] Download real CMEMS current data for Arabian Sea
- [ ] Connect XGBoost model to FastAPI /api/v1/rank endpoint
- [ ] Replace synthetic case data in cases-data.js with real incident data

### Medium Priority
- [ ] Install PyTorch + segmentation-models-pytorch for U-Net SAR model
- [ ] Get CleanSeaNet dataset from EMSA (email csn@emsa.europa.eu)
- [ ] Add SHAP explainability charts to the frontend
- [ ] Set up PostgreSQL + PostGIS Docker container

### SIH Presentation Prep
- [ ] Record 3-minute demo video of full pipeline
- [ ] Prepare slide deck (problem → solution → pipeline → results)
- [ ] Document real-world accuracy metrics with ITOPF incident data

---

## ⚠️ KNOWN ISSUES & FIXES APPLIED

1. scihub.copernicus.eu → DEAD → Fixed: using dataspace.copernicus.eu + ASF
2. Map "API KEY REQUIRED" watermark → Fixed: switched to ESRI Ocean + OSM tiles
3. XGBoost needs libomp → Fixed: `brew install libomp` (already done)
4. CartoDB rate limiting → Fixed: removed CartoDB tiles completely

---

## 💡 KEY TECHNICAL DECISIONS

1. Windage Factor = 3.2% — Standard NOAA/ITOPF value for surface oil drift
2. Backtrack Window = 6 hours — Covers typical Sentinel-1 revisit cycle
3. Origin Buffer = 15 km — Standard uncertainty for mesoscale currents
4. Min AIS Confidence = 0.85 — Reject low-confidence SAR detections
5. Evidence Threshold = 70/100 — Mark as "High Confidence" attribution

---

## 🏗️ ARCHITECTURE DIAGRAM

```
[Sentinel-1 SAR] ──→ [U-Net CNN] ──→ Spill Polygon
                                           │
[CMEMS Currents]  ──→ [Lagrangian  ] ──→ Origin Zone ──→ [AIS Filter]
[ERA5 Wind]           [Drift Model ]                         │
                                                        Candidate List
                                                             │
                                                    [XGBoost Ranking]
                                                             │
                                               [SHAP Explainability] ──→ Dossier
```

---

*Generated: 28-Aug-2026 21:35 IST | OceanGuard AI | SIH26143 | SamadhanLabs*
