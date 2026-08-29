"""
OceanGuard AI — Real AIS Data Downloader & Parser
Sources:
  1. Global Fishing Watch (FREE, direct download)
  2. Marine Traffic API (paid for commercial, free tier available)
  3. Local NMEA file parser for raw AIS broadcast files

Requirements:
  pip install pyais requests pandas geopandas shapely
"""

import os
import sys
import json
import csv
import requests
import pandas as pd
import geopandas as gpd
from pathlib import Path
from datetime import datetime, timedelta
from shapely.geometry import Point, Polygon

OUTPUT_DIR = Path("data/raw/ais")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ─── CONFIG ───────────────────────────────────────────────────────────────────

GFW_API_TOKEN = os.getenv("GFW_API_TOKEN", "")  # Get free from https://globalfishingwatch.org/our-apis/

MT_API_KEY    = os.getenv("MT_API_KEY", "")      # MarineTraffic API key

# ─── SOURCE 1: GLOBAL FISHING WATCH (FREE) ───────────────────────────────────

def download_gfw_vessel_tracks(
    mmsi_list: list,
    start_date: str = None,
    end_date:   str = None
):
    """
    Downloads vessel tracks from Global Fishing Watch API (free tier).
    Register at: https://globalfishingwatch.org/our-apis/
    
    Args:
        mmsi_list: List of MMSI numbers to query
        start_date: "2024-01-01"
        end_date:   "2024-01-31"
    """
    if not GFW_API_TOKEN:
        print("[GFW] ⚠️  Set environment variable: GFW_API_TOKEN")
        print("       Register free at https://globalfishingwatch.org/our-apis/")
        return None

    if not start_date:
        end_dt   = datetime.utcnow()
        start_dt = end_dt - timedelta(days=30)
        start_date = start_dt.strftime("%Y-%m-%d")
        end_date   = end_dt.strftime("%Y-%m-%d")

    all_tracks = []
    base_url = "https://gateway.api.globalfishingwatch.org/v3/vessels"
    headers  = {"Authorization": f"Bearer {GFW_API_TOKEN}"}

    for mmsi in mmsi_list:
        print(f"\n[GFW] Fetching track for MMSI: {mmsi}")

        # Step 1: Find vessel ID
        search_url = f"{base_url}/search?query={mmsi}&datasets[0]=public-global-vessel-identity:latest"
        resp = requests.get(search_url, headers=headers, timeout=15)

        if resp.status_code != 200:
            print(f"  ❌ Search failed: {resp.status_code} — {resp.text[:200]}")
            continue

        vessels = resp.json().get("entries", [])
        if not vessels:
            print(f"  ⚠️ No vessel found for MMSI {mmsi}")
            continue

        vessel_id = vessels[0]["id"]
        vessel_name = vessels[0].get("shipname", "UNKNOWN")
        print(f"  Found: {vessel_name} (ID: {vessel_id})")

        # Step 2: Get track
        track_url = (
            f"{base_url}/{vessel_id}/tracks"
            f"?datasets[0]=public-global-fishing-tracks:latest"
            f"&startDate={start_date}&endDate={end_date}"
            f"&fields=lonlat,timestamp,speed,course"
        )
        track_resp = requests.get(track_url, headers=headers, timeout=30)

        if track_resp.status_code != 200:
            print(f"  ❌ Track fetch failed: {track_resp.status_code}")
            continue

        track_data = track_resp.json()
        track_points = []
        coords = track_data.get("data", {})
        lons   = coords.get("coordinates", [])
        times  = coords.get("timestamps", [])
        speeds = coords.get("speed", [])

        for i, (lon_lat, ts) in enumerate(zip(lons, times)):
            track_points.append({
                "mmsi":      mmsi,
                "vessel":    vessel_name,
                "timestamp": datetime.utcfromtimestamp(ts/1000).isoformat(),
                "latitude":  lon_lat[1],
                "longitude": lon_lat[0],
                "speed_kts": speeds[i] if i < len(speeds) else None
            })

        print(f"  → {len(track_points)} track points retrieved")
        all_tracks.extend(track_points)

    if all_tracks:
        df = pd.DataFrame(all_tracks)
        out_path = OUTPUT_DIR / f"gfw_tracks_{start_date}_{end_date}.csv"
        df.to_csv(out_path, index=False)
        print(f"\n✅ Saved {len(all_tracks)} track points → {out_path}")
        return df

    return None


# ─── SOURCE 2: MARINE TRAFFIC API ─────────────────────────────────────────────

def download_marinetraffic_expected_arrivals(
    port_target_id: int = 1,  # Port of Mumbai
    days_ahead: int = 5
):
    """
    Download expected vessel arrivals at Indian ports via MarineTraffic API.
    API Docs: https://www.marinetraffic.com/en/ais-api-services/api-endpoint/group/0
    
    Free tier: 100 API credits/month
    """
    if not MT_API_KEY:
        print("[MT API] ⚠️  Set MT_API_KEY env variable (MarineTraffic API key)")
        return None

    url = (
        f"https://services.marinetraffic.com/api/expectedarrivals/{MT_API_KEY}"
        f"?portid={port_target_id}&expectedarrival_from=0&expectedarrival_to={days_ahead*24}"
        f"&msgtype=extended"
    )

    resp = requests.get(url, timeout=30)
    if resp.status_code == 200:
        data = resp.json()
        out_path = OUTPUT_DIR / "expected_arrivals.json"
        with open(out_path, 'w') as f:
            json.dump(data, f, indent=2)
        print(f"✅ Expected arrivals saved → {out_path}")
        return data
    else:
        print(f"❌ MT API error: {resp.status_code}")
        return None


# ─── SOURCE 3: NMEA AIS RAW FILE PARSER ───────────────────────────────────────

def parse_nmea_ais_file(nmea_file_path: str, output_csv: str = None):
    """
    Parses a local NMEA raw AIS broadcast file (e.g., from Coast Guard / VTS receiver).
    NMEA files typically look like:
      !AIVDM,1,1,,A,15M67N0P01G?Uf6E`T1n4?vN0<0i,0*73
    
    Args:
        nmea_file_path: Path to .nmea or .txt file with raw AIS messages
        output_csv:     Where to save parsed records
    """
    try:
        from pyais import FileReaderStream
    except ImportError:
        print("Install: pip install pyais")
        return None

    records = []
    print(f"\n[NMEA] Parsing AIS file: {nmea_file_path}")

    try:
        with FileReaderStream(nmea_file_path) as stream:
            for msg in stream:
                try:
                    decoded = msg.decode()
                    d = decoded.asdict()
                    if d.get("lat") and d.get("lon") and d.get("mmsi"):
                        records.append({
                            "mmsi":       d.get("mmsi"),
                            "name":       d.get("shipname", ""),
                            "vessel_type": d.get("ship_type", ""),
                            "latitude":   d.get("lat"),
                            "longitude":  d.get("lon"),
                            "speed_kts":  d.get("speed", 0),
                            "course_deg": d.get("course", 0),
                            "heading_deg":d.get("heading", 0),
                            "status":     d.get("status", ""),
                            "msg_type":   d.get("msg_type", "")
                        })
                except Exception:
                    continue  # Skip malformed messages
    except FileNotFoundError:
        print(f"  ❌ File not found: {nmea_file_path}")
        return None

    df = pd.DataFrame(records)
    print(f"  → Parsed {len(df)} valid AIS position reports from {df['mmsi'].nunique()} unique vessels")

    if output_csv:
        df.to_csv(output_csv, index=False)
        print(f"  ✅ Saved → {output_csv}")

    return df


# ─── SPATIAL FILTER: Vessels inside origin polygon ────────────────────────────

def filter_vessels_in_polygon(
    ais_df: pd.DataFrame,
    origin_polygon_coords: list,
    start_time: str,
    end_time:   str
) -> pd.DataFrame:
    """
    Filters AIS DataFrame to only vessels that entered the origin polygon
    during the backtracked time window.
    
    Args:
        ais_df:                  DataFrame with lat/lon/timestamp columns
        origin_polygon_coords:   [[lat,lon], ...] polygon
        start_time:              "2024-08-27T04:00:00"
        end_time:                "2024-08-27T06:00:00"
    
    Returns:
        Filtered DataFrame of candidate vessels
    """
    # Build Shapely polygon (note: Shapely uses lon, lat order)
    poly = Polygon([(c[1], c[0]) for c in origin_polygon_coords])

    # Parse timestamps
    ais_df['timestamp'] = pd.to_datetime(ais_df['timestamp'])
    t_start = pd.to_datetime(start_time)
    t_end   = pd.to_datetime(end_time)

    # Time filter
    time_filtered = ais_df[
        (ais_df['timestamp'] >= t_start) &
        (ais_df['timestamp'] <= t_end)
    ].copy()

    if time_filtered.empty:
        print("  ⚠️ No AIS records found in time window.")
        return pd.DataFrame()

    # Spatial filter
    time_filtered['in_zone'] = time_filtered.apply(
        lambda row: poly.contains(Point(row['longitude'], row['latitude'])),
        axis=1
    )
    candidates = time_filtered[time_filtered['in_zone']].copy()

    # Group by vessel
    candidate_vessels = candidates.groupby('mmsi').agg(
        entry_time=('timestamp', 'min'),
        exit_time =('timestamp', 'max'),
        min_lat   =('latitude',  'min'),
        max_lat   =('latitude',  'max'),
        mean_speed=('speed_kts', 'mean'),
        points    =('mmsi',      'count')
    ).reset_index()

    print(f"\n[SPATIAL FILTER] {len(candidate_vessels)} vessels entered origin zone during window:")
    for _, row in candidate_vessels.iterrows():
        print(f"  MMSI {row['mmsi']}: {row['entry_time']} → {row['exit_time']} | avg {row['mean_speed']:.1f} kts | {row['points']} points")

    out_path = OUTPUT_DIR / "candidate_vessels.csv"
    candidate_vessels.to_csv(out_path, index=False)
    print(f"\n✅ Candidates saved → {out_path}")
    return candidate_vessels


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="OceanGuard AI — AIS Data Downloader")
    parser.add_argument("--source", choices=["gfw", "mt", "nmea", "filter"], default="gfw")
    parser.add_argument("--mmsi",   nargs="+", default=["419001234", "419005678"])
    parser.add_argument("--file",   help="Path to NMEA file for parsing")
    parser.add_argument("--days",   type=int, default=30)
    args = parser.parse_args()

    if args.source == "gfw":
        download_gfw_vessel_tracks(args.mmsi, days_back=args.days)
    elif args.source == "mt":
        download_marinetraffic_expected_arrivals()
    elif args.source == "nmea":
        if not args.file:
            print("Provide --file path to NMEA file")
        else:
            parse_nmea_ais_file(args.file, str(OUTPUT_DIR / "parsed_ais.csv"))
