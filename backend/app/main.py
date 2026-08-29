"""
OceanGuard AI - Main FastAPI Application Server
SIH26143 / SamadhanLabs Evidence-Based Marine Attribution API
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from backend.app.core.config import settings
from backend.app.db.session import engine, Base
from backend.app.db import models
from backend.app.api.routes import health, investigations, detection, tracing, vessels, ranking

# Auto-create all SQLite tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="OceanGuard AI: Marine oil spill origin backtracking and AIS vessel attribution engine (SIH26143)."
)

# Enable CORS for cross-origin frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(health.router)
app.include_router(investigations.router)
app.include_router(detection.router)
app.include_router(tracing.router)
app.include_router(vessels.router)
app.include_router(ranking.router)

@app.get("/")
def root():
    return {
        "platform": "OceanGuard AI Platform",
        "sih_problem_statement": "SIH26143 (MoES / INCOIS / ICG)",
        "status": "online",
        "database": "SQLite (oceanguard.db)",
        "docs_url": "/docs",
        "redoc_url": "/redoc"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
