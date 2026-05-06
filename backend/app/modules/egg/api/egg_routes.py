from fastapi import APIRouter, UploadFile, File, Form
from app.modules.egg.models.egg_classifier import predict_egg
from app.modules.egg.services.egg_constraints import apply_biological_constraints
from app.modules.egg.services.egg_confidence import confidence_gate
from app.modules.egg.services.egg_decision_engine import evaluate_scenario
from app.modules.egg.schemas.context_schema import SpawnContext
from app.modules.egg.services.egg_validation_engine import get_validation_questions

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
    # Parse context
    context_data = SpawnContext(**json.loads(context))

    # Run CNN (mock or real)
    ai_result = predict_egg(image.filename)

    # Apply biological constraints
    adjusted_probs = apply_biological_constraints(
        ai_result["probabilities"],
        context_data
    )

    # Confidence calculation
    confidence = max(adjusted_probs.values())
    gate = confidence_gate(confidence)

    # Get validation questions if needed
    questions = []
    if gate != "high":
        questions = get_validation_questions(
            adjusted_probs,
            context_data,
            gate
        )

    return {
        "probabilities": adjusted_probs,
        "confidence": confidence,
        "confidence_level": gate,
        "requires_validation": gate != "high",
        "questions": questions
    }


# -----------------------------
# STEP 2: FINAL FUSION ANALYSIS
# -----------------------------
@router.post("/final")
async def final_analysis(
    probabilities: str = Form(...),
    answers: str = Form(...),
    context: str = Form(...)
):
    # Parse inputs
    prob_dict = json.loads(probabilities)
    answers_dict = json.loads(answers)
    context_data = SpawnContext(**json.loads(context))

    # Run fusion decision engine
    result = evaluate_scenario(
        prob_dict,
        answers_dict,
        context_data
    )

    return result