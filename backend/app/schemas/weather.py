from pydantic import BaseModel
from typing import List, Literal, Optional
from datetime import datetime
from .common import Coordinates

class WeatherData(BaseModel):
    latitude: float
    longitude: float
    timestamp: datetime
    temperature: float
    humidity: float
    wind_speed: float
    wind_direction: float
    precipitation: float
    cloud_cover: float
    visibility: float
    lightning_risk: Literal['none', 'low', 'moderate', 'high']
    pressure: float
    source: str
    data_mode: str

class WeatherForecast(BaseModel):
    current: WeatherData
    hourly: List[WeatherData]
    daily: List[WeatherData]

class CycloneAlert(BaseModel):
    id: str
    name: str
    category: int
    latitude: float
    longitude: float
    wind_speed: float
    pressure: float
    direction: float
    speed: float
    predicted_path: List[Coordinates]
    timestamp: datetime
    source: str
