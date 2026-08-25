from abc import ABC, abstractmethod
from typing import Dict, Any

class DataSource(ABC):
    @property
    @abstractmethod
    def name(self) -> str:
        pass

    @property
    @abstractmethod
    def source_type(self) -> str:
        pass

    @abstractmethod
    def fetch(self, lat: float, lon: float, params: Dict[str, Any] = None) -> Dict[str, Any]:
        pass

    @abstractmethod
    def health_check(self) -> bool:
        pass

    @abstractmethod
    def get_source_info(self) -> Dict[str, Any]:
        pass
