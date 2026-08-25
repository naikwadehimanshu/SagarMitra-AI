from typing import Dict, Any, List, Optional
from geopy.distance import geodesic
from .base import DataSource
from ..schemas.marine import PFZZone
from .demo_data import demo_provider

class PFZDataSource(DataSource):
    @property
    def name(self) -> str:
        return "PFZ Demo Data"

    @property
    def source_type(self) -> str:
        return "pfz"

    def get_pfz_zones(self, lat: float, lon: float, radius_km: float = 50.0) -> List[PFZZone]:
        return demo_provider.get_nearest_pfz_zones(lat, lon, radius_km)

    def get_nearest_pfz(self, lat: float, lon: float) -> Optional[PFZZone]:
        zones = self.get_pfz_zones(lat, lon, radius_km=1000.0)
        if zones:
            return zones[0]
        return None

    def fetch(self, lat: float, lon: float, params: Dict[str, Any] = None) -> Dict[str, Any]:
        radius = params.get("radius_km", 50.0) if params else 50.0
        return {"zones": [z.model_dump() for z in self.get_pfz_zones(lat, lon, radius)]}

    def health_check(self) -> bool:
        return True

    def get_source_info(self) -> Dict[str, Any]:
        return {"name": self.name, "type": self.source_type, "status": "demo"}
