import httpx
import logging
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from .base import DataSource
from ..schemas.weather import WeatherData, WeatherForecast
from .demo_data import DemoDataProvider

logger = logging.getLogger(__name__)


class OpenMeteoSource(DataSource):
    """Open-Meteo weather API source (free, no key required)."""

    @property
    def name(self) -> str:
        return "Open-Meteo"

    @property
    def source_type(self) -> str:
        return "weather"

    def get_current_weather(self, lat: float, lon: float) -> Optional[WeatherData]:
        """Fetch current weather (synchronous). Falls back to demo data."""
        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": lat,
            "longitude": lon,
            "current": "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,wind_direction_10m,cloud_cover,surface_pressure",
            "timezone": "auto",
        }

        try:
            with httpx.Client(timeout=8.0) as client:
                response = client.get(url, params=params)
                response.raise_for_status()
                data = response.json()

                current = data.get("current", {})

                return WeatherData(
                    latitude=lat,
                    longitude=lon,
                    timestamp=datetime.now(timezone.utc),
                    temperature=current.get("temperature_2m", 28.0),
                    humidity=current.get("relative_humidity_2m", 75.0),
                    wind_speed=current.get("wind_speed_10m", 15.0),
                    wind_direction=current.get("wind_direction_10m", 180.0),
                    precipitation=current.get("precipitation", 0.0),
                    cloud_cover=current.get("cloud_cover", 50.0),
                    visibility=10.0,  # Not in Open-Meteo current
                    lightning_risk="low",
                    pressure=current.get("surface_pressure", 1013.0),
                    source="Open-Meteo (Live)",
                    data_mode="live",
                )
        except Exception as e:
            logger.warning("Open-Meteo fetch failed, using demo data: %s", e)
            return DemoDataProvider().get_weather_data(lat, lon)

    def get_forecast(self, lat: float, lon: float, hours: int = 48) -> Optional[WeatherForecast]:
        """Fetch weather forecast. Falls back to demo data."""
        current = self.get_current_weather(lat, lon)
        if not current:
            return None
        # Simplified: return current as forecast basis
        return WeatherForecast(current=current, hourly=[], daily=[])

    def fetch(self, lat: float, lon: float, params: Dict[str, Any] = None) -> Dict[str, Any]:
        weather = self.get_current_weather(lat, lon)
        if weather:
            return weather.model_dump() if hasattr(weather, 'model_dump') else {}
        return {}

    def health_check(self) -> bool:
        try:
            with httpx.Client(timeout=5.0) as client:
                r = client.get("https://api.open-meteo.com/v1/forecast?latitude=0&longitude=0&current=temperature_2m")
                return r.status_code == 200
        except Exception:
            return False

    def get_source_info(self) -> Dict[str, Any]:
        return {"name": self.name, "type": self.source_type, "status": "active", "mode": "live"}

