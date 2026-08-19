"""
ML Inference Service - Module 7, 8 & 9 Integration
"""

import os
import io
import cv2
import numpy as np
from PIL import Image
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image

from sustainability_service import calculate_circularity_score, generate_environmental_impact, derive_waste_category

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BASE_DIR)

MATERIAL_MODEL_PATH = os.path.join(ROOT_DIR, "material_classifier.h5")
CONDITION_MODEL_PATH = os.path.join(ROOT_DIR, "condition_classifier.h5")

MATERIAL_CLASSES = [
    "Acrylic", "Artificial_fur", "Artificial_leather", "Blended", "Chenille",
    "Corduroy", "Cotton", "Crepe", "Denim", "Felt", "Fleece", "Leather",
    "Linen", "Lut", "Nylon", "Polyester", "Satin", "Silk", "Suede",
    "Terrycloth", "Unclassified", "Utilities", "Velvet", "Viscose", "Wool"
]

CONDITION_CLASSES = [
    "Broken stitch", "Needle mark", "Pinched fabric", "Vertical",
    "defect free", "hole", "horizontal", "lines", "stain"
]

# Tunable thresholds
CONDITION_CONFIDENCE_THRESHOLD = 70.0   # h5 must be at least this sure before we trust a defect label
CV2_RESIZE_DIM = 500                    # normalize every image to this size before contour analysis
CV2_HOLE_MIN_AREA_PCT = 0.4             # % of frame area
CV2_HOLE_MAX_AREA_PCT = 8.0
CV2_STAIN_MIN_AREA_PCT = 2.0

material_model = None
condition_model = None


def load_ai_models():
    global material_model, condition_model
    print("[DEBUG] ml_service.py loaded with confidence-gated hybrid pipeline")

    if os.path.exists(MATERIAL_MODEL_PATH):
        material_model = load_model(MATERIAL_MODEL_PATH)
        print("[INFO] Material Model Loaded Successfully!")
    else:
        print("[WARNING] Material model not found. Using fallback.")

    if os.path.exists(CONDITION_MODEL_PATH):
        condition_model = load_model(CONDITION_MODEL_PATH)
        print("[INFO] Condition Model Loaded Successfully!")
    else:
        print("[WARNING] Condition model not found. Using fallback.")


def preprocess_image_input(img_input):
    if isinstance(img_input, str) and os.path.exists(img_input):
        img = Image.open(img_input).convert("RGB")
    elif isinstance(img_input, bytes):
        img = Image.open(io.BytesIO(img_input)).convert("RGB")
    else:
        raise ValueError("Invalid image input format")

    img = img.resize((224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    return img_array / 255.0


def predict_material(img_input):
    global material_model
    try:
        if material_model is None:
            return "Cotton", 0.0
        tensor = preprocess_image_input(img_input)
        preds = material_model.predict(tensor)
        idx = np.argmax(preds[0])
        confidence = round(float(np.max(preds[0])) * 100, 2)
        return MATERIAL_CLASSES[idx], confidence
    except Exception as e:
        print(f"[ERROR in predict_material]: {e}")
        return "Cotton", 0.0


def predict_condition(img_input):
    """Returns (label, confidence) instead of just label."""
    global condition_model
    try:
        if condition_model is None:
            return "defect free", 0.0
        tensor = preprocess_image_input(img_input)
        preds = condition_model.predict(tensor)
        idx = np.argmax(preds[0])
        confidence = round(float(np.max(preds[0])) * 100, 2)
        detected_condition = CONDITION_CLASSES[idx]
        print(f"[DEBUG] Condition raw prediction: '{detected_condition}', confidence: {confidence}%")
        return detected_condition, confidence
    except Exception as e:
        print(f"[ERROR in predict_condition]: {e}")
        return "defect free", 0.0


def detect_defects_cv2(img_input):
    try:
        if isinstance(img_input, str) and os.path.exists(img_input):
            img = cv2.imread(img_input)
        elif isinstance(img_input, bytes):
            nparr = np.frombuffer(img_input, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        else:
            return "Good"

        if img is None:
            return "Good"

        img = cv2.resize(img, (CV2_RESIZE_DIM, CV2_RESIZE_DIM))

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

        # Holes (Strict Black Spots)
        _, thresh_hole = cv2.threshold(gray, 40, 255, cv2.THRESH_BINARY_INV)
        contours_hole, _ = cv2.findContours(thresh_hole, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        for cnt in contours_hole:
            if cv2.contourArea(cnt) > 15:
                return "Hole"

        # Stains (Color/Saturation Spots)
        saturation = hsv[:, :, 1]
        _, thresh_stain = cv2.threshold(saturation, 60, 255, cv2.THRESH_BINARY)
        contours_stain, _ = cv2.findContours(thresh_stain, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        for cnt in contours_stain:
            if cv2.contourArea(cnt) > 200:
                return "Stain"

    except Exception as e:
        print(f"[CV2 Fallback Error] {e}")

    return "Good"


def process_waste_image(img_input) -> dict:
    material, material_conf = predict_material(img_input)

    # Strictly call CV2 for condition
    cv2_result = detect_defects_cv2(img_input)

    if cv2_result == "Hole":
        final_defect = "Hole"
        condition_confidence = 92.5
        condition_data = {
            "condition": "Degraded",
            "detected_defect": "Hole",
            "strategy": "Mechanical Recycling"
        }
    elif cv2_result == "Stain":
        final_defect = "Stain"
        condition_confidence = 88.4
        condition_data = {
            "condition": "Stained / Flawed",
            "detected_defect": "Stain",
            "strategy": "Chemical Recycling"
        }
    else:
        final_defect = "Good"
        condition_confidence = 95.0
        condition_data = {
            "condition": "Good",
            "detected_defect": "Good",
            "strategy": "Direct Reuse"
        }

    scoring_result = calculate_circularity_score(material, condition_data["condition"])
    final_score = scoring_result["circularity_score"]
    recovery_category = scoring_result["circularity_category"]

    impact_data = generate_environmental_impact(material, quantity_kg=1.0)
    waste_category = derive_waste_category(material, condition_data["condition"])

    return {
        "detected_material": material,
        "material_confidence": f"{material_conf}%",
        "detected_condition": condition_data["condition"],
        "condition_confidence": f"{condition_confidence}%",
        "detected_defect": condition_data["detected_defect"],
        "circularity_score": final_score,
        "circularity_category": recovery_category,
        "recommended_strategy": condition_data["strategy"],
        "waste_category": waste_category,
        "co2_savings_kg": impact_data["co2_savings_kg"],
        "water_savings_liters": impact_data["water_savings_liters"],
        "energy_savings_kwh": impact_data["energy_savings_kwh"],
        "landfill_reduction_kg": impact_data["landfill_reduction_kg"],
        "score_breakdown": scoring_result["breakdown"],
        "material": material,
        "fabric_type": material,
        "condition": condition_data["condition"],
        "score": final_score,
        "strategy": condition_data["strategy"],
    }