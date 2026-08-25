"""Map layers and data sources API."""
import logging
from fastapi import APIRouter
from app.agents.marine import MarineAgent
from app.agents.weather import WeatherAgent
from app.agents.visualization import VisualizationAgent
from app.agents.geospatial import GeospatialAgent

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Layers"])


@router.get("/layers")
async def get_layers(latitude: float = 19.076, longitude: float = 72.877):
    """Get all available map layers for a location."""
    viz = VisualizationAgent()
    marine = MarineAgent()
    weather_agent = WeatherAgent()
    geo = GeospatialAgent()

    layers = []

    # User location
    layers.append(viz.create_user_location_layer(latitude, longitude))

    # PFZ
    pfz = marine.get_pfz_zones(latitude, longitude, 50)
    if pfz:
        layers.append(viz.create_pfz_layer(pfz))

    # Ocean
    ocean = marine.get_ocean_data(latitude, longitude)
    if ocean:
        layers.append(viz.create_sst_layer(ocean))
        layers.append(viz.create_chlorophyll_layer(ocean))

    # Weather
    weather = weather_agent.get_current_weather(latitude, longitude)
    if weather:
        layers.append(viz.create_weather_layer(weather))

    # Geofences
    geofences = geo.get_all_geofences()
    if geofences:
        layers.append(viz.create_geofence_layer(geofences))

    return {
        "layers": [l.model_dump() if hasattr(l, 'model_dump') else l.__dict__ for l in layers],
        "count": len(layers),
    }


@router.get("/data-sources")
async def get_data_sources():
    """List all configured data sources and their status."""
    return {
        "sources": [
            {
                "name": "Open-Meteo Weather",
                "type": "weather",
                "status": "active",
                "mode": "live",
                "url": "https://api.open-meteo.com",
                "description": "Free weather forecast API — no key required",
            },
            {
                "name": "INCOIS PFZ Data",
                "type": "marine",
                "status": "demo",
                "mode": "demo",
                "description": "Potential Fishing Zone data (simulated for hackathon)",
            },
            {
                "name": "Ocean Observations",
                "type": "ocean",
                "status": "demo",
                "mode": "demo",
                "description": "SST, chlorophyll, wave, and current data (simulated)",
            },
            {
                "name": "Marine Weather (Open-Meteo)",
                "type": "marine_weather",
                "status": "active",
                "mode": "live",
                "url": "https://marine-api.open-meteo.com",
                "description": "Marine wave and swell data",
            },
            {
                "name": "Maritime Boundaries",
                "type": "geospatial",
                "status": "active",
                "mode": "demo",
                "description": "Restricted zones, protected areas, and boundaries (GeoJSON)",
            },
            {
                "name": "IMD Cyclone Warnings",
                "type": "alerts",
                "status": "demo",
                "mode": "demo",
                "description": "India Meteorological Department alerts (simulated)",
            },
        ]
    }
