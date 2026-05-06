import random

def predict_egg(image_path: str):
    classes = ["healthy", "fungal", "mixed", "unhealthy"]

    # generate random probabilities (mock)
    probs = [random.random() for _ in classes]
    total = sum(probs)
    probs = [p / total for p in probs]

    probabilities = dict(zip(classes, probs))

    prediction = max(probabilities, key=probabilities.get)

    return {
        "prediction": prediction,
        "confidence": probabilities[prediction],
        "probabilities": probabilities
    }