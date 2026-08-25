from pydantic import BaseModel
from typing import Dict, Any
from .common import Location

class Geofence(BaseModel):
    id: str
    name: str
    type: str
    description: str
    geometry: Dict[str, Any]
    restriction_level: str
    reason: str
    source: str

class GeofenceAlert(BaseModel):
    geofence: Geofence
    distance_km: float
    user_location: Location
    message: str
