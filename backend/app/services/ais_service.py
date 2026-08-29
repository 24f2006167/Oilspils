from modules.ais.candidate_filter import filter_candidate_vessels
from backend.app.schemas.vessel import VesselMatchRequest, VesselMatchResponse, CandidateVessel, TrackPoint

class AISService:
    @staticmethod
    def match_candidates(req: VesselMatchRequest) -> VesselMatchResponse:
        raw_candidates = filter_candidate_vessels(
            origin_polygon=req.origin_polygon,
            start_time=req.start_time,
            end_time=req.end_time,
            buffer_km=req.buffer_km
        )
        candidates = []
        for c in raw_candidates:
            traj = [TrackPoint(lat=p["lat"], lon=p["lon"], time=p["time"], speed=p["speed"]) for p in c["trajectory"]]
            candidates.append(CandidateVessel(
                id=c["id"],
                mmsi=c["mmsi"],
                imo=c["imo"],
                name=c["name"],
                flag=c["flag"],
                type=c["type"],
                speed_in_zone=c["speed_in_zone"],
                closest_approach_km=c["closest_approach_km"],
                entry_time=c["entry_time"],
                exit_time=c["exit_time"],
                data_completeness=c["data_completeness"],
                trajectory=traj
            ))
        return VesselMatchResponse(investigation_id=req.investigation_id, candidate_vessels=candidates)
