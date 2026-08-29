from pydantic import BaseModel
from typing import List, Optional, Any
from backend.app.schemas.spill import SpillDetectionResponse
from backend.app.schemas.trace import TraceResponse
from backend.app.schemas.ranking import RankedVessel

class InvestigationCreate(BaseModel):
    title: str
    region: str
    latitude: float
    longitude: float

class InvestigationFull(BaseModel):
    id: str
    title: str
    region: str
    status: str
    created_at: str
    detection: Optional[SpillDetectionResponse] = None
    trace: Optional[TraceResponse] = None
    rankings: Optional[List[RankedVessel]] = None
    summary: str
