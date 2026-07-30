"""
Textile Inventory & AI Analysis Router
"""

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Form
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from database import get_db
from models import WasteInventory
from ml_service import process_waste_image

# ---> INTHA LINE MISS AANATHALA THAAN ERROR VANTHUCHU: <---
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


# 2. STANDARD CRUD ENDPOINTS
@router.get("/api/inventory")
def get_inventory(db: Session = Depends(get_db)):
    return db.query(WasteInventory).all()


@router.get("/api/inventory/{batch_id}")
def get_inventory_item(batch_id: int, db: Session = Depends(get_db)):
    item = db.query(WasteInventory).filter(WasteInventory.batch_id == batch_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@router.post("/api/inventory")
def add_inventory(item: InventoryCreate, db: Session = Depends(get_db)):
    new_item = WasteInventory(**item.dict())
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


# 3. AI IMAGE SCANNER ENDPOINT (BULLETPROOF VERSION)
@router.post("/api/inventory/upload")
async def analyze_waste_image(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db)
):
    try:
        # Direct-aa image bytes-a read panrom
        image_bytes = await file.read()
        
        # Dual-AI scanner call panrom
        ai_result = process_waste_image(image_bytes)
        
        # DB-la save panrom
        new_item = WasteInventory(
            fabric_type=ai_result["material"],
            source="AI Vision Scanner",
            quantity_kg=1.0,
            color="Unknown",
            condition=ai_result["condition"]
        )
        db.add(new_item)
        db.commit()
        db.refresh(new_item)
        
        return ai_result
    except Exception as e:
        print(f"[ERROR in /upload]: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# 4. DASHBOARD ANALYTICS ENDPOINT
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