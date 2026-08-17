# Module 7, 8 & 9: Sustainability Intelligence, Environmental Impact & Weighted Waste Scoring Engine
# Module 5: Waste Classification Engine — Waste Category Derivation


from typing import Dict, Any

# Fabric-specific Environmental Impact Savings Constants (per kg of recycled/diverted fabric)
# GAP-08 FIX: Expanded to cover ALL 10 materials specified in the document
# Sources based on industry circular economy averages
FABRIC_IMPACT_CONSTANTS = {
    "Cotton":    {"co2_saved_per_kg": 5.4,  "water_saved_liters_per_kg": 10000.0, "energy_saved_kwh_per_kg": 15.0},
    "Denim":     {"co2_saved_per_kg": 6.8,  "water_saved_liters_per_kg": 11000.0, "energy_saved_kwh_per_kg": 18.0},
    "Polyester": {"co2_saved_per_kg": 3.8,  "water_saved_liters_per_kg": 50.0,    "energy_saved_kwh_per_kg": 30.0},
    "Wool":      {"co2_saved_per_kg": 14.0, "water_saved_liters_per_kg": 500.0,   "energy_saved_kwh_per_kg": 25.0},
    "Silk":      {"co2_saved_per_kg": 10.0, "water_saved_liters_per_kg": 800.0,   "energy_saved_kwh_per_kg": 20.0},
    "Linen":     {"co2_saved_per_kg": 4.9,  "water_saved_liters_per_kg": 5000.0,  "energy_saved_kwh_per_kg": 12.0},
    "Nylon":     {"co2_saved_per_kg": 6.5,  "water_saved_liters_per_kg": 75.0,    "energy_saved_kwh_per_kg": 28.0},
    "Viscose":   {"co2_saved_per_kg": 3.5,  "water_saved_liters_per_kg": 2000.0,  "energy_saved_kwh_per_kg": 14.0},
    "Rayon":     {"co2_saved_per_kg": 3.5,  "water_saved_liters_per_kg": 2000.0,  "energy_saved_kwh_per_kg": 14.0},
    "Acrylic":   {"co2_saved_per_kg": 5.1,  "water_saved_liters_per_kg": 80.0,    "energy_saved_kwh_per_kg": 27.0},
    "Blended":   {"co2_saved_per_kg": 4.2,  "water_saved_liters_per_kg": 3000.0,  "energy_saved_kwh_per_kg": 16.0},
    "Default":   {"co2_saved_per_kg": 4.5,  "water_saved_liters_per_kg": 2500.0,  "energy_saved_kwh_per_kg": 15.0}
}


def derive_waste_category(material: str, condition: str) -> str:
    """
    GAP-07 FIX: Module 5 — Waste Classification Engine
    Maps material + condition to one of the 6 official waste categories from the requirements document:
      - Recyclable       : synthetic or mixed fibres in fair/damaged condition
      - Reusable         : natural fibres in good condition — can go directly back into use
      - Repairable       : items with minor defects that can be repaired before reuse
      - Upcyclable       : items whose material can be transformed into higher-value products
      - Compostable      : natural biodegradable fibres at end of life
      - Hazardous Textile Waste : heavily contaminated or chemically treated textiles
    """
    mat_lower  = material.lower()
    cond_lower = condition.lower()

    NATURAL   = ["cotton", "linen", "wool", "silk"]
    SYNTHETIC = ["polyester", "nylon", "acrylic"]
    BIO       = ["cotton", "linen", "viscose", "rayon"]

    if "hazard" in cond_lower or "chemical" in cond_lower:
        return "Hazardous Textile Waste"
    if any(c in cond_lower for c in ["good", "defect-free", "new"]):
        if any(m in mat_lower for m in NATURAL):
            return "Reusable"
        return "Recyclable"
    if any(c in cond_lower for c in ["minor", "needle", "pinch"]):
        return "Repairable"
    if any(c in cond_lower for c in ["stain", "flawed"]):
        if any(m in mat_lower for m in BIO):
            return "Upcyclable"
        return "Recyclable"
    if any(c in cond_lower for c in ["torn", "damaged", "hole"]):
        if any(m in mat_lower for m in BIO):
            return "Compostable"
        if any(m in mat_lower for m in SYNTHETIC):
            return "Recyclable"
        return "Upcyclable"
    return "Recyclable"  # Safe default


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
        cond_score = 95.0    # 95 * 0.20 = 19.0
        reuse_potential = 90.0 # 90 * 0.20 = 18.0
    elif any(c in cond_lower for c in ["degraded", "hole", "cut", "broken stitch"]):
        cond_score = 50.0    # 50 * 0.20 = 10.0
        reuse_potential = 30.0 # 30 * 0.20 = 6.0
    elif any(c in cond_lower for c in ["stain", "heavy wear", "damaged", "flawed"]):
        cond_score = 60.0    # 60 * 0.20 = 12.0
        reuse_potential = 40.0 # 40 * 0.20 = 8.0
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
    GAP-08 FIX: Now supports all 10 document-specified materials via expanded FABRIC_IMPACT_CONSTANTS.
    """
    # Fuzzy match: find the best key for the detected material
    mat_lower = material.lower()
    matched_key = "Default"
    for key in FABRIC_IMPACT_CONSTANTS:
        if key == "Default":
            continue
        if key.lower() in mat_lower or mat_lower in key.lower():
            matched_key = key
            break

    constants = FABRIC_IMPACT_CONSTANTS[matched_key]

    co2_saved        = round(constants["co2_saved_per_kg"]          * quantity_kg, 2)
    water_saved      = round(constants["water_saved_liters_per_kg"] * quantity_kg, 2)
    energy_saved     = round(constants["energy_saved_kwh_per_kg"]   * quantity_kg, 2)
    landfill_diverted = round(quantity_kg, 2)  # 100% diversion if processed

    return {
        "co2_savings_kg":        co2_saved,
        "water_savings_liters":  water_saved,
        "energy_savings_kwh":    energy_saved,
        "landfill_reduction_kg": landfill_diverted
    }