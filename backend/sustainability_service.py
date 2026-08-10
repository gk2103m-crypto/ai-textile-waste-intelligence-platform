   
# Module 7, 8 & 9: Sustainability Intelligence, Environmental Impact & Weighted Waste Scoring Engine


from typing import Dict, Any

# Fabric-specific Environmental Impact Savings Constants (per kg of recycled/diverted fabric)
# Sources based on industry circular economy averages
FABRIC_IMPACT_CONSTANTS = {
    "Cotton": {"co2_saved_per_kg": 5.4, "water_saved_liters_per_kg": 10000.0, "energy_saved_kwh_per_kg": 15.0},
    "Denim": {"co2_saved_per_kg": 6.8, "water_saved_liters_per_kg": 11000.0, "energy_saved_kwh_per_kg": 18.0},
    "Polyester": {"co2_saved_per_kg": 3.8, "water_saved_liters_per_kg": 50.0, "energy_saved_kwh_per_kg": 30.0},
    "Wool": {"co2_saved_per_kg": 14.0, "water_saved_liters_per_kg": 500.0, "energy_saved_kwh_per_kg": 25.0},
    "Silk": {"co2_saved_per_kg": 10.0, "water_saved_liters_per_kg": 800.0, "energy_saved_kwh_per_kg": 20.0},
    "Default": {"co2_saved_per_kg": 4.5, "water_saved_liters_per_kg": 2500.0, "energy_saved_kwh_per_kg": 15.0}
}

def calculate_circularity_score(material: str, condition: str) -> Dict[str, Any]:
    """
    Module 9: Waste Scoring Engine
    Weighted Scoring Model:
    Circularity Score = Material Recyclability(35%) + Material Condition(20%) +
                        Reuse Potential(20%) + Environmental Benefit(15%) + Processing Feasibility(10%)
    """
    # 1. Component Scoring (Out of 100)
    mat_lower = material.lower()
    cond_lower = condition.lower()

    # Material Recyclability (35%)
    if any(m in mat_lower for m in ["cotton", "wool", "denim"]):
        recyclability = 95.0
    elif any(m in mat_lower for m in ["polyester", "nylon", "acrylic"]):
        recyclability = 75.0
    else:
        recyclability = 60.0

    # Material Condition & Reuse Potential (20% + 20%)
    if any(c in cond_lower for c in ["good", "defect-free", "new"]):
        cond_score = 95.0
        reuse_potential = 95.0
    elif any(c in cond_lower for c in ["hole", "cut", "broken stitch"]):
        cond_score = 70.0
        reuse_potential = 40.0
    elif any(c in cond_lower for c in ["stain", "heavy wear", "damaged"]):
        cond_score = 50.0
        reuse_potential = 20.0
    else:
        cond_score = 60.0
        reuse_potential = 30.0

    # Environmental Benefit (15%) & Processing Feasibility (10%)
    env_benefit = 85.0
    feasibility = 80.0 if recyclability > 70 else 60.0

    # Strict Weighted Formula Calculation
    circularity_score = (
        (recyclability * 0.35) +
        (cond_score * 0.20) +
        (reuse_potential * 0.20) +
        (env_benefit * 0.15) +
        (feasibility * 0.10)
    )
    circularity_score = round(circularity_score, 1)

    # Circularity Categories (As per Document Page 6)
    if circularity_score >= 85.0:
        category = "Excellent Recovery Potential"
    elif circularity_score >= 70.0:
        category = "High Recovery Potential"
    elif circularity_score >= 55.0:
        category = "Moderate Recovery Potential"
    elif circularity_score >= 40.0:
        category = "Limited Recovery Potential"
    else:
        category = "Disposal Recommended"

    return {
        "circularity_score": circularity_score,
        "circularity_category": category,
        "breakdown": {
            "material_recyclability_35": round(recyclability * 0.35, 1),
            "material_condition_20": round(cond_score * 0.20, 1),
            "reuse_potential_20": round(reuse_potential * 0.20, 1),
            "environmental_benefit_15": round(env_benefit * 0.15, 1),
            "processing_feasibility_10": round(feasibility * 0.10, 1)
        }
    }

def generate_environmental_impact(material: str, quantity_kg: float = 1.0) -> Dict[str, float]:
    """
    Module 7 & 8: Environmental Impact Assessment Engine
    Calculates CO2 savings, Water savings, Energy conservation, and Landfill reduction.
    """
    constants = FABRIC_IMPACT_CONSTANTS.get(material, FABRIC_IMPACT_CONSTANTS["Default"])
    
    co2_saved = round(constants["co2_saved_per_kg"] * quantity_kg, 2)
    water_saved = round(constants["water_saved_liters_per_kg"] * quantity_kg, 2)
    energy_saved = round(constants["energy_saved_kwh_per_kg"] * quantity_kg, 2)
    landfill_diverted = round(quantity_kg, 2) # 100% diversion if processed

    return {
        "co2_savings_kg": co2_saved,
        "water_savings_liters": water_saved,
        "energy_savings_kwh": energy_saved,
        "landfill_reduction_kg": landfill_diverted
    }