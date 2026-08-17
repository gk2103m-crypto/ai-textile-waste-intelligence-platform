"""
Textile Inventory & AI Analysis Router 
"""

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from database import get_db
from models import WasteInventory
from ml_service import process_waste_image


router = APIRouter()


# 1. PYDANTIC SCHEMAS
class InventoryCreate(BaseModel):
    fabric_type: str
    source: str
    quantity_kg: float
    color: str
    condition: str


class InventoryUpdate(BaseModel):
    fabric_type: str
    source: str
    quantity_kg: float
    color: str
    condition: str


# 2. SPECIFIC & GENERAL LIST ENDPOINTS (MUST COME BEFORE DYNAMIC ID ROUTES)
@router.get("/api/inventory")
def get_inventory(db: Session = Depends(get_db)):
    return db.query(WasteInventory).all()


@router.get("/api/inventory/sustainability-stats")
def get_sustainability_analytics(db: Session = Depends(get_db)):
    """
    Returns total CO2 saved, water saved, energy conservation & landfill diversion.
    Placed above /{batch_id} to prevent FastAPI from casting 'sustainability-stats' as an int.
    """
    total_items = db.query(WasteInventory).count()
    if total_items == 0:
        return {
            "total_co2_saved_kg": 0.0,
            "total_water_saved_liters": 0.0,
            "total_energy_saved_kwh": 0.0,
            "total_landfill_diverted_kg": 0.0,
            "avg_circularity_score": 0.0,
            "waste_diversion_rate": "100%"
        }

    total_co2 = db.query(func.sum(WasteInventory.co2_saved_kg)).scalar() or 0.0
    total_water = db.query(func.sum(WasteInventory.water_saved_liters)).scalar() or 0.0
    total_energy = db.query(func.sum(WasteInventory.energy_saved_kwh)).scalar() or 0.0
    total_landfill = db.query(func.sum(WasteInventory.landfill_diverted_kg)).scalar() or 0.0
    avg_score = db.query(func.avg(WasteInventory.circularity_score)).scalar() or 0.0

    return {
        "total_co2_saved_kg": round(total_co2, 2),
        "total_water_saved_liters": round(total_water, 2),
        "total_energy_saved_kwh": round(total_energy, 2),
        "total_landfill_diverted_kg": round(total_landfill, 2),
        "avg_circularity_score": round(avg_score, 1),
        "waste_diversion_rate": "94.5%"
    }


@router.get("/api/analytics")
def get_dashboard_analytics(db: Session = Depends(get_db)):
    total_items = db.query(WasteInventory).count()
    
    material_stats = db.query(
        WasteInventory.fabric_type, 
        func.count(WasteInventory.batch_id)
    ).group_by(WasteInventory.fabric_type).all()
    materials = {item[0]: item[1] for item in material_stats}
    
    condition_stats = db.query(
        WasteInventory.condition, 
        func.count(WasteInventory.batch_id)
    ).group_by(WasteInventory.condition).all()
    conditions = {item[0]: item[1] for item in condition_stats}
    
    return {
        "total_scans": total_items,
        "material_distribution": materials,
        "condition_distribution": conditions
    }


# 3. DYNAMIC PARAMETER ENDPOINTS (MUST COME AFTER SPECIFIC TEXT ROUTES)
@router.get("/api/inventory/{batch_id}")
def get_inventory_item(batch_id: int, db: Session = Depends(get_db)):
    item = db.query(WasteInventory).filter(WasteInventory.batch_id == batch_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@router.post("/api/inventory")
def add_inventory(item: InventoryCreate, db: Session = Depends(get_db)):
    new_item = WasteInventory(**item.model_dump())
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return {"message": "Success", "data": new_item}


@router.put("/api/inventory/{batch_id}")
def update_inventory(batch_id: int, item: InventoryUpdate, db: Session = Depends(get_db)):
    existing = db.query(WasteInventory).filter(WasteInventory.batch_id == batch_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Item not found")
    for key, value in item.dict().items():
        setattr(existing, key, value)
    db.commit()
    db.refresh(existing)
    return {"message": "Updated successfully", "data": existing}


@router.delete("/api/inventory/{batch_id}")
def delete_inventory(batch_id: int, db: Session = Depends(get_db)):
    existing = db.query(WasteInventory).filter(WasteInventory.batch_id == batch_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(existing)
    db.commit()
    return {"message": "Deleted successfully"}


# 4. AI IMAGE SCANNER ENDPOINT (WITH MILESTONE 3 ESG DATA INTEGRATION)
@router.post("/api/inventory/upload")
async def analyze_waste_image(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db)
):
    try:
        image_bytes = await file.read()
        ai_result = process_waste_image(image_bytes)
        
        # Save AI predictions along with Module 7, 8 & 9 ESG calculation metrics
        new_item = WasteInventory(
            fabric_type=ai_result["detected_material"],
            source="AI Vision Scanner",
            quantity_kg=1.0,
            color="Unknown",
            condition=ai_result["detected_condition"],
            waste_category=ai_result.get("waste_category", "Recyclable"),  # GAP-07 FIX
            circularity_score=ai_result.get("circularity_score", 0.0),
            circularity_category=ai_result.get("circularity_category", "Moderate Recovery Potential"),
            co2_saved_kg=ai_result.get("co2_savings_kg", 0.0),
            water_saved_liters=ai_result.get("water_savings_liters", 0.0),
            energy_saved_kwh=ai_result.get("energy_savings_kwh", 0.0),
            landfill_diverted_kg=ai_result.get("landfill_reduction_kg", 0.0),
            strategy=ai_result.get("recommended_strategy", "Mechanical Recycling")
        )
        db.add(new_item)
        db.commit()
        db.refresh(new_item)
        
        return ai_result
    except Exception as e:
        print(f"[ERROR in /upload]: {e}")
        raise HTTPException(status_code=500, detail=str(e))