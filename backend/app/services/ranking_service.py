from modules.ranking.scoring import compute_evidence_ranking
from modules.ais.candidate_filter import filter_candidate_vessels
from backend.app.schemas.ranking import RankingRequest, RankingResponse, RankedVessel, VesselRankingEvidence, EvidenceFactor
from backend.app.core.config import settings

class RankingService:
    @staticmethod
    def rank_vessels(req: RankingRequest) -> RankingResponse:
        candidates = filter_candidate_vessels(origin_polygon=[], start_time="", end_time="")
        scored = compute_evidence_ranking(candidates)
        
        rankings = []
        for s in scored:
            ev = s["evidence"]
            evidence_model = VesselRankingEvidence(
                proximity=EvidenceFactor(score=ev["proximity"]["score"], weight=ev["proximity"]["weight"], note=ev["proximity"]["note"]),
                time_match=EvidenceFactor(score=ev["time_match"]["score"], weight=ev["time_match"]["weight"], note=ev["time_match"]["note"]),
                trajectory_match=EvidenceFactor(score=ev["trajectory_match"]["score"], weight=ev["trajectory_match"]["weight"], note=ev["trajectory_match"]["note"]),
                drift_consistency=EvidenceFactor(score=ev["drift_consistency"]["score"], weight=ev["drift_consistency"]["weight"], note=ev["drift_consistency"]["note"]),
                ais_quality=EvidenceFactor(score=ev["ais_quality"]["score"], weight=ev["ais_quality"]["weight"], note=ev["ais_quality"]["note"])
            )
            rankings.append(RankedVessel(
                rank=s["rank"],
                vessel_id=s["vessel_id"],
                name=s["name"],
                imo=s["imo"],
                mmsi=s["mmsi"],
                overall_score=s["overall_score"],
                confidence_category=s["confidence_category"],
                evidence=evidence_model,
                justification=s["justification"]
            ))
            
        return RankingResponse(
            investigation_id=req.investigation_id,
            rankings=rankings,
            weights_used={
                "proximity": settings.WEIGHT_PROXIMITY,
                "time_window": settings.WEIGHT_TIME_WINDOW,
                "trajectory": settings.WEIGHT_TRAJECTORY,
                "drift_consistency": settings.WEIGHT_DRIFT_CONSISTENCY,
                "ais_quality": settings.WEIGHT_AIS_QUALITY
            }
        )
