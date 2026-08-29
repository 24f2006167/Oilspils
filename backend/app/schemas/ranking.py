from pydantic import BaseModel
from typing import List, Dict, Any

class EvidenceFactor(BaseModel):
    score: float
    weight: float
    note: str

class VesselRankingEvidence(BaseModel):
    proximity: EvidenceFactor
    time_match: EvidenceFactor
    trajectory_match: EvidenceFactor
    drift_consistency: EvidenceFactor
    ais_quality: EvidenceFactor

class RankedVessel(BaseModel):
    rank: int
    vessel_id: str
    name: str
    imo: str
    mmsi: str
    overall_score: float
    confidence_category: str
    evidence: VesselRankingEvidence
    justification: str

class RankingRequest(BaseModel):
    investigation_id: str
    spill_id: str

class RankingResponse(BaseModel):
    investigation_id: str
    rankings: List[RankedVessel]
    weights_used: Dict[str, float]
