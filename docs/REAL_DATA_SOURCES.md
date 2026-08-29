# OceanGuard AI — UPDATED Real Data Sources (Working Links)
# SIH26143 | SamadhanLabs | Updated: August 2026
# NOTE: scihub.copernicus.eu is DEAD. Use the new Copernicus Data Space.

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 1. SAR SATELLITE DATA — Sentinel-1 (FREE)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### ✅ NEW: Copernicus Data Space Ecosystem (SciHub REPLACEMENT)
- URL:       https://dataspace.copernicus.eu/
- Register:  https://identity.dataspace.copernicus.eu/auth/realms/CDSE/login-actions/registration
- Portal:    https://browser.dataspace.copernicus.eu/
- Python API: pip install cdsetool

### ✅ Alternative: Alaska Satellite Facility (ASF) — Works perfectly from India
- URL:      https://search.asf.alaska.edu/
- Register: https://urs.earthdata.nasa.gov/users/new  (NASA Earthdata account)
- Free, no restrictions, fastest for India users
- Download Sentinel-1 GRD directly with wget after auth

### ✅ Alternative: ISRO Bhuvan — Indian SAR Data (Best for Indian waters)
- URL:      https://bhuvan.nrsc.gov.in/
- Data:     RISAT-1, RISAT-2 (Indian SAR constellation)
- Register: https://bhuvan-app1.nrsc.gov.in/bhuvan2d/bhuvan/bhuvan2d.php
- Free for Indian researchers/students

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 2. OCEAN CURRENTS + WAVES — MetOcean (FREE)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### ✅ Copernicus Marine Service (CMEMS) — WORKING
- URL:      https://marine.copernicus.eu/
- Register: https://data.marine.copernicus.eu/register
- Python:   pip install copernicusmarine
- Login:    copernicusmarine login   (then use in script)
- Dataset:  cmems_mod_glo_phy-cur_anfc_0.083deg_P1D-m  (currents)

### ✅ INCOIS ODAS — Indian Ocean Data (Perfect for SIH)
- URL:      https://odas.incois.gov.in/
- Contact:  odas@incois.gov.in for research data access
- Has:      Indian Ocean currents, SST, wave height
- Free for academic/research

### ✅ NOAA HYCOM — Global Ocean Model (No registration needed)
- URL:      https://www.hycom.org/dataserver/gofs-3pt1/analysis
- Direct:   https://tds.hycom.org/thredds/catalog.html
- Free FTP, no API key needed at all
- pip install xarray    then open directly with NetCDF4

### ✅ ERA5 Wind — ECMWF Reanalysis (FREE)
- URL:      https://cds.climate.copernicus.eu/
- Register: https://cds.climate.copernicus.eu/user/register
- Config:   Create ~/.cdsapirc with UID + key from your profile page
- pip install cdsapi

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 3. AIS VESSEL TRACKING (FREE OPTIONS)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### ✅ Global Fishing Watch (FREE for research)
- URL:      https://globalfishingwatch.org/our-apis/
- Register: https://gateway.api.globalfishingwatch.org/auth
- Get token: Dashboard → Token → Copy Bearer token
- Free academic tier, approved instantly for SIH teams

### ✅ AISHub (FREE — share & receive AIS)
- URL:      https://www.aishub.net/join-us
- Share your AIS data or get access to live feeds
- Free account gives access to historical data

### ✅ OpenSeaMap / OpenAIS (FREE)
- URL:      https://www.openseamap.org/
- Raw NMEA: Some ports publish free NMEA feeds

### ✅ VesselFinder (Limited free)
- URL:      https://www.vesselfinder.com/
- Historical positions: limited on free tier

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 4. MAP TILES (FREE, No API Key — Already Fixed)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### ✅ ESRI Ocean Basemap (now default in app)
- URL:      server.arcgisonline.com/ArcGIS/rest/services/Ocean/...
- No key needed, unlimited

### ✅ OpenStreetMap
- URL:      tile.openstreetmap.org
- No key needed, unlimited

### ✅ Stamen Terrain (via Stadia Maps)
- URL:      https://stadia.maps.com/
- Free tier: 200,000 tile requests/month
- Register for key if needed

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 5. OIL SPILL LABELED INCIDENT DATABASE
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### ✅ ITOPF — Historical Tanker Spill Statistics
- URL:      https://www.itopf.org/knowledge-resources/data-statistics/statistics/
- Free download: Excel file with 1970-present spill records
- No registration needed for summary stats

### ✅ CEDRE — French Spill Incident Database
- URL:      https://wwz.cedre.fr/en/Resources/Spills
- Free browse, contact for raw data

### ✅ IMO GISIS — Official Incident Reports
- URL:      https://gisis.imo.org/Public/MCI/Default.aspx
- No registration for public incident browsing

### ✅ CleanSeaNet (EMSA) — Labeled SAR Spill Masks
- URL:      https://www.emsa.europa.eu/csn-menu.html
- Email:    csn@emsa.europa.eu for academic research access
- This is the GOLD STANDARD training dataset for U-Net SAR model

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## PRIORITY ORDER FOR SIH (Do These First)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 1 → Register at https://dataspace.copernicus.eu/     (SAR images, 10 min)
Step 2 → Register at https://urs.earthdata.nasa.gov/      (ASF backup, 5 min)
Step 3 → Register at https://data.marine.copernicus.eu/   (ocean currents, 10 min)
Step 4 → Register at https://cds.climate.copernicus.eu/   (wind data, 5 min)
Step 5 → Register at https://gateway.api.globalfishingwatch.org/auth  (AIS, 5 min)
Step 6 → Contact INCOIS: odas@incois.gov.in               (Indian ocean data)
Step 7 → Email EMSA: csn@emsa.europa.eu                   (CleanSeaNet labeled masks)

Total time to get all free API access: ~1 hour
