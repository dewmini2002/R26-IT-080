import os
import shutil
import json

from fastapi import APIRouter, UploadFile, File, Form

from app.modules.egg.models.egg_classifier import predict_egg
from app.modules.egg.services.egg_constraints import apply_biological_constraints
from app.modules.egg.services.egg_confidence import confidence_gate
from app.modules.egg.schemas.context_schema import SpawnContext
from app.modules.egg.services.egg_validation_engine import get_validation_questions

# 🔥 NEW (fusion engine)
from app.modules.egg.services.egg_decision_engine import evaluate_scenario


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
        # STEP 0: SAVE IMAGE
        # -----------------------------
        file_path = os.path.join(UPLOAD_DIR, image.filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        # -----------------------------
        # STEP 1: CNN Prediction
        # -----------------------------
        ai_result = predict_egg(file_path)

        # Safety check
        if "probabilities" not in ai_result:
            return {"error": "Model did not return probabilities", "details": ai_result}

        # -----------------------------
        # STEP 2: Biological Constraints
        # -----------------------------
        adjusted_probs = apply_biological_constraints(
            ai_result["probabilities"], context_data
        )

        confidence = max(adjusted_probs.values())
        gate = confidence_gate(confidence)

        # -----------------------------
        # STEP 3: Adaptive Questions
        # -----------------------------
        if gate["level"] == "low":
            questions = get_validation_questions("full")
        elif gate["level"] == "medium":
            questions = get_validation_questions("medium")
        else:
            questions = get_validation_questions("light")

        # -----------------------------
        # STEP 4: XAI (placeholder)
        # -----------------------------
        xai = {
            "heatmap_available": False,
            "message": "Heatmap will be available after CNN integration.",
            "focus_hint": "Observe egg color, texture, surrounding area."
        }

        # -----------------------------
        # STEP 5: 🔥 FUSION ENGINE (YOUR CORE)
        # -----------------------------
        answers = {}  # no user answers yet

        fusion_result = evaluate_scenario(
            probabilities=adjusted_probs,
            answers=answers,
            context=context_data
        )

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
            "xai": xai,

            # 🔥 NEW (MOST IMPORTANT PART)
            "final_decision": fusion_result
        }

    except Exception as e:
        return {"error": str(e)}