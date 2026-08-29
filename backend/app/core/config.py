from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "OceanGuard AI"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    BACKEND_CORS_ORIGINS: List[str] = ["*"]
    DATABASE_URL: str = "sqlite:///./oceanguard.db"
    
    # Evidence fusion weight distribution (Master Plan SIH26143)
    WEIGHT_PROXIMITY: float = 0.30
    WEIGHT_TIME_WINDOW: float = 0.25
    WEIGHT_TRAJECTORY: float = 0.20
    WEIGHT_DRIFT_CONSISTENCY: float = 0.15
    WEIGHT_AIS_QUALITY: float = 0.10

    class Config:
        case_sensitive = True

settings = Settings()
