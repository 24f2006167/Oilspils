from fastapi import APIRouter
from backend.app.schemas.vessel import VesselMatchRequest, VesselMatchResponse
from backend.app.services.ais_service import AISService

router = APIRouter()

@router.post("/match-vessels", response_model=VesselMatchResponse, tags=["AIS Matching"])
def match_candidate_vessels(request: VesselMatchRequest):
    """Filters historical AIS trajectories against calculated origin polygon and time window."""
    return AISService.match_candidates(request)
