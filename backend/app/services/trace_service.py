from modules.tracing.drift_model import calculate_reverse_drift
from backend.app.schemas.trace import TraceRequest, TraceResponse, MetOceanConditions
from backend.app.schemas.spill import GeoLocation, GeoPolygon

class TraceService:
    @staticmethod
    def compute_trace(req: TraceRequest) -> TraceResponse:
        drift_res = calculate_reverse_drift(
            observed_lat=req.observed_location.latitude,
            observed_lon=req.observed_location.longitude,
            observation_time=req.observed_time,
            backtrack_hours=float(req.simulation_hours or 6.0)
        )
        return TraceResponse(
            spill_id=req.spill_id,
            origin_region=GeoPolygon(type="Polygon", coordinates=drift_res["origin_polygon"]["coordinates"]),
            origin_centroid=GeoLocation(
                latitude=drift_res["origin_centroid"]["latitude"],
                longitude=drift_res["origin_centroid"]["longitude"]
            ),
            likely_start_time=drift_res["likely_start_time"],
            likely_end_time=drift_res["likely_end_time"],
            uncertainty=drift_res["uncertainty"],
            confidence=drift_res["confidence"],
            drift_vector=drift_res["drift_vector"],
            metocean_summary=MetOceanConditions(
                wind_speed_kts=14.6,
                wind_direction_deg=245.0,
                surface_current_ms=0.42,
                current_direction_deg=228.0,
                wave_height_m=1.6
            )
        )
