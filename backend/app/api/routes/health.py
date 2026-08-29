from fastapi import APIRouter
from datetime import datetime

router = APIRouter()

@router.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "OceanGuard AI Platform",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "components": {
            "detection_module": "operational",
            "tracing_module": "operational",
            "ais_matching": "operational",
            "ranking_engine": "operational"
        }
    }
