from typing import Dict
from app.modules.egg.schemas.context_schema import SpawnContext


def evaluate_scenario(
    probabilities: Dict[str, float],
    answers: Dict[str, bool],
    context: SpawnContext
):
    # -----------------------------
    # STEP 1: INITIAL BASE CLASS
    # -----------------------------
    base_class = max(probabilities, key=probabilities.get)
    base_confidence = probabilities[base_class]

    score = {
        "healthy": probabilities.get("healthy", 0),
        "mixed": probabilities.get("mixed", 0),
        "fungal": probabilities.get("fungal", 0),
        "unhealthy": probabilities.get("unhealthy", 0),
    }

    explanation_parts = []
    risk_factors = []

    explanation_parts.append(
        f"Initial AI prediction suggested '{base_class}' with confidence {round(base_confidence, 2)}."
    )

    # -----------------------------
    # STEP 2: USER VALIDATION BOOST
    # -----------------------------
    if answers.get("fuzzy"):
        score["fungal"] += 0.4
        risk_factors.append("fungal_growth")
        explanation_parts.append(
            "Fuzzy/hairy texture detected, indicating fungal infection."
        )

    if answers.get("white_eggs"):
        score["mixed"] += 0.2
        score["unhealthy"] += 0.2
        risk_factors.append("white_eggs")
        explanation_parts.append(
            "Presence of white eggs suggests dead or unfertilized eggs."
        )

    if answers.get("fanning") is False:
        score["unhealthy"] += 0.3
        risk_factors.append("no_fanning")
        explanation_parts.append(
            "Lack of parental fanning reduces oxygen supply."
        )

    if answers.get("eye_spots"):
        score["healthy"] += 0.3
        explanation_parts.append(
            "Eye spots detected, indicating normal embryo development."
        )

    # -----------------------------
    # STEP 3: BIOLOGICAL CONSTRAINTS
    # -----------------------------
    if context.hours_since_spawn < 6:
        score["fungal"] *= 0.2
        explanation_parts.append(
            "Fungus unlikely at early stage (<6 hours)."
        )

    if context.hours_since_spawn < 30 and answers.get("eye_spots"):
        score["healthy"] -= 0.2
        explanation_parts.append(
            "Eye spots unlikely before 30 hours."
        )

    if context.hours_since_spawn > 72:
        score["unhealthy"] += 0.2
        risk_factors.append("overdue_hatching")
        explanation_parts.append(
            "Eggs overdue for hatching, possible developmental failure."
        )

    # -----------------------------
    # STEP 4: ENVIRONMENTAL FACTORS
    # -----------------------------
    if context.temperature < 28:
        score["unhealthy"] += 0.1
        risk_factors.append("low_temp")
        explanation_parts.append(
            "Temperature below optimal range may slow development."
        )

    if context.temperature > 30:
        score["unhealthy"] += 0.1
        risk_factors.append("high_temp")
        explanation_parts.append(
            "High temperature may stress embryos."
        )

    if context.tds > 100:
        score["unhealthy"] += 0.2
        risk_factors.append("high_tds")
        explanation_parts.append(
            "High water hardness (TDS) may affect fertilization."
        )

    # 🔥 pH integration
    if context.ph:
        if context.ph > 7:
            score["unhealthy"] += 0.2
            risk_factors.append("high_ph")
            explanation_parts.append(
                "High pH may reduce fertilization success."
            )
        elif context.ph < 5.5:
            score["unhealthy"] += 0.2
            risk_factors.append("low_ph")
            explanation_parts.append(
                "Low pH may stress embryos."
            )
        elif 6.0 <= context.ph <= 6.5:
            score["healthy"] += 0.2
            explanation_parts.append(
                "Optimal pH supports healthy embryo development."
            )

    # -----------------------------
    # STEP 5: FINAL CLASS DECISION
    # -----------------------------
    final_class = max(score, key=score.get)
    final_confidence = min(score[final_class], 1.0)

    # -----------------------------
    # STEP 6: SEVERITY LEVEL
    # -----------------------------
    risk_score = len(risk_factors)

    if final_class == "fungal" or risk_score >= 3:
        severity = "high"
    elif final_class in ["mixed", "unhealthy"] or risk_score >= 2:
        severity = "medium"
    else:
        severity = "low"

    # -----------------------------
    # STEP 7: ACTIONS
    # -----------------------------
    actions = []

    if final_class == "healthy":
        actions = [
            "Maintain stable water parameters (28–30°C, low TDS, pH 6.0–6.5).",
            "Avoid disturbing the tank.",
            "Ensure dim lighting to reduce stress."
        ]

    elif final_class == "fungal":
        actions = [
            "Remove infected eggs immediately.",
            "Apply methylene blue to prevent spread.",
            "Increase aeration carefully."
        ]

    elif final_class == "mixed":
        actions = [
            "Monitor eggs closely for fungal spread.",
            "Allow parents to remove dead eggs.",
            "Manually remove white eggs if necessary."
        ]

    elif final_class == "unhealthy":
        actions = [
            "Check water parameters (pH, TDS, temperature).",
            "Ensure parents are active and not stressed.",
            "Prepare for possible loss of clutch."
        ]

    # -----------------------------
    # STEP 8: FINAL EXPLANATION
    # -----------------------------
    explanation_parts.append(
        f"Final decision: '{final_class}' based on combined AI prediction, user observations, and environmental conditions."
    )

    explanation = " ".join(explanation_parts)

    # -----------------------------
    # FINAL OUTPUT
    # -----------------------------
    return {
        "final_class": final_class,
        "confidence": round(final_confidence, 2),
        "severity": severity,
        "explanation": explanation,
        "actions": actions
    }