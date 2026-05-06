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
    confidence = probabilities[base_class]

    score = {
        "healthy": probabilities.get("healthy", 0),
        "mixed": probabilities.get("mixed", 0),
        "fungal": probabilities.get("fungal", 0),
        "unhealthy": probabilities.get("unhealthy", 0),
    }

    # -----------------------------
    # STEP 2: USER VALIDATION BOOST
    # -----------------------------
    if answers.get("fuzzy"):
        score["fungal"] += 0.4

    if answers.get("white_eggs"):
        score["mixed"] += 0.2
        score["unhealthy"] += 0.2

    if answers.get("fanning") is False:
        score["unhealthy"] += 0.3

    if answers.get("eye_spots"):
        score["healthy"] += 0.3

    # -----------------------------
    # STEP 3: BIOLOGICAL RULE OVERRIDE
    # -----------------------------
    # Fungus cannot occur too early
    if context.hours_since_spawn < 6:
        score["fungal"] *= 0.2

    # Eye spots only after ~36h
    if context.hours_since_spawn < 30 and answers.get("eye_spots"):
        score["healthy"] -= 0.2

    # -----------------------------
    # STEP 4: FINAL CLASS DECISION
    # -----------------------------
    final_class = max(score, key=score.get)
    final_confidence = min(score[final_class], 1.0)

    # -----------------------------
    # STEP 5: SEVERITY LEVEL
    # -----------------------------
    if final_class == "fungal":
        severity = "high"
    elif final_class == "unhealthy":
        severity = "medium"
    elif final_class == "mixed":
        severity = "medium"
    else:
        severity = "low"

    # -----------------------------
    # STEP 6: EXPLANATION (XAI)
    # -----------------------------
    explanation_parts = []

    explanation_parts.append(
        f"Initial AI prediction suggested '{base_class}' with confidence {round(confidence, 2)}."
    )

    if answers.get("fuzzy"):
        explanation_parts.append(
            "User confirmed fuzzy/hairy eggs, which strongly indicates fungal infection."
        )

    if answers.get("white_eggs"):
        explanation_parts.append(
            "White eggs detected, suggesting possible unfertilized or dead eggs."
        )

    if answers.get("fanning") is False:
        explanation_parts.append(
            "Parents are not fanning eggs, increasing risk of oxygen deprivation."
        )

    if answers.get("eye_spots"):
        explanation_parts.append(
            "Eye spots detected, indicating normal embryo development."
        )

    explanation_parts.append(
        f"Final decision adjusted to '{final_class}' after combining image analysis and environmental observations."
    )

    explanation = " ".join(explanation_parts)

    # -----------------------------
    # STEP 7: ACTION RECOMMENDATIONS
    # -----------------------------
    actions = []

    if final_class == "healthy":
        actions.append("Maintain stable water parameters (29°C, low TDS).")
        actions.append("Avoid disturbing the tank.")
        actions.append("Ensure dim lighting at night.")

    elif final_class == "fungal":
        actions.append("Remove infected eggs immediately using a pipette.")
        actions.append("Apply methylene blue to prevent spread.")
        actions.append("Increase aeration but avoid direct bubbles on eggs.")

    elif final_class == "mixed":
        actions.append("Monitor closely for fungal spread.")
        actions.append("Allow parents to remove dead eggs if active.")
        actions.append("Manually remove white eggs if necessary.")

    elif final_class == "unhealthy":
        actions.append("Check water parameters (pH, TDS, temperature).")
        actions.append("Ensure parents are not stressed.")
        actions.append("Consider separating eggs if condition worsens.")

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