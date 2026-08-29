from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class TrackPoint(BaseModel):
    lat: float
    lon: float
    time: str
    speed: float

class VesselMatchRequest(BaseModel):
    investigation_id: str
    origin_polygon: List[List[float]]
    start_time: str
    end_time: str
    buffer_km: float = 15.0

class CandidateVessel(BaseModel):
    id: str
    mmsi: str
    imo: str
    name: str
    flag: str
    type: str
    speed_in_zone: str
    closest_approach_km: float
    entry_time: str
    exit_time: str
    data_completeness: float
    trajectory: List[TrackPoint]

class VesselMatchResponse(BaseModel):
    investigation_id: str
    candidate_vessels: List[CandidateVessel]
