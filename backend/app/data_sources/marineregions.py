import httpx
import logging
from typing import Dict, Any
from .base import DataSource

logger = logging.getLogger(__name__)

class MarineRegionsSource(DataSource):
    """Marine Regions API (marineregions.org) integration for gazetteer and maritime boundaries."""
    
    @property
    def name(self) -> str:
        return "Marine Regions API"

    @property
    def source_type(self) -> str:
        return "gazetteer"
        
    def fetch(self, lat: float, lon: float, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Fetch marine region information for given coordinates."""
        # Using marineregions.org REST API to get region by lat/lon
        url = f"https://marineregions.org/rest/getGazetteerRecordsByLatLong.json/{lat}/{lon}/"
        
        try:
            with httpx.Client(timeout=8.0) as client:
                response = client.get(url)
                response.raise_for_status()
                data = response.json()
                return {"regions": data, "source": self.name}
        except Exception as e:
            logger.warning(f"Marine Regions API fetch failed: {e}")
            
        return {"regions": [], "source": self.name, "error": "Fetch failed or no data"}

    def health_check(self) -> bool:
        try:
            with httpx.Client(timeout=5.0) as client:
                r = client.head("https://marineregions.org")
                return r.status_code == 200
        except Exception:
            return False

    def get_source_info(self) -> Dict[str, Any]:
        return {"name": self.name, "type": self.source_type, "status": "integrated", "url": "https://marineregions.org"}

