import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Local env Variables load aagum, aana Render Env variables-ah override pannadhu
load_dotenv(override=False)

# Render Environment Variable-la irundhu DATABASE_URL-ah edukum
DATABASE_URL = os.environ.get("DATABASE_URL")

# Fallback for local testing if DATABASE_URL is not set
if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./textile_waste.db"

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