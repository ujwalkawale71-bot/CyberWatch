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
from app.routes.dashboard import router as dashboard_router
from app.routes.behavior import router as behavior_router
from app.routes.threat_intelligence import router as threat_intelligence_router

# Initialize tables gracefully
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"[Warning] Database initialization deferred: {e}")

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
app.include_router(dashboard_router)
app.include_router(behavior_router)
app.include_router(threat_intelligence_router)

@app.get("/")
def read_root():
    return {
        "success": True,
        "message": "CyberWatch API Operational",
        "documentation": "/docs"
    }
