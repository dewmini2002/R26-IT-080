from fastapi import APIRouter, UploadFile, File, Form
from app.modules.egg.models.egg_classifier import predict_egg
from app.modules.egg.services.egg_decision_engine import evaluate_scenario
import json

router = APIRouter(prefix="/egg", tags=["Egg Analysis"])


# -----------------------------
# STEP 1: IMAGE ANALYSIS
# -----------------------------
@router.post("/analyze-image")
async def analyze_image(image: UploadFile = File(...)):
    ai_result = predict_egg(image.filename)

    return {
        "probabilities": ai_result["probabilities"],
        "top_prediction": ai_result["prediction"],
        "confidence": ai_result["confidence"]
    }


# -----------------------------
# STEP 2: FINAL FUSION ANALYSIS
# -----------------------------
@router.post("/final-analysis")
async def final_analysis(
    probabilities: str = Form(...),
    answers: str = Form(...)
):
    prob_dict = json.loads(probabilities)
    answers_dict = json.loads(answers)

    result = evaluate_scenario(prob_dict, answers_dict)

    return result