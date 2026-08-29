"""
OceanGuard AI — Real MetOcean Data Downloader
Downloads actual ocean current + wind data from:
  - Copernicus Marine Service (CMEMS) → Surface Currents
  - ECMWF CDS API (ERA5)             → 10m Wind Fields

Requirements:
  pip install copernicusmarine cdsapi xarray netCDF4

Setup CMEMS:
  1. Register free at https://marine.copernicus.eu/
  2. Run: copernicusmarine login

Setup ERA5:
  1. Register at https://cds.climate.copernicus.eu/
  2. Create ~/.cdsapirc with your UID and API key
"""

import os
import sys
from pathlib import Path
from datetime import datetime, timedelta
import json

OUTPUT_DIR = Path("data/raw/metocean")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ─── CMEMS OCEAN CURRENTS ─────────────────────────────────────────────────────

def download_ocean_currents(
    lon_min: float = 71.0, lon_max: float = 74.5,
    lat_min: float = 18.0, lat_max: float = 20.5,
    start_datetime: str = None,
    end_datetime:   str = None,
    output_file:    str = "ocean_currents.nc"
):
    """
    Downloads real surface current U/V components from CMEMS Global Analysis.
    Dataset: cmems_mod_glo_phy-cur_anfc_0.083deg_P1D-m
    Variables: uo (eastward current), vo (northward current)
    """
    try:
        import copernicusmarine as cm
    except ImportError:
        print("Install: pip install copernicusmarine")
        sys.exit(1)

    if not start_datetime:
        end_dt   = datetime.utcnow()
        start_dt = end_dt - timedelta(days=7)
        start_datetime = start_dt.strftime("%Y-%m-%dT00:00:00")
        end_datetime   = end_dt.strftime("%Y-%m-%dT23:59:59")

    out_path = OUTPUT_DIR / output_file
    print(f"\n[CMEMS] Downloading ocean surface currents...")
    print(f"  Region: ({lat_min}N–{lat_max}N, {lon_min}E–{lon_max}E)")
    print(f"  Period: {start_datetime} → {end_datetime}")

    cm.subset(
        dataset_id    = "cmems_mod_glo_phy-cur_anfc_0.083deg_P1D-m",
        variables     = ["uo", "vo"],
        minimum_longitude = lon_min,
        maximum_longitude = lon_max,
        minimum_latitude  = lat_min,
        maximum_latitude  = lat_max,
        start_datetime    = start_datetime,
        end_datetime      = end_datetime,
        minimum_depth     = 0.0,
        maximum_depth     = 1.0,    # Surface layer only
        output_filename   = str(out_path),
        force_download    = True
    )

    print(f"  ✅ Saved: {out_path}")
    return str(out_path)


def download_wave_data(
    lon_min: float = 71.0, lon_max: float = 74.5,
    lat_min: float = 18.0, lat_max: float = 20.5,
    start_datetime: str = None,
    end_datetime:   str = None
):
    """
    Downloads real significant wave height from CMEMS.
    Dataset: cmems_mod_glo_wav_anfc_0.083deg_PT3H-i
    """
    try:
        import copernicusmarine as cm
    except ImportError:
        print("Install: pip install copernicusmarine")
        sys.exit(1)

    if not start_datetime:
        end_dt   = datetime.utcnow()
        start_dt = end_dt - timedelta(days=7)
        start_datetime = start_dt.strftime("%Y-%m-%dT00:00:00")
        end_datetime   = end_dt.strftime("%Y-%m-%dT23:59:59")

    out_path = OUTPUT_DIR / "wave_height.nc"
    print(f"\n[CMEMS] Downloading wave height data...")

    cm.subset(
        dataset_id    = "cmems_mod_glo_wav_anfc_0.083deg_PT3H-i",
        variables     = ["VHM0"],    # Significant wave height
        minimum_longitude = lon_min,
        maximum_longitude = lon_max,
        minimum_latitude  = lat_min,
        maximum_latitude  = lat_max,
        start_datetime    = start_datetime,
        end_datetime      = end_datetime,
        output_filename   = str(out_path),
        force_download    = True
    )

    print(f"  ✅ Saved: {out_path}")
    return str(out_path)


# ─── ERA5 WIND DATA ───────────────────────────────────────────────────────────

def download_era5_wind(
    lon_min: float = 71.0, lon_max: float = 74.5,
    lat_min: float = 18.0, lat_max: float = 20.5,
    year: str = None, month: str = None, day: str = None
):
    """
    Downloads ERA5 10-metre wind U/V components from ECMWF CDS.
    Requires: ~/.cdsapirc with API key from https://cds.climate.copernicus.eu/
    """
    try:
        import cdsapi
    except ImportError:
        print("Install: pip install cdsapi")
        sys.exit(1)

    if not year:
        dt    = datetime.utcnow() - timedelta(days=7)
        year  = str(dt.year)
        month = str(dt.month).zfill(2)
        day   = str(dt.day).zfill(2)

    out_path = OUTPUT_DIR / f"era5_wind_{year}{month}{day}.nc"
    print(f"\n[ERA5] Downloading 10m wind for {year}-{month}-{day}...")

    c = cdsapi.Client()
    c.retrieve(
        "reanalysis-era5-single-levels",
        {
            "product_type": "reanalysis",
            "variable": [
                "10m_u_component_of_wind",
                "10m_v_component_of_wind"
            ],
            "year":  year,
            "month": month,
            "day":   day,
            "time":  [f"{h:02d}:00" for h in range(0, 24, 3)],
            "area":  [lat_max, lon_min, lat_min, lon_max],   # N, W, S, E
            "format": "netcdf"
        },
        str(out_path)
    )

    print(f"  ✅ Saved: {out_path}")
    return str(out_path)


# ─── PROCESS: EXTRACT DRIFT VECTORS AT SPILL LOCATION ────────────────────────

def extract_drift_conditions(current_nc: str, lat: float, lon: float, timestamp: str):
    """
    Extracts actual u/v current components at the spill observation point and time.
    Returns drift speed and direction for Lagrangian backtracking.
    """
    try:
        import xarray as xr
        import numpy as np
    except ImportError:
        print("Install: pip install xarray netCDF4 numpy")
        return None

    print(f"\n[PROCESS] Extracting drift conditions at ({lat}°N, {lon}°E) at {timestamp}...")
    ds = xr.open_dataset(current_nc)

    # Select nearest point in space and time
    obs_time = np.datetime64(timestamp)
    uo = float(ds['uo'].sel(latitude=lat, longitude=lon, time=obs_time, method='nearest').values)
    vo = float(ds['vo'].sel(latitude=lat, longitude=lon, time=obs_time, method='nearest').values)

    # Calculate speed and direction
    speed_ms   = float(np.sqrt(uo**2 + vo**2))
    direction  = float(np.degrees(np.arctan2(uo, vo)) % 360)

    result = {
        "latitude":          lat,
        "longitude":         lon,
        "timestamp":         timestamp,
        "u_ms":              round(uo, 4),
        "v_ms":              round(vo, 4),
        "speed_ms":          round(speed_ms, 4),
        "direction_deg":     round(direction, 1),
        "source":            "CMEMS Global Analysis Forecast"
    }

    print(f"  Surface Current: {speed_ms:.3f} m/s @ {direction:.1f}°")
    out_json = OUTPUT_DIR / "drift_conditions.json"
    with open(out_json, 'w') as f:
        json.dump(result, f, indent=2)
    print(f"  ✅ Saved: {out_json}")

    return result


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="OceanGuard AI — Real MetOcean Data Downloader")
    parser.add_argument("--source", choices=["currents","waves","wind","all"], default="currents")
    parser.add_argument("--lat-min", type=float, default=18.0)
    parser.add_argument("--lat-max", type=float, default=20.5)
    parser.add_argument("--lon-min", type=float, default=71.0)
    parser.add_argument("--lon-max", type=float, default=74.5)
    args = parser.parse_args()

    if args.source in ("currents", "all"):
        download_ocean_currents(args.lon_min, args.lon_max, args.lat_min, args.lat_max)
    if args.source in ("waves", "all"):
        download_wave_data(args.lon_min, args.lon_max, args.lat_min, args.lat_max)
    if args.source in ("wind", "all"):
        download_era5_wind(args.lon_min, args.lon_max, args.lat_min, args.lat_max)
