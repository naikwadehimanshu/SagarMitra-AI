from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from .common import Location, DataMetadata

class RouteWaypoint(BaseModel):
    latitude: float
    longitude: float
    risk_score: float
    weather_note: Optional[str] = None

class Route(BaseModel):
    id: str
    name: str
    waypoints: List[RouteWaypoint]
    distance_km: float
    duration_hours: float
    risk_score: float
    hazards: List[str]
    geojson: Dict[str, Any]
    route_type: str

class RouteRequest(BaseModel):
    start: Location
    end: Location
    avoid_high_risk: bool = True

class RouteResponse(BaseModel):
    routes: List[Route]
    recommendation: str
    metadata: DataMetadata
