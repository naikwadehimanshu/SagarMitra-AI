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
async def get_layers(latitude: float = 19.0, longitude: float = 72.5):
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
    from app.data_sources import (
        IncoisPFZSource,
        MosdacSource,
        CmemsSource,
        ImdMausamSource,
        OpenMeteoMarineSource,
        MarineRegionsSource
    )
    
    # Initialize sources
    sources = [
        IncoisPFZSource(),
        MosdacSource(),
        CmemsSource(),
        ImdMausamSource(),
        OpenMeteoMarineSource(),
        MarineRegionsSource()
    ]
    
    results = []
    for source in sources:
        info = source.get_source_info()
        info["health"] = "healthy" if source.health_check() else "unreachable"
        results.append(info)
        
    return {
        "sources": results
    }
