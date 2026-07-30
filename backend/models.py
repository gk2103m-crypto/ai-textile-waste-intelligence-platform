from sqlalchemy import Column, Integer, String, Enum, Float, DateTime
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base
from database import Base 
import enum



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