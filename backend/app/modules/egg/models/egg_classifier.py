import random

CLASSES = ["healthy", "unhealthy", "mixed", "fungal"]


def predict_egg(image_name: str):
    prediction = random.choice(CLASSES)

    return {
        "prediction": prediction,
        "confidence": round(random.uniform(0.7, 0.95), 2)
    }