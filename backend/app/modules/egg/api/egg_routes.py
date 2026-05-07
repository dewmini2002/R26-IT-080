from fastapi import APIRouter, UploadFile, File, Form
from app.modules.egg.models.egg_classifier import predict_egg
from app.modules.egg.services.egg_constraints import apply_biological_constraints
from app.modules.egg.services.egg_confidence import confidence_gate
from app.modules.egg.schemas.context_schema import SpawnContext
from app.modules.egg.services.egg_validation_engine import get_validation_questions

import json

router = APIRouter(prefix="/egg", tags=["Egg Analysis"])


@router.post("/analyze")
async def analyze(
    image: UploadFile = File(...),
    context: str = Form(...)
):
    context_data = SpawnContext(**json.loads(context))

    # -----------------------------
    # STEP 1: CNN Prediction
    # -----------------------------
    ai_result = predict_egg(image.filename)

    # -----------------------------
    # STEP 2: Apply Biological Constraints
    # -----------------------------
    adjusted_probs = apply_biological_constraints(
        ai_result["probabilities"], context_data
    )

    confidence = max(adjusted_probs.values())

    gate = confidence_gate(confidence)

    # -----------------------------
    # STEP 3: Adaptive Question Logic
    # -----------------------------
    if gate["level"] == "low":
        questions = get_validation_questions("full")

    elif gate["level"] == "medium":
        questions = get_validation_questions("medium")

    else:  # high confidence
        questions = get_validation_questions("light")

    # -----------------------------
    # STEP 4: XAI Placeholder
    # -----------------------------
    xai = {
        "heatmap_available": False,
        "message": "Heatmap will be available after CNN integration.",
        "focus_hint": "Observe egg color (amber/white), texture, and surrounding area."
    }

    # -----------------------------
    # FINAL RESPONSE
    # -----------------------------
    return {
        "probabilities": adjusted_probs,
        "confidence": round(confidence, 2),
        "confidence_level": gate["level"],
        "requires_validation": gate["requires_validation"],
        "confidence_message": gate["message"],
        "questions": questions,
        "xai": xai
    }