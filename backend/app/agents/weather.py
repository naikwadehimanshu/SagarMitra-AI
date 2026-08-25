"""Weather Intelligence Agent — retrieves and analyzes weather conditions."""
import logging
from typing import Optional

from app.schemas.weather import WeatherData, WeatherForecast
from app.schemas.alert import Alert
from app.data_sources.demo_data import DemoDataProvider
from app.data_sources.weather_source import OpenMeteoSource

logger = logging.getLogger(__name__)


class WeatherAgent:
    """Agent for fetching weather data, forecasts, and severe weather alerts.

    Tries real Open-Meteo API first, falls back to demo data.
    """

    def __init__(self):
        self.live_source = OpenMeteoSource()
        self.demo_provider = DemoDataProvider()

    def get_current_weather(self, lat: float, lon: float) -> Optional[WeatherData]:
        """Get current weather — tries live API, falls back to demo."""
        try:
            data = self.live_source.get_current_weather(lat, lon)
            if data:
                logger.info("Live weather retrieved for (%.3f, %.3f)", lat, lon)
                return data
        except Exception as e:
            logger.warning("Live weather failed, using demo: %s", e)

        try:
            return self.demo_provider.get_weather_data(lat, lon)
        except Exception as e:
            logger.error("Demo weather also failed: %s", e)
            return None

    def get_forecast(self, lat: float, lon: float, hours: int = 48) -> Optional[WeatherForecast]:
        """Get weather forecast."""
        try:
            forecast = self.live_source.get_forecast(lat, lon, hours)
            if forecast:
                return forecast
        except Exception:
            pass

        # Fallback: create forecast from demo data
        current = self.demo_provider.get_weather_data(lat, lon)
        if current:
            return WeatherForecast(current=current, hourly=[], daily=[])
        return None

    def check_severe_weather(self, lat: float, lon: float) -> list[Alert]:
        """Check for severe weather conditions that warrant alerts."""
        weather = self.get_current_weather(lat, lon)
        if not weather:
            return []

        alerts: list[Alert] = []

        if weather.wind_speed > 40:
            alerts.append(Alert(
                id="sw_wind_high", type="weather", severity="critical",
                title="⚠️ Very High Wind Warning",
                description=f"Wind speed is {weather.wind_speed} km/h — dangerous for small vessels.",
                latitude=lat, longitude=lon, radius_km=50,
                timestamp=weather.timestamp, source=weather.source, icon="🌬️"
            ))
        elif weather.wind_speed > 25:
            alerts.append(Alert(
                id="sw_wind_mod", type="weather", severity="warning",
                title="🌬️ Strong Wind Advisory",
                description=f"Wind speed is {weather.wind_speed} km/h — exercise caution.",
                latitude=lat, longitude=lon, radius_km=50,
                timestamp=weather.timestamp, source=weather.source, icon="🌬️"
            ))

        if weather.precipitation > 30:
            alerts.append(Alert(
                id="sw_rain_heavy", type="weather", severity="critical",
                title="🌧️ Heavy Rainfall Warning",
                description=f"Precipitation at {weather.precipitation} mm — reduced visibility expected.",
                latitude=lat, longitude=lon, radius_km=30,
                timestamp=weather.timestamp, source=weather.source, icon="🌧️"
            ))
        elif weather.precipitation > 15:
            alerts.append(Alert(
                id="sw_rain_mod", type="weather", severity="warning",
                title="🌧 Moderate Rain",
                description=f"Precipitation at {weather.precipitation} mm.",
                latitude=lat, longitude=lon, radius_km=30,
                timestamp=weather.timestamp, source=weather.source, icon="🌧"
            ))

        if weather.visibility < 3:
            alerts.append(Alert(
                id="sw_vis_low", type="weather", severity="critical",
                title="🌫️ Very Low Visibility",
                description=f"Visibility is only {weather.visibility} km — navigation hazard.",
                latitude=lat, longitude=lon, radius_km=20,
                timestamp=weather.timestamp, source=weather.source, icon="🌫️"
            ))

        if weather.lightning_risk in ("high", "moderate"):
            alerts.append(Alert(
                id="sw_lightning", type="weather", severity="warning",
                title="⚡ Lightning Risk",
                description=f"Lightning risk is {weather.lightning_risk} in this area.",
                latitude=lat, longitude=lon, radius_km=40,
                timestamp=weather.timestamp, source=weather.source, icon="⚡"
            ))

        return alerts

    def get_weather_summary(self, lat: float, lon: float) -> dict:
        """Comprehensive weather summary for a location."""
        current = self.get_current_weather(lat, lon)
        alerts = self.check_severe_weather(lat, lon)
        forecast = self.get_forecast(lat, lon)

        return {
            "current": current,
            "forecast": forecast,
            "alerts": alerts,
            "alert_count": len(alerts),
            "has_severe_weather": any(a.severity == "critical" for a in alerts),
        }
