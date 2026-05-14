import os
import shutil
import json

from fastapi import APIRouter, UploadFile, File, Form, Body

from app.modules.egg.models.egg_classifier import predict_egg
from app.modules.egg.services.egg_constraints import apply_biological_constraints
from app.modules.egg.services.egg_confidence import confidence_gate
from app.modules.egg.schemas.context_schema import SpawnContext
from app.modules.egg.services.egg_validation_engine import get_validation_questions
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
        # STEP 1: CNN AI PREDICTION
        # -----------------------------
        ai_result = predict_egg(file_path)
        print("AI RESULT:", ai_result)

        if "probabilities" not in ai_result:
            return {
                "error": "MODEL_ERROR",
                "message": "Model did not return probabilities.",
                "details": ai_result
            }

        # -----------------------------
        # STEP 2: BIOLOGICAL CONSTRAINTS
        # -----------------------------
        adjusted_probs = apply_biological_constraints(
            ai_result["probabilities"],
            context_data
        )

        confidence = max(adjusted_probs.values())
        gate = confidence_gate(confidence)

        # -----------------------------
        # STEP 2.5: INVALID / LOW-CONFIDENCE FILTER
        # -----------------------------
        if gate["level"] == "invalid":
            return {
                "error": "INVALID_IMAGE",
                "message": gate["message"],
                "confidence": round(confidence, 2),
                "confidence_level": gate["level"]
            }

        # -----------------------------
        # STEP 3: ADAPTIVE VALIDATION QUESTIONS
        # -----------------------------
        if gate["level"] == "medium":
            questions = get_validation_questions("medium")
        else:
            questions = get_validation_questions("light")

        # -----------------------------
        # STEP 4: INITIAL FUSION ENGINE
        # No user answers yet at this stage
        # -----------------------------
        fusion_result = evaluate_scenario(
            probabilities=adjusted_probs,
            answers={},
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

            # Initial CNN prediction
            "ai_prediction": ai_result["predicted_class"],

            # Needed later for final fusion after validation answers
            "context": context_data.dict(),

            # Initial decision before validation answers
            "final_decision": fusion_result
        }

    except Exception as e:
        return {
            "error": "SERVER_ERROR",
            "message": str(e)
        }


# ===============================
# FINALIZE — REAL FUSION AFTER USER VALIDATION
# ===============================
@router.post("/finalize")
async def finalize_decision(data: dict = Body(...)):
    try:
        probabilities = data["probabilities"]
        answers = data["answers"]
        context = SpawnContext(**data["context"])

        fusion_result = evaluate_scenario(
            probabilities=probabilities,
            answers=answers,
            context=context
        )

        return {
            "final_decision": fusion_result
        }

    except Exception as e:
        return {
            "error": "FINALIZE_ERROR",
            "message": str(e)
        }