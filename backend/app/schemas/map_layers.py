from pydantic import BaseModel
from typing import Optional, Dict, Any

class MapLayer(BaseModel):
    id: str
    name: str
    type: str
    visible: bool
    data: Dict[str, Any]
    style: Optional[Dict[str, Any]] = None
    source_name: str
