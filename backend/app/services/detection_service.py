from modules.detection.baseline_detector import load_sar_raster, preprocess_and_denoise, detect_oil_slick_mask, mask_to_geojson_polygon
from backend.app.schemas.spill import SpillDetectionRequest, SpillDetectionResponse, GeoLocation, GeoPolygon

class DetectionService:
    @staticmethod
    def process_spill_detection(req: SpillDetectionRequest) -> SpillDetectionResponse:
        sar_data = load_sar_raster(
            image_path=req.satellite_image_path,
            center_lat=19.142,
            center_lon=72.605
        )
        denoised = preprocess_and_denoise(sar_data["raster"])
        mask = detect_oil_slick_mask(denoised)
        result = mask_to_geojson_polygon(
            mask,
            center_lat=sar_data["center_lat"],
            center_lon=sar_data["center_lon"],
            pixel_spacing_m=sar_data["pixel_spacing_m"]
        )
        
        centroid_lat = result.get("centroid", {}).get("latitude", 19.142)
        centroid_lon = result.get("centroid", {}).get("longitude", 72.605)
        
        return SpillDetectionResponse(
            investigation_id=req.investigation_id,
            spill_id=f"SPILL-{req.investigation_id}",
            observation_time=req.observation_time,
            location=GeoLocation(latitude=centroid_lat, longitude=centroid_lon),
            geometry=GeoPolygon(type="Polygon", coordinates=result["coordinates"]),
            area_km2=result["area_km2"],
            detection_confidence=result["confidence"],
            slick_characteristics="Heavy Petroleum Emulsion / Dark Biogenic Contrast"
        )
