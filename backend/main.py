from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine, SessionLocal
from routers import inventory, auth_router
from ml_service import load_ai_models
from models import User, UserRole
from auth import get_password_hash

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

def seed_default_users():
    db = SessionLocal()
    created_count = 0
    existing_count = 0
    
    default_users = [
        {"email": "test@eco.com", "password": "test123", "role": UserRole.ADMIN},
        {"email": "krish123@gmail.com", "password": "test123", "role": "Manufacturer"},
        {"email": "facility@eco.com", "password": "facility123", "role": UserRole.FACILITY_OPERATOR},
        {"email": "sustainability@eco.com", "password": "sustain123", "role": UserRole.SUSTAINABILITY_MANAGER}
    ]
    
    try:
        for u in default_users:
            existing_user = db.query(User).filter(User.email == u["email"]).first()
            if existing_user:
                existing_count += 1
                continue
            
            hashed_pwd = get_password_hash(u["password"])
            username = u["email"].split('@')[0]
            new_user = User(username=username, email=u["email"], hashed_password=hashed_pwd, role=u["role"])
            db.add(new_user)
            created_count += 1
            
        db.commit()
        print(f"[INFO] Seeded default users: {created_count} created, {existing_count} already existed.")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Failed to seed default users: {e}")
    finally:
        db.close()

# 3. Load Dual AI Models at Server Startup
@app.on_event("startup")
async def startup_event():
    print("[INFO] Initializing AI Inference Engine on server startup...")
    load_ai_models()
    seed_default_users()

# 4. Include Routers
app.include_router(inventory.router)
app.include_router(auth_router.router)

@app.get("/")
async def root():
    return {
        "status": "online",
        "message": "Welcome to the AI Textile Waste Intelligence Platform API"
    }