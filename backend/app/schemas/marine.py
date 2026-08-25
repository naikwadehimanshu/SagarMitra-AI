from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class MarineObservation(BaseModel):
    latitude: float
    longitude: float
    timestamp: datetime
    parameter: str
    value: float
    unit: str
    source: str
    confidence: float
    metadata: Dict[str, Any]

class OceanData(BaseModel):
    latitude: float
    longitude: float
    timestamp: datetime
    sst: float
    chlorophyll: float
    wave_height: float
    wave_period: float
    wave_direction: float
    current_speed: float
    current_direction: float
    sea_state: str
    salinity: Optional[float] = None
    source: str
    data_mode: str

class PFZZone(BaseModel):
    id: str
    name: str
    latitude: float
    longitude: float
    timestamp: datetime
    confidence: float
    source: str
    suitability_score: int
    sst: float
    chlorophyll: float
    distance_km: Optional[float] = None
    direction: Optional[str] = None
    weather_risk: Optional[str] = None
    sea_state: Optional[str] = None
    fish_species: Optional[List[str]] = None
