from pydantic_settings import BaseSettings
from typing import List
import os
from pathlib import Path
from dotenv import load_dotenv

# Explicitly resolve and load backend/.env or root .env
backend_root = Path(__file__).resolve().parent.parent
env_paths = [
    backend_root / ".env",
    backend_root.parent / ".env"
]
for p in env_paths:
    if p.exists():
        load_dotenv(dotenv_path=p, override=True)

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/cyberwatch"
    JWT_SECRET: str = "supersecretjwtkeyforcyberwatchplatform"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:5175"

    # Threat Intelligence API Keys (Optional)
    GOOGLE_SAFE_BROWSING_API_KEY: str = ""
    VIRUSTOTAL_API_KEY: str = ""
    URLHAUS_API_KEY: str = ""
    PHISHTANK_API_KEY: str = ""

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = str(backend_root / ".env") if (backend_root / ".env").exists() else ".env"
        extra = "ignore"

settings = Settings()
