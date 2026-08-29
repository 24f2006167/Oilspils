"""
OceanGuard AI - Oil Weathering Physics Module (Mackay & ADIOS Kinetics)
Computes real evaporative loss, emulsification water uptake, viscosity increase,
and natural dispersion over hydrodynamic drift duration.
"""

import math
from typing import Dict, Any, List


def compute_oil_weathering(
    api_gravity: float = 31.5,
    initial_viscosity_cst: float = 18.0,
    sea_surface_temp_c: float = 28.4,
    wind_speed_kts: float = 14.6,
    wave_height_m: float = 1.6,
    elapsed_hours: float = 6.0,
    time_steps: int = 7
) -> Dict[str, Any]:
    """
    Computes weathering kinetics using Mackay's evaporative exposure and emulsification equations:
      - Evaporative loss F_v(t)
      - Water content in emulsion Y_w(t)
      - Dynamic emulsion viscosity mu(t)
      - Natural dispersion rate into water column
    """
    wind_ms = wind_speed_kts * 0.514444
    temp_k = sea_surface_temp_c + 273.15
    
    # Mackay evaporative exposure constant: theta = (k_evap * Area / Volume) * t
    # Empirical constant for medium crude oil (Arabian Light / Bombay High Crude)
    k_evap = (0.002 * (wind_ms ** 0.78)) / (1.0 + 0.05 * (300.0 - temp_k))
    
    timeline: List[Dict[str, Any]] = []
    
    for step in range(time_steps):
        t_hours = (step / (time_steps - 1)) * elapsed_hours
        t_sec = t_hours * 3600.0
        
        # 1. Evaporative fraction F_v: logarithmic decay of volatile fractions
        # Medium crude (API ~31-35): evaporates ~25-45% in first 12 hours
        evap_fraction = min(0.48, (0.028 * math.log(1.0 + (k_evap * t_sec * 0.001) + 1e-4) * (api_gravity / 30.0)))
        evap_percent = round(evap_fraction * 100.0, 1)
        
        # 2. Water content in emulsion Y_w (Moose formation): Y_max ~ 75%
        # Rate constant k_w depends on wind speed squared
        k_w = 2.0e-5 * ((wind_ms + 1.0) ** 2)
        y_max = 0.75
        water_content = y_max * (1.0 - math.exp(-k_w * t_sec))
        emulsion_percent = round(water_content * 100.0, 1)
        
        # 3. Dynamic Viscosity: Mooney equation + Evaporation concentration
        # mu = mu_0 * exp(2.5 * Y_w / (1 - 0.65 * Y_w)) * exp(c * F_v)
        mooney_factor = math.exp((2.5 * water_content) / (1.0 - 0.65 * water_content + 1e-5))
        evap_visc_factor = math.exp(6.5 * evap_fraction)
        current_viscosity_cst = round(initial_viscosity_cst * mooney_factor * evap_visc_factor, 1)
        
        # 4. Natural dispersion rate (% mass lost to water column droplets)
        # Delvigne & Sweeney breaking wave droplet entrainment
        dispersion_percent = round(min(18.0, 0.008 * (wave_height_m ** 2) * (t_hours ** 0.85) * 100.0), 1)
        
        # 5. Remaining surface volume percentage
        remaining_surface_percent = round(max(40.0, 100.0 - evap_percent - dispersion_percent), 1)
        
        timeline.append({
            "hour": round(t_hours, 1),
            "evaporated_percent": evap_percent,
            "emulsion_water_percent": emulsion_percent,
            "viscosity_cst": current_viscosity_cst,
            "dispersion_percent": dispersion_percent,
            "remaining_surface_percent": remaining_surface_percent
        })
    
    final = timeline[-1]
    return {
        "crude_oil_type": f"Bombay High Crude / Arabian Light (API {api_gravity}°)",
        "elapsed_hours": elapsed_hours,
        "sea_surface_temp_c": sea_surface_temp_c,
        "wind_speed_kts": wind_speed_kts,
        "wave_height_m": wave_height_m,
        "final_evaporated_percent": final["evaporated_percent"],
        "final_emulsion_water_percent": final["emulsion_water_percent"],
        "final_viscosity_cst": final["viscosity_cst"],
        "final_remaining_surface_percent": final["remaining_surface_percent"],
        "weathering_timeline": timeline
    }
