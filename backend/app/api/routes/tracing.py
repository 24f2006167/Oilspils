from fastapi import APIRouter
from typing import Dict, Any, Optional
from pydantic import BaseModel

from backend.app.schemas.trace import TraceRequest, TraceResponse
from backend.app.services.trace_service import TraceService
from modules.tracing.weathering_model import compute_oil_weathering

router = APIRouter()

class WeatheringRequest(BaseModel):
    api_gravity: float = 31.5
    sea_surface_temp_c: float = 28.4
    wind_speed_kts: float = 14.6
    wave_height_m: float = 1.6
    elapsed_hours: float = 6.0

@router.post("/trace", response_model=TraceResponse, tags=["Tracing"])
def backtrack_origin(request: TraceRequest):
    """Computes reverse Lagrangian drift to estimate probable origin region and time window."""
    return TraceService.compute_trace(request)

@router.post("/weathering", tags=["Tracing"])
def calculate_weathering_kinetics(request: Optional[WeatheringRequest] = None):
    """Calculates Mackay oil weathering kinetics: evaporation, emulsification, and viscosity."""
    req = request or WeatheringRequest()
    return compute_oil_weathering(
        api_gravity=req.api_gravity,
        sea_surface_temp_c=req.sea_surface_temp_c,
        wind_speed_kts=req.wind_speed_kts,
        wave_height_m=req.wave_height_m,
        elapsed_hours=req.elapsed_hours
    )
