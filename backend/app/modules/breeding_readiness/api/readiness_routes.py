from fastapi import APIRouter
from app.modules.breeding_readiness.schemas.readiness_schema import ReadinessRequest
from app.modules.breeding_readiness.services.readiness_engine import evaluate_breeding_readiness

router = APIRouter(prefix="/readiness", tags=["Breeding Readiness"])


@router.post("/analyze")
async def analyze_readiness(data: ReadinessRequest):
    result = evaluate_breeding_readiness(data)
    return {
        "message": "Breeding readiness analysis completed",
        "result": result
    }