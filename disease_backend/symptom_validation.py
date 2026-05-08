DISEASE_SYMPTOMS = {
    "hole_in_head": [
        "holes_on_head",
        "pitting_on_head",
        "white_feces",
        "loss_of_appetite",
        "lethargy",
        "dark_coloration"
    ],

    "black_death": [
        "body_turning_black",
        "dark_coloration",
        "lethargy",
        "clamped_fins",
        "loss_of_appetite",
        "hiding_behavior"
    ],

    "fin_rot": [
        "damaged_fins",
        "frayed_fins",
        "white_edges_on_fins",
        "red_inflamed_fins",
        "fin_discoloration",
        "loss_of_appetite"
    ],

    "healthy_fish": [
        "normal_swimming",
        "clear_body",
        "good_appetite",
        "active_behavior",
        "normal_fins"
    ],

    "unknown": []
}


def normalize_symptom(symptom: str) -> str:
    return symptom.strip().lower().replace(" ", "_").replace("-", "_")


def format_symptom_name(symptom: str) -> str:
    return symptom.replace("_", " ").title()


def match_symptoms(predicted_class: str, user_symptoms: list):
    predicted_class = normalize_symptom(predicted_class)

    expected_symptoms = DISEASE_SYMPTOMS.get(predicted_class, [])

    normalized_user_symptoms = [
        normalize_symptom(symptom)
        for symptom in user_symptoms
    ]

    matched = []
    unmatched = []

    for symptom in normalized_user_symptoms:
        if symptom in expected_symptoms:
            matched.append(symptom)
        else:
            unmatched.append(symptom)

    if len(normalized_user_symptoms) > 0:
        match_percentage = round(
            (len(matched) / len(normalized_user_symptoms)) * 100,
            2
        )
    else:
        match_percentage = 0

    return {
        "predicted_class": predicted_class,
        "expected_symptoms": expected_symptoms,
        "expected_symptoms_display": [
            format_symptom_name(s) for s in expected_symptoms
        ],
        "user_symptoms": normalized_user_symptoms,
        "user_symptoms_display": [
            format_symptom_name(s) for s in normalized_user_symptoms
        ],
        "matched_symptoms": matched,
        "matched_symptoms_display": [
            format_symptom_name(s) for s in matched
        ],
        "unmatched_symptoms": unmatched,
        "unmatched_symptoms_display": [
            format_symptom_name(s) for s in unmatched
        ],
        "match_percentage": match_percentage
    }