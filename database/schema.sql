-- ============================================================================
-- OCEANGUARD AI - POSTGRESQL + POSTGIS SCHEMA (SIH26143 / SAMADHANLABS)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Investigations Table
CREATE TABLE IF NOT EXISTS investigations (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    region VARCHAR(128) NOT NULL,
    status VARCHAR(32) DEFAULT 'IN_PROGRESS',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    summary TEXT
);

-- 2. Spills Table
CREATE TABLE IF NOT EXISTS spills (
    id VARCHAR(64) PRIMARY KEY,
    investigation_id VARCHAR(64) REFERENCES investigations(id) ON DELETE CASCADE,
    observation_time TIMESTAMP WITH TIME ZONE NOT NULL,
    centroid_lat DOUBLE PRECISION NOT NULL,
    centroid_lon DOUBLE PRECISION NOT NULL,
    area_km2 DOUBLE PRECISION NOT NULL,
    confidence DOUBLE PRECISION NOT NULL,
    slick_type VARCHAR(128),
    geometry GEOMETRY(Polygon, 4326)
);

-- 3. Drift Backtracking Results
CREATE TABLE IF NOT EXISTS drift_results (
    id VARCHAR(64) PRIMARY KEY,
    spill_id VARCHAR(64) REFERENCES spills(id) ON DELETE CASCADE,
    origin_lat DOUBLE PRECISION NOT NULL,
    origin_lon DOUBLE PRECISION NOT NULL,
    likely_start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    likely_end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    uncertainty_envelope VARCHAR(64),
    confidence DOUBLE PRECISION NOT NULL,
    origin_geometry GEOMETRY(Polygon, 4326)
);

-- 4. Vessels Static Table
CREATE TABLE IF NOT EXISTS vessels (
    mmsi VARCHAR(16) PRIMARY KEY,
    imo VARCHAR(16),
    name VARCHAR(128) NOT NULL,
    flag VARCHAR(64),
    vessel_type VARCHAR(64),
    length_m DOUBLE PRECISION,
    deadweight_tonnage DOUBLE PRECISION
);

-- 5. AIS Historical Position Broadcasts
CREATE TABLE IF NOT EXISTS ais_positions (
    id BIGSERIAL PRIMARY KEY,
    mmsi VARCHAR(16) REFERENCES vessels(mmsi) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    speed_knots DOUBLE PRECISION,
    heading_deg DOUBLE PRECISION,
    geom GEOMETRY(Point, 4326)
);

-- 6. Evidence Scoring & Candidate Attribution
CREATE TABLE IF NOT EXISTS evidence_scores (
    id BIGSERIAL PRIMARY KEY,
    investigation_id VARCHAR(64) REFERENCES investigations(id) ON DELETE CASCADE,
    mmsi VARCHAR(16) REFERENCES vessels(mmsi) ON DELETE CASCADE,
    rank_order INT NOT NULL,
    overall_score DOUBLE PRECISION NOT NULL,
    proximity_score DOUBLE PRECISION NOT NULL,
    time_match_score DOUBLE PRECISION NOT NULL,
    trajectory_score DOUBLE PRECISION NOT NULL,
    drift_score DOUBLE PRECISION NOT NULL,
    ais_quality_score DOUBLE PRECISION NOT NULL,
    justification TEXT
);
