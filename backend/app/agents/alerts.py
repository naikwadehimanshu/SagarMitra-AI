"""Alert Agent — monitors conditions and generates proactive alerts."""
import logging
from datetime import datetime, timedelta
from typing import Optional

from app.schemas.alert import Alert
from app.schemas.weather import WeatherData
from app.schemas.marine import OceanData
from app.data_sources.demo_data import DemoDataProvider

logger = logging.getLogger(__name__)


class AlertsAgent:
    """Agent for monitoring marine conditions and generating location-aware alerts."""

    def __init__(self):
        self.provider = DemoDataProvider()

    def check_weather_alerts(self, weather: WeatherData) -> list[Alert]:
        """Generate alerts from weather conditions."""
        alerts: list[Alert] = []
        now = datetime.utcnow().isoformat()

        if weather.wind_speed > 40:
            alerts.append(Alert(
                id="alert_wind_severe", type="weather", severity="critical",
                title="⚠️ Severe Wind Warning",
                description=f"Wind speed is {weather.wind_speed} km/h — extremely dangerous for maritime activity.",
                latitude=weather.latitude, longitude=weather.longitude,
                radius_km=50, timestamp=now, source=weather.source, icon="🌬️"
            ))
        elif weather.wind_speed > 25:
            alerts.append(Alert(
                id="alert_wind_high", type="weather", severity="warning",
                title="🌬️ High Wind Advisory",
                description=f"Wind speed is {weather.wind_speed} km/h — exercise caution on water.",
                latitude=weather.latitude, longitude=weather.longitude,
                radius_km=40, timestamp=now, source=weather.source, icon="🌬️"
            ))

        if weather.precipitation > 30:
            alerts.append(Alert(
                id="alert_rain_heavy", type="weather", severity="critical",
                title="🌧️ Heavy Rain Warning",
                description=f"Rainfall at {weather.precipitation} mm — visibility and sea conditions may deteriorate.",
                latitude=weather.latitude, longitude=weather.longitude,
                radius_km=30, timestamp=now, source=weather.source, icon="🌧️"
            ))

        if weather.visibility < 3:
            alerts.append(Alert(
                id="alert_visibility", type="weather", severity="warning",
                title="🌫️ Low Visibility Warning",
                description=f"Visibility is {weather.visibility} km — navigation hazard.",
                latitude=weather.latitude, longitude=weather.longitude,
                radius_km=20, timestamp=now, source=weather.source, icon="🌫️"
            ))

        if weather.lightning_risk and weather.lightning_risk.lower() in ("high", "moderate"):
            alerts.append(Alert(
                id="alert_lightning", type="weather", severity="warning",
                title="⚡ Lightning Risk Alert",
                description=f"Lightning risk is {weather.lightning_risk} in this area. Avoid open water.",
                latitude=weather.latitude, longitude=weather.longitude,
                radius_km=40, timestamp=now, source=weather.source, icon="⚡"
            ))

        return alerts

    def check_marine_alerts(self, ocean: OceanData) -> list[Alert]:
        """Generate alerts from ocean conditions."""
        alerts: list[Alert] = []
        now = datetime.utcnow().isoformat()

        if ocean.wave_height > 3.5:
            alerts.append(Alert(
                id="alert_wave_severe", type="wave", severity="critical",
                title="🌊 Dangerous Wave Warning",
                description=f"Wave height is {ocean.wave_height}m — dangerous for small vessels.",
                latitude=ocean.latitude, longitude=ocean.longitude,
                radius_km=40, timestamp=now, source=ocean.source, icon="🌊"
            ))
        elif ocean.wave_height > 2.5:
            alerts.append(Alert(
                id="alert_wave_high", type="wave", severity="warning",
                title="🌊 High Wave Advisory",
                description=f"Wave height is {ocean.wave_height}m — caution advised.",
                latitude=ocean.latitude, longitude=ocean.longitude,
                radius_km=30, timestamp=now, source=ocean.source, icon="🌊"
            ))

        if ocean.sea_state in ("rough", "very_rough"):
            alerts.append(Alert(
                id="alert_sea_state", type="wave", severity="warning",
                title="🌊 Rough Sea State",
                description=f"Sea state is {ocean.sea_state}. Not suitable for small vessels.",
                latitude=ocean.latitude, longitude=ocean.longitude,
                radius_km=30, timestamp=now, source=ocean.source, icon="🌊"
            ))

        return alerts

    def check_cyclone_alerts(self) -> list[Alert]:
        """Check for active cyclone alerts (demo data)."""
        return self.provider.get_alerts()

    def get_active_alerts(self, lat: float, lon: float,
                          radius_km: float = 100) -> list[Alert]:
        """Get all active alerts near a location."""
        all_alerts: list[Alert] = []

        # Get demo/preconfigured alerts
        demo_alerts = self.provider.get_alerts()
        all_alerts.extend(demo_alerts)

        # Sort by severity (critical first)
        severity_order = {"critical": 0, "warning": 1, "info": 2}
        all_alerts.sort(key=lambda a: severity_order.get(a.severity, 3))

        return all_alerts

    def get_pfz_alerts(self, pfz_zones: list) -> list[Alert]:
        """Generate positive alerts for high-potential fishing zones."""
        alerts = []
        for zone in pfz_zones[:3]:
            if hasattr(zone, 'suitability_score') and zone.suitability_score > 80:
                alerts.append(Alert(
                    id=f"alert_pfz_{zone.id}", type="advisory", severity="info",
                    title="🎣 High-Potential Fishing Zone",
                    description=f"{zone.name} has a suitability score of {zone.suitability_score}/100.",
                    latitude=zone.latitude, longitude=zone.longitude,
                    radius_km=10, timestamp=datetime.utcnow().isoformat(),
                    source="PFZ Intelligence", icon="🎣"
                ))
        return alerts
