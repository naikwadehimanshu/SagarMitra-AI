"""Geofence API routes."""
import logging
from fastapi import APIRouter
from app.agents.geospatial import GeospatialAgent

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Geofence"])


@router.get("/geofences")
async def get_geofences(latitude: float, longitude: float, radius_km: float = 50):
    """Get restricted/protected zones near a location."""
    agent = GeospatialAgent()
    alerts = agent.check_geofences(latitude, longitude, radius_km)
    all_zones = agent.get_all_geofences()

    return {
        "geofences": [gf.model_dump() if hasattr(gf, 'model_dump') else gf.__dict__ for gf in all_zones],
        "alerts": [
            {
                "geofence": ga.geofence.model_dump() if hasattr(ga.geofence, 'model_dump') else ga.geofence.__dict__,
                "distance_km": ga.distance_km,
                "message": ga.message,
            }
            for ga in alerts
        ],
        "count": len(all_zones),
    }
