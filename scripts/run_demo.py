"""
OceanGuard AI - Automated End-to-End Pipeline Execution Script
Runs Detect -> Trace -> Match -> Rank -> Explain sequence in CLI.
"""

import sys
import os

# Add root directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from modules.detection.baseline_detector import load_sar_raster, preprocess_and_denoise, detect_oil_slick_mask, mask_to_geojson_polygon
from modules.tracing.drift_model import calculate_reverse_drift
from modules.ais.candidate_filter import filter_candidate_vessels
from modules.ranking.scoring import compute_evidence_ranking

def main():
    print("======================================================================")
    print(" 🌊 OCEANGUARD AI - END-TO-END DEMO EXECUTION (SIH26143)")
    print("======================================================================")
    
    # STEP 1: DETECT
    print("\n[STEP 1/5] 🛰️ DETECT: Processing SAR Raster Image...")
    raw = load_sar_raster()
    denoised = preprocess_and_denoise(raw)
    mask = detect_oil_slick_mask(denoised)
    spill = mask_to_geojson_polygon(mask, 19.142, 72.605)
    print(f" -> Spill Extracted: Area = {spill['area_km2']} km², Confidence = {spill['confidence']*100:.0f}%")
    
    # STEP 2: TRACE
    print("\n[STEP 2/5] 🌊 TRACE: Calculating Lagrangian MetOcean Reverse Drift...")
    drift = calculate_reverse_drift(19.142, 72.605)
    print(f" -> Backtrack Window: {drift['likely_start_time']} to {drift['likely_end_time']}")
    print(f" -> Origin Centroid: {drift['origin_centroid']['latitude']:.3f}° N, {drift['origin_centroid']['longitude']:.3f}° E")
    print(f" -> Backtrack Confidence: {drift['confidence']*100:.0f}%")
    
    # STEP 3: MATCH
    print("\n[STEP 3/5] 🚢 MATCH: Filtering Historical AIS Vessel Trajectories...")
    candidates = filter_candidate_vessels(drift['origin_polygon']['coordinates'], drift['likely_start_time'], drift['likely_end_time'])
    print(f" -> Shortlisted {len(candidates)} candidate vessels within spatial-temporal envelope.")
    
    # STEP 4: RANK
    print("\n[STEP 4/5] 🏆 RANK: Fusing Multi-Factor Evidence Scores (0-100)...")
    rankings = compute_evidence_ranking(candidates)
    for r in rankings:
        print(f"    #{r['rank']} {r['name']} ({r['imo']}) -> Score: {r['overall_score']}/100 [{r['confidence_category']}]")
        
    # STEP 5: EXPLAIN
    top = rankings[0]
    print("\n[STEP 5/5] 🧠 EXPLAIN: Generating Attribution Justification...")
    print(f" -> Primary Suspect: {top['name']}")
    print(f" -> Evidence Summary: {top['justification']}")
    print("\n✅ OceanGuard AI Pipeline Execution Finished Successfully.")
    print("======================================================================")

if __name__ == "__main__":
    main()
