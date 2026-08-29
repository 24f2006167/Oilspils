from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class GeoLocation(BaseModel):
    latitude: float
    longitude: float

class GeoPolygon(BaseModel):
    type: str = "Polygon"
    coordinates: List[List[float]]

class SpillDetectionRequest(BaseModel):
    investigation_id: str
    satellite_image_path: Optional[str] = None
    observation_time: str
    sensor_type: str = "Sentinel-1 SAR C-Band"

class SpillDetectionResponse(BaseModel):
    investigation_id: str
    spill_id: str
    observation_time: str
    location: GeoLocation
    geometry: GeoPolygon
    area_km2: float
    detection_confidence: float
    slick_characteristics: str
