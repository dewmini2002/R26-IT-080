from fastapi import APIRouter, UploadFile, File
from app.modules.egg.models.egg_classifier import predict_egg
from app.modules.egg.services.egg_scenarios import SCENARIOS
from fastapi import Form
from app.modules.egg.services.egg_decision_engine import evaluate_scenario
import json

router = APIRouter()


@router.post("/start-analysis")
async def start_analysis(image: UploadFile = File(...)):
    # Step 1: Run AI prediction (dummy for now)
    ai_result = predict_egg(image.filename)

    scenario = ai_result["prediction"]

    # Step 2: Get questions for that scenario
    scenario_data = SCENARIOS.get(scenario, {})

    return {
        "scenario": scenario,
        "confidence": ai_result["confidence"],
        "questions": scenario_data.get("questions", [])
    }

@router.post("/complete-analysis")
async def complete_analysis(
    scenario: str = Form(...),
    answers: str = Form(...)
):
    answers_dict = json.loads(answers)

    result = evaluate_scenario(scenario, answers_dict)

    return result