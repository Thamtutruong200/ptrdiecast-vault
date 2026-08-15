from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routers import items, storage, ai
from api.config import IS_SUPABASE_CONFIGURED, APP_ENV

app = FastAPI(
    title="Diecast Tracker API",
    description="FastAPI Backend for Diecast Model Car Collection Tracking with Supabase PostgreSQL & Storage",
    version="1.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)

# Enable CORS for React frontend (local dev and Vercel production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers under /api
app.include_router(items.router, prefix="/api")
app.include_router(storage.router, prefix="/api")
app.include_router(ai.router, prefix="/api")

# Also mount routers at root in case Vercel rewrites strip /api prefix
app.include_router(items.router)
app.include_router(storage.router)
app.include_router(ai.router)

@app.get("/")
@app.get("/api")
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Diecast Tracker API",
        "version": "1.0.0",
        "supabase_connected": IS_SUPABASE_CONFIGURED,
        "environment": APP_ENV
    }
