"""
Textile Inventory & AI Analysis Router using Supabase
"""

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from pydantic import BaseModel
from database import supabase
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

# 2. SPECIFIC & GENERAL LIST ENDPOINTS
@router.get("/api/inventory")
def get_inventory():
    if not supabase:
        return []
    res = supabase.table("waste_inventory").select("*").execute()
    return res.data

@router.get("/api/inventory/sustainability-stats")
def get_sustainability_analytics():
    if not supabase:
        return {
            "total_co2_saved_kg": 0.0,
            "total_water_saved_liters": 0.0,
            "total_energy_saved_kwh": 0.0,
            "total_landfill_diverted_kg": 0.0,
            "avg_circularity_score": 0.0,
            "waste_diversion_rate": "100%"
        }
    
    res = supabase.table("waste_inventory").select("*").execute()
    data = res.data
    
    total_items = len(data)
    if total_items == 0:
        return {
            "total_co2_saved_kg": 0.0,
            "total_water_saved_liters": 0.0,
            "total_energy_saved_kwh": 0.0,
            "total_landfill_diverted_kg": 0.0,
            "avg_circularity_score": 0.0,
            "waste_diversion_rate": "100%"
        }

    total_co2 = sum([item.get("co2_saved_kg", 0) or 0 for item in data])
    total_water = sum([item.get("water_saved_liters", 0) or 0 for item in data])
    total_energy = sum([item.get("energy_saved_kwh", 0) or 0 for item in data])
    total_landfill = sum([item.get("landfill_diverted_kg", 0) or 0 for item in data])
    avg_score = sum([item.get("circularity_score", 0) or 0 for item in data]) / total_items

    return {
        "total_co2_saved_kg": round(total_co2, 2),
        "total_water_saved_liters": round(total_water, 2),
        "total_energy_saved_kwh": round(total_energy, 2),
        "total_landfill_diverted_kg": round(total_landfill, 2),
        "avg_circularity_score": round(avg_score, 1),
        "waste_diversion_rate": "94.5%"
    }

@router.get("/api/analytics")
def get_dashboard_analytics():
    if not supabase:
        return {"total_scans": 0, "material_distribution": {}, "condition_distribution": {}}
        
    res = supabase.table("waste_inventory").select("batch_id, fabric_type, condition").execute()
    data = res.data
    
    materials = {}
    conditions = {}
    for item in data:
        mat = item.get("fabric_type")
        cond = item.get("condition")
        if mat:
            materials[mat] = materials.get(mat, 0) + 1
        if cond:
            conditions[cond] = conditions.get(cond, 0) + 1
            
    return {
        "total_scans": len(data),
        "material_distribution": materials,
        "condition_distribution": conditions
    }

# 3. DYNAMIC PARAMETER ENDPOINTS
@router.get("/api/inventory/{batch_id}")
def get_inventory_item(batch_id: int):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    res = supabase.table("waste_inventory").select("*").eq("batch_id", batch_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Item not found")
    return res.data[0]

@router.post("/api/inventory")
def add_inventory(item: InventoryCreate):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    res = supabase.table("waste_inventory").insert(item.model_dump()).execute()
    return {"message": "Success", "data": res.data[0] if res.data else None}

@router.put("/api/inventory/{batch_id}")
def update_inventory(batch_id: int, item: InventoryUpdate):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    res = supabase.table("waste_inventory").update(item.model_dump()).eq("batch_id", batch_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Updated successfully", "data": res.data[0]}

@router.delete("/api/inventory/{batch_id}")
def delete_inventory(batch_id: int):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    res = supabase.table("waste_inventory").delete().eq("batch_id", batch_id).execute()
    return {"message": "Deleted successfully"}

# 4. AI IMAGE SCANNER ENDPOINT
@router.post("/api/inventory/upload")
async def analyze_waste_image(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        ai_result = process_waste_image(image_bytes)
        
        # Save to Supabase
        if supabase:
            new_item = {
                "fabric_type": ai_result.get("detected_material"),
                "source": "AI Vision Scanner",
                "quantity_kg": 1.0,
                "color": "Unknown",
                "condition": ai_result.get("detected_condition"),
                "waste_category": ai_result.get("waste_category", "Recyclable"),
                "circularity_score": ai_result.get("circularity_score", 0.0),
                "circularity_category": ai_result.get("circularity_category", "Moderate Recovery Potential"),
                "co2_saved_kg": ai_result.get("co2_savings_kg", 0.0),
                "water_saved_liters": ai_result.get("water_savings_liters", 0.0),
                "energy_saved_kwh": ai_result.get("energy_savings_kwh", 0.0),
                "landfill_diverted_kg": ai_result.get("landfill_reduction_kg", 0.0),
                "strategy": ai_result.get("recommended_strategy", "Mechanical Recycling")
            }
            supabase.table("waste_inventory").insert(new_item).execute()
        
        return ai_result
    except Exception as e:
        print(f"[ERROR in /upload]: {e}")
        raise HTTPException(status_code=500, detail=str(e))