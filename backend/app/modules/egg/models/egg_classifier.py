import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image

# Device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load model once
model = models.resnet18(pretrained=False)

num_features = model.fc.in_features

model.fc = nn.Sequential(
    nn.Dropout(0.3),
    nn.Linear(num_features, 3)
)

#path
model.load_state_dict(
    torch.load("app/modules/egg/models/final_model_93.pth", map_location=device)
)

model.to(device)
model.eval()

# Class labels (MUST MATCH TRAINING)
CLASSES = ['fungal', 'healthy', 'unhealthy']

# Transform (same as validation)
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])


def predict_egg(image_path: str):
    try:
        image = Image.open(image_path).convert("RGB")
        image = transform(image).unsqueeze(0).to(device)

        with torch.no_grad():
            outputs = model(image)
            probs = torch.softmax(outputs, dim=1)[0]

        probabilities = {
            CLASSES[i]: float(probs[i])
            for i in range(len(CLASSES))
        }

        return {
            "probabilities": probabilities
        }

    except Exception as e:
        return {
            "error": str(e)
        }