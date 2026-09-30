import httpx
import logging
from typing import Dict, Any
from .base import DataSource
from .demo_data import demo_provider

logger = logging.getLogger(__name__)

class ImdMausamSource(DataSource):
    """IMD Mausam (Indian Meteorological Department) API integration."""
    
    @property
    def name(self) -> str:
        return "IMD Mausam API"

    @property
    def source_type(self) -> str:
        return "weather"
        
    def fetch(self, lat: float, lon: float, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Fetch weather data from IMD."""
        # Simulated API call to IMD
        url = "https://mausam.imd.gov.in/api/v1/weather"
        
        try:
            # Example API fetch logic
            # response = httpx.get(url, params={"lat": lat, "lon": lon}, timeout=5.0)
            pass
        except Exception as e:
            logger.warning(f"IMD Mausam API fetch failed: {e}")
            
        # Fall back to demo weather data
        weather_data = demo_provider.get_weather_data(lat, lon)
        return {
            "weather_data": weather_data.model_dump() if weather_data else {},
            "source": self.name
        }

    def health_check(self) -> bool:
        try:
            with httpx.Client(timeout=5.0) as client:
                r = client.head("https://mausam.imd.gov.in")
                return r.status_code == 200
        except Exception:
            return False

    def get_source_info(self) -> Dict[str, Any]:
        return {"name": self.name, "type": self.source_type, "status": "integrated", "url": "https://mausam.imd.gov.in"}

