def evaluate_breeding_readiness(data):
    score = 0
    risk_flags = []
    explanations = []
    actions = []

    # -----------------------------
    # 1. Scenario Identification
    # -----------------------------

    if data.fish_count == "one":
        return {
            "status": "Not Ready",
            "score": 0,
            "risk_level": "High",
            "scenario": "Single Fish",
            "explanation": "Only one discus fish is present. Discus breeding requires a compatible pair.",
            "actions": [
                "Introduce or select a compatible breeding partner.",
                "Observe pair bonding before starting breeding preparation."
            ]
        }

    if data.fish_count == "two":
        if data.gender_status == "confirmed_male_female":
            score += 20
            explanations.append("A confirmed male and female pair is present.")
        elif data.gender_status == "assumed_pair":
            score += 12
            explanations.append("Two fish may be a pair, but gender is not fully confirmed.")
            actions.append("Continue observing bonding and spawning behaviour.")
        else:
            score += 5
            explanations.append("Two fish are present, but gender is unknown.")
            actions.append("Confirm pair behaviour before expecting breeding.")

    if data.fish_count == "more_than_two":
        score += 8
        explanations.append("Multiple discus are in the same tank. A pair may form, but disturbance risk is higher.")
        actions.append("If a pair forms, move them to a separate breeding tank if possible.")

    # -----------------------------
    # 2. Pair Behaviour
    # -----------------------------

    if data.pair_behavior == "strong":
        score += 15
        explanations.append("The fish show strong pair bonding behaviour.")
    elif data.pair_behavior == "some":
        score += 8
        explanations.append("Some pair bonding behaviour is visible.")
    elif data.pair_behavior == "none":
        risk_flags.append("Pair bonding is not visible.")
        actions.append("Observe whether two fish stay together and defend the same area.")

    if data.cleaning_surface == "active":
        score += 15
        explanations.append("The pair is actively cleaning a breeding surface.")
    elif data.cleaning_surface == "sometimes":
        score += 8
        explanations.append("The fish sometimes clean a possible spawning surface.")
    elif data.cleaning_surface == "no":
        actions.append("Provide a clean vertical breeding cone, pipe, or flat surface.")

    if data.territorial_behavior == "yes":
        score += 8
        explanations.append("The fish are defending one area, which can be a breeding sign.")
    elif data.territorial_behavior == "no":
        actions.append("Monitor whether the pair starts defending a specific area.")

    if data.aggression_level == "low":
        score += 10
        explanations.append("Aggression level is low and manageable.")
    elif data.aggression_level == "medium":
        score += 5
        explanations.append("Some aggression is present, but it may be normal breeding behaviour.")
    elif data.aggression_level == "high":
        risk_flags.append("High aggression may disturb breeding or injure the fish.")
        actions.append("Reduce stress and consider separating fish if aggression is severe.")

    if data.breeding_tubes_visible == "clear":
        score += 7
        explanations.append("Breeding tubes are clearly visible.")
    elif data.breeding_tubes_visible == "slight":
        score += 3
        explanations.append("Breeding tubes may be starting to appear.")

    # -----------------------------
    # 3. Health and Stress
    # -----------------------------

    if data.appetite == "both_eating":
        score += 10
        explanations.append("Both fish are eating normally.")
    elif data.appetite == "one_less":
        score += 4
        risk_flags.append("One fish is eating less than normal.")
        actions.append("Monitor appetite and health before breeding.")
    elif data.appetite == "both_poor":
        risk_flags.append("Both fish have poor appetite.")
        actions.append("Improve fish health before breeding.")

    if data.disease_signs == "yes":
        risk_flags.append("Visible disease signs are reported.")
        actions.append("Treat health issues before attempting breeding.")
    elif data.disease_signs == "no":
        score += 10
        explanations.append("No visible disease signs are reported.")

    if data.activity_level == "active":
        score += 6
        explanations.append("Activity level appears healthy.")
    elif data.activity_level == "hiding":
        risk_flags.append("Fish are hiding or inactive.")
        actions.append("Check stress, water quality, and tank environment.")

    if data.tank_disturbance == "low":
        score += 6
        explanations.append("Tank environment is calm and stable.")
    elif data.tank_disturbance == "medium":
        score += 3
        actions.append("Reduce unnecessary movement and disturbance near the tank.")
    elif data.tank_disturbance == "high":
        risk_flags.append("Tank disturbance is high.")
        actions.append("Keep the tank environment calm and avoid sudden changes.")

    # -----------------------------
    # 4. Tank Setup
    # -----------------------------

    if data.separate_breeding_tank == "yes":
        score += 8
        explanations.append("A separate breeding tank is available.")
    elif data.separate_breeding_tank == "no":
        actions.append("A separate breeding tank is recommended for better egg protection.")

    if data.breeding_surface_available == "yes":
        score += 5
        explanations.append("A suitable breeding surface is available.")
    elif data.breeding_surface_available == "no":
        actions.append("Add a breeding cone, pipe, or clean vertical surface.")

    # -----------------------------
    # 5. Water Parameters
    # -----------------------------

    if data.temperature is not None:
        if 28 <= data.temperature <= 30:
            score += 15
            explanations.append("Temperature is within a suitable breeding range.")
        elif 27 <= data.temperature < 28 or 30 < data.temperature <= 31:
            score += 7
            risk_flags.append("Temperature is slightly outside the ideal range.")
            actions.append("Maintain temperature closer to 28–30°C.")
        else:
            risk_flags.append("Temperature is not suitable for breeding.")
            actions.append("Stabilize temperature before breeding.")

    if data.ph is not None:
        if 6.2 <= data.ph <= 6.8:
            score += 15
            explanations.append("pH is within an ideal breeding range.")
        elif 6.0 <= data.ph <= 7.2:
            score += 8
            explanations.append("pH is acceptable but not ideal.")
        else:
            risk_flags.append("pH is outside the recommended breeding range.")
            actions.append("Stabilize pH gradually before breeding.")

    if data.tds is not None:
        if 80 <= data.tds <= 180:
            score += 15
            explanations.append("TDS is suitable for discus breeding.")
        elif 180 < data.tds <= 250:
            score += 7
            risk_flags.append("TDS is slightly high for breeding.")
            actions.append("Consider gradually reducing TDS if breeding problems occur.")
        else:
            risk_flags.append("TDS is high and may affect breeding success.")
            actions.append("Improve water quality and reduce TDS gradually.")

    if data.recent_water_change == "within_24h":
        score += 5
        explanations.append("A recent water change may support breeding readiness.")
    elif data.recent_water_change == "more_than_3_days":
        actions.append("Consider a controlled water change if water quality is poor.")

    # -----------------------------
    # Final Classification
    # -----------------------------

    score = min(score, 100)

    # Safety override rules
    if data.disease_signs == "yes":
        status = "High Risk"
        risk_level = "High"
    elif data.aggression_level == "high":
        status = "High Risk"
        risk_level = "High"
    elif score >= 80:
        status = "Ready"
        risk_level = "Low"
    elif score >= 60:
        status = "Preparing"
        risk_level = "Medium"
    elif score >= 40:
        status = "Not Ready"
        risk_level = "Medium"
    else:
        status = "High Risk"
        risk_level = "High"

    if not explanations:
        explanations.append("The system could not find enough positive breeding readiness signs.")

    if not actions:
        actions.append("Maintain stable water conditions and continue monitoring the pair.")

    return {
        "status": status,
        "score": score,
        "risk_level": risk_level,
        "scenario": get_scenario_label(data),
        "explanation": " ".join(explanations),
        "risk_flags": risk_flags,
        "actions": actions
    }


def get_scenario_label(data):
    if data.fish_count == "one":
        return "Single Fish"

    if data.fish_count == "two":
        if data.gender_status == "confirmed_male_female":
            return "Confirmed Breeding Pair"
        elif data.gender_status == "assumed_pair":
            return "Possible Pair"
        else:
            return "Two Fish - Gender Unknown"

    if data.fish_count == "more_than_two":
        return "Community / Group Tank"

    return "Unknown Scenario"