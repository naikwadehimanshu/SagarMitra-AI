"""Visualization Agent — generates map layers from analysis results."""
import logging
from typing import Optional

from app.schemas.map_layers import MapLayer
from app.schemas.marine import OceanData, PFZZone
from app.schemas.weather import WeatherData
from app.schemas.geofence import Geofence
from app.schemas.route import Route

logger = logging.getLogger(__name__)


class VisualizationAgent:
    """Agent that converts analytical results into GeoJSON map layers."""

    def create_pfz_layer(self, pfz_zones: list[PFZZone]) -> MapLayer:
        """Create a marker layer for PFZ zones."""
        features = []
        for zone in pfz_zones:
            features.append({
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [zone.longitude, zone.latitude]},
                "properties": {
                    "id": zone.id,
                    "name": zone.name,
                    "suitability_score": zone.suitability_score,
                    "sst": zone.sst,
                    "chlorophyll": zone.chlorophyll,
                    "distance_km": zone.distance_km,
                    "direction": zone.direction,
                    "sea_state": zone.sea_state,
                    "weather_risk": zone.weather_risk,
                    "marker_color": self._score_to_color(zone.suitability_score),
                    "marker_size": 12,
                    "icon": "🐟",
                },
            })

        return MapLayer(
            id="pfz_zones", name="Potential Fishing Zones", type="marker",
            visible=True,
            data={"type": "FeatureCollection", "features": features},
            style={"color": "#00d4ff", "size": 12},
            source_name="PFZ Intelligence",
        )

    def create_weather_layer(self, weather: WeatherData) -> MapLayer:
        """Create a weather information overlay."""
        features = [{
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [weather.longitude, weather.latitude]},
            "properties": {
                "temperature": weather.temperature,
                "wind_speed": weather.wind_speed,
                "wind_direction": weather.wind_direction,
                "precipitation": weather.precipitation,
                "visibility": weather.visibility,
                "humidity": weather.humidity,
                "cloud_cover": weather.cloud_cover,
            },
        }]
        return MapLayer(
            id="weather_overlay", name="Weather Conditions", type="marker",
            visible=False,
            data={"type": "FeatureCollection", "features": features},
            style={"color": "#f59e0b"},
            source_name="Weather Service",
        )

    def create_risk_layer(self, lat: float, lon: float, risk_score: int,
                          risk_level: str) -> MapLayer:
        """Create a risk zone circle overlay."""
        # Create a circle approximation as polygon
        features = [{
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [lon, lat]},
            "properties": {
                "risk_score": risk_score,
                "risk_level": risk_level,
                "radius_km": 30,
                "color": self._risk_color(risk_level),
                "opacity": 0.2,
            },
        }]
        return MapLayer(
            id="risk_zone", name="Risk Assessment Zone", type="circle",
            visible=True,
            data={"type": "FeatureCollection", "features": features},
            style={"color": self._risk_color(risk_level), "opacity": 0.2, "radius": 30000},
            source_name="Risk Engine",
        )

    def create_route_layer(self, routes: list[Route]) -> MapLayer:
        """Create route line layers."""
        features = []
        for route in routes:
            if route.geojson:
                features.append(route.geojson)
        return MapLayer(
            id="routes", name="Maritime Routes", type="line",
            visible=True,
            data={"type": "FeatureCollection", "features": features},
            style={"width": 3},
            source_name="Route Engine",
        )

    def create_geofence_layer(self, geofences: list[Geofence]) -> MapLayer:
        """Create geofence polygon layer."""
        features = []
        for gf in geofences:
            features.append({
                "type": "Feature",
                "geometry": gf.geometry,
                "properties": {
                    "name": gf.name,
                    "type": gf.type,
                    "restriction_level": gf.restriction_level,
                    "reason": gf.reason,
                    "color": "#ef4444" if gf.restriction_level == "prohibited" else "#f59e0b",
                    "opacity": 0.3,
                },
            })
        return MapLayer(
            id="geofences", name="Restricted / Protected Zones", type="polygon",
            visible=True,
            data={"type": "FeatureCollection", "features": features},
            style={"color": "#ef4444", "opacity": 0.2},
            source_name="Maritime Boundaries",
        )

    def create_sst_layer(self, ocean_data: OceanData) -> MapLayer:
        """Create SST heatmap visualization."""
        features = [{
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [ocean_data.longitude, ocean_data.latitude]},
            "properties": {
                "sst": ocean_data.sst,
                "intensity": (ocean_data.sst - 20) / 15,  # Normalize
                "label": f"{ocean_data.sst}°C",
            },
        }]
        return MapLayer(
            id="sst_heatmap", name="Sea Surface Temperature", type="heatmap",
            visible=False,
            data={"type": "FeatureCollection", "features": features},
            style={"color_range": ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444"]},
            source_name="Ocean Observations",
        )

    def create_chlorophyll_layer(self, ocean_data: OceanData) -> MapLayer:
        """Create chlorophyll concentration visualization."""
        features = [{
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [ocean_data.longitude, ocean_data.latitude]},
            "properties": {
                "chlorophyll": ocean_data.chlorophyll,
                "intensity": min(1.0, ocean_data.chlorophyll / 3.0),
                "label": f"{ocean_data.chlorophyll} mg/m³",
            },
        }]
        return MapLayer(
            id="chlorophyll_heatmap", name="Chlorophyll Concentration", type="heatmap",
            visible=False,
            data={"type": "FeatureCollection", "features": features},
            style={"color_range": ["#1e3a5f", "#059669", "#22c55e", "#84cc16"]},
            source_name="Satellite Observations",
        )

    def create_user_location_layer(self, lat: float, lon: float, name: str = "Your Location") -> MapLayer:
        """Create user location marker."""
        features = [{
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [lon, lat]},
            "properties": {"name": name, "icon": "📍", "marker_color": "#00d4ff"},
        }]
        return MapLayer(
            id="user_location", name="Your Location", type="marker",
            visible=True,
            data={"type": "FeatureCollection", "features": features},
            style={"color": "#00d4ff", "size": 14},
            source_name="User",
        )

    @staticmethod
    def _score_to_color(score: float) -> str:
        if score >= 80:
            return "#22c55e"
        elif score >= 60:
            return "#f59e0b"
        elif score >= 40:
            return "#f97316"
        else:
            return "#ef4444"

    @staticmethod
    def _risk_color(level: str) -> str:
        return {
            "LOW": "#22c55e",
            "MODERATE": "#f59e0b",
            "HIGH": "#f97316",
            "EXTREME": "#ef4444",
        }.get(level, "#94a3b8")
