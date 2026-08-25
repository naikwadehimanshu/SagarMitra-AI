"""Route planning API routes."""
import logging
from fastapi import APIRouter
from app.schemas.common import Location
from app.agents.route import RouteAgent
from app.agents.weather import WeatherAgent
from app.agents.geospatial import GeospatialAgent
from pydantic import BaseModel
from typing import Optional

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Routes"])


class RouteRequestBody(BaseModel):
    start_latitude: float
    start_longitude: float
    start_name: Optional[str] = None
    end_latitude: float
    end_longitude: float
    end_name: Optional[str] = None
    avoid_high_risk: bool = True


@router.post("/route")
async def calculate_route(req: RouteRequestBody):
    """Calculate optimized maritime route with fastest and safest options."""
    route_agent = RouteAgent()
    weather_agent = WeatherAgent()
    geo_agent = GeospatialAgent()

    start = Location(latitude=req.start_latitude, longitude=req.start_longitude, name=req.start_name)
    end = Location(latitude=req.end_latitude, longitude=req.end_longitude, name=req.end_name)

    weather = weather_agent.get_current_weather(req.start_latitude, req.start_longitude)
    geofences = geo_agent.check_geofences(req.start_latitude, req.start_longitude, radius_km=100)

    response = route_agent.calculate_route(start, end, weather, geofences)

    return response.model_dump() if hasattr(response, 'model_dump') else response.__dict__
