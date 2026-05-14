import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image

# -----------------------------
# DEVICE
# -----------------------------
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# -----------------------------
# LOAD MODEL
# -----------------------------
model = models.resnet18(pretrained=False)

num_features = model.fc.in_features

model.fc = nn.Sequential(
    nn.Dropout(0.3),
    nn.Linear(num_features, 3)
)

model.load_state_dict(
    torch.load("app/modules/egg/models/final_model_93.pth", map_location=device)
)

model.to(device)
model.eval()

# -----------------------------
# CLASSES (must match training)
# -----------------------------
CLASSES = ['fungal', 'healthy', 'unhealthy']

# -----------------------------
# TRANSFORM
# -----------------------------
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        [0.485, 0.456, 0.406],
        [0.229, 0.224, 0.225]
    )
])

# -----------------------------
# PREDICTION FUNCTION
# -----------------------------
def predict_egg(image_path: str):
    try:
        image = Image.open(image_path).convert("RGB")
        image = transform(image).unsqueeze(0).to(device)

        with torch.no_grad():
            outputs = model(image)
            probs = torch.softmax(outputs, dim=1)[0]

        probabilities = {
            CLASSES[i]: float(probs[i].item())
            for i in range(len(CLASSES))
        }

        predicted_index = torch.argmax(probs).item()
        predicted_class = CLASSES[predicted_index]
        confidence = float(probs[predicted_index].item())

        return {
            "probabilities": probabilities,
            "confidence": confidence,
            "predicted_class": predicted_class
        }

    except Exception as e:
        return {
            "error": str(e)
        }