"""
OceanGuard AI — Real SAR Data Downloader (UPDATED 2024)
⚠️  scihub.copernicus.eu is PERMANENTLY SHUT DOWN.
    Now using the new Copernicus Data Space Ecosystem + ASF as backup.

Sources (in priority order):
  1. Copernicus Data Space (dataspace.copernicus.eu) — NEW official portal
  2. Alaska Satellite Facility (ASF)                 — Works great from India
  3. ISRO Bhuvan                                     — Best for Indian coastal waters

Requirements:
  pip install cdsetool requests

Setup:
  Register FREE at: https://dataspace.copernicus.eu/
  Register FREE at: https://urs.earthdata.nasa.gov/   (for ASF)
"""

import os
import sys
import json
import requests
from pathlib import Path
from datetime import datetime, timedelta, date

OUTPUT_DIR = Path("data/raw/sar")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ─── CREDENTIALS ──────────────────────────────────────────────────────────────
# Register at: https://dataspace.copernicus.eu/
CDSE_USER = os.getenv("CDSE_USER", "")   # Your email
CDSE_PASS = os.getenv("CDSE_PASS", "")   # Your password

# Register at: https://urs.earthdata.nasa.gov/
ASF_USER  = os.getenv("ASF_USER", "")
ASF_PASS  = os.getenv("ASF_PASS", "")

# ─── REGIONS OF INTEREST ──────────────────────────────────────────────────────
REGIONS = {
    "mumbai_high": {
        "name": "Mumbai High Offshore Basin (Arabian Sea)",
        "bbox": [71.5, 18.2, 74.0, 20.5],        # [lon_min, lat_min, lon_max, lat_max]
        "wkt": "POLYGON((71.5 18.2,74.0 18.2,74.0 20.5,71.5 20.5,71.5 18.2))"
    },
    "gulf_of_mannar": {
        "name": "Gulf of Mannar Marine Biosphere",
        "bbox": [78.5, 8.0, 80.5, 10.5],
        "wkt": "POLYGON((78.5 8.0,80.5 8.0,80.5 10.5,78.5 10.5,78.5 8.0))"
    },
    "bay_of_bengal": {
        "name": "North Bay of Bengal",
        "bbox": [87.0, 19.0, 91.0, 23.0],
        "wkt": "POLYGON((87.0 19.0,91.0 19.0,91.0 23.0,87.0 23.0,87.0 19.0))"
    },
    "lakshadweep": {
        "name": "Lakshadweep Sea",
        "bbox": [72.0, 8.0, 76.0, 12.0],
        "wkt": "POLYGON((72.0 8.0,76.0 8.0,76.0 12.0,72.0 12.0,72.0 8.0))"
    }
}

# ─── SOURCE 1: COPERNICUS DATA SPACE (New Official Portal) ────────────────────

def get_cdse_token():
    """Get OAuth2 access token from Copernicus Data Space."""
    if not CDSE_USER or not CDSE_PASS:
        print("  ⚠️  Set CDSE_USER and CDSE_PASS environment variables")
        print("       Register FREE: https://dataspace.copernicus.eu/")
        return None

    resp = requests.post(
        "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token",
        data={
            "client_id":  "cdse-public",
            "grant_type": "password",
            "username":   CDSE_USER,
            "password":   CDSE_PASS
        },
        timeout=30
    )
    if resp.status_code == 200:
        token = resp.json()["access_token"]
        print("  ✅ Copernicus Data Space authenticated.")
        return token
    else:
        print(f"  ❌ Auth failed: {resp.status_code} — {resp.text[:200]}")
        return None


def search_cdse(region_key: str, days_back: int = 30, max_results: int = 5):
    """
    Search for Sentinel-1 GRD products over a region using the new CDSE OData API.
    """
    region = REGIONS.get(region_key)
    if not region:
        print(f"Unknown region: {region_key}")
        return []

    end_date   = datetime.utcnow()
    start_date = end_date - timedelta(days=days_back)

    # CDSE OData search URL
    filter_str = (
        f"Collection/Name eq 'SENTINEL-1' "
        f"and Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'productType' and att/OData.CSC.StringAttribute/Value eq 'GRD') "
        f"and Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'operationalMode' and att/OData.CSC.StringAttribute/Value eq 'IW') "
        f"and ContentDate/Start gt {start_date.strftime('%Y-%m-%dT%H:%M:%S.000Z')} "
        f"and ContentDate/Start lt {end_date.strftime('%Y-%m-%dT%H:%M:%S.000Z')} "
        f"and OData.CSC.Intersects(area=geography'SRID=4326;{region['wkt']}')"
    )

    url = f"https://catalogue.dataspace.copernicus.eu/odata/v1/Products?$filter={filter_str}&$top={max_results}&$orderby=ContentDate/Start desc"

    print(f"\n[CDSE] Searching Sentinel-1 GRD for: {region['name']}")
    print(f"       Period: {start_date.date()} → {end_date.date()}")

    resp = requests.get(url, timeout=30)
    if resp.status_code != 200:
        print(f"  ❌ Search error: {resp.status_code}")
        return []

    products = resp.json().get("value", [])
    print(f"  Found {len(products)} products.")

    for p in products:
        size_mb = p.get('ContentLength', 0) / (1024*1024)
        print(f"  • {p['Name']} | {p['ContentDate']['Start'][:10]} | {size_mb:.0f} MB")

    return products


def download_cdse(product: dict, token: str):
    """Download a single product from Copernicus Data Space."""
    prod_id  = product["Id"]
    prod_name = product["Name"]
    out_path  = OUTPUT_DIR / f"{prod_name}.zip"

    if out_path.exists():
        print(f"  ⏭  Already exists: {prod_name}")
        return str(out_path)

    url = f"https://download.dataspace.copernicus.eu/odata/v1/Products({prod_id})/$value"
    headers = {"Authorization": f"Bearer {token}"}

    print(f"  ⬇️  Downloading: {prod_name} ...")
    with requests.get(url, headers=headers, stream=True, timeout=120) as r:
        r.raise_for_status()
        total = int(r.headers.get('content-length', 0))
        downloaded = 0
        with open(out_path, 'wb') as f:
            for chunk in r.iter_content(chunk_size=8192):
                f.write(chunk)
                downloaded += len(chunk)
                if total:
                    pct = downloaded / total * 100
                    print(f"\r     {pct:.1f}% ({downloaded/1e6:.0f}/{total/1e6:.0f} MB)", end='')
        print()

    print(f"  ✅ Saved: {out_path}")
    return str(out_path)


def download_from_cdse(region_key: str = "mumbai_high", days_back: int = 30, max_scenes: int = 2):
    """Full pipeline: search + download from Copernicus Data Space."""
    print(f"\n{'='*60}")
    print(f"  Copernicus Data Space — Sentinel-1 SAR Downloader")
    print(f"  Region: {REGIONS[region_key]['name']}")
    print(f"{'='*60}")

    token    = get_cdse_token()
    products = search_cdse(region_key, days_back, max_scenes)

    if not products or not token:
        print("\n  💡 TIP: To use this, set env vars:")
        print("     export CDSE_USER='your@email.com'")
        print("     export CDSE_PASS='yourpassword'")
        print("     Register: https://dataspace.copernicus.eu/")
        return

    for product in products[:max_scenes]:
        download_cdse(product, token)


# ─── SOURCE 2: ALASKA SATELLITE FACILITY (Works Great from India) ─────────────

def search_and_download_asf(region_key: str = "mumbai_high", days_back: int = 30, max_results: int = 3):
    """
    Search & download Sentinel-1 GRD from Alaska Satellite Facility (ASF).
    Works perfectly from India — NASA Earthdata account is FREE.
    
    Register: https://urs.earthdata.nasa.gov/users/new
    """
    if not ASF_USER or not ASF_PASS:
        print("\n[ASF] ⚠️  Set ASF_USER and ASF_PASS environment variables")
        print("           Register FREE: https://urs.earthdata.nasa.gov/users/new")
        print_asf_browser_instructions(region_key)
        return

    region   = REGIONS[region_key]
    end_date = datetime.utcnow()
    start_dt = end_date - timedelta(days=days_back)

    bbox_str = ",".join(map(str, region['bbox']))
    search_url = (
        f"https://api.daac.asf.alaska.edu/services/search/param"
        f"?platform=Sentinel-1"
        f"&processingLevel=GRD_HD"
        f"&beamMode=IW"
        f"&bbox={bbox_str}"
        f"&start={start_dt.strftime('%Y-%m-%dT00:00:00UTC')}"
        f"&end={end_date.strftime('%Y-%m-%dT23:59:59UTC')}"
        f"&maxResults={max_results}"
        f"&output=json"
    )

    print(f"\n[ASF] Searching Sentinel-1 GRD for: {region['name']}")
    resp = requests.get(search_url, timeout=30)
    if resp.status_code != 200:
        print(f"  ❌ Search failed: {resp.status_code}")
        return

    results = resp.json()
    if not results or not results[0]:
        print("  ⚠️  No results found.")
        return

    print(f"  Found {len(results[0])} products:")
    for item in results[0]:
        print(f"  • {item.get('fileName','?')} | {item.get('startTime','?')[:10]} | {item.get('sizeMB','?')} MB")

    # Download using NASA Earthdata auth
    session = requests.Session()
    session.auth = (ASF_USER, ASF_PASS)

    out_dir = OUTPUT_DIR / region_key
    out_dir.mkdir(exist_ok=True)

    for item in results[0][:max_results]:
        dl_url   = item.get("url") or item.get("downloadUrl")
        filename = item.get("fileName", "sentinel1_scene.zip")
        out_path = out_dir / filename

        if out_path.exists():
            print(f"  ⏭  Already exists: {filename}")
            continue

        print(f"  ⬇️  Downloading: {filename} ...")
        r = session.get(dl_url, stream=True, timeout=300, allow_redirects=True)
        with open(out_path, 'wb') as f:
            for chunk in r.iter_content(chunk_size=8192):
                f.write(chunk)

        print(f"  ✅ Saved: {out_path}")


def print_asf_browser_instructions(region_key: str):
    """Print manual download instructions for ASF Vertex browser."""
    region = REGIONS[region_key]
    bbox   = region['bbox']
    print(f"""
  ┌─────────────────────────────────────────────────────┐
  │  MANUAL DOWNLOAD via ASF Vertex Browser (Easiest)   │
  └─────────────────────────────────────────────────────┘
  
  1. Open: https://search.asf.alaska.edu/
  2. Sign in with your NASA Earthdata account
     (Register free at: https://urs.earthdata.nasa.gov)
  3. In the search box, enter this bounding box:
     Lon: {bbox[0]}°E to {bbox[2]}°E
     Lat: {bbox[1]}°N to {bbox[3]}°N
  4. Filters:
     Dataset     = Sentinel-1
     File Type   = L1 GRD HD
     Beam Mode   = IW
  5. Click SEARCH → Select results → ADD TO QUEUE → DOWNLOAD
  
  Region: {region['name']}
""")


# ─── MAIN ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="OceanGuard AI — SAR Data Downloader (Updated)")
    parser.add_argument("--source",  choices=["cdse","asf","info"], default="info")
    parser.add_argument("--region",  default="mumbai_high", choices=list(REGIONS.keys()))
    parser.add_argument("--days",    type=int, default=30)
    parser.add_argument("--max",     type=int, default=2)
    args = parser.parse_args()

    if args.source == "cdse":
        download_from_cdse(args.region, args.days, args.max)
    elif args.source == "asf":
        search_and_download_asf(args.region, args.days, args.max)
    else:
        print("""
╔══════════════════════════════════════════════════════════════╗
║        OceanGuard AI — SAR Data Access Guide                 ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  ⚠️  scihub.copernicus.eu is PERMANENTLY SHUT DOWN          ║
║                                                              ║
║  Use these alternatives instead:                             ║
║                                                              ║
║  1. Copernicus Data Space (Official replacement)             ║
║     → https://dataspace.copernicus.eu/                      ║
║     → export CDSE_USER='email' CDSE_PASS='pass'             ║
║     → python3 download_sar.py --source cdse                 ║
║                                                              ║
║  2. Alaska Satellite Facility (Easiest, works from India)    ║
║     → https://search.asf.alaska.edu/                        ║
║     → https://urs.earthdata.nasa.gov/ (free NASA account)   ║
║     → export ASF_USER='user' ASF_PASS='pass'                ║
║     → python3 download_sar.py --source asf                  ║
║                                                              ║
║  3. ISRO Bhuvan (Indian SAR - RISAT constellation)          ║
║     → https://bhuvan.nrsc.gov.in/                           ║
║     → Best for Indian coastal waters                        ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
""")
        print_asf_browser_instructions("mumbai_high")
