def confidence_gate(confidence: float):
    """
    Confidence-based routing for egg analysis.

    < 0.50     : invalid / unclear image
    0.50-0.98 : validation required
    >= 0.99    : direct final decision
    """

    if confidence < 0.50:
        return {
            "level": "invalid",
            "requires_validation": False,
            "message": "Low confidence. Please upload a clearer valid egg image.",
            "allow_result": False
        }

    elif confidence < 0.99:
        return {
            "level": "medium",
            "requires_validation": True,
            "message": "Moderate confidence. Additional validation questions are required.",
            "allow_result": True
        }

    else:
        return {
            "level": "high",
            "requires_validation": False,
            "message": "High confidence prediction.",
            "allow_result": True
        }