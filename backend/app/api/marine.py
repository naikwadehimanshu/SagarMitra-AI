"""Marine data API routes — PFZ zones and ocean data."""
import logging
from fastapi import APIRouter
from app.agents.marine import MarineAgent

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Marine"])

agent = MarineAgent()


@router.get("/pfz")
async def get_pfz(latitude: float, longitude: float, radius_km: float = 50):
    """Get Potential Fishing Zones near a location."""
    zones = agent.get_pfz_zones(latitude, longitude, radius_km)
    return {
        "zones": [z.model_dump() if hasattr(z, 'model_dump') else z.__dict__ for z in zones],
        "count": len(zones),
        "metadata": {"source": "PFZ Intelligence (Demo)", "data_mode": "demo"},
    }


@router.get("/ocean")
async def get_ocean(latitude: float, longitude: float):
    """Get ocean conditions for a location."""
    ocean = agent.get_ocean_data(latitude, longitude)
    if not ocean:
        return {"error": "Ocean data unavailable", "data_mode": "unavailable"}
    return {
        "data": ocean.model_dump() if hasattr(ocean, 'model_dump') else ocean.__dict__,
        "metadata": {"source": ocean.source, "data_mode": ocean.data_mode},
    }
