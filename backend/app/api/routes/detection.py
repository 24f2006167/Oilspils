from fastapi import APIRouter
from backend.app.schemas.spill import SpillDetectionRequest, SpillDetectionResponse
from backend.app.services.detection_service import DetectionService

router = APIRouter()

@router.post("/detect", response_model=SpillDetectionResponse, tags=["Detection"])
def detect_spill(request: SpillDetectionRequest):
    """Executes SAR preprocessing, thresholding, and polygon contour extraction."""
    return DetectionService.process_spill_detection(request)
