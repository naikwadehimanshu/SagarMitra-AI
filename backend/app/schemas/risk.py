from pydantic import BaseModel
from typing import List
from datetime import datetime

class RiskFactor(BaseModel):
    name: str
    score: float
    max_score: float
    level: str
    description: str
    icon: str

class RiskAssessment(BaseModel):
    overall_score: float
    risk_level: str
    factors: List[RiskFactor]
    recommendation: str
    explanation: str
    warnings: List[str]
    timestamp: datetime
    sources: List[str]
    confidence: float
    data_mode: str
