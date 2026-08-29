from fastapi import APIRouter, HTTPException
from typing import List
from backend.app.schemas.investigation import InvestigationCreate, InvestigationFull
from backend.app.services.detection_service import DetectionService
from backend.app.services.trace_service import TraceService
from backend.app.services.ranking_service import RankingService
from backend.app.schemas.spill import SpillDetectionRequest
from backend.app.schemas.trace import TraceRequest, GeoLocation, GeoPolygon
from backend.app.schemas.ranking import RankingRequest

router = APIRouter()

INVESTIGATIONS_STORE = {
    "INV-2026-001": {
        "id": "INV-2026-001",
        "title": "Mumbai High Offshore Slick (Arabian Sea)",
        "region": "MUMBAI OFFSHORE BASIN",
        "status": "INVESTIGATION COMPLETE",
        "created_at": "2026-08-27T10:30:00Z",
        "summary": "Sentinel-1 SAR C-Band sensor detected 12.4 km² mineral oil slick. AIS trajectory fusion established MT OCEAN MONARCH as primary candidate with 87/100 Evidence Score."
    }
}

@router.post("/investigations", response_model=InvestigationFull, tags=["Investigations"])
def create_investigation(payload: InvestigationCreate):
    inv_id = f"INV-2026-{len(INVESTIGATIONS_STORE)+1:03d}"
    data = {
        "id": inv_id,
        "title": payload.title,
        "region": payload.region,
        "status": "IN_PROGRESS",
        "created_at": "2026-08-28T12:00:00Z",
        "summary": "New investigation initiated."
    }
    INVESTIGATIONS_STORE[inv_id] = data
    return InvestigationFull(**data)

@router.get("/investigations/{investigation_id}", response_model=InvestigationFull, tags=["Investigations"])
def get_investigation(investigation_id: str):
    if investigation_id not in INVESTIGATIONS_STORE:
        raise HTTPException(status_code=404, detail="Investigation not found")
    
    base = INVESTIGATIONS_STORE[investigation_id]
    
    # Run pipeline services to populate full response
    det_req = SpillDetectionRequest(investigation_id=investigation_id, observation_time="2026-08-27T10:30:00Z")
    det_res = DetectionService.process_spill_detection(det_req)
    
    trace_req = TraceRequest(
        spill_id=det_res.spill_id,
        observed_time=det_res.observation_time,
        observed_location=det_res.location,
        observed_geometry=det_res.geometry
    )
    trace_res = TraceService.compute_trace(trace_req)
    
    rank_req = RankingRequest(investigation_id=investigation_id, spill_id=det_res.spill_id)
    rank_res = RankingService.rank_vessels(rank_req)
    
    return InvestigationFull(
        id=base["id"],
        title=base["title"],
        region=base["region"],
        status=base["status"],
        created_at=base["created_at"],
        detection=det_res,
        trace=trace_res,
        rankings=rank_res.rankings,
        summary=base["summary"]
    )
