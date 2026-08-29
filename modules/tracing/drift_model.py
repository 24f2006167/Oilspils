"""
OceanGuard AI - Tracing Module (Real Lagrangian Reverse Drift Engine)
Performs numerical multi-particle Lagrangian reverse backtracking integrating
MetOcean windage (3.2% rule with Coriolis deflection), surface currents, and turbulent eddy diffusion.
"""

import math
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional
import numpy as np


def calculate_reverse_drift(
    observed_lat: float,
    observed_lon: float,
    observation_time: Optional[str] = None,
    wind_kts: float = 14.6,
    wind_deg: float = 245.0,
    current_ms: float = 0.42,
    current_deg: float = 228.0,
    backtrack_hours: float = 6.0,
    num_particles: int = 100,
    windage_factor: float = 0.032,
    coriolis_deflection_deg: float = 10.0,
    eddy_diffusion_kh: float = 2.5
) -> Dict[str, Any]:
    """
    Simulates reverse Lagrangian particle dispersion backwards in time:
    v_drift = u_current + alpha * R(theta) * u_wind + u'_turbulent
    
    Returns origin centroid, dispersion envelope polygon, release time window, and trajectory vector.
    """
    # Parse observation timestamp
    if observation_time:
        try:
            obs_dt = datetime.fromisoformat(observation_time.replace("Z", "+00:00"))
        except Exception:
            obs_dt = datetime(2026, 8, 27, 10, 30, tzinfo=timezone.utc)
    else:
        obs_dt = datetime(2026, 8, 27, 10, 30, tzinfo=timezone.utc)
    
    # Unit conversions
    wind_ms = wind_kts * 0.514444
    
    # Meteorological wind blows FROM wind_deg, so transport is TOWARDS (wind_deg - 180) + Coriolis deflection
    # Surface current direction: Oceanographic current flows TOWARDS (current_deg - 180 if from, or current_deg if towards)
    # In CMEMS/HYCOM, transport heading is towards (65 deg for 245 deg WSW wind)
    transport_wind_deg = (wind_deg - 180.0) % 360.0 + coriolis_deflection_deg
    transport_curr_deg = (current_deg - 180.0) % 360.0  # Current transport heading
    
    rad_wind = math.radians(transport_wind_deg)
    rad_curr = math.radians(transport_curr_deg)
    
    # Base velocity vector components of forward transport (m/s)
    u_wind = (windage_factor * wind_ms) * math.sin(rad_wind)
    v_wind = (windage_factor * wind_ms) * math.cos(rad_wind)
    
    u_curr = current_ms * math.sin(rad_curr)
    v_curr = current_ms * math.cos(rad_curr)
    
    u_mean_forward = u_wind + u_curr
    v_mean_forward = v_wind + v_curr
    
    # Reverse velocity vector is negative of forward drift
    u_reverse = -u_mean_forward
    v_reverse = -v_mean_forward
    
    # Monte-Carlo Particle Backtracking with turbulent diffusion
    np.random.seed(42)
    dt_sec = 600.0  # 10 minute time steps
    total_steps = int((backtrack_hours * 3600) / dt_sec)
    
    # Earth radius constants
    meters_per_deg_lat = 111320.0
    meters_per_deg_lon = 111320.0 * math.cos(math.radians(observed_lat))
    
    # Initialize particle cloud around observed center (with small initial slick footprint)
    particle_lats = observed_lat + np.random.normal(0, 0.005, num_particles)
    particle_lons = observed_lon + np.random.normal(0, 0.005, num_particles)
    
    # Particle random walk diffusion standard deviation per step: sigma = sqrt(2 * Kh * dt)
    turb_sigma = math.sqrt(2.0 * eddy_diffusion_kh * dt_sec)
    
    # Track trajectory history at hourly checkpoints
    checkpoints = 6
    steps_per_ckpt = max(1, total_steps // checkpoints)
    trajectory_points = [[round(observed_lat, 5), round(observed_lon, 5)]]
    
    for step in range(1, total_steps + 1):
        # Add random turbulent diffusion to each particle
        turb_u = np.random.normal(0, turb_sigma, num_particles) / dt_sec
        turb_v = np.random.normal(0, turb_sigma, num_particles) / dt_sec
        
        # Windage variation per particle (+/- 10%)
        p_windage = np.random.normal(1.0, 0.08, num_particles)
        p_u = (u_reverse * p_windage) + turb_u
        p_v = (v_reverse * p_windage) + turb_v
        
        # Coordinate update
        particle_lats += (p_v * dt_sec) / meters_per_deg_lat
        particle_lons += (p_u * dt_sec) / (111320.0 * np.cos(np.radians(particle_lats)))
        
        if step % steps_per_ckpt == 0 or step == total_steps:
            mean_lat = float(np.mean(particle_lats))
            mean_lon = float(np.mean(particle_lons))
            trajectory_points.append([round(mean_lat, 5), round(mean_lon, 5)])
    
    # Origin statistics at t0 - backtrack_hours
    origin_centroid_lat = float(np.mean(particle_lats))
    origin_centroid_lon = float(np.mean(particle_lons))
    
    # Calculate dispersion radius (standard deviation in meters and km)
    disp_lat_m = float(np.std(particle_lats)) * meters_per_deg_lat
    disp_lon_m = float(np.std(particle_lons)) * meters_per_deg_lon
    dispersion_km = round(math.sqrt(disp_lat_m**2 + disp_lon_m**2) / 1000.0, 2)
    
    # Generate origin uncertainty polygon boundary (Convex hull of particle cluster)
    angles = np.arctan2(particle_lats - origin_centroid_lat, particle_lons - origin_centroid_lon)
    hull_idx = np.argsort(angles)
    
    # Select 8 representative envelope points for clean polygon representation
    sub_idx = hull_idx[::max(1, len(hull_idx) // 8)]
    origin_polygon = []
    for idx in sub_idx:
        origin_polygon.append([round(float(particle_lats[idx]), 5), round(float(particle_lons[idx]), 5)])
    
    # Close polygon
    if origin_polygon and origin_polygon[0] != origin_polygon[-1]:
        origin_polygon.append(origin_polygon[0])
    
    # Time window calculation
    release_nominal_dt = obs_dt - timedelta(hours=backtrack_hours)
    # Add uncertainty window (e.g. +/- 1.0 to 1.5 hours)
    start_dt = release_nominal_dt - timedelta(hours=1.0)
    end_dt = release_nominal_dt + timedelta(hours=1.0)
    
    likely_start_time = start_dt.strftime("%Y-%m-%dT%H:%M:%SZ")
    likely_end_time = end_dt.strftime("%Y-%m-%dT%H:%M:%SZ")
    
    # Order drift vector from origin -> observed location
    drift_vector = trajectory_points[::-1]
    
    # Backtrack confidence score (decreases with longer backtrack time and higher dispersion)
    confidence = round(max(0.65, min(0.95, 0.95 - (backtrack_hours * 0.015) - (dispersion_km * 0.02))), 2)
    
    return {
        "origin_centroid": {
            "latitude": round(origin_centroid_lat, 5),
            "longitude": round(origin_centroid_lon, 5)
        },
        "origin_polygon": {
            "type": "Polygon",
            "coordinates": origin_polygon
        },
        "drift_vector": drift_vector,
        "likely_start_time": likely_start_time,
        "likely_end_time": likely_end_time,
        "uncertainty": f"± {dispersion_km:.1f} km dispersion",
        "dispersion_radius_km": dispersion_km,
        "confidence": confidence,
        "backtrack_hours": backtrack_hours,
        "particle_count": num_particles
    }
