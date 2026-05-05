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

    # -------------------------------
    # HEALTHY SCENARIO
    # -------------------------------
    if scenario == "healthy":
        if answers.get("fanning") == "none":
            result["severity"] = "HIGH"
            result["explanation"] = "Eggs appear healthy but fanning has stopped."
            result["actions"].append("Ensure both parents resume fanning immediately.")
            result["risk_factors"].append("oxygen deprivation")
            result["reason_trace"].append("No fanning detected")

        elif answers.get("lighting") == "bright":
            result["severity"] = "MEDIUM"
            result["explanation"] = "Bright lighting may suppress hatching."
            result["actions"].append("Reduce tank lighting.")
            result["risk_factors"].append("light stress")
            result["reason_trace"].append("Bright light condition")

        else:
            result["severity"] = "LOW"
            result["explanation"] = "Conditions are optimal for healthy egg development."
            result["actions"].append("Continue monitoring without disturbance.")
            result["reason_trace"].append("All parameters normal")

    # -------------------------------
    # UNHEALTHY SCENARIO
    # -------------------------------
    elif scenario == "unhealthy":
        if answers.get("white_percentage") == ">80" and answers.get("parents") == "none":
            result["severity"] = "CRITICAL"
            result["explanation"] = "Clutch has failed due to abandonment and high egg mortality."
            result["actions"].append("Remove eggs to prevent infection spread.")
            result["actions"].append("Prepare tank for next spawning cycle.")
            result["risk_factors"].append("complete clutch loss")
            result["reason_trace"].append("High mortality + no parental care")

        else:
            result["severity"] = "MEDIUM"
            result["explanation"] = "Partial egg viability loss detected."
            result["actions"].append("Monitor closely and reduce disturbances.")
            result["reason_trace"].append("Moderate egg mortality")

    # -------------------------------
    # MIXED SCENARIO
    # -------------------------------
    elif scenario == "mixed":
        if answers.get("trend") == "increasing":
            result["severity"] = "HIGH"
            result["explanation"] = "White eggs are increasing, indicating declining clutch health."
            result["actions"].append("Inspect for fungal spread.")
            result["risk_factors"].append("spreading mortality")
            result["reason_trace"].append("Increasing white egg trend")

        else:
            result["severity"] = "LOW"
            result["explanation"] = "Mixed clutch but stable condition."
            result["actions"].append("Allow parents to manage eggs.")
            result["reason_trace"].append("Stable mixed condition")

    # -------------------------------
    # FUNGAL SCENARIO
    # -------------------------------
    elif scenario == "fungal":
        if answers.get("spread") == ">60":
            result["severity"] = "CRITICAL"
            result["explanation"] = "Fungal infection has spread across majority of eggs."
            result["actions"].append("Remove all eggs immediately.")
            result["risk_factors"].append("fungal outbreak")
            result["reason_trace"].append("High fungal spread")

        else:
            result["severity"] = "HIGH"
            result["explanation"] = "Early fungal infection detected."
            result["actions"].append("Apply antifungal treatment (methylene blue).")
            result["actions"].append("Improve water circulation.")
            result["reason_trace"].append("Initial fungal detection")

    result["confidence_explanation"] = "Based on AI classification and user-provided observations."

    return result