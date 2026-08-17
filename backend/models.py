
# Complete Database Models for Milestone 1, 2 & 3 (Auth + Inventory + Sustainability ESG)

from sqlalchemy import Column, Integer, String, Enum, Float, DateTime
from sqlalchemy.sql import func
from database import Base 
import enum



# 1. USER AUTHENTICATION & ROLES TABLE (Module 1)

# Defining the exact roles mentioned in the project document
class UserRole(str, enum.Enum):
    FACILITY_OPERATOR = "Recycling Facility Operator"
    SUSTAINABILITY_MANAGER = "Sustainability Manager"
    MANUFACTURER = "Textile Manufacturer"
    ADMIN = "Administrator"


# Defining the User Database Schema for PostgreSQL
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.MANUFACTURER)


# 2. TEXTILE INVENTORY & ESG TABLE (Modules 2, 5, 7, 8 & 9)

# Defining the Textile Inventory Management Schema based on PDF requirements
class WasteInventory(Base):
    __tablename__ = "waste_inventory"

    batch_id = Column(Integer, primary_key=True, index=True) # Waste Batch ID
    fabric_type = Column(String, index=True, nullable=False) # Fabric Type
    source = Column(String, nullable=False)                  # Source
    quantity_kg = Column(Float, nullable=False)              # Quantity
    color = Column(String)                                   # Color
    condition = Column(String)                               # Condition
    collection_date = Column(DateTime(timezone=True), server_default=func.now()) # Collection Date

    # MILESTONE 2: Module 5 — Waste Classification Engine
    # Waste categories as per document: Recyclable, Reusable, Repairable, Upcyclable, Compostable, Hazardous
    waste_category = Column(String, default="Recyclable")   # GAP-06 FIX: Document Module 5

    # MILESTONE 3: Module 7, 8 & 9 ESG & Sustainability Columns
    circularity_score = Column(Float, default=0.0)
    circularity_category = Column(String, default="Moderate Recovery Potential")
    reuse_score = Column(Float, default=0.0)                # GAP-06 FIX: Document Module 9 (Reuse score)
    co2_saved_kg = Column(Float, default=0.0)
    water_saved_liters = Column(Float, default=0.0)
    energy_saved_kwh = Column(Float, default=0.0)
    landfill_diverted_kg = Column(Float, default=0.0)
    
    # AI Recommendation Strategy
    strategy = Column(String, default="Mechanical Recycling")