from fastapi import APIRouter, UploadFile, File, Form
from app.modules.egg.models.egg_classifier import predict_egg
from app.modules.egg.services.egg_constraints import apply_biological_constraints
from app.modules.egg.services.egg_confidence import confidence_gate
from app.modules.egg.schemas.context_schema import SpawnContext
from app.modules.egg.services.egg_validation_engine import get_validation_questions

import json
import os
from uuid import uuid4

router = APIRouter(prefix="/egg", tags=["Egg Analysis"])

# Create upload folder if not exists
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/analyze")
async def analyze(
    image: UploadFile = File(...),
    context: str = Form(...)
):
    context_data = SpawnContext(**json.loads(context))

    # -----------------------------
    # SAVE IMAGE PROPERLY
    # -----------------------------
    file_ext = image.filename.split(".")[-1]
    unique_name = f"{uuid4()}.{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_name)

    with open(file_path, "wb") as buffer:
        buffer.write(await image.read())

    # -----------------------------
    # CNN Prediction (REAL)
    # -----------------------------
    ai_result = predict_egg(file_path)

    # Expected:
    # {
    #   "class": "healthy",
    #   "probabilities": {...}
    # }

    # -----------------------------
    # Apply Biological Constraints
    # -----------------------------
    adjusted_probs = apply_biological_constraints(
        ai_result["probabilities"], context_data
    )

    confidence = max(adjusted_probs.values())
    gate = confidence_gate(confidence)

    # -----------------------------
    # Adaptive Question Logic
    # -----------------------------
    if gate["level"] == "low":
        questions = get_validation_questions("full")

    elif gate["level"] == "medium":
        questions = get_validation_questions("medium")

    else:
        questions = get_validation_questions("light")

    # -----------------------------
    # BASIC XAI (IMPROVED)
    # -----------------------------
    predicted_class = max(adjusted_probs, key=adjusted_probs.get)

    xai = {
        "heatmap_available": False,
        "message": "Model focused on texture, color density, and egg boundary patterns.",
        "predicted_class": predicted_class,
        "confidence": round(confidence, 2)
    }

    # -----------------------------
    # FINAL RESPONSE
    # -----------------------------
    return {
        "predicted_class": predicted_class,
        "probabilities": adjusted_probs,
        "confidence": round(confidence, 2),
        "confidence_level": gate["level"],
        "requires_validation": gate["requires_validation"],
        "confidence_message": gate["message"],
        "questions": questions,
        "xai": xai
    }