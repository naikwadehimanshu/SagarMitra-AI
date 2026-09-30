import httpx
import logging
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from .base import DataSource
from ..schemas.marine import OceanData
from .demo_data import demo_provider

logger = logging.getLogger(__name__)

class OpenMeteoMarineSource(DataSource):
    """Open-Meteo Marine API integration for wave and swell data."""
    
    @property
    def name(self) -> str:
        return "Open-Meteo Marine API"

    @property
    def source_type(self) -> str:
        return "ocean"
        
    def fetch(self, lat: float, lon: float, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Fetch marine/wave data from Open-Meteo Marine API."""
        url = "https://marine-api.open-meteo.com/v1/marine"
        api_params = {
            "latitude": lat,
            "longitude": lon,
            "current": "wave_height,wave_direction,wave_period",
            "timezone": "auto"
        }
        
        try:
            with httpx.Client(timeout=8.0) as client:
                response = client.get(url, params=api_params)
                response.raise_for_status()
                data = response.json()
                
                current = data.get("current", {})
                
                ocean = OceanData(
                    latitude=lat,
                    longitude=lon,
                    timestamp=datetime.now(timezone.utc),
                    sst=28.0, # Not provided by this specific endpoint, using default
                    chlorophyll=0.5, # Not provided
                    wave_height=current.get("wave_height", 1.0),
                    wave_period=current.get("wave_period", 5.0),
                    wave_direction=current.get("wave_direction", 180.0),
                    current_speed=0.5, # Not provided
                    current_direction=180.0, # Not provided
                    sea_state="Moderate",
                    source=self.name,
                    data_mode="live"
                )
                return ocean.model_dump()
        except Exception as e:
            logger.warning(f"Open-Meteo Marine API fetch failed: {e}")
            
        # Fall back to demo ocean data
        ocean_data = demo_provider.get_ocean_data(lat, lon)
        return ocean_data.model_dump() if ocean_data else {}

    def health_check(self) -> bool:
        try:
            with httpx.Client(timeout=5.0) as client:
                r = client.get("https://marine-api.open-meteo.com/v1/marine?latitude=0&longitude=0&current=wave_height")
                return r.status_code == 200
        except Exception:
            return False

    def get_source_info(self) -> Dict[str, Any]:
        return {"name": self.name, "type": self.source_type, "status": "active", "mode": "live", "url": "https://marine-api.open-meteo.com"}

