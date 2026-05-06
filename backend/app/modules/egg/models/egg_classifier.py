import random

CLASSES = ["healthy", "mixed", "fungal", "unhealthy"]


def predict_egg(image_path: str):
    raw = [random.random() for _ in CLASSES]
    total = sum(raw)

    probabilities = {c: v / total for c, v in zip(CLASSES, raw)}

    prediction = max(probabilities, key=probabilities.get)

    return {
        "prediction": prediction,
        "confidence": probabilities[prediction],
        "probabilities": probabilities
    }