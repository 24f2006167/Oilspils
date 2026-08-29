# 🌊 OceanGuard AI (SIH26143 • SamadhanLabs)

**Marine Oil Spill Detection, MetOcean Backtracking & AIS Vessel Attribution System**

---

## 🎯 System Architecture & 5-Stage Core Pipeline

```
 🛰️ DETECT         🌊 TRACE             🚢 MATCH            🏆 RANK             🧠 EXPLAIN
SAR Satellite   MetOcean Reverse    Historical AIS      Multi-Factor        Attribution &
AI/CV Detector    Lagrangian Drift      Trajectory Match   Evidence Fusion     Legal Dossier
```

1. **DETECT**: Sentinel-1 C-Band SAR amplitude processing, adaptive thresholding, speckle noise reduction, and polygon geometry extraction.
2. **TRACE**: Lagrangian reverse hydrodynamic particle drift integrating windage (3.2%) and surface current vectors to estimate probable origin region and release time window.
3. **MATCH**: Spatial-temporal filtering of Class-A historical AIS vessel trajectories across origin envelope.
4. **RANK**: Transparent 5-factor weighted evidence fusion (0–100 score):
   - Proximity to Origin (30%)
   - Time-Window Match (25%)
   - Trajectory Alignment & Behavioral Anomalies (20%)
   - Drift Consistency (15%)
   - AIS Data Quality & Completeness (10%)
5. **EXPLAIN**: Human-readable legal dossier justification and timeline reconstruction.

---

## 🚀 Fast Loading & Quick Start

### 1. Interactive Prototype (Instant Web UI)
Open `index.html` directly in any modern browser. It loads instantaneously with zero build steps and full interactive simulation of all 3 case studies!

### 2. Run the End-to-End Pipeline in Python
```bash
python3 scripts/run_demo.py
```

### 3. Run FastAPI Backend Server
```bash
uvicorn backend.app.main:app --reload --port 8000
```
API Documentation will be accessible at: `http://localhost:8000/docs`

---

## 📁 Repository Structure

```
├── index.html                   # High-performance interactive UI
├── style.css                    # Dark tactical command center styling
├── app.js                       # Frontend controller & Leaflet simulation
├── cases-data.js                # Calibrated historical datasets (3 scenarios)
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application server
│   │   ├── core/                # Config & constants
│   │   ├── schemas/             # Pydantic data contracts
│   │   ├── services/            # Pipeline orchestration services
│   │   └── api/routes/          # REST endpoints (/detect, /trace, /match, /rank)
│   ├── requirements.txt         # Python dependencies
│   └── Dockerfile               # Container build configuration
├── modules/
│   ├── detection/               # SAR AI detection engine
│   ├── tracing/                 # Lagrangian reverse drift model
│   ├── ais/                     # AIS filtering & spatial-temporal matching
│   └── ranking/                 # 5-Factor evidence fusion scoring
├── database/
│   ├── schema.sql               # PostgreSQL + PostGIS schema
│   └── seed_data.sql            # Seed dataset for demo cases
├── scripts/
│   └── run_demo.py              # CLI automated end-to-end demo execution
└── docker-compose.yml           # Multi-container orchestration
```
