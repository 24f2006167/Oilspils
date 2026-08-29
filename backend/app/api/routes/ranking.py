from fastapi import APIRouter
from backend.app.schemas.ranking import RankingRequest, RankingResponse
from backend.app.services.ranking_service import RankingService

router = APIRouter()

@router.post("/rank", response_model=RankingResponse, tags=["Evidence Ranking"])
def rank_candidates(request: RankingRequest):
    """Executes multi-factor evidence fusion and returns explainable ranking breakdown."""
    return RankingService.rank_vessels(request)
