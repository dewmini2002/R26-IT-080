def evaluate_scenario(scenario: str, answers: dict):
    result = {
        "condition": scenario,
        "severity": "LOW",
        "explanation": "",
        "actions": [],
        "reason_trace": [],
        "risk_factors": [],
        "confidence_explanation": ""
    }

    risk_score = 0
    override = None

    # -------------------------------
    # GLOBAL CROSS-LOGIC (OVERRIDE)
    # -------------------------------

    # Detect fungal override
    if answers.get("fuzzy") == "yes":
        override = "fungal"
        result["reason_trace"].append("Fuzzy growth detected → fungal override")

    # Detect abandonment
    if answers.get("parents") == "none":
        risk_score += 3
        result["risk_factors"].append("parental abandonment")
        result["reason_trace"].append("Parents abandoned eggs")

    # -------------------------------
    # APPLY OVERRIDE
    # -------------------------------
    if override:
        scenario = override
        result["condition"] = override

    # -------------------------------
    # SCENARIO LOGIC
    # -------------------------------

    # HEALTHY
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

    #UNHEALTHY
    elif scenario == "unhealthy":
        white_pct = answers.get("white_percentage")

        if white_pct == ">80":
            risk_score += 4
            result["reason_trace"].append("High mortality (>80%)")

        elif white_pct == "50-80":
            risk_score += 2
            result["reason_trace"].append("Moderate mortality")

        if answers.get("first_spawn") == "yes":
            risk_score -= 1
            result["reason_trace"].append("First spawn → normal mortality")

    #MIXED
    elif scenario == "mixed":
        if answers.get("trend") == "increasing":
            risk_score += 3
            result["reason_trace"].append("White eggs increasing")

        if answers.get("removal") == "no":
            risk_score += 2
            result["reason_trace"].append("Parents not removing dead eggs")

        if answers.get("fanning") == "none":
            risk_score += 3
            result["reason_trace"].append("No fanning")

    #FUNGAL
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
            result["reason_trace"].append("Poor water flow")

    # -------------------------------
    # FINAL SEVERITY DECISION
    # -------------------------------

    if risk_score >= 6:
        result["severity"] = "CRITICAL"
    elif risk_score >= 4:
        result["severity"] = "HIGH"
    elif risk_score >= 2:
        result["severity"] = "MEDIUM"
    else:
        result["severity"] = "LOW"

    # -------------------------------
    # ACTION GENERATION
    # -------------------------------

    if result["severity"] == "CRITICAL":
        result["actions"] = [
            "Remove eggs immediately",
            "Disinfect tank",
            "Prepare for next spawning cycle"
        ]

    elif result["severity"] == "HIGH":
        result["actions"] = [
            "Apply antifungal treatment",
            "Reduce disturbances",
            "Stabilize water conditions"
        ]

    elif result["severity"] == "MEDIUM":
        result["actions"] = [
            "Monitor closely",
            "Optimize temperature and lighting"
        ]

    else:
        result["actions"] = [
            "Continue normal monitoring"
        ]

    # -------------------------------
    # FINAL EXPLANATION
    # -------------------------------
    result["explanation"] = " | ".join(result["reason_trace"])

    result["confidence_explanation"] = (
        "Decision derived from combined AI classification and environmental observations "
        "using rule-based risk evaluation."
    )

    return result