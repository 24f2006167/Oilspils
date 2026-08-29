from fastapi import APIRouter
from backend.app.schemas.trace import TraceRequest, TraceResponse
from backend.app.services.trace_service import TraceService

router = APIRouter()

@router.post("/trace", response_model=TraceResponse, tags=["Tracing"])
def backtrack_origin(request: TraceRequest):
    """Computes reverse Lagrangian drift to estimate probable origin region and time window."""
    return TraceService.compute_trace(request)
