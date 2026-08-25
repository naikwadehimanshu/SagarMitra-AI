"""SagarMitra AI — FastAPI Main Application.

Marine Intelligence & Decision Support Platform.
"""
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from app.api.chat import router as chat_router
from app.api.marine import router as marine_router
from app.api.weather import router as weather_router
from app.api.safety import router as safety_router
from app.api.routes import router as routes_router
from app.api.geofence import router as geofence_router
from app.api.layers import router as layers_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("sagarmitra")

# Create FastAPI app
app = FastAPI(
    title="SagarMitra AI API",
    description=(
        "Agentic AI-powered Marine Intelligence & Decision Support Platform. "
        "Multi-agent system for PFZ discovery, marine safety assessment, "
        "weather analysis, route optimization, and geospatial reasoning."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(chat_router, prefix="/api")
app.include_router(marine_router, prefix="/api")
app.include_router(weather_router, prefix="/api")
app.include_router(safety_router, prefix="/api")
app.include_router(routes_router, prefix="/api")
app.include_router(geofence_router, prefix="/api")
app.include_router(layers_router, prefix="/api")


@app.on_event("startup")
async def startup_event():
    """Initialize data sources and preload demo data on startup."""
    logger.info("🌊 SagarMitra AI starting up...")
    try:
        from app.data_sources.demo_data import DemoDataProvider
        provider = DemoDataProvider()
        logger.info("✅ Demo data provider initialized")
    except Exception as e:
        logger.warning("⚠️ Demo data initialization warning: %s", e)

    logger.info("🚀 SagarMitra AI API ready at http://localhost:8000")
    logger.info("📖 API docs at http://localhost:8000/docs")


@app.get("/", include_in_schema=False)
async def root():
    """Redirect root to API documentation."""
    return RedirectResponse(url="/docs")


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "SagarMitra AI",
        "version": "1.0.0",
        "mode": "demo",
    }


@app.get("/api/location")
async def get_location_info():
    """Return available coastal locations."""
    from app.tools.geocoding import get_all_locations
    locations = get_all_locations()
    return {
        "locations": [
            {"name": name.title(), "latitude": coords[0], "longitude": coords[1]}
            for name, coords in sorted(locations.items())
        ]
    }
