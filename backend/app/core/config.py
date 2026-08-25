from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional
from pathlib import Path

class Settings(BaseSettings):
    APP_NAME: str = "SagarMitra AI"
    DEBUG: bool = False
    DEMO_MODE: bool = True
    
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000
    
    CORS_ORIGINS: List[str] = ["*"]
    
    LLM_PROVIDER: str = "mock"  # openai, gemini, mock
    OPENAI_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    
    DATABASE_URL: str = "sqlite+aiosqlite:///./sagarmitra.db"
    REDIS_URL: Optional[str] = None
    
    OPEN_METEO_ENABLED: bool = True
    
    DATA_DIR: Path = Path(__file__).parent.parent.parent.parent / "data"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
