"""Safety & risk API routes."""
import logging
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.agents.weather import WeatherAgent
from app.agents.marine import MarineAgent
from app.agents.risk import RiskAgent
from app.agents.alerts import AlertsAgent
from app.agents.geospatial import GeospatialAgent

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Safety"])


class RiskRequest(BaseModel):
    latitude: float
    longitude: float
    datetime_str: Optional[str] = None


@router.post("/risk-assessment")
async def calculate_risk(req: RiskRequest):
    """Calculate comprehensive marine safety risk assessment."""
    weather_agent = WeatherAgent()
    marine_agent = MarineAgent()
    risk_agent = RiskAgent()
    geo_agent = GeospatialAgent()
    alerts_agent = AlertsAgent()

    weather = weather_agent.get_current_weather(req.latitude, req.longitude)
    ocean = marine_agent.get_ocean_data(req.latitude, req.longitude)
    alerts = alerts_agent.get_active_alerts(req.latitude, req.longitude)
    geofences = geo_agent.check_geofences(req.latitude, req.longitude)

    if weather:
        alerts.extend(alerts_agent.check_weather_alerts(weather))
    if ocean:
        alerts.extend(alerts_agent.check_marine_alerts(ocean))

    assessment = risk_agent.assess_risk(weather, ocean, alerts, geofences)

    return assessment.model_dump() if hasattr(assessment, 'model_dump') else assessment.__dict__


@router.get("/alerts")
async def get_alerts(latitude: float, longitude: float, radius_km: float = 100):
    """Get active alerts near a location."""
    alerts_agent = AlertsAgent()
    weather_agent = WeatherAgent()
    marine_agent = MarineAgent()

    all_alerts = alerts_agent.get_active_alerts(latitude, longitude, radius_km)

    weather = weather_agent.get_current_weather(latitude, longitude)
    if weather:
        all_alerts.extend(alerts_agent.check_weather_alerts(weather))

    ocean = marine_agent.get_ocean_data(latitude, longitude)
    if ocean:
        all_alerts.extend(alerts_agent.check_marine_alerts(ocean))

    return {
        "alerts": [a.model_dump() if hasattr(a, 'model_dump') else a.__dict__ for a in all_alerts],
        "count": len(all_alerts),
    }
