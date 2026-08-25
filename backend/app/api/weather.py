"""Weather API routes."""
import logging
from fastapi import APIRouter
from app.agents.weather import WeatherAgent

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Weather"])

agent = WeatherAgent()


@router.get("/weather")
async def get_weather(latitude: float, longitude: float):
    """Get current weather and forecast for a location."""
    current = agent.get_current_weather(latitude, longitude)
    forecast = agent.get_forecast(latitude, longitude)
    alerts = agent.check_severe_weather(latitude, longitude)

    return {
        "current": current.model_dump() if current and hasattr(current, 'model_dump') else (current.__dict__ if current else None),
        "forecast": forecast.model_dump() if forecast and hasattr(forecast, 'model_dump') else None,
        "alerts": [a.model_dump() if hasattr(a, 'model_dump') else a.__dict__ for a in alerts],
        "metadata": {
            "source": current.source if current else "unavailable",
            "data_mode": current.data_mode if current else "unavailable",
        },
    }
