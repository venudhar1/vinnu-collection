from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.routes import sets, items, auth_routes, bulk, public, orders
from app.middleware.auth import verify_api_key
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Saree Inventory API",
    version="1.0.0",
    description="A lightweight backend API to manage dynamic inventory for a saree business"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Initialize database on startup
@app.on_event("startup")
def on_startup():
    """Initialize database on application startup"""
    init_db()


# Health check endpoint (no auth required)
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}


# Auth routes (no auth required for key creation)
app.include_router(auth_routes.router)

# Public catalog routes (no auth required)
app.include_router(public.router)

# Orders routes (auth handled per-endpoint)
app.include_router(orders.router)

# Sets routes (auth required)
app.include_router(sets.router, dependencies=[Depends(verify_api_key)])

# Items routes (auth required)
app.include_router(items.router, dependencies=[Depends(verify_api_key)])

# Bulk routes (auth required)
app.include_router(bulk.router, dependencies=[Depends(verify_api_key)])



# OpenAPI endpoint
@app.get("/openapi.json")
async def openapi():
    """Get OpenAPI specification"""
    return app.openapi()


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("API_PORT", 8000))
    host = os.getenv("API_HOST", "0.0.0.0")
    
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=os.getenv("DEBUG", "True").lower() == "true"
    )
