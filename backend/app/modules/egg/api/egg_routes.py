import os
import shutil
from fastapi import APIRouter, UploadFile, File, Form
from app.modules.egg.models.egg_classifier import predict_egg
from app.modules.egg.services.egg_constraints import apply_biological_constraints
from app.modules.egg.services.egg_confidence import confidence_gate
from app.modules.egg.schemas.context_schema import SpawnContext
from app.modules.egg.services.egg_validation_engine import get_validation_questions

import json

router = APIRouter(prefix="/egg", tags=["Egg Analysis"])

UPLOAD_DIR = "temp_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/analyze")
async def analyze(
    image: UploadFile = File(...),
    context: str = Form(...)
):
    try:
        context_data = SpawnContext(**json.loads(context))

        # -----------------------------
        # SAVE IMAGE
        # -----------------------------
        file_path = os.path.join(UPLOAD_DIR, image.filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        # -----------------------------
        # STEP 1: CNN Prediction
        # -----------------------------
        ai_result = predict_egg(file_path)

        # -----------------------------
        # STEP 2: Constraints
        # -----------------------------
        adjusted_probs = apply_biological_constraints(
            ai_result["probabilities"], context_data
        )

        confidence = max(adjusted_probs.values())
        gate = confidence_gate(confidence)

        # -----------------------------
        # STEP 3: Questions
        # -----------------------------
        if gate["level"] == "low":
            questions = get_validation_questions("full")
        elif gate["level"] == "medium":
            questions = get_validation_questions("medium")
        else:
            questions = get_validation_questions("light")

        # -----------------------------
        # STEP 4: XAI placeholder
        # -----------------------------
        xai = {
            "heatmap_available": False,
            "message": "Heatmap will be available after CNN integration.",
            "focus_hint": "Observe egg color, texture, surrounding area."
        }

        return {
            "probabilities": adjusted_probs,
            "confidence": round(confidence, 2),
            "confidence_level": gate["level"],
            "requires_validation": gate["requires_validation"],
            "confidence_message": gate["message"],
            "questions": questions,
            "xai": xai
        }

    except Exception as e:
        return {"error": str(e)}