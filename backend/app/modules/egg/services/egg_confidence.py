def confidence_gate(confidence: float):
    """
    Determines confidence level and system behavior
    """

    if confidence >= 0.75:
        return {
            "level": "high",
            "requires_validation": False,
            "message": "High confidence prediction."
        }

    elif confidence >= 0.5:
        return {
            "level": "medium",
            "requires_validation": True,
            "message": "Moderate confidence. Additional validation recommended."
        }

    else:
        return {
            "level": "low",
            "requires_validation": True,
            "message": "Low confidence. Image may be unclear. User input required."
        }