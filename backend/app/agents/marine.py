"""Marine Data Agent — retrieves ocean data, PFZ zones, and marine observations."""
import logging
from typing import Optional

from app.schemas.marine import OceanData, PFZZone
from app.schemas.common import DataMetadata
from app.data_sources.demo_data import DemoDataProvider
from app.tools.calculations import haversine_distance, bearing, bearing_to_cardinal

logger = logging.getLogger(__name__)


class MarineAgent:
    """Agent responsible for discovering and retrieving marine datasets.

    Handles SST, chlorophyll, ocean currents, wave data, sea-state,
    PFZ information, and marine advisories.
    """

    def __init__(self):
        self.provider = DemoDataProvider()

    def get_ocean_data(self, lat: float, lon: float) -> Optional[OceanData]:
        """Retrieve ocean conditions for a location."""
        try:
            data = self.provider.get_ocean_data(lat, lon)
            logger.info("Ocean data retrieved for (%.3f, %.3f)", lat, lon)
            return data
        except Exception as e:
            logger.error("Failed to get ocean data: %s", e)
            return None

    def get_pfz_zones(self, lat: float, lon: float,
                      radius_km: float = 50.0) -> list[PFZZone]:
        """Retrieve PFZ zones near a location with distance/direction info."""
        try:
            zones = self.provider.get_pfz_zones(lat, lon, radius_km)
            # Enrich with distance and direction from user
            enriched = []
            for zone in zones:
                dist = haversine_distance(lat, lon, zone.latitude, zone.longitude)
                bear = bearing(lat, lon, zone.latitude, zone.longitude)
                cardinal = bearing_to_cardinal(bear)
                zone_dict = zone.model_dump() if hasattr(zone, 'model_dump') else zone.__dict__.copy()
                zone_dict["distance_km"] = round(dist, 1)
                zone_dict["direction"] = cardinal
                enriched.append(PFZZone(**zone_dict))
            # Sort by suitability score (descending)
            enriched.sort(key=lambda z: z.suitability_score, reverse=True)
            logger.info("Found %d PFZ zones near (%.3f, %.3f)", len(enriched), lat, lon)
            return enriched
        except Exception as e:
            logger.error("Failed to get PFZ zones: %s", e)
            return []

    def get_nearest_pfz(self, lat: float, lon: float) -> Optional[PFZZone]:
        """Get the single nearest PFZ zone."""
        zones = self.get_pfz_zones(lat, lon, radius_km=100)
        if not zones:
            return None
        return min(zones, key=lambda z: z.distance_km or float("inf"))

    def get_marine_summary(self, lat: float, lon: float) -> dict:
        """Get a comprehensive marine summary for a location."""
        ocean = self.get_ocean_data(lat, lon)
        pfz = self.get_pfz_zones(lat, lon, radius_km=50)

        return {
            "ocean_data": ocean,
            "pfz_zones": pfz,
            "pfz_count": len(pfz),
            "nearest_pfz": pfz[0] if pfz else None,
        }
