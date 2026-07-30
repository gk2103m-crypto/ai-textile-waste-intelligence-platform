"""
ML Inference Service - Force Fix Version
"""

import os
import io
import numpy as np
from PIL import Image
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BASE_DIR)

MATERIAL_MODEL_PATH = os.path.join(ROOT_DIR, "material_classifier.h5")
CONDITION_MODEL_PATH = os.path.join(ROOT_DIR, "condition_classifier.h5")

# CORRECTED — matches actual fabrics_dataset folder names, alphabetical order
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

material_model = None
condition_model = None


def load_ai_models():
    global material_model, condition_model
    print("🔥 [DEBUG] CORRECT ml_service.py IS RUNNING! 🔥")

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


def predict_condition(img_input) -> dict:
    global condition_model
    try:
        if condition_model is None:
            detected_condition = "defect free"
        else:
            tensor = preprocess_image_input(img_input)
            preds = condition_model.predict(tensor)
            idx = np.argmax(preds[0])
            confidence = round(float(np.max(preds[0])) * 100, 2)
            detected_condition = CONDITION_CLASSES[idx]
            print(f"[DEBUG] Condition raw prediction: '{detected_condition}', confidence: {confidence}%, all_scores: {preds[0]}")
    except Exception as e:
        print(f"[ERROR in predict_condition]: {e}")
        detected_condition = "defect free"

    if detected_condition == "defect free":
        return {
            "condition": "Good",
            "detected_defect": "Defect-Free",
            "circularity_score": 95,
            "strategy": "Direct Reuse / Resale"
        }
    elif detected_condition in ["hole", "Broken stitch", "Cut", "Tear"]:
        return {
            "condition": "Torn / Damaged",
            "detected_defect": detected_condition.title(),
            "circularity_score": 72,
            "strategy": "Mechanical Recycling / Repair"
        }
    else:
        return {
            "condition": "Stained / Flawed",
            "detected_defect": detected_condition.title(),
            "circularity_score": 58,
            "strategy": "Chemical Recycling / Industrial Wash"
        }


def process_waste_image(img_input) -> dict:
    material, confidence = predict_material(img_input)
    condition_data = predict_condition(img_input)

    return {
        "detected_material": material,
        "material_confidence": f"{confidence}%",
        "detected_condition": condition_data["condition"],
        "detected_defect": condition_data["detected_defect"],
        "circularity_score": condition_data["circularity_score"],
        "recommended_strategy": condition_data["strategy"],

        # Backward-compatible extra keys (safe to keep)
        "material": material,
        "fabric_type": material,
        "condition": condition_data["condition"],
        "score": condition_data["circularity_score"],
        "strategy": condition_data["strategy"],
    }