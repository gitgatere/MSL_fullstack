from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from db import get_db, Device, RawScan, Location, Fingerprint
from fingerprint import build_feature_vector
from matching import cosine_similarity
from datetime import datetime, timedelta
from pydantic import BaseModel, Field, validator
from typing import Optional
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


# Request/Response models
class ScanRequestPayload(BaseModel):
    deviceId: str = Field(..., min_length=1, description="Unique device identifier")
    fingerprint: Optional[str] = None
    locationId: Optional[str] = None
    cellData: Optional[dict] = Field(default_factory=dict)
    wifiData: Optional[dict] = Field(default_factory=dict)
    gpsLat: Optional[float] = Field(None, ge=-90, le=90)
    gpsLon: Optional[float] = Field(None, ge=-180, le=180)

    @validator('deviceId')
    def validate_device_id(cls, v):
        if not v or not isinstance(v, str):
            raise ValueError('deviceId must be a non-empty string')
        return v


class ScanResult(BaseModel):
    id: str
    deviceId: str
    confidence: float = Field(ge=0.0, le=1.0)
    locationId: Optional[str]
    timestamp: str
    matched: bool


class DashboardStats(BaseModel):
    totalDevices: int
    presentDevices: int
    absentDevices: int
    averageConfidence: float
    recentScans: list[ScanResult]


class ApiResponse(BaseModel):
    success: bool
    data: Optional[dict] = None
    error: Optional[str] = None


# Helper functions
def find_or_create_device(db: Session, device_hash: str) -> Device:
    device = db.query(Device).filter(Device.device_hash == device_hash).first()
    if not device:
        device = Device(device_hash=device_hash, first_seen=datetime.utcnow())
        db.add(device)
        db.commit()
        db.refresh(device)
    return device


def match_scan_to_location(db: Session, scan_features: dict) -> tuple[Optional[int], float]:
    """Match scan features to closest location fingerprint"""
    fingerprints = db.query(Fingerprint).all()
    
    if not fingerprints:
        return None, 0.0
    
    best_match_location_id = None
    best_confidence = 0.0
    
    for fp in fingerprints:
        if fp.features:
            try:
                similarity = cosine_similarity(scan_features, fp.features)
                if similarity > best_confidence:
                    best_confidence = max(0.0, min(1.0, similarity))
                    best_match_location_id = fp.location_id
            except:
                continue
    
    return best_match_location_id, best_confidence


# API Routes
@router.get("/health")
def health_check():
    """Health check endpoint for deployment monitoring"""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}


@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    """Get dashboard statistics"""
    try:
        total_devices = db.query(Device).count()
        
        # Get recent scans (last 24 hours)
        one_day_ago = datetime.utcnow() - timedelta(hours=24)
        recent_scans = db.query(RawScan).filter(
            RawScan.timestamp >= one_day_ago
        ).order_by(desc(RawScan.timestamp)).limit(100).all()
        
        # Calculate stats
        present_devices = len(set(scan.device_id for scan in recent_scans)) if recent_scans else 0
        absent_devices = max(0, total_devices - present_devices)
        
        avg_confidence = 0.0
        if recent_scans:
            confidences = []
            for scan in recent_scans:
                if scan.cell_data or scan.wifi_data:
                    try:
                        features = build_feature_vector({
                            'cell_info': [{'cid': k, 'rsrp': v} for k, v in (scan.cell_data or {}).items()],
                            'wifi_info': [{'bssid': k, 'rssi': v} for k, v in (scan.wifi_data or {}).items()],
                        })
                        fingerprints = db.query(Fingerprint).all()
                        if fingerprints:
                            for fp in fingerprints:
                                if fp.features:
                                    similarity = cosine_similarity(features, fp.features)
                                    confidences.append(max(0.0, min(1.0, similarity)))
                                    break
                    except Exception as e:
                        logger.warning(f"Error processing scan {scan.id}: {str(e)}")
            
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0
        
        scan_results = []
        for scan in recent_scans[:10]:
            try:
                device = db.query(Device).filter(Device.id == scan.device_id).first()
                device_hash = device.device_hash if device else "unknown"
                
                fp_confidence = 0.0
                if scan.cell_data or scan.wifi_data:
                    features = build_feature_vector({
                        'cell_info': [{'cid': k, 'rsrp': v} for k, v in (scan.cell_data or {}).items()],
                        'wifi_info': [{'bssid': k, 'rssi': v} for k, v in (scan.wifi_data or {}).items()],
                    })
                    fingerprints = db.query(Fingerprint).all()
                    if fingerprints:
                        for fp in fingerprints:
                            if fp.features:
                                fp_confidence = max(0.0, min(1.0, cosine_similarity(features, fp.features)))
                                break
                
                scan_results.append(ScanResult(
                    id=str(scan.id),
                    deviceId=device_hash,
                    confidence=fp_confidence,
                    locationId=str(scan.id),
                    timestamp=scan.timestamp.isoformat() if scan.timestamp else datetime.utcnow().isoformat(),
                    matched=fp_confidence > 0.5
                ))
            except Exception as e:
                logger.warning(f"Error building scan result: {str(e)}")
        
        return DashboardStats(
            totalDevices=total_devices,
            presentDevices=present_devices,
            absentDevices=absent_devices,
            averageConfidence=avg_confidence,
            recentScans=scan_results
        )
    except Exception as e:
        logger.error(f"Error getting stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving statistics")


@router.get("/live")
def get_live_scans(limit: int = Query(50, ge=1, le=500), db: Session = Depends(get_db)):
    """Get live scans with optional limit"""
    try:
        recent_scans = db.query(RawScan).order_by(desc(RawScan.timestamp)).limit(limit).all()
        
        results = []
        for scan in recent_scans:
            try:
                device = db.query(Device).filter(Device.id == scan.device_id).first()
                device_hash = device.device_hash if device else "unknown"
                
                fp_confidence = 0.0
                if scan.cell_data or scan.wifi_data:
                    features = build_feature_vector({
                        'cell_info': [{'cid': k, 'rsrp': v} for k, v in (scan.cell_data or {}).items()],
                        'wifi_info': [{'bssid': k, 'rssi': v} for k, v in (scan.wifi_data or {}).items()],
                    })
                    fingerprints = db.query(Fingerprint).all()
                    if fingerprints:
                        for fp in fingerprints:
                            if fp.features:
                                fp_confidence = max(0.0, min(1.0, cosine_similarity(features, fp.features)))
                                break
                
                results.append(ScanResult(
                    id=str(scan.id),
                    deviceId=device_hash,
                    confidence=fp_confidence,
                    locationId=str(scan.id),
                    timestamp=scan.timestamp.isoformat() if scan.timestamp else datetime.utcnow().isoformat(),
                    matched=fp_confidence > 0.5
                ))
            except Exception as e:
                logger.warning(f"Error building live scan result: {str(e)}")
        
        return results
    except Exception as e:
        logger.error(f"Error getting live scans: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving live scans")


@router.post("/scan")
def submit_scan(payload: ScanRequestPayload, db: Session = Depends(get_db)):
    """Submit a new scan for processing"""
    try:
        # Find or create device
        device = find_or_create_device(db, payload.deviceId)
        
        # Build feature vector
        scan_data = {
            'cell_info': [{'cid': k, 'rsrp': v} for k, v in (payload.cellData or {}).items()],
            'wifi_info': [{'bssid': k, 'rssi': v} for k, v in (payload.wifiData or {}).items()],
        }
        
        features = build_feature_vector(scan_data)
        
        # Match to location
        location_id, confidence = match_scan_to_location(db, features)
        
        # Store raw scan
        raw_scan = RawScan(
            device_id=device.id,
            timestamp=datetime.utcnow(),
            cell_data=payload.cellData or {},
            wifi_data=payload.wifiData or {},
            gps_lat=payload.gpsLat,
            gps_lon=payload.gpsLon
        )
        db.add(raw_scan)
        db.commit()
        db.refresh(raw_scan)
        
        result = ScanResult(
            id=str(raw_scan.id),
            deviceId=payload.deviceId,
            confidence=confidence,
            locationId=str(location_id) if location_id else None,
            timestamp=raw_scan.timestamp.isoformat(),
            matched=location_id is not None
        )
        
        return ApiResponse(
            success=True,
            data=result.dict()
        )
    except ValueError as e:
        logger.warning(f"Validation error in submit_scan: {str(e)}")
        return ApiResponse(
            success=False,
            error=f"Invalid input: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Error submitting scan: {str(e)}")
        return ApiResponse(
            success=False,
            error="Error processing scan"
        )
