/**
 * OceanGuard AI - Historical Datasets & Evidence Cases
 * SIH26143 / SamadhanLabs Multi-Scenario Engine
 */

const INVESTIGATION_CASES = {
  "INV-2026-001": {
    id: "INV-2026-001",
    title: "Mumbai High Offshore Slick (Arabian Sea)",
    region: "MUMBAI OFFSHORE BASIN",
    center: [19.08, 72.48],
    zoom: 10,
    timestamp: "2026-08-27T10:30:00Z",
    status: "INVESTIGATION COMPLETE",
    summary: "Sentinel-1 SAR C-Band sensor detected a 12.4 km² mineral oil slick in the western offshore petroleum corridor. Lagrangian drift backtracking identified an origin release window between 04:00 - 06:00 UTC. AIS trajectory fusion established MT OCEAN MONARCH as the primary candidate with an 87/100 Evidence Score.",
    
    // Stage 1: Detect Output
    detection: {
      spillId: "SPILL-2026-MUM-01",
      satellite: "Sentinel-1B SAR (C-Band Synthetic Aperture Radar)",
      polarization: "VV + VH Cross-Polarized",
      observationTime: "2026-08-27T10:30:00Z",
      center: [19.142, 72.605],
      areaKm2: 12.4,
      confidence: 0.91,
      slickType: "Heavy Petroleum Emulsion / Dark Biogenic Contrast",
      spillPolygon: [
        [19.162, 72.585],
        [19.155, 72.628],
        [19.130, 72.635],
        [19.115, 72.595],
        [19.135, 72.570],
        [19.162, 72.585]
      ]
    },

    // Stage 2: Trace Output (MetOcean Drift & Backtracking)
    trace: {
      model: "Lagrangian MetOcean Reverse Particle Trajectory",
      windSpeedKts: 14.6,
      windDirectionDeg: 245,
      windHeading: "WSW (West-Southwest)",
      surfaceCurrentSpeed: "0.42 m/s",
      currentDirectionDeg: 228,
      currentHeading: "SW (Southwest)",
      seaSurfaceTemp: "28.4 °C",
      waveHeight: "1.6 m (Significant)",
      likelyStartTime: "2026-08-27T04:00:00Z",
      likelyEndTime: "2026-08-27T06:00:00Z",
      uncertainty: "Medium (± 1.8 km dispersion)",
      backtrackConfidence: 0.88,
      originCenter: [18.995, 72.365],
      originPolygon: [
        [19.025, 72.335],
        [19.030, 72.395],
        [18.975, 72.415],
        [18.960, 72.350],
        [19.025, 72.335]
      ],
      driftVector: [
        [18.995, 72.365],
        [19.040, 72.445],
        [19.090, 72.525],
        [19.142, 72.605]
      ]
    },

    // Real-World Marine Feature: Ecological Vulnerability Index (ESI)
    ecoZones: [
      {
        name: "Thane Creek Mangrove & Flamingo Sanctuary",
        esiScore: 10,
        type: "Mangrove & Coastal Estuary",
        distanceKm: 42.5,
        etaHours: 28.5,
        polygon: [
          [19.020, 72.920], [19.070, 72.980], [19.130, 72.995], [19.140, 72.940], [19.020, 72.920]
        ]
      },
      {
        name: "Alibaug Intertidal Fisheries Nursery",
        esiScore: 8,
        type: "Intertidal Mudflats & Spawning Grounds",
        distanceKm: 28.0,
        etaHours: 19.2,
        polygon: [
          [18.680, 72.820], [18.720, 72.900], [18.650, 72.920], [18.620, 72.840], [18.680, 72.820]
        ]
      }
    ],

    // Real-World Marine Feature: ICG Interception & Containment Plan
    icgResponse: {
      station: "ICG Regional HQ West (Mumbai) & CGAS Daman",
      craft: "ICGS Samudra Prahari (Pollution Control Vessel CG-01)",
      aircraft: "Dornier 228 Maritime Patrol (Squadron 848)",
      suspectEezExitHours: 3.8,
      interceptCoords: [19.220, 72.910],
      boomRequiredMeters: 1200,
      skimmerCapacityM3H: 180,
      dispersantPermit: "RESTRICTED (Tier-2 Response Required)"
    },

    // Stage 3: Match Output (Candidate AIS Vessels)
    vessels: [
      {
        id: "vessel-1",
        mmsi: "419001234",
        imo: "9238471",
        name: "MT OCEAN MONARCH",
        flag: "Panama (PA)",
        type: "Crude Oil Tanker",
        length: "248 m",
        deadweight: "105,400 DWT",
        speedInZone: "5.8 kts (Abnormal deceleration from 14.2 kts)",
        closestApproachKm: 0.6,
        entryTime: "2026-08-27T04:15:00Z",
        exitTime: "2026-08-27T05:40:00Z",
        dataCompleteness: 0.94,
        rank: 1,
        overallScore: 87,
        confidenceCategory: "HIGH EVIDENCE PROBABILITY",
        isTopSuspect: true,
        evidence: {
          proximity: { score: 92, weight: 30, note: "Traversed directly within 0.6 km of computed centroid" },
          timeMatch: { score: 95, weight: 25, note: "Inside origin window for 85 minutes (04:15-05:40 UTC)" },
          trajectory: { score: 84, weight: 20, note: "Speed drop to 5.8 kts indicates potential tank discharge" },
          drift: { score: 86, weight: 15, note: "Geometric alignment matches backtracked particle plume" },
          aisQuality: { score: 94, weight: 10, note: "Unbroken high-frequency Class-A AIS telemetry" }
        },
        justification: "MT OCEAN MONARCH demonstrated a severe operational anomaly: vessel slowed abruptly to 5.8 knots directly inside the high-confidence origin envelope between 04:15 and 05:40 UTC. Vector geometry and oceanographic drift align with high mathematical fidelity.",
        track: [
          { lat: 18.910, lon: 72.180, time: "02:00 UTC", speed: 14.2 },
          { lat: 18.955, lon: 72.270, time: "03:15 UTC", speed: 13.8 },
          { lat: 18.992, lon: 72.360, time: "04:35 UTC", speed: 5.8 },  // inside origin zone
          { lat: 19.030, lon: 72.460, time: "06:00 UTC", speed: 11.4 },
          { lat: 19.080, lon: 72.620, time: "08:30 UTC", speed: 14.0 },
          { lat: 19.130, lon: 72.780, time: "10:30 UTC", speed: 14.5 }
        ]
      },
      {
        id: "vessel-2",
        mmsi: "419005678",
        imo: "9410291",
        name: "MV CORAL STAR",
        flag: "Liberia (LR)",
        type: "Bulk Cargo Carrier",
        length: "190 m",
        deadweight: "57,200 DWT",
        speedInZone: "12.6 kts (Steady cruising speed)",
        closestApproachKm: 8.4,
        entryTime: "2026-08-27T05:10:00Z",
        exitTime: "2026-08-27T05:55:00Z",
        dataCompleteness: 0.90,
        rank: 2,
        overallScore: 64,
        confidenceCategory: "MODERATE PROBABILITY",
        isTopSuspect: false,
        evidence: {
          proximity: { score: 65, weight: 30, note: "Passed 8.4 km North of origin centroid" },
          timeMatch: { score: 78, weight: 25, note: "Transited during tail end of release window" },
          trajectory: { score: 62, weight: 20, note: "Continuous linear course without heading deviations" },
          drift: { score: 60, weight: 15, note: "Peripheral overlap with secondary dispersion boundary" },
          aisQuality: { score: 90, weight: 10, note: "Consistent positional broadcast intervals" }
        },
        justification: "Vessel transited through the northern boundary zone during the estimated release window but maintained constant 12.6 knot speed and steady heading without behavioral deviations.",
        track: [
          { lat: 19.020, lon: 72.150, time: "02:00 UTC", speed: 12.8 },
          { lat: 19.055, lon: 72.280, time: "03:45 UTC", speed: 12.6 },
          { lat: 19.080, lon: 72.420, time: "05:15 UTC", speed: 12.6 },
          { lat: 19.110, lon: 72.580, time: "07:00 UTC", speed: 12.7 },
          { lat: 19.145, lon: 72.720, time: "08:45 UTC", speed: 12.5 },
          { lat: 19.180, lon: 72.850, time: "10:30 UTC", speed: 12.6 }
        ]
      },
      {
        id: "vessel-3",
        mmsi: "419009988",
        imo: "9187320",
        name: "STAR HORIZON",
        flag: "Singapore (SG)",
        type: "Container Ship",
        length: "294 m",
        deadweight: "68,000 DWT",
        speedInZone: "18.5 kts (Fast commercial transit)",
        closestApproachKm: 22.1,
        entryTime: "2026-08-27T03:20:00Z",
        exitTime: "2026-08-27T03:50:00Z",
        dataCompleteness: 0.88,
        rank: 3,
        overallScore: 42,
        confidenceCategory: "LOW PROBABILITY",
        isTopSuspect: false,
        evidence: {
          proximity: { score: 38, weight: 30, note: "Distanced over 22 km south of calculated origin" },
          timeMatch: { score: 45, weight: 25, note: "Departed sector 40 min prior to estimated release" },
          trajectory: { score: 40, weight: 20, note: "High speed container highway lane transit" },
          drift: { score: 45, weight: 15, note: "Outside hydrodynamic dispersion envelope" },
          aisQuality: { score: 88, weight: 10, note: "Standard terrestrial AIS reception" }
        },
        justification: "Spatial separation of 22 km and departure before the calculated origin time window make attribution highly implausible under established hydrodynamic models.",
        track: [
          { lat: 18.820, lon: 72.100, time: "02:00 UTC", speed: 18.6 },
          { lat: 18.860, lon: 72.250, time: "03:00 UTC", speed: 18.5 },
          { lat: 18.895, lon: 72.400, time: "04:00 UTC", speed: 18.4 },
          { lat: 18.935, lon: 72.560, time: "05:15 UTC", speed: 18.5 },
          { lat: 18.980, lon: 72.720, time: "06:30 UTC", speed: 18.6 },
          { lat: 19.040, lon: 72.900, time: "08:00 UTC", speed: 18.5 }
        ]
      }
    ],

    // Replay Simulation Keyframe Sequence
    replaySteps: [
      {
        step: 0,
        time: "02:00 UTC",
        title: "T0: Normal Maritime Corridor Traffic",
        narrative: "Vessels transiting normal sea lanes in western offshore corridor. Background SAR acquisition shows baseline calm water.",
        activeVesselPos: { "vessel-1": [18.910, 72.180], "vessel-2": [19.020, 72.150], "vessel-3": [18.820, 72.100] },
        spillVisible: false,
        originVisible: false,
        driftVisible: false
      },
      {
        step: 1,
        time: "04:15 UTC",
        title: "T1: Vessel Enters Critical Origin Zone",
        narrative: "MT OCEAN MONARCH reduces speed dramatically from 14.2 to 5.8 kts upon entering coordinates 18.99° N, 72.36° E.",
        activeVesselPos: { "vessel-1": [18.992, 72.360], "vessel-2": [19.055, 72.280], "vessel-3": [18.895, 72.400] },
        spillVisible: false,
        originVisible: true,
        driftVisible: false
      },
      {
        step: 2,
        time: "05:00 UTC",
        title: "T2: Probable Discharge Incident Occurs",
        narrative: "High probability release timestamp. Vessel lingers inside sector. Hydrodynamic model initiates particle release.",
        activeVesselPos: { "vessel-1": [19.005, 72.390], "vessel-2": [19.080, 72.420], "vessel-3": [18.935, 72.560] },
        spillVisible: false,
        originVisible: true,
        driftVisible: true
      },
      {
        step: 3,
        time: "07:30 UTC",
        title: "T3: MetOcean Drift Advection",
        narrative: "Wind (14.6 kts WSW) and surface currents (0.42 m/s SW) carry expanding slick 24 km northeast towards Mumbai coastline.",
        activeVesselPos: { "vessel-1": [19.080, 72.620], "vessel-2": [19.110, 72.580], "vessel-3": [19.040, 72.900] },
        spillVisible: true,
        originVisible: true,
        driftVisible: true
      },
      {
        step: 4,
        time: "10:30 UTC",
        title: "T4: Satellite Detection & Evidence Fusion",
        narrative: "Sentinel-1 SAR sensor observes 12.4 km² spill. OceanGuard AI executes reverse drift & fuses AIS scores: MT OCEAN MONARCH (87%).",
        activeVesselPos: { "vessel-1": [19.130, 72.780], "vessel-2": [19.180, 72.850], "vessel-3": [19.040, 72.900] },
        spillVisible: true,
        originVisible: true,
        driftVisible: true
      }
    ]
  },

  "INV-2026-002": {
    id: "INV-2026-002",
    title: "Gulf of Mannar Marine Biosphere Spill",
    region: "GULF OF MANNAR SANCTUARY",
    center: [9.15, 79.25],
    zoom: 10,
    timestamp: "2026-08-25T14:15:00Z",
    status: "INVESTIGATION COMPLETE",
    summary: "High-resolution SAR identified an 8.6 km² oily sheen trailing 18 km inside the ecologically protected Gulf of Mannar Biosphere. AIS backtrack analysis identified suspected illegal bilge discharge by Chemical Tanker GULF GLORY (Score: 82/100).",
    
    detection: {
      spillId: "SPILL-2026-GOM-02",
      satellite: "Sentinel-1A SAR",
      polarization: "VV High Sensitivity",
      observationTime: "2026-08-25T14:15:00Z",
      center: [9.182, 79.320],
      areaKm2: 8.6,
      confidence: 0.89,
      slickType: "Oily Bilge Mixture / Linear Discharge Sheen",
      spillPolygon: [
        [9.195, 79.300],
        [9.190, 79.345],
        [9.170, 79.350],
        [9.165, 79.295],
        [9.195, 79.300]
      ]
    },

    trace: {
      model: "Lagrangian Reverse Drift Modeling",
      windSpeedKts: 18.2,
      windDirectionDeg: 195,
      windHeading: "SSW (South-Southwest)",
      surfaceCurrentSpeed: "0.55 m/s",
      currentDirectionDeg: 210,
      currentHeading: "SSW",
      seaSurfaceTemp: "29.2 °C",
      waveHeight: "1.2 m",
      likelyStartTime: "2026-08-25T08:00:00Z",
      likelyEndTime: "2026-08-25T10:00:00Z",
      uncertainty: "Low (± 1.2 km dispersion)",
      backtrackConfidence: 0.91,
      originCenter: [9.055, 79.160],
      originPolygon: [
        [9.080, 79.135],
        [9.085, 79.185],
        [9.030, 79.190],
        [9.025, 79.140],
        [9.080, 79.135]
      ],
      driftVector: [
        [9.055, 79.160],
        [9.100, 79.215],
        [9.145, 79.270],
        [9.182, 79.320]
      ]
    },

    ecoZones: [
      {
        name: "Gulf of Mannar Coral Biosphere & Dugong Reserve",
        esiScore: 10,
        type: "Subtidal Coral Reefs & Seagrass",
        distanceKm: 14.2,
        etaHours: 8.5,
        polygon: [
          [9.220, 79.200], [9.280, 79.280], [9.240, 79.360], [9.180, 79.280], [9.220, 79.200]
        ]
      },
      {
        name: "Dhanushkodi Olive Ridley Nesting Beach",
        esiScore: 9,
        type: "Sandy Turtle Nesting Coastline",
        distanceKm: 22.0,
        etaHours: 14.0,
        polygon: [
          [9.150, 79.400], [9.200, 79.480], [9.160, 79.520], [9.120, 79.440], [9.150, 79.400]
        ]
      }
    ],

    icgResponse: {
      station: "ICG Mandapam Station & CGAS Tuticorin",
      craft: "ICGS Sankalp (Offshore Patrol Vessel CG-46)",
      aircraft: "Chetak Multi-Mission Helicopter",
      suspectEezExitHours: 2.4,
      interceptCoords: [9.310, 79.450],
      boomRequiredMeters: 800,
      skimmerCapacityM3H: 120,
      dispersantPermit: "PROHIBITED (Coral Biosphere Sanctuary Zone)"
    },

    vessels: [
      {
        id: "vessel-201",
        mmsi: "538009812",
        imo: "9354123",
        name: "MT GULF GLORY",
        flag: "Marshall Islands (MH)",
        type: "Chemical / Products Tanker",
        length: "183 m",
        deadweight: "49,990 DWT",
        speedInZone: "7.2 kts (Low night cruising speed)",
        closestApproachKm: 0.9,
        entryTime: "2026-08-25T08:20:00Z",
        exitTime: "2026-08-25T09:45:00Z",
        dataCompleteness: 0.92,
        rank: 1,
        overallScore: 82,
        confidenceCategory: "HIGH EVIDENCE PROBABILITY",
        isTopSuspect: true,
        evidence: {
          proximity: { score: 90, weight: 30, note: "Transited within 0.9 km of origin coordinates" },
          timeMatch: { score: 92, weight: 25, note: "Corresponds precisely to calculated 08:30 UTC release" },
          trajectory: { score: 76, weight: 20, note: "Course matches narrow linear orientation of oily trail" },
          drift: { score: 80, weight: 15, note: "High adherence to southern current drift vector" },
          aisQuality: { score: 92, weight: 10, note: "Unbroken positional telemetry" }
        },
        justification: "MT GULF GLORY's linear track matches the elongation angle of the detected bilge sheen. Vessel transited the exact origin zone during early morning hours with speed reductions characteristic of nocturnal pump-outs.",
        track: [
          { lat: 8.980, lon: 79.050, time: "06:00 UTC", speed: 13.5 },
          { lat: 9.055, lon: 79.160, time: "08:30 UTC", speed: 7.2 },
          { lat: 9.120, lon: 79.260, time: "10:30 UTC", speed: 12.0 },
          { lat: 9.200, lon: 79.380, time: "13:00 UTC", speed: 13.8 }
        ]
      },
      {
        id: "vessel-202",
        mmsi: "419008811",
        imo: "9123899",
        name: "MV LANKA PRIDE",
        flag: "Sri Lanka (LK)",
        type: "General Cargo",
        length: "140 m",
        deadweight: "18,500 DWT",
        speedInZone: "11.0 kts",
        closestApproachKm: 14.5,
        entryTime: "2026-08-25T09:10:00Z",
        exitTime: "2026-08-25T09:50:00Z",
        dataCompleteness: 0.85,
        rank: 2,
        overallScore: 48,
        confidenceCategory: "LOW PROBABILITY",
        isTopSuspect: false,
        evidence: {
          proximity: { score: 42, weight: 30, note: "Stayed 14.5 km eastward in deep channel" },
          timeMatch: { score: 60, weight: 25, note: "Transited during window but outside lateral envelope" },
          trajectory: { score: 48, weight: 20, note: "Standard ferry lane heading" },
          drift: { score: 45, weight: 15, note: "No hydrodynamic confluence" },
          aisQuality: { score: 85, weight: 10, note: "Intermittent coastal station reception" }
        },
        justification: "Vessel remained in the eastern deep-water shipping channel with no proximity to the origin zone.",
        track: [
          { lat: 8.950, lon: 79.280, time: "07:00 UTC", speed: 11.2 },
          { lat: 9.080, lon: 79.350, time: "09:20 UTC", speed: 11.0 },
          { lat: 9.220, lon: 79.420, time: "12:00 UTC", speed: 11.1 }
        ]
      }
    ],

    replaySteps: [
      {
        step: 0,
        time: "06:00 UTC",
        title: "T0: Baseline Biosphere Traffic",
        narrative: "Normal coastal shipping moving along Palk Strait & Gulf of Mannar channel.",
        activeVesselPos: { "vessel-201": [8.980, 79.050], "vessel-202": [8.950, 79.280] },
        spillVisible: false, originVisible: false, driftVisible: false
      },
      {
        step: 1,
        time: "08:30 UTC",
        title: "T1: Vessel Transits Marine Sanctuary Zone",
        narrative: "MT GULF GLORY transits sensitive biosphere zone at reduced speed.",
        activeVesselPos: { "vessel-201": [9.055, 79.160], "vessel-202": [9.020, 79.320] },
        spillVisible: false, originVisible: true, driftVisible: false
      },
      {
        step: 2,
        time: "09:30 UTC",
        title: "T2: Discharge Release & Sheen Trail Formation",
        narrative: "Oily bilge trail discharged along vessel wake line.",
        activeVesselPos: { "vessel-201": [9.090, 79.210], "vessel-202": [9.080, 79.350] },
        spillVisible: false, originVisible: true, driftVisible: true
      },
      {
        step: 3,
        time: "11:30 UTC",
        title: "T3: Strong Monsoonal Drift",
        narrative: "SSW winds (18.2 kts) and surface currents drift sheen northward.",
        activeVesselPos: { "vessel-201": [9.150, 79.300], "vessel-202": [9.150, 79.380] },
        spillVisible: true, originVisible: true, driftVisible: true
      },
      {
        step: 4,
        time: "14:15 UTC",
        title: "T4: SAR Detection & Vessel Attribution",
        narrative: "SAR detects 8.6 km² spill. OceanGuard AI ranks MT GULF GLORY with 82% evidence score.",
        activeVesselPos: { "vessel-201": [9.200, 79.380], "vessel-202": [9.220, 79.420] },
        spillVisible: true, originVisible: true, driftVisible: true
      }
    ]
  },

  "INV-2026-003": {
    id: "INV-2026-003",
    title: "Singapore Strait Traffic Separation Scheme",
    region: "SINGAPORE STRAIT (TSS)",
    center: [1.24, 103.88],
    zoom: 11,
    timestamp: "2026-08-26T06:45:00Z",
    status: "INVESTIGATION COMPLETE",
    summary: "Heavy fuel oil slick (6.2 km²) observed across the eastbound Traffic Separation Scheme lane. Reverse tracking and AIS trajectory alignment attributed highest probability to VLCC PACIFIC TITAN (Score: 89/100) during bunkering transit.",
    
    detection: {
      spillId: "SPILL-2026-SGP-03",
      satellite: "Sentinel-1B SAR",
      polarization: "VV + VH Co-polar",
      observationTime: "2026-08-26T06:45:00Z",
      center: [1.258, 103.935],
      areaKm2: 6.2,
      confidence: 0.94,
      slickType: "Heavy Bunker Fuel Oil / Persistent Dark Slick",
      spillPolygon: [
        [1.268, 103.918],
        [1.265, 103.952],
        [1.248, 103.950],
        [1.249, 103.915],
        [1.268, 103.918]
      ]
    },

    trace: {
      model: "Tidal & Surface Current Lagrangian Backtracking",
      windSpeedKts: 9.4,
      windDirectionDeg: 120,
      windHeading: "ESE (East-Southeast)",
      surfaceCurrentSpeed: "0.82 m/s (Tidal Rip)",
      currentDirectionDeg: 260,
      currentHeading: "W (Westwards Tidal Flow)",
      seaSurfaceTemp: "30.1 °C",
      waveHeight: "0.8 m",
      likelyStartTime: "2026-08-26T02:30:00Z",
      likelyEndTime: "2026-08-26T04:00:00Z",
      uncertainty: "Low (± 0.9 km high tidal resolution)",
      backtrackConfidence: 0.93,
      originCenter: [1.238, 103.845],
      originPolygon: [
        [1.250, 103.830],
        [1.252, 103.865],
        [1.225, 103.868],
        [1.222, 103.832],
        [1.250, 103.830]
      ],
      driftVector: [
        [1.238, 103.845],
        [1.245, 103.875],
        [1.252, 103.905],
        [1.258, 103.935]
      ]
    },

    vessels: [
      {
        id: "vessel-301",
        mmsi: "354009121",
        imo: "9488310",
        name: "VLCC PACIFIC TITAN",
        flag: "Panama (PA)",
        type: "Very Large Crude Carrier",
        length: "333 m",
        deadweight: "318,000 DWT",
        speedInZone: "6.1 kts (Bunkering anchorage departure)",
        closestApproachKm: 0.4,
        entryTime: "2026-08-26T02:45:00Z",
        exitTime: "2026-08-26T03:50:00Z",
        dataCompleteness: 0.96,
        rank: 1,
        overallScore: 89,
        confidenceCategory: "HIGH EVIDENCE PROBABILITY",
        isTopSuspect: true,
        evidence: {
          proximity: { score: 96, weight: 30, note: "Point-source overlap within 0.4 km of origin center" },
          timeMatch: { score: 94, weight: 25, note: "Occupied anchorage zone at exact calculated start time" },
          trajectory: { score: 85, weight: 20, note: "Maneuvering trajectory consistent with fuel line transfer leak" },
          drift: { score: 88, weight: 15, note: "Strong alignment with East-bound tidal stream propagation" },
          aisQuality: { score: 96, weight: 10, note: "High density dual terrestrial & satellite AIS stream" }
        },
        justification: "PACIFIC TITAN was maneuvering in the Western Anchorage zone immediately prior to entering the eastbound lane. Strong spatial and temporal confluence with tidal stream calculations.",
        track: [
          { lat: 1.225, lon: 103.810, time: "01:30 UTC", speed: 2.1 },
          { lat: 1.238, lon: 103.845, time: "03:00 UTC", speed: 6.1 },
          { lat: 1.248, lon: 103.890, time: "04:30 UTC", speed: 9.8 },
          { lat: 1.262, lon: 103.950, time: "06:45 UTC", speed: 13.2 }
        ]
      },
      {
        id: "vessel-302",
        mmsi: "563001889",
        imo: "9311204",
        name: "FEEDER ASIA",
        flag: "Singapore (SG)",
        type: "Feeder Container Ship",
        length: "168 m",
        deadweight: "14,200 DWT",
        speedInZone: "13.8 kts",
        closestApproachKm: 4.8,
        entryTime: "2026-08-26T03:15:00Z",
        exitTime: "2026-08-26T03:40:00Z",
        dataCompleteness: 0.91,
        rank: 2,
        overallScore: 56,
        confidenceCategory: "MODERATE PROBABILITY",
        isTopSuspect: false,
        evidence: {
          proximity: { score: 58, weight: 30, note: "Maintained standard traffic separation corridor" },
          timeMatch: { score: 70, weight: 25, note: "Transit occurred during release timeframe" },
          trajectory: { score: 52, weight: 20, note: "Uninterrupted high speed lane transit" },
          drift: { score: 50, weight: 15, note: "North of main tidal advection stream" },
          aisQuality: { score: 91, weight: 10, note: "Standard AIS class-A stream" }
        },
        justification: "Transited eastwards along normal traffic flow at steady speed without entering anchorage zone.",
        track: [
          { lat: 1.240, lon: 103.800, time: "02:40 UTC", speed: 13.7 },
          { lat: 1.250, lon: 103.860, time: "03:25 UTC", speed: 13.8 },
          { lat: 1.265, lon: 103.940, time: "04:10 UTC", speed: 13.9 }
        ]
      }
    ],

    replaySteps: [
      {
        step: 0,
        time: "01:30 UTC",
        title: "T0: Pre-Transit Bunkering Anchorage",
        narrative: "Vessels preparing for eastbound Singapore Strait passage.",
        activeVesselPos: { "vessel-301": [1.225, 103.810], "vessel-302": [1.230, 103.760] },
        spillVisible: false, originVisible: false, driftVisible: false
      },
      {
        step: 1,
        time: "03:00 UTC",
        title: "T1: Vessel Departs Bunkering Zone",
        narrative: "VLCC PACIFIC TITAN maneuvers through Western Bunkering Sector at 6.1 kts.",
        activeVesselPos: { "vessel-301": [1.238, 103.845], "vessel-302": [1.245, 103.830] },
        spillVisible: false, originVisible: true, driftVisible: false
      },
      {
        step: 2,
        time: "03:45 UTC",
        title: "T2: Potential Bunkering Disconnect Leak",
        narrative: "Probable discharge event during valve transition. Heavy fuel oil slick forms.",
        activeVesselPos: { "vessel-301": [1.242, 103.865], "vessel-302": [1.250, 103.860] },
        spillVisible: false, originVisible: true, driftVisible: true
      },
      {
        step: 3,
        time: "05:15 UTC",
        title: "T3: High Velocity Tidal Stream Drift",
        narrative: "Strong 0.82 m/s tidal stream pushes slick rapidly eastwards along fairway.",
        activeVesselPos: { "vessel-301": [1.252, 103.910], "vessel-302": [1.260, 103.900] },
        spillVisible: true, originVisible: true, driftVisible: true
      },
      {
        step: 4,
        time: "06:45 UTC",
        title: "T4: SAR Observation & Attribution",
        narrative: "High-resolution SAR detects 6.2 km² fuel slick. AI ranks VLCC PACIFIC TITAN at 89%.",
        activeVesselPos: { "vessel-301": [1.262, 103.950], "vessel-302": [1.265, 103.940] },
        spillVisible: true, originVisible: true, driftVisible: true
      }
    ]
  }
};
