from fastapi import APIRouter, UploadFile, File, Form
from app.modules.egg.models.egg_classifier import predict_egg
from app.modules.egg.services.egg_constraints import apply_biological_constraints
from app.modules.egg.services.egg_confidence import confidence_gate
from app.modules.egg.services.egg_decision_engine import evaluate_scenario
from app.modules.egg.schemas.context_schema import SpawnContext

import json

router = APIRouter(prefix="/egg", tags=["Egg Analysis"])


# -----------------------------
# STEP 1: IMAGE + CONTEXT ANALYSIS
# -----------------------------
@router.post("/analyze")
async def analyze(
    image: UploadFile = File(...),
    context: str = Form(...)
):
    context_data = SpawnContext(**json.loads(context))

    ai_result = predict_egg(image.filename)

    # Apply biological constraints
    adjusted_probs = apply_biological_constraints(
        ai_result["probabilities"], context_data
    )

    confidence = max(adjusted_probs.values())

    gate = confidence_gate(confidence)

    return {
        "probabilities": adjusted_probs,
        "confidence": confidence,
        "confidence_level": gate,
        "requires_validation": gate != "high"
    }


# -----------------------------
# STEP 2: FINAL FUSION
# -----------------------------
@router.post("/final")
async def final_analysis(
    probabilities: str = Form(...),
    answers: str = Form(...),
    context: str = Form(...)
):
    prob_dict = json.loads(probabilities)
    answers_dict = json.loads(answers)
    context_data = SpawnContext(**json.loads(context))

    result = evaluate_scenario(prob_dict, answers_dict, context_data)

    return result