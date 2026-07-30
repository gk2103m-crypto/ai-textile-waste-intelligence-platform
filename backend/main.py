from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
from routers import inventory, auth_router
from ml_service import load_ai_models

app = FastAPI(
    title="AI Textile Waste Intelligence Platform",
    description="Backend API for AI-powered textile waste management platform",
    version="1.0.0"
)

# 1. Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Initialize Database Tables
Base.metadata.create_all(bind=engine)

# 3. Load Dual AI Models at Server Startup
@app.on_event("startup")
async def startup_event():
    print("[INFO] Initializing AI Inference Engine on server startup...")
    load_ai_models()

# 4. Include Routers
app.include_router(inventory.router)
app.include_router(auth_router.router)

@app.get("/")
async def root():
    return {
        "status": "online",
        "message": "Welcome to the AI Textile Waste Intelligence Platform API"
    }