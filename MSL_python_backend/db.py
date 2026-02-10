from sqlalchemy import create_engine, Column, Integer, String, DateTime, JSONB, Float, ForeignKey, Numeric, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os
import logging

logger = logging.getLogger(__name__)

# Database configuration
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://user:password@localhost:5432/msl_db"
)

# Connection pooling for production
engine = create_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,  # Verify connections before using
    echo=os.getenv("SQL_ECHO", "False").lower() == "true"
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


class Device(Base):
    __tablename__ = "devices"
    
    id = Column(Integer, primary_key=True)
    device_hash = Column(String(64), unique=True, nullable=False)
    first_seen = Column(DateTime, default=datetime.utcnow)


class RawScan(Base):
    __tablename__ = "raw_scans"
    
    id = Column(Integer, primary_key=True)
    device_id = Column(Integer, ForeignKey("devices.id"))
    timestamp = Column(DateTime)
    cell_data = Column(JSONB)
    wifi_data = Column(JSONB)
    gps_lat = Column(Numeric(precision=10, scale=6))
    gps_lon = Column(Numeric(precision=10, scale=6))


class Location(Base):
    __tablename__ = "locations"
    
    id = Column(Integer, primary_key=True)
    centroid_lat = Column(Numeric(precision=10, scale=6))
    centroid_lon = Column(Numeric(precision=10, scale=6))
    created_at = Column(DateTime, default=datetime.utcnow)


class Fingerprint(Base):
    __tablename__ = "fingerprints"
    
    id = Column(Integer, primary_key=True)
    location_id = Column(Integer, ForeignKey("locations.id"))
    features = Column(JSONB)
    confidence = Column(Numeric(precision=5, scale=4))
    updated_at = Column(DateTime)


def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)


def get_db():
    """Get database session for dependency injection in FastAPI"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
