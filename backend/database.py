import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker


# Read from environment variable (set in docker-compose.yml) — fallback to sqlite for local dev
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./textile_waste.db"
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Frontend & UI connectivity function
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()