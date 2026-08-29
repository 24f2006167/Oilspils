from pydantic import BaseModel
from typing import List, Optional
from backend.app.schemas.spill import GeoPolygon, GeoLocation

class TraceRequest(BaseModel):
    spill_id: str
    observed_time: str
    observed_location: GeoLocation
    observed_geometry: GeoPolygon
    simulation_hours: int = 8

class MetOceanConditions(BaseModel):
    wind_speed_kts: float
    wind_direction_deg: float
    surface_current_ms: float
    current_direction_deg: float
    wave_height_m: float

class TraceResponse(BaseModel):
    spill_id: str
    origin_region: GeoPolygon
    origin_centroid: GeoLocation
    likely_start_time: str
    likely_end_time: str
    uncertainty: str
    confidence: float
    drift_vector: List[List[float]]
    metocean_summary: MetOceanConditions
