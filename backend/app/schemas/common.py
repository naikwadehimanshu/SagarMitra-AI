from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime

class Location(BaseModel):
    latitude: float
    longitude: float
    name: Optional[str] = None

class TimeRange(BaseModel):
    start: datetime
    end: datetime

class DataMetadata(BaseModel):
    source: str
    timestamp: datetime
    data_mode: Literal['live', 'demo', 'forecast', 'historical']
    confidence: float = 0.8

class Coordinates(BaseModel):
    latitude: float
    longitude: float
