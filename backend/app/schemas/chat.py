from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from .common import Location, DataMetadata
from .risk import RiskAssessment
from .marine import PFZZone
from .alert import Alert
from .route import RouteResponse

class AgentActivity(BaseModel):
    agent_name: str
    status: str
    description: str
    timestamp: datetime
    duration_ms: Optional[int] = None

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    location: Optional[Location] = None
    language: Optional[str] = 'en'

class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    language: str
    agents_used: List[str]
    agent_activity: List[AgentActivity]
    risk_assessment: Optional[RiskAssessment] = None
    pfz_data: Optional[List[PFZZone]] = None
    map_layers: Optional[List[Dict[str, Any]]] = None
    recommendations: Optional[List[Dict[str, Any]]] = None
    alerts: Optional[List[Alert]] = None
    route: Optional[RouteResponse] = None
    metadata: DataMetadata
