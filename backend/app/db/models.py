"""
OceanGuard AI - SQLAlchemy Database Models (SQLite / PostgreSQL)
SIH26143 / SamadhanLabs Architecture
"""

from sqlalchemy import Column, String, Float, Integer, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from backend.app.db.session import Base


class InvestigationModel(Base):
    """Stores high-level marine incident investigations."""
    __tablename__ = "investigations"

    id = Column(String(64), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    region = Column(String(128), nullable=False)
    status = Column(String(32), default="IN_PROGRESS")
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    spills = relationship("SpillModel", back_populates="investigation", cascade="all, delete-orphan")
    evidence_scores = relationship("EvidenceScoreModel", back_populates="investigation", cascade="all, delete-orphan")


class SpillModel(Base):
    """Stores SAR detected oil slick metadata and polygon geometry."""
    __tablename__ = "spills"

    id = Column(String(64), primary_key=True, index=True)
    investigation_id = Column(String(64), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False)
    observation_time = Column(DateTime, nullable=False)
    centroid_lat = Column(Float, nullable=False)
    centroid_lon = Column(Float, nullable=False)
    area_km2 = Column(Float, nullable=False)
    confidence = Column(Float, nullable=False)
    slick_type = Column(String(128), nullable=True)
    geometry_json = Column(JSON, nullable=True)  # GeoJSON coordinates array

    # Relationships
    investigation = relationship("InvestigationModel", back_populates="spills")
    drift_result = relationship("DriftResultModel", uselist=False, back_populates="spill", cascade="all, delete-orphan")


class DriftResultModel(Base):
    """Stores Lagrangian reverse drift backtracking outputs."""
    __tablename__ = "drift_results"

    id = Column(String(64), primary_key=True, index=True)
    spill_id = Column(String(64), ForeignKey("spills.id", ondelete="CASCADE"), nullable=False, unique=True)
    origin_lat = Column(Float, nullable=False)
    origin_lon = Column(Float, nullable=False)
    likely_start_time = Column(DateTime, nullable=False)
    likely_end_time = Column(DateTime, nullable=False)
    uncertainty_envelope = Column(String(64), nullable=True)
    confidence = Column(Float, nullable=False)
    origin_polygon_json = Column(JSON, nullable=True)
    drift_vector_json = Column(JSON, nullable=True)

    # Relationships
    spill = relationship("SpillModel", back_populates="drift_result")


class VesselModel(Base):
    """Stores vessel registry metadata."""
    __tablename__ = "vessels"

    mmsi = Column(String(16), primary_key=True, index=True)
    imo = Column(String(16), index=True)
    name = Column(String(128), nullable=False)
    flag = Column(String(64))
    vessel_type = Column(String(64))
    length_m = Column(Float, nullable=True)
    deadweight_tonnage = Column(Float, nullable=True)

    # Relationships
    positions = relationship("AISPositionModel", back_populates="vessel", cascade="all, delete-orphan")
    evidence_scores = relationship("EvidenceScoreModel", back_populates="vessel", cascade="all, delete-orphan")


class AISPositionModel(Base):
    """Stores historical AIS position broadcasts and trajectory waypoints."""
    __tablename__ = "ais_positions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    mmsi = Column(String(16), ForeignKey("vessels.mmsi", ondelete="CASCADE"), nullable=False, index=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    speed_knots = Column(Float, nullable=True)
    heading_deg = Column(Float, nullable=True)

    # Relationships
    vessel = relationship("VesselModel", back_populates="positions")


class EvidenceScoreModel(Base):
    """Stores multi-factor evidence fusion and ML model rankings."""
    __tablename__ = "evidence_scores"

    id = Column(Integer, primary_key=True, autoincrement=True)
    investigation_id = Column(String(64), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False, index=True)
    mmsi = Column(String(16), ForeignKey("vessels.mmsi", ondelete="CASCADE"), nullable=False, index=True)
    rank_order = Column(Integer, nullable=False)
    overall_score = Column(Float, nullable=False)
    proximity_score = Column(Float, nullable=False)
    time_match_score = Column(Float, nullable=False)
    trajectory_score = Column(Float, nullable=False)
    drift_score = Column(Float, nullable=False)
    ais_quality_score = Column(Float, nullable=False)
    justification = Column(Text, nullable=True)

    # Relationships
    investigation = relationship("InvestigationModel", back_populates="evidence_scores")
    vessel = relationship("VesselModel", back_populates="evidence_scores")
