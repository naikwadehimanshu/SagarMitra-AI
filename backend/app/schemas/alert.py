from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Alert(BaseModel):
    id: str
    type: str
    severity: str
    title: str
    description: str
    latitude: float
    longitude: float
    radius_km: float
    timestamp: datetime
    expires: Optional[datetime] = None
    source: str
    icon: str
