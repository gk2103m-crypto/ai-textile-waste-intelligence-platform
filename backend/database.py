from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker


DATABASE_URL = "postgresql://postgres:oracle10g@localhost:5432/textile_waste_db"

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