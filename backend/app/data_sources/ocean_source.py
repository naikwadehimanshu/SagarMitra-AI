from typing import Dict, Any
from .base import DataSource
from ..schemas.marine import OceanData
from .demo_data import demo_provider

class OceanDataSource(DataSource):
    @property
    def name(self) -> str:
        return "Ocean Data Demo (INCOIS/Copernicus wrapper)"

    @property
    def source_type(self) -> str:
        return "ocean"

    def get_sst(self, lat: float, lon: float) -> float:
        return demo_provider.get_ocean_data(lat, lon).sst

    def get_chlorophyll(self, lat: float, lon: float) -> float:
        return demo_provider.get_ocean_data(lat, lon).chlorophyll

    def get_ocean_data(self, lat: float, lon: float) -> OceanData:
        return demo_provider.get_ocean_data(lat, lon)

    def fetch(self, lat: float, lon: float, params: Dict[str, Any] = None) -> Dict[str, Any]:
        return self.get_ocean_data(lat, lon).model_dump()

    def health_check(self) -> bool:
        return True

    def get_source_info(self) -> Dict[str, Any]:
        return {"name": self.name, "type": self.source_type, "status": "demo"}
