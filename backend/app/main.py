from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
import app.models  # Important: ensures models are registered in metadata
from app.routes.auth import router as auth_router
from app.routes.users import router as users_router
from app.routes.scans import router as scans_router
from app.routes.scan import router as scan_router
from app.routes.alerts import router as alerts_router
from app.routes.reports import router as reports_router

# Initialize tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CyberWatch API",
    description="Unified Web & Browser Threat Detection Platform Backend Operations",
    version="1.0.0",
)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(scans_router)
app.include_router(scan_router)
app.include_router(alerts_router)
app.include_router(reports_router)

@app.get("/")
def read_root():
    return {
        "success": True,
        "message": "CyberWatch API Operational",
        "documentation": "/docs"
    }
