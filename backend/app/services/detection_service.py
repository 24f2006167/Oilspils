from modules.detection.baseline_detector import load_sar_raster, preprocess_and_denoise, detect_oil_slick_mask, mask_to_geojson_polygon
from backend.app.schemas.spill import SpillDetectionRequest, SpillDetectionResponse, GeoLocation, GeoPolygon

class DetectionService:
    @staticmethod
    def process_spill_detection(req: SpillDetectionRequest) -> SpillDetectionResponse:
        raw_sar = load_sar_raster(req.satellite_image_path)
        denoised = preprocess_and_denoise(raw_sar)
        mask = detect_oil_slick_mask(denoised)
        result = mask_to_geojson_polygon(mask)
        
        return SpillDetectionResponse(
            investigation_id=req.investigation_id,
            spill_id=f"SPILL-{req.investigation_id}",
            observation_time=req.observation_time,
            location=GeoLocation(latitude=19.142, longitude=72.605),
            geometry=GeoPolygon(type="Polygon", coordinates=result["coordinates"]),
            area_km2=result["area_km2"],
            detection_confidence=result["confidence"],
            slick_characteristics="Heavy Petroleum Emulsion / Dark Biogenic Contrast"
        )
