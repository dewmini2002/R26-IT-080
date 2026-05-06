from app.modules.egg.services.egg_validation_questions import QUESTION_BANK


def get_validation_questions(probabilities: dict, context, confidence_level: str):
    questions = []

    # -------------------------------
    # ALWAYS CHECK CORE RISKS
    # -------------------------------
    questions.append(QUESTION_BANK["fanning"])
    questions.append(QUESTION_BANK["fuzzy"])

    # -------------------------------
    # LOW CONFIDENCE → ASK MORE
    # -------------------------------
    if confidence_level == "low":
        questions.extend([
            QUESTION_BANK["white_percentage"],
            QUESTION_BANK["trend"],
            QUESTION_BANK["removal"]
        ])

    # -------------------------------
    # MEDIUM CONFIDENCE → TARGETED
    # -------------------------------
    elif confidence_level == "medium":
        top = max(probabilities, key=probabilities.get)

        if top == "mixed":
            questions.extend([
                QUESTION_BANK["trend"],
                QUESTION_BANK["removal"]
            ])

        elif top == "fungal":
            questions.extend([
                QUESTION_BANK["spread"],
                QUESTION_BANK["aeration"]
            ])

        elif top == "unhealthy":
            questions.append(QUESTION_BANK["white_percentage"])

    # -------------------------------
    # CONTEXT-BASED QUESTIONS
    # -------------------------------
    if context.hours_since_spawn > 48:
        questions.append(QUESTION_BANK["temp_stability"])

    if context.temperature < 28 or context.temperature > 30:
        questions.append(QUESTION_BANK["temp_stability"])

    # remove duplicates
    unique = []
    seen = set()

    for q in questions:
        if q["question"] not in seen:
            unique.append(q)
            seen.add(q["question"])

    return unique