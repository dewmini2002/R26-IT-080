def get_validation_questions(mode="full"):
    """
    Returns validation questions based on confidence level
    """

    if mode == "light":
        return [
            "Are both parents actively fanning the eggs?",
            "Do you see any white eggs?"
        ]

    elif mode == "medium":
        return [
            "Are both parents actively fanning the eggs?",
            "Do you see white eggs?",
            "Do you see fuzzy/hairy growth on eggs?",
            "Do you see black eye spots in eggs?"
        ]

    else:  # full (low confidence)
        return [
            "Are both parents actively fanning the eggs?",
            "Do you see white eggs?",
            "Do you see fuzzy/hairy growth on eggs?",
            "Do you see black eye spots in eggs?",
            "Have there been disturbances near the tank?",
            "Is the lighting stable (not too bright or changing)?"
        ]