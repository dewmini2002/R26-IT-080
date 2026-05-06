from app.modules.egg.services.egg_knowledge_base import KNOWLEDGE_BASE


def evaluate_scenario(probabilities: dict, answers: dict):
    # -------------------------------
    # SELECT BASE SCENARIO FROM CNN
    # -------------------------------
    scenario = max(probabilities, key=probabilities.get)
    confidence = probabilities[scenario]

    result = {
        "condition": scenario,
        "severity": "LOW",
        "confidence": confidence,
        "explanation": "",
        "actions": [],
        "reason_trace": [],
        "risk_factors": [],
        "confidence_explanation": ""
    }

    risk_score = 0

    # -------------------------------
    # GLOBAL LOGIC
    # -------------------------------

    if answers.get("fuzzy") == "yes":
        scenario = "fungal"
        result["condition"] = "fungal"
        result["reason_trace"].append("Fuzzy growth detected → fungal override")

    if answers.get("parents") == "none":
        risk_score += 3
        result["risk_factors"].append("parental abandonment")
        result["reason_trace"].append("Parents abandoned eggs")

    # -------------------------------
    # SCENARIO RULES
    # -------------------------------

    if scenario == "healthy":
        if answers.get("fanning") == "none":
            risk_score += 3
            result["reason_trace"].append("No fanning → oxygen risk")

        if answers.get("lighting") == "bright":
            risk_score += 1
            result["reason_trace"].append("Bright light stress")

        if answers.get("temp_stability") == "unstable":
            risk_score += 2
            result["reason_trace"].append("Temperature fluctuation")

    elif scenario == "unhealthy":
        white_pct = answers.get("white_percentage")

        if white_pct == ">80":
            risk_score += 4
            result["reason_trace"].append("High mortality")

        elif white_pct == "50-80":
            risk_score += 2
            result["reason_trace"].append("Moderate mortality")

    elif scenario == "mixed":
        if answers.get("trend") == "increasing":
            risk_score += 3
            result["reason_trace"].append("White eggs increasing")

        if answers.get("removal") == "no":
            risk_score += 2
            result["reason_trace"].append("Parents not removing dead eggs")

    elif scenario == "fungal":
        spread = answers.get("spread")

        if spread == ">60":
            risk_score += 5
            result["reason_trace"].append("Severe fungal spread")

        elif spread == "30-60":
            risk_score += 3
            result["reason_trace"].append("Moderate fungal spread")

        else:
            risk_score += 2
            result["reason_trace"].append("Early fungal stage")

        if answers.get("aeration") == "low":
            risk_score += 2
            result["reason_trace"].append("Low aeration")

    # -------------------------------
    # FUSION LOGIC (IMPORTANT)
    # -------------------------------

    final_score = risk_score + (1 - confidence) * 5

    if final_score >= 7:
        result["severity"] = "CRITICAL"
    elif final_score >= 5:
        result["severity"] = "HIGH"
    elif final_score >= 3:
        result["severity"] = "MEDIUM"
    else:
        result["severity"] = "LOW"

    # -------------------------------
    # ACTIONS
    # -------------------------------

    if result["severity"] == "CRITICAL":
        result["actions"] = [
            "Remove eggs immediately",
            "Disinfect tank",
            "Prepare for next spawning"
        ]

    elif result["severity"] == "HIGH":
        result["actions"] = [
            "Apply antifungal treatment",
            "Stabilize environment"
        ]

    elif result["severity"] == "MEDIUM":
        result["actions"] = [
            "Monitor closely",
            "Adjust tank conditions"
        ]

    else:
        result["actions"] = ["Continue normal monitoring"]

    # -------------------------------
    # EXPLANATION (XAI)
    # -------------------------------

    explanations = []

    for reason in result["reason_trace"]:
        r = reason.lower()

        if "fanning" in r:
            kb = KNOWLEDGE_BASE["no_fanning"]
        elif "light" in r:
            kb = KNOWLEDGE_BASE["bright_light"]
        elif "temperature" in r:
            kb = KNOWLEDGE_BASE["temp_fluctuation"]
        elif "mortality" in r:
            kb = KNOWLEDGE_BASE["high_mortality"]
        elif "fungal" in r:
            kb = KNOWLEDGE_BASE["fungal_growth"]
        elif "aeration" in r:
            kb = KNOWLEDGE_BASE["low_aeration"]
        elif "increasing" in r:
            kb = KNOWLEDGE_BASE["increasing_white"]
        else:
            kb = None

        if kb:
            explanations.append(f"{kb['explanation']} ({kb['source']})")

    if not explanations:
        explanations.append(
            "Decision based on combined AI and environmental indicators."
        )

    result["explanation"] = " | ".join(explanations)

    result["confidence_explanation"] = (
        "Final decision combines CNN confidence with environmental risk scoring."
    )

    return result