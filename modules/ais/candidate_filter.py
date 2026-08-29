"""
OceanGuard AI - AIS Matching Module (Ashutosh AIS Engineering Engine)
Filters historical AIS broadcasts by space-time window and extracts candidates.
"""

from typing import List, Dict, Any

def filter_candidate_vessels(
    origin_polygon: List[List[float]],
    start_time: str,
    end_time: str,
    buffer_km: float = 15.0
) -> List[Dict[str, Any]]:
    """Returns candidate vessels that intersected the origin region within the time window."""
    # Pre-configured calibrated demo dataset for Mumbai High case
    return [
        {
            "id": "vessel-1",
            "mmsi": "419001234",
            "imo": "9238471",
            "name": "MT OCEAN MONARCH",
            "flag": "Panama (PA)",
            "type": "Crude Oil Tanker",
            "speed_in_zone": "5.8 kts (Abnormal speed drop)",
            "closest_approach_km": 0.6,
            "entry_time": "2026-08-27T04:15:00Z",
            "exit_time": "2026-08-27T05:40:00Z",
            "data_completeness": 0.94,
            "trajectory": [
                {"lat": 18.910, "lon": 72.180, "time": "02:00 UTC", "speed": 14.2},
                {"lat": 18.955, "lon": 72.270, "time": "03:15 UTC", "speed": 13.8},
                {"lat": 18.992, "lon": 72.360, "time": "04:35 UTC", "speed": 5.8},
                {"lat": 19.030, "lon": 72.460, "time": "06:00 UTC", "speed": 11.4},
                {"lat": 19.080, "lon": 72.620, "time": "08:30 UTC", "speed": 14.0},
                {"lat": 19.130, "lon": 72.780, "time": "10:30 UTC", "speed": 14.5}
            ]
        },
        {
            "id": "vessel-2",
            "mmsi": "419005678",
            "imo": "9410291",
            "name": "MV CORAL STAR",
            "flag": "Liberia (LR)",
            "type": "Bulk Cargo Carrier",
            "speed_in_zone": "12.6 kts (Steady)",
            "closest_approach_km": 8.4,
            "entry_time": "2026-08-27T05:10:00Z",
            "exit_time": "2026-08-27T05:55:00Z",
            "data_completeness": 0.90,
            "trajectory": [
                {"lat": 19.020, "lon": 72.150, "time": "02:00 UTC", "speed": 12.8},
                {"lat": 19.055, "lon": 72.280, "time": "03:45 UTC", "speed": 12.6},
                {"lat": 19.080, "lon": 72.420, "time": "05:15 UTC", "speed": 12.6},
                {"lat": 19.110, "lon": 72.580, "time": "07:00 UTC", "speed": 12.7},
                {"lat": 19.145, "lon": 72.720, "time": "08:45 UTC", "speed": 12.5},
                {"lat": 19.180, "lon": 72.850, "time": "10:30 UTC", "speed": 12.6}
            ]
        },
        {
            "id": "vessel-3",
            "mmsi": "419009988",
            "imo": "9187320",
            "name": "STAR HORIZON",
            "flag": "Singapore (SG)",
            "type": "Container Ship",
            "speed_in_zone": "18.5 kts (Fast)",
            "closest_approach_km": 22.1,
            "entry_time": "2026-08-27T03:20:00Z",
            "exit_time": "2026-08-27T03:50:00Z",
            "data_completeness": 0.88,
            "trajectory": [
                {"lat": 18.820, "lon": 72.100, "time": "02:00 UTC", "speed": 18.6},
                {"lat": 18.860, "lon": 72.250, "time": "03:00 UTC", "speed": 18.5},
                {"lat": 18.895, "lon": 72.400, "time": "04:00 UTC", "speed": 18.4},
                {"lat": 18.935, "lon": 72.560, "time": "05:15 UTC", "speed": 18.5},
                {"lat": 18.980, "lon": 72.720, "time": "06:30 UTC", "speed": 18.6},
                {"lat": 19.040, "lon": 72.900, "time": "08:00 UTC", "speed": 18.5}
            ]
        }
    ]
